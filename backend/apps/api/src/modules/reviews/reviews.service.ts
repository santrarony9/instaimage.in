import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '../bookings/schemas/booking.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    private readonly bookingsService: BookingsService,
  ) {}

  async create(createReviewDto: CreateReviewDto, clientId: string) {
    const booking = await this.bookingsService.getBookingById(
      createReviewDto.bookingId,
    );

    // Safely extract customerId whether populated or not
    const bookingCustomerId =
      (booking.customerId as any)?._id?.toString() ||
      booking.customerId?.toString();
    if (bookingCustomerId !== clientId) {
      throw new BadRequestException('You can only review your own bookings');
    }

    if (
      booking.status !== BookingStatus.DELIVERED &&
      booking.status !== BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'You can only review completed or delivered bookings',
      );
    }

    const existingReview = await this.reviewModel.findOne({
      bookingId: new Types.ObjectId(createReviewDto.bookingId),
    });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this booking');
    }

    // Save tip to booking if provided
    if (createReviewDto.tipAmount && createReviewDto.tipAmount > 0) {
      await this.bookingsService.updateTipAmount(
        booking._id.toString(),
        createReviewDto.tipAmount,
      );
    }

    // Safely extract ObjectIds from potentially populated fields
    const sellerId = booking.sellerId
      ? new Types.ObjectId(
          (booking.sellerId as any)?._id?.toString() ||
            booking.sellerId.toString(),
        )
      : null;
    const serviceId = booking.serviceId
      ? new Types.ObjectId(
          (booking.serviceId as any)?._id?.toString() ||
            booking.serviceId.toString(),
        )
      : null;

    const review = new this.reviewModel({
      bookingId: new Types.ObjectId(createReviewDto.bookingId),
      clientId: new Types.ObjectId(clientId),
      sellerId,
      serviceId,
      rating: createReviewDto.rating,
      reviewText: createReviewDto.reviewText,
      status: 'APPROVED', // Auto-approve for now
    });

    return review.save();
  }

  async getReviewsForService(serviceId: string) {
    if (!Types.ObjectId.isValid(serviceId)) return [];
    return this.reviewModel
      .find({ serviceId: new Types.ObjectId(serviceId), status: 'APPROVED' })
      .populate('clientId', 'name')
      .sort({ createdAt: -1 });
  }

  async getReviewsForSeller(sellerId: string) {
    if (!Types.ObjectId.isValid(sellerId)) return [];
    return this.reviewModel
      .find({ sellerId: new Types.ObjectId(sellerId), status: 'APPROVED' })
      .populate('clientId', 'name')
      .sort({ createdAt: -1 });
  }
}
