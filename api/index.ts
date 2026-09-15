// Точка входа для деплоя NestJS-приложения как serverless-функции на Vercel.
// Локальная разработка использует src/main.ts (обычный listen), этот файл
// используется только в проде на Vercel.
//
// Vercel Node.js функции вызываются как обычный (req, res) — как раз то,
// что умеет отдавать Express-приложение. Никакого AWS Lambda-адаптера
// (@vendia/serverless-express и т.п.) здесь не нужно — тот формат события
// рассчитан на API Gateway, а не на Vercel, отсюда была ошибка
// "Unable to determine event source based on event".
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express, { Express } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { AppModule } from '../src/app.module';

let cachedApp: Express | undefined;

async function bootstrapServer(): Promise<Express> {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors();
  await app.init();
  return expressApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cachedApp) {
    cachedApp = await bootstrapServer();
  }
  // Express-приложение само по себе — валидный (req, res) обработчик.
  cachedApp(req as unknown as express.Request, res as unknown as express.Response);
}
