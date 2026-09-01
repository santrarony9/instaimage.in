import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './schemas/user.schema';
import {
  WalletTransaction,
  TransactionType,
} from './schemas/wallet-transaction.schema';
import {
  VerificationCoupon,
} from './schemas/verification-coupon.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectModel(WalletTransaction.name)
    private walletTransactionModel: Model<WalletTransaction>,
    @InjectModel(VerificationCoupon.name)
    private verificationCouponModel: Model<VerificationCoupon>,
    private readonly emailService: EmailService,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    return this.usersRepository.create(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.usersRepository.find({ email });
    return users.length > 0 ? users[0] : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) cleaned = `91${cleaned}`;
    const users = await this.usersRepository.find({
      $or: [{ phone: cleaned }, { phone: phone.trim() }, { phone: `+${cleaned}` }],
    });
    return users.length > 0 ? users[0] : null;
  }

  async findByReferralCode(code: string): Promise<User | null> {
    const users = await this.usersRepository.find({ referralCode: code });
    return users.length > 0 ? users[0] : null;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findAll(search?: string) {
    const filter: any = { isDeleted: false };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    return this.usersRepository.model
      .find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, data: Partial<User>) {
    try {
      return await this.usersRepository.findOneAndUpdate({ _id: id }, data);
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new BadRequestException('This email is already registered to another account. Please login with Google instead.');
      }
      throw error;
    }
  }

  async getAddresses(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user.savedAddresses || [];
  }

  async addAddress(userId: string, addressData: any) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const addresses = user.savedAddresses || [];
    addresses.push(addressData);

    await this.usersRepository.findOneAndUpdate(
      { _id: userId },
      { savedAddresses: addresses },
    );
    return addresses;
  }

  async updateRole(id: string, role: string) {
    if (!['ADMIN', 'CUSTOMER', 'SELLER'].includes(role)) {
      throw new BadRequestException('Invalid role');
    }
    return this.usersRepository.findOneAndUpdate({ _id: id }, { role });
  }

  async addWalletBalance(
    userId: string,
    amount: number,
    description: string,
    bookingId?: string,
  ) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const newBalance = (user.walletBalance || 0) + amount;
    if (newBalance < 0) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    await this.usersRepository.findOneAndUpdate(
      { _id: userId },
      { walletBalance: newBalance },
    );

    const type = amount >= 0 ? TransactionType.CREDIT : TransactionType.DEBIT;

    await this.walletTransactionModel.create({
      userId: new Types.ObjectId(userId),
      amount: Math.abs(amount),
      type,
      description,
      bookingId: bookingId ? new Types.ObjectId(bookingId) : undefined,
    });

    return { balance: newBalance };
  }

  async getWalletTransactions(userId: string) {
    return this.walletTransactionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Issue a ₹500 verification coupon when a user saves their real email for the first time.
   * Guards: 1 coupon per phone number, 1 coupon per email address.
   */
  async sendVerificationCoupon(userId: string, phone: string, email: string) {
    if (!phone) {
      throw new BadRequestException('Phone number is required to issue a verification coupon.');
    }

    // Guard: one coupon per phone number
    const existingByPhone = await this.verificationCouponModel.findOne({ phone });
    if (existingByPhone) {
      throw new BadRequestException('A verification coupon has already been issued for this phone number.');
    }

    // Guard: one coupon per email address (prevents sharing email between accounts)
    const existingByEmail = await this.verificationCouponModel.findOne({ email });
    if (existingByEmail) {
      throw new BadRequestException('This email address has already been used to claim a verification coupon.');
    }

    // Generate unique coupon code: "VRFY" + 6 random uppercase chars
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const code = `VRFY${suffix}`;

    await this.verificationCouponModel.create({
      userId: new Types.ObjectId(userId),
      phone,
      email,
      code,
      isRedeemed: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const user = await this.usersRepository.findById(userId);
    const displayName = user?.name || 'Customer';

    // Send email asynchronously — don't block the response
    this.emailService.sendVerificationCouponEmail(email, displayName, code);

    return {
      success: true,
      message: 'Coupon code sent to your email! Check your inbox to claim ₹500.',
    };
  }

  /**
   * Redeem a verification coupon — credits ₹500 to the user's wallet.
   * The coupon must belong to this user's phone number (anti-sharing guard).
   */
  async redeemVerificationCoupon(userId: string, code: string) {
    const coupon = await this.verificationCouponModel.findOne({
      code: code.trim().toUpperCase(),
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon code. Please check and try again.');
    }

    if (coupon.isRedeemed) {
      throw new BadRequestException('This coupon has already been redeemed.');
    }

    if (coupon.expiresAt < new Date()) {
      throw new BadRequestException('This coupon has expired. Verification coupons are valid for 7 days.');
    }

    // Security: coupon must belong to this user
    if (coupon.userId.toString() !== userId) {
      throw new BadRequestException('This coupon does not belong to your account.');
    }

    // Mark redeemed first (prevent race condition double-spend)
    await this.verificationCouponModel.findByIdAndUpdate(coupon._id, {
      isRedeemed: true,
    });

    // Credit ₹500 to wallet
    const result = await this.addWalletBalance(
      userId,
      500,
      'Email Verification Bonus',
    );

    return {
      success: true,
      message: '🎉 ₹500 added to your wallet successfully!',
      walletBalance: result.balance,
    };
  }
}

