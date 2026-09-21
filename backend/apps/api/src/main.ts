import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiModule } from './api.module';
import { JwtAuthGuard, RolesGuard } from '@app/auth';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {
    bufferLogs: true,
  });

  // Security Headers
  app.use(helmet());

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Guards
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  // CORS
  app.enableCors({
    origin: [
      'https://instaimage.in',
      'https://www.instaimage.in',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  Logger.log(`🚀 API Application running on http://localhost:${port}/v1`, 'Bootstrap');

  // OpenAPI Swagger Setup (disabled in production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Photography Marketplace API')
      .setDescription('Enterprise Photography & Media Fulfillment Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`📚 Swagger Docs available at http://localhost:${port}/api/docs`);
  }
}
bootstrap();
