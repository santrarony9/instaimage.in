import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ServicesModule } from './modules/services/services.module';
import { ServiceZonesModule } from './modules/service-zones/service-zones.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CategoriesModule } from './modules/categories/categories.module';
import { SubcategoriesModule } from './modules/subcategories/subcategories.module';
import { PackagesModule } from './modules/packages/packages.module';
import { AddonsModule } from './modules/addons/addons.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PortfoliosModule } from './modules/portfolios/portfolios.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { SellerAvailabilityModule } from './modules/seller-availability/seller-availability.module';
import { SupportModule } from './modules/support/support.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { SettingsModule } from './modules/settings/settings.module';
import { EmailModule } from './modules/email/email.module';
import { BannersModule } from './modules/banners/banners.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/v1/uploads',
    }),
    EmailModule,
    ServicesModule,
    ServiceZonesModule,
    CouponsModule,
    UsersModule,
    AuthModule,
    BookingsModule,
    PaymentsModule,
    AvailabilityModule,
    UploadsModule,
    SellersModule,
    CategoriesModule,
    SubcategoriesModule,
    PackagesModule,
    AddonsModule,
    ReviewsModule,
    PortfoliosModule,
    PayoutsModule,
    SellerAvailabilityModule,
    SupportModule,
    NotificationsModule,
    AuditLogsModule,
    SettingsModule,
    BannersModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
