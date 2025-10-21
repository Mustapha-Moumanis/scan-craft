import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { swaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
		origin: process.env.ENABLE_CORS,
		credentials: true,
		methods: 'GET,POST,PUT,PATCH,DELETE',
		allowedHeaders: 'Content-Type, Authorization, Cookie, withCredentials',
	});

	app.setGlobalPrefix('api');
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  const documentFactory = () =>
  SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api/swagger', app, documentFactory, {
		customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
		customJs: [
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js',
		],
	});
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
