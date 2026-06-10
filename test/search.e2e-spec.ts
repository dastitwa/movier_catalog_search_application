import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { ValidationPipe } from '@nestjs/common';

import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('Search API', () => {
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

  it('should fuzzy match Interstellar', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get('/movies/search/fuzzy')
      .query({
        q: 'intersteller',
      });

    expect(response.status).toBe(200);

    expect(
      response.body.total,
    ).toBeGreaterThan(0);
  });

  it('should reject short fuzzy query', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get('/movies/search/fuzzy')
      .query({
        q: 'a',
      });

    expect(response.status).toBe(400);
  });

  it('should reject invalid keyword field', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get('/movies/search/keyword')
      .query({
        field: 'password',
        value: 'test',
      });

    expect(response.status).toBe(400);
  });

  it('should reject invalid year', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get('/movies/search/combined')
      .query({
        q: 'batman',
        year: 5000,
      });

    expect(response.status).toBe(400);
  });
});