import { Controller, Get } from '@nestjs/common';

import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

import { MOVIES_INDEX } from '../movies/constants/index.constants';

@Controller('health')
export class HealthController {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  @Get()
  async health() {
    const elasticsearch =
      await this.elasticsearchService.ping();

    const movieCount =
      await this.elasticsearchService.count(
        MOVIES_INDEX,
      );

    return {
      status: 'ok',
      elasticsearch,
      movieCount: movieCount.count,
    };
  }
}