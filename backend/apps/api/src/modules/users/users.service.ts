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
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectModel(WalletTransaction.name)
    private walletTransactionModel: Model<WalletTransaction>,
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
    return this.usersRepository.findOneAndUpdate({ _id: id }, data);
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
}
