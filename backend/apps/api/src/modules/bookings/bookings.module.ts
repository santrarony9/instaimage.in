import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { DatabaseModule } from '@app/database';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { BookingsRepository } from './bookings.repository';
import { BookingsCronService } from './bookings-cron.service';

import { ServicesModule } from '../services/services.module';
import { CouponsModule } from '../coupons/coupons.module';
import { ServiceZonesModule } from '../service-zones/service-zones.module';
import { PaymentsModule } from '../payments/payments.module';
import { AvailabilityModule } from '../availability/availability.module';
import { SellersModule } from '../sellers/sellers.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    ServicesModule,
    CouponsModule,
    ServiceZonesModule,
    PaymentsModule,
    AvailabilityModule,
    SellersModule,
    NotificationsModule,
    SettingsModule,
    UsersModule,
    EmailModule,
    WhatsappModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsRepository, BookingsCronService],
  exports: [BookingsService],
})
export class BookingsModule {}
