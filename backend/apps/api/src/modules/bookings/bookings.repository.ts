import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbstractRepository } from '@app/database';
import { Booking } from './schemas/booking.schema';

@Injectable()
export class BookingsRepository extends AbstractRepository<Booking> {
  protected readonly logger = new Logger(BookingsRepository.name);

  constructor(@InjectModel(Booking.name) bookingModel: Model<Booking>) {
    super(bookingModel);
  }
}
