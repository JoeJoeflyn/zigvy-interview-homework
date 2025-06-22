import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  // Validate client data, transform values, and strip away fields not defined in the DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('API Document V1')
    .setDescription('API Document for ZigTask API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger for API
  SwaggerModule.setup('api', app, document);

  const port = process.env.API_GATEWAY_PORT ?? process.env.PORT ?? 5101;

  await app.listen(port);

  console.log(`API Gateway running on port ${port}`);
}
bootstrap();
