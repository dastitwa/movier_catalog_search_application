import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

import { MOVIES_INDEX } from '../movies/constants/index.constants';
import { movieMapping } from '../movies/mappings/movie.mapping';

async function bootstrap(): Promise<void> {
  const app =
    await NestFactory.createApplicationContext(
      AppModule,
    );

  const elasticsearchService =
    app.get(ElasticsearchService);

  const exists =
    await elasticsearchService.indexExists(
      MOVIES_INDEX,
    );

  if (exists) {
    console.log(
      `${MOVIES_INDEX} index already exists`,
    );

    await app.close();

    return;
  }

  await elasticsearchService.createIndex(
    MOVIES_INDEX,
    movieMapping,
  );

  console.log(
    `${MOVIES_INDEX} index created successfully`,
  );

  await app.close();
}

bootstrap();