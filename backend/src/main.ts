import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { swaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with support for multiple origins
  const corsOrigins = process.env.ENABLE_CORS?.split(',').map(origin => origin.trim()) || ['http://localhost'];
  
  app.enableCors({
		origin: corsOrigins,
		credentials: true,
		methods: 'GET,POST,PUT,PATCH,DELETE',
		allowedHeaders: 'Content-Type, Authorization, Cookie, withCredentials',
	});

	app.setGlobalPrefix('api');
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  const documentFactory = () =>
  SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api/swagger', app, documentFactory);
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
