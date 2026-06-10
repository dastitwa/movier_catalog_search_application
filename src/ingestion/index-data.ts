import * as fs from 'fs';

import {
  Logger,
} from '@nestjs/common';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';

import { CsvReaderService } from './csv-reader.service';

import { TransformerService } from './transformer.service';

import { BulkIndexService } from './bulk-index.service';

import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

import { MOVIES_INDEX } from '../movies/constants/index.constants';

async function bootstrap(): Promise<void> {
  const logger =
    new Logger(
      'MovieIngestion',
    );

  logger.log(
    'Starting Movie Ingestion Pipeline',
  );

  const app =
    await NestFactory.createApplicationContext(
      AppModule,
    );

  try {
    const csvReader =
      new CsvReaderService();

    const transformer =
      new TransformerService();

    const bulkIndexer =
      app.get(
        BulkIndexService,
      );

    const elasticsearchService =
      app.get(
        ElasticsearchService,
      );

    if (
      !process.env.MOVIES_CSV_PATH
    ) {
      throw new Error(
        'MOVIES_CSV_PATH environment variable is required',
      );
    }

    if (
      !process.env.CREDITS_CSV_PATH
    ) {
      throw new Error(
        'CREDITS_CSV_PATH environment variable is required',
      );
    }

    const moviesCsvPath =
      process.env.MOVIES_CSV_PATH;

    const creditsCsvPath =
      process.env.CREDITS_CSV_PATH;

    logger.log(
      `Movies CSV Path: ${moviesCsvPath}`,
    );

    logger.log(
      `Credits CSV Path: ${creditsCsvPath}`,
    );

    if (
      !fs.existsSync(
        moviesCsvPath,
      )
    ) {
      throw new Error(
        `Movies CSV not found: ${moviesCsvPath}`,
      );
    }

    if (
      !fs.existsSync(
        creditsCsvPath,
      )
    ) {
      throw new Error(
        `Credits CSV not found: ${creditsCsvPath}`,
      );
    }

    logger.log(
      'Reading Movies CSV',
    );

    const movies =
      await csvReader.readCsv(
        moviesCsvPath,
      );

    logger.log(
      `Movies Loaded: ${movies.length}`,
    );

    logger.log(
      'Reading Credits CSV',
    );

    const credits =
      await csvReader.readCsv(
        creditsCsvPath,
      );

    logger.log(
      `Credits Loaded: ${credits.length}`,
    );

    const creditsMap =
      new Map(
        credits.map(
          (credit) => [
            credit.movie_id,
            credit,
          ],
        ),
      );

    logger.log(
      'Credits Map Created',
    );

    const transformedMovies =
      movies.map(
        (movie) =>
          transformer.transformMovie(
            movie,
            creditsMap.get(
              movie.id,
            ),
          ),
      );

    transformer.logTransformationStats(
      transformedMovies.length,
    );

    logger.log(
      'Starting Bulk Indexing',
    );

    await bulkIndexer.bulkIndex(
      transformedMovies,
    );

    logger.log(
      'Bulk Indexing Completed',
    );

    const count =
      await elasticsearchService.count(
        MOVIES_INDEX,
      );

    logger.log(
      `Indexed Documents Count: ${count.count}`,
    );

    logger.log(
      'Movie Ingestion Completed Successfully',
    );
  } catch (error) {
    logger.error(
      'Movie Ingestion Failed',
      error instanceof Error
        ? error.stack
        : String(error),
    );

    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();