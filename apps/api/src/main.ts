import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('LocalRide Hub API')
    .setDescription('Rural Nigeria mobility hub API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter Firebase ID token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('passengers', 'Passenger profiles')
    .addTag('drivers', 'Driver profiles and discovery')
    .addTag('presence', 'Driver presence and location')
    .addTag('documents', 'Driver document management')
    .addTag('admin', 'Admin operations')
    .addTag('reviews', 'Driver reviews')
    .build();

  try {
    const document = SwaggerModule.createDocument(app, config, {
      ignoreGlobalPrefix: false,
    });
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  } catch (error) {
    console.warn('⚠️  Swagger setup failed, but API will continue:', error.message);
    console.warn('   This is usually due to custom decorators. API endpoints are still functional.');
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/docs`);
}

bootstrap();

