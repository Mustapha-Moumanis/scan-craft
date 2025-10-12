import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
	.setTitle('Assignment API')
	.setDescription('Assignment API Documentation')
	.setVersion('0.0.1')
	.build();
