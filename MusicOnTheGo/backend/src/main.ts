import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5050;
  const host = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for network access
  await app.listen(port, host);
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📝 API available at http://localhost:${port}/api`);
  console.log(`🌐 Network access: http://${host === '0.0.0.0' ? 'YOUR_IP' : host}:${port}/api`);
}

bootstrap();
