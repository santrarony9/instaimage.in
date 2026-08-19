import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { ServicesService } from './modules/services/services.service';
import { ServiceZonesService } from './modules/service-zones/service-zones.service';
import { UsersService } from './modules/users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ApiModule);
  
  const servicesService = app.get(ServicesService);
    description: 'Get your edited photos delivered within 48 hours guaranteed.',
    price: 3000,
    isActive: true,
  });

  logger.log('✅ Database Seeding Completed Successfully!');
  await app.close();
  process.exit(0);
}

bootstrap();
