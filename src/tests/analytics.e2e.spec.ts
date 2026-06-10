import { Test } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';

import request from 'supertest';

import { AppModule } from '../app.module';

describe('Analytics API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return genres', async () => {
    const response = await request(
      app.getHttpServer(),
    ).get(
      '/movies/analytics/genres',
    );

    expect(response.status).toBe(200);
  });

  it('should return languages', async () => {
    const response = await request(
      app.getHttpServer(),
    ).get(
      '/movies/analytics/languages',
    );

    expect(response.status).toBe(200);
  });

  it('should return directors', async () => {
    const response = await request(
      app.getHttpServer(),
    ).get(
      '/movies/analytics/directors',
    );

    expect(response.status).toBe(200);
  });

  it('should return release years', async () => {
    const response = await request(
      app.getHttpServer(),
    ).get(
      '/movies/analytics/release-years',
    );

    expect(response.status).toBe(200);
  });
});