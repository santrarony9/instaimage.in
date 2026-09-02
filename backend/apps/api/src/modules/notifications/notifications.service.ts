import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async create(
    userId: string,
    title: string,
    message: string,
    type: string = 'SYSTEM',
    payload?: any,
  ) {
    const link = payload?.bookingId ? `/customer/bookings/${payload.bookingId}` : undefined;
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      title,
      message,
      type: ['BOOKING', 'SYSTEM', 'PROMO'].includes(type) ? type : 'SYSTEM',
      link: payload?.link || link,
    });
    return notification.save();
  }

  async getUserNotifications(userId: string) {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true },
    ).exec();
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    ).exec();
  }
}
