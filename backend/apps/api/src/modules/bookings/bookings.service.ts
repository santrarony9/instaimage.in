import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { BookingsRepository } from './bookings.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  BookingStatus,
  PricingDetails,
  TimeFlexibility,
} from './schemas/booking.schema';
import { Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import * as crypto from 'crypto';

import { ServicesService } from '../services/services.service';
import { CouponsService } from '../coupons/coupons.service';
import { PaymentsService } from '../payments/payments.service';
import { AvailabilityService } from '../availability/availability.service';
import { SellersService } from '../sellers/sellers.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';

import { SettingsService } from '../settings/settings.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  private s3: S3Client;

  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly configService: ConfigService,
    private readonly servicesService: ServicesService,
    private readonly couponsService: CouponsService,
    private readonly paymentsService: PaymentsService,
    private readonly availabilityService: AvailabilityService,
    private readonly SellersService: SellersService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly settingsService: SettingsService,
    private readonly usersService: UsersService,
  ) {
    this.s3 = new S3Client({
      endpoint: process.env.B2_ENDPOINT || 'https://s3.eu-central-003.backblazeb2.com',
      region: process.env.B2_REGION || 'eu-central-003',
      credentials: {
        accessKeyId: process.env.B2_KEY_ID || 'f87ad6faa8b3',
        secretAccessKey: process.env.B2_APPLICATION_KEY || '0031697847c74883ae60204a0d5fd410f394a59adf',
      },
    });
  }

  async createBooking(customerId: string, createBookingDto: CreateBookingDto) {
    const date = new Date();
    const year = date.getFullYear();
    const count = await this.bookingsRepository.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
    });
    const bookingId = `BKG-${year}-${String(count + 1).padStart(4, '0')}`;

    await this.availabilityService.lockSlot(
      new Date(createBookingDto.scheduledDate),
      createBookingDto.startTime,
      createBookingDto.endTime,
      bookingId,
    );

    try {
      const { pricing, matchedAddons, walletDiscountApplied } =
        await this.calculateFullPrice(createBookingDto, customerId);

      // 2. Create Booking Record
      const booking = await this.bookingsRepository.create({
        bookingId,
        customerId: new Types.ObjectId(customerId),
        serviceId: new Types.ObjectId(createBookingDto.serviceId),
        pricingMode: createBookingDto.pricingMode,
        addons: matchedAddons,
        scheduledDate: new Date(createBookingDto.scheduledDate),
        startTime: createBookingDto.startTime,
        endTime: createBookingDto.endTime,
        timeFlexibility:
          (createBookingDto.timeFlexibility as TimeFlexibility) ||
          TimeFlexibility.STRICT,
        extraHoursBooked: createBookingDto.extraHoursBooked || 0,
        location: createBookingDto.location,
        pricing,
        status: BookingStatus.PENDING_PAYMENT,
        appliedCouponId: createBookingDto.appliedCouponId
          ? new Types.ObjectId(createBookingDto.appliedCouponId)
          : undefined,
        customerNotes: createBookingDto.customerNotes,
      });

      // Deduct wallet balance if applied
      if (walletDiscountApplied && walletDiscountApplied > 0) {
        await this.usersService.addWalletBalance(
          customerId,
          -walletDiscountApplied,
          `Applied to booking ${bookingId}`,
          booking._id.toString(),
        );
      }

      // 3. Create Payment Order Mock
      const paymentOrder = await this.paymentsService.createPaymentOrder(
        bookingId,
        pricing.advancePaid,
        'INR',
      );

      // Async email sending (no await)
      this.bookingsRepository.model
        .findById(booking._id)
        .populate('customerId', 'name email')
        .populate('serviceId', 'title name')
        .then((b) => {
          if (b && b.customerId && (b.customerId as any).email) {
            this.emailService.sendBookingConfirmation(
              (b.customerId as any).email,
              (b.customerId as any).name,
              (b.serviceId as any).title ||
                (b.serviceId as any).name ||
                'Service',
              b.scheduledDate.toLocaleDateString(),
            );
          }
        });

      return {
        booking,
        paymentOrder,
      };
    } catch (error) {
      await this.availabilityService.releaseLock(
        new Date(createBookingDto.scheduledDate),
        createBookingDto.startTime,
        createBookingDto.endTime,
      );
      throw error;
    }
  }

  async verifyPayment(
    bookingId: string,
    payload: {
      payment_id: string;
      payment_request_id?: string;
      payment_status?: string;
    },
  ) {
    const isValid = await this.paymentsService.verifyInstamojoPayment(
      payload.payment_id
    );

    if (!isValid) {
      import('@nestjs/common').then(m => {
        throw new m.BadRequestException('Invalid or incomplete payment');
      });
      throw new Error('Invalid or incomplete payment');
    }

    const booking = await this.bookingsRepository.model.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.status = BookingStatus.CONFIRMED;
    booking.paymentStatus = 'PAID';
    booking.paymentId = payload.payment_id;
    await booking.save();

    return { success: true, booking };
  }

  async getBookingById(id: string) {
    const booking = await this.bookingsRepository.model
      .findById(id)
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'name');
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Generate pre-signed URLs for gallery
    const bookingObj = booking.toObject();
    if (bookingObj.gallery && bookingObj.gallery.length > 0) {
      const bucketName = process.env.B2_BUCKET_NAME || 'instaimage-bucket';
      bookingObj.gallery = await Promise.all(
        bookingObj.gallery.map(async (item: any) => {
          if (item.key) {
            try {
              const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: item.key,
              });
              item.url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
            } catch (err) {
              this.logger.error(`Failed to sign URL for ${item.key}`, err);
            }
          }
          return item;
        })
      );
    }
    return bookingObj;
  }

  async getUserBookings(customerId: string) {
    return this.bookingsRepository.model
      .find({ customerId: new Types.ObjectId(customerId), isDeleted: false })
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findAllBookings() {
    return this.bookingsRepository.model
      .find({ isDeleted: false })
      .populate('customerId', 'name email phone isWhatsappVerified')
      .populate('serviceId', 'name')
      .populate('sellerId', 'name bankDetails')
      .sort({ createdAt: -1 })
      .lean();
  }

  async cancelBookingCustomer(id: string, customerId: string) {
    const booking = await this.bookingsRepository.model.findOne({ _id: new Types.ObjectId(id), customerId: new Types.ObjectId(customerId) });
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking cannot be cancelled at this stage.');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.timeline.push({
      status: BookingStatus.CANCELLED,
      timestamp: new Date(),
      note: 'Cancelled by customer',
    });

    // If they paid with wallet (or advance), we should refund wallet balance!
    // Since this is a quick fix, let's refund walletDiscountApplied if any.
    if (booking.pricing && booking.pricing.walletDiscountApplied > 0) {
       await this.usersService.addWalletBalance(
         customerId,
         booking.pricing.walletDiscountApplied,
         `Refund for cancelled booking #${booking.bookingId}`
       );
    }

    return booking.save();
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    const booking = await this.bookingsRepository.update(id, { status });

    if (status === BookingStatus.CONFIRMED && booking && booking.customerId) {
      const user = await this.usersService.findById(
        booking.customerId.toString(),
      );
      if (user && !user.hasCompletedFirstBooking && user.referredBy) {
        // Reward the referrer
        await this.usersService.addWalletBalance(
          user.referredBy.toString(),
          500,
          `Referral reward for ${user.name}'s first booking`,
          booking._id.toString(),
        );
        // Mark as completed
        await this.usersService.update(user._id.toString(), {
          hasCompletedFirstBooking: true,
        });
      }
    }

    return booking;
  }

  async updateTipAmount(id: string, tipAmount: number) {
    return this.bookingsRepository.update(id, {
      'pricing.tipAmount': tipAmount,
    });
  }

  async addSurcharge(
    id: string,
    surcharge: { name: string; amount: number; reason?: string },
  ) {
    const booking = await this.bookingsRepository.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');

    const newSurcharges = [...booking.pricing.surcharges, surcharge];
    const newSurchargesPrice =
      booking.pricing.surchargesPrice + surcharge.amount;
    const newTotalPrice = booking.pricing.totalPrice + surcharge.amount;
    const newBalanceDue = booking.pricing.balanceDue + surcharge.amount;

    return this.bookingsRepository.update(id, {
      pricing: {
        ...booking.pricing,
        surcharges: newSurcharges,
        surchargesPrice: newSurchargesPrice,
        totalPrice: newTotalPrice,
        balanceDue: newBalanceDue,
      },
    });
  }

  async getsellerAssignments(userId: string) {
    const seller = await this.SellersService.findByUserId(userId);
    if (!seller) return [];

    return this.bookingsRepository.model
      .find({
        sellerId: seller._id,
        isDeleted: false,
      })
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'name')
      .sort({ scheduledDate: 1 })
      .lean();
  }

  async assignseller(bookingId: string, sellerId: string) {
    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    const seller = await this.SellersService.findOne(sellerId);
    if (seller && seller.userId) {
      await this.notificationsService.create(
        seller.userId.toString(),
        'New Booking Assignment!',
        `You have been assigned to booking ${booking.bookingId}. Please check your assignments for details.`,
        'BOOKING_ASSIGNED',
        { bookingId },
      );

      if (seller.email) {
        // Fetch service to get name
        this.servicesService.findOne(booking.serviceId.toString()).then((s) => {
          this.emailService.sendBookingAlert(
            seller.email,
            seller.name,
            s?.name || 'a Service',
            booking.scheduledDate.toLocaleDateString(),
          );
        });
      }
    }

    return this.bookingsRepository.update(bookingId, {
      sellerId: new Types.ObjectId(sellerId),
      status: BookingStatus.ASSIGNED,
    });
  }

  async markPayoutPaid(bookingId: string) {
    return this.bookingsRepository.update(bookingId, {
      payoutStatus: 'PAID',
    });
  }

  async updatesellerStatus(
    bookingId: string,
    userId: string,
    status: BookingStatus,
  ) {
    const seller = await this.SellersService.findByUserId(userId);
    if (!seller) throw new NotFoundException('seller profile not found');

    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    // Check if this booking is assigned to this seller
    if (booking.sellerId?.toString() !== seller._id.toString()) {
      throw new ForbiddenException('You are not assigned to this booking');
    }

    return this.bookingsRepository.update(bookingId, { status });
  }

  async updateDeliveryLink(bookingId: string, deliveryLink: string) {
    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    return this.bookingsRepository.update(bookingId, { deliveryLink });
  }

  async calculateTravelCharge(clientCoordinates: number[] | undefined | null) {
    let deliveryCharge = 500;
    let travelDistanceKm = 0;
    let nearestOfficeName = undefined;

    const officeLocations =
      (await this.settingsService.getSetting('officeLocations')) || [];
    const travelConfig = (await this.settingsService.getSetting(
      'travelChargeConfig',
    )) || {
      perKmRate: 15,
      freeRadiusKm: 5,
      defaultFlatCharge: 500,
    };

    if (
      clientCoordinates &&
      clientCoordinates.length === 2 &&
      officeLocations.length > 0
    ) {
      const [lng2, lat2] = clientCoordinates;
      let minDistance = Infinity;

      for (const office of officeLocations) {
        if (office.coordinates && office.coordinates.length === 2) {
          const [lng1, lat1] = office.coordinates;
          const R = 6371; // Earth's radius in km
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lng2 - lng1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const d = R * c; // Distance in km

          if (d < minDistance) {
            minDistance = d;
            nearestOfficeName = office.name;
          }
        }
      }

      if (minDistance !== Infinity) {
        travelDistanceKm = parseFloat(minDistance.toFixed(2));
        const billableDistance = Math.max(
          0,
          travelDistanceKm - travelConfig.freeRadiusKm,
        );
        deliveryCharge = Math.ceil(
          billableDistance * 2 * travelConfig.perKmRate,
        ); // * 2 for round trip
      } else {
        deliveryCharge = travelConfig.defaultFlatCharge || 500;
      }
    } else {
      deliveryCharge = travelConfig.defaultFlatCharge || 500;
    }

    return { deliveryCharge, travelDistanceKm, nearestOfficeName };
  }

  async calculateFullPrice(createBookingDto: CreateBookingDto, customerId?: string) {
    const service = await this.servicesService.findOne(
      createBookingDto.serviceId,
    );
    if (!service) throw new NotFoundException('Service not found');

    let basePrice = 0;
    let extraHoursPrice = 0;

    if (createBookingDto.pricingMode === 'fixed') {
      basePrice = service.basePrice;
      if (
        createBookingDto.extraHoursBooked &&
        createBookingDto.extraHoursBooked > 0
      ) {
        if (!service.extraHourPrice)
          throw new BadRequestException(
            'This service does not allow extra fixed hours.',
          );
        extraHoursPrice =
          createBookingDto.extraHoursBooked * service.extraHourPrice;
      }
    } else if (createBookingDto.pricingMode === 'flexible') {
      if (!service.flexiblePrice)
        throw new BadRequestException(
          'This service does not allow flexible pricing.',
        );
      basePrice = service.flexiblePrice;
    }

    let addonsPrice = 0;
    const matchedAddons: Array<{ name: string; price: number }> = [];
    const unselectedAddons: Array<{ name: string; price: number }> = [];

    if (service.addons && service.addons.length > 0) {
      for (const addonObj of service.addons) {
        if (
          createBookingDto.addonNames &&
          createBookingDto.addonNames.includes(addonObj.name)
        ) {
          addonsPrice += addonObj.price;
          matchedAddons.push({ name: addonObj.name, price: addonObj.price });
        } else {
          unselectedAddons.push({ name: addonObj.name, price: addonObj.price });
        }
      }
    }

    const surchargesPrice = 0;
    const surcharges: Array<{ name: string; amount: number; reason?: string }> =
      [];

    const { deliveryCharge, travelDistanceKm, nearestOfficeName } =
      await this.calculateTravelCharge(createBookingDto.location?.coordinates);
    let discount = 0;

    const travelConfig =
      await this.settingsService.getSetting('travelChargeConfig');
    let deliveryDiscount = 0;
    if (travelConfig?.isFreeOfferActive) {
      deliveryDiscount = deliveryCharge;
    }

    if (createBookingDto.appliedCouponId) {
      const coupon = await this.couponsService.findOne(
        createBookingDto.appliedCouponId,
      );
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (basePrice + addonsPrice) * (coupon.discountValue / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount)
            discount = coupon.maxDiscount;
        } else {
          discount = coupon.discountValue;
        }
      }
    }

    const availableExpressFee = service.expressDeliveryFee || 0;
    const expressDeliveryFee = createBookingDto.isExpressDelivery
      ? availableExpressFee
      : 0;
    const totalDiscount = discount + deliveryDiscount;
    let totalPrice =
      basePrice +
      addonsPrice +
      extraHoursPrice +
      surchargesPrice +
      deliveryCharge +
      expressDeliveryFee -
      totalDiscount;

    let walletDiscountApplied = 0;
    if (createBookingDto.applyWalletBalance && customerId) {
      const user = await this.usersService.findById(customerId);
      if (user && user.walletBalance && user.walletBalance > 0) {
        walletDiscountApplied = Math.min(totalPrice, user.walletBalance);
        totalPrice -= walletDiscountApplied;
      }
    }

    const advancePaid = totalPrice * 0.2;
    const balanceDue = totalPrice - advancePaid;

    const platformFee = totalPrice * 0.1;
    const sellerPayout = totalPrice * 0.9;

    const pricing = {
      basePrice,
      addonsPrice,
      extraHoursPrice,
      surcharges,
      surchargesPrice,
      deliveryCharge,
      expressDeliveryFee,
      deliveryDiscount,
      discount,
      walletDiscountApplied,
      totalPrice,
      platformFee,
      sellerPayout,
      advancePaid,
      balanceDue,
      travelDistanceKm,
      nearestOfficeName,
    };

    return {
      pricing,
      matchedAddons,
      unselectedAddons,
      availableExpressFee,
      walletDiscountApplied,
    };
  }

  async uploadToGallery(bookingId: string, sellerId: string, file: Express.Multer.File) {
    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    
    // Check if assigned
    if (booking.sellerId?.toString() !== sellerId) {
      throw new ForbiddenException('You are not assigned to this booking');
    }

    let fileBuffer = file.buffer;
    let mimeType = file.mimetype;
    let fileExt = '.webp'; 

    if (mimeType.startsWith('image/') && !mimeType.includes('gif')) {
      try {
        fileBuffer = await sharp(file.buffer)
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85, effort: 4 })
          .toBuffer();
        mimeType = 'image/webp';
      } catch (err) {
        this.logger.error('Sharp optimization failed, falling back:', err);
        const path = require('path');
        fileExt = path.extname(file.originalname);
      }
    } else {
      const path = require('path');
      fileExt = path.extname(file.originalname);
    }

    const uuid = crypto.randomUUID();
    const key = `private/galleries/${booking.bookingId}/${uuid}${fileExt}`;
    const bucketName = process.env.B2_BUCKET_NAME || 'instaimage-bucket';

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: mimeType,
        })
      );

      const galleryItem = {
        _id: crypto.randomUUID(),
        key,
        filename: file.originalname,
        isWishlisted: false,
      };

      await this.bookingsRepository.model.updateOne(
        { _id: booking._id },
        { $push: { gallery: galleryItem } }
      );

      return galleryItem;
    } catch (error) {
      this.logger.error('Gallery Upload Error:', error);
      throw new BadRequestException('Failed to upload file to storage');
    }
  }

  async deleteFromGallery(bookingId: string, sellerId: string, imageId: string) {
    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    
    if (booking.sellerId?.toString() !== sellerId) {
      throw new ForbiddenException('You are not assigned to this booking');
    }

    const image = booking.gallery?.find(img => img._id === imageId);
    if (!image) throw new NotFoundException('Image not found in gallery');

    const bucketName = process.env.B2_BUCKET_NAME || 'instaimage-bucket';

    if (image.key) {
      try {
        await this.s3.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: image.key,
          })
        );
      } catch (e) {
        this.logger.error('Failed to delete from B2:', e);
      }
    }

    await this.bookingsRepository.model.updateOne(
      { _id: booking._id },
      { $pull: { gallery: { _id: imageId } } }
    );

    return { success: true, message: 'Image deleted' };
  }
}
