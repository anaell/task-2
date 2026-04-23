import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // To enable cors
  app.enableCors({ origin: '*' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties not in the DTO
      // forbidNonWhitelisted: true, // Throws error if extra properties are sent
      transform: true, // Auto-transforms payloads to DTO instances

      exceptionFactory(errors) {
        // Use a recursive search or just grab the first available constraint.
        // I'm gonna grab just the first error.
        const firstError = errors[0];

        // If the error is nested, the constraints are inside 'children'
        const constraints = firstError.constraints
          ? firstError.constraints
          : firstError.children?.[0].constraints;

        // Take the very first error message found in the DTO
        const message = Object.values(constraints!)[0];

        // The below is to Check which constraint failed and then send an appropriate error response
        // 'isString' corresponds to the @IsString decorator
        if (
          errors[0].constraints?.isString ||
          errors[0].constraints?.isEnum ||
          errors[0].constraints?.isNumber
        ) {
          return new UnprocessableEntityException({
            status: 'error',
            // The below was adjusted for task-2
            // message: message,
            message: 'Invalid query parameters',
          });
        }

        // This return defines the EXACT JSON the user sees which follows what's recommended.
        return new BadRequestException({ status: 'error', message: message });
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);

  // To get the full url after the app starts
  const url = await app.getUrl();
  console.log(`Application is running on: ${url}`);
}
bootstrap();
