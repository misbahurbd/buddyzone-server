import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { EnvVariables } from 'src/common/validators/env-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const configureSwagger = (
  app: INestApplication,
  configService: ConfigService<EnvVariables>,
) => {
  const sessionName = configService.getOrThrow<string>('SESSION_NAME');
  const apiUrl = configService.getOrThrow<string>('API_URL');
  const port = configService.getOrThrow<number>('PORT');

  const config = new DocumentBuilder()
    .setTitle('BuddyZone API')
    .setDescription('BuddyZone API documentation')
    .setVersion('1.0')
    .addCookieAuth(sessionName, {
      type: 'apiKey',
      in: 'cookie',
      name: sessionName,
      description: 'Session cookie for authentication',
    })
    .addServer(`http://localhost:${port}`, 'Development API')
    .addServer(apiUrl, 'Production API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};
