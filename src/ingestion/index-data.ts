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

    const moviesCsvPath =
      process.env.MOVIES_CSV_PATH ??
      './data/tmdb_5000_movies.csv';

    const creditsCsvPath =
      process.env.CREDITS_CSV_PATH ??
      './data/tmdb_5000_credits.csv';

    logger.log(
      `Movies CSV Path: ${moviesCsvPath}`,
    );

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
      `Credits CSV Path: ${creditsCsvPath}`,
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
      error,
    );
  } finally {
    await app.close();
  }
}

bootstrap();