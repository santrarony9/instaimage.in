import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { ServicesService } from './modules/services/services.service';
import { ServiceZonesService } from './modules/service-zones/service-zones.service';
import { UsersService } from './modules/users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ApiModule);
  
  const servicesService = app.get(ServicesService);
  const zonesService = app.get(ServiceZonesService);
  const usersService = app.get(UsersService);

  console.log('Seed starting');
  
  await app.close();
}

bootstrap();
