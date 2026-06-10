import { Injectable } from '@nestjs/common';

import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';

import { MOVIES_INDEX } from '../constants/index.constants';

import { buildGenreAggregation } from '../queries/genre-aggregation.query';
import { buildLanguageAggregation } from '../queries/language-aggregation.query';
import { buildDirectorAggregation } from '../queries/director-aggregation.query';
import { buildReleaseYearAggregation } from '../queries/release-year-aggregation.query';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async genres() {
    const response =
      await this.elasticsearchService.search(
        MOVIES_INDEX,
        {
          size: 0,

          aggs:
            buildGenreAggregation(),
        },
      );

    return response.aggregations;
  }

  async languages() {
    const response =
      await this.elasticsearchService.search(
        MOVIES_INDEX,
        {
          size: 0,

          aggs:
            buildLanguageAggregation(),
        },
      );

    return response.aggregations;
  }

  async directors() {
    const response =
      await this.elasticsearchService.search(
        MOVIES_INDEX,
        {
          size: 0,

          aggs:
            buildDirectorAggregation(),
        },
      );

    return response.aggregations;
  }

  async releaseYears() {
    const response =
      await this.elasticsearchService.search(
        MOVIES_INDEX,
        {
          size: 0,

          aggs:
            buildReleaseYearAggregation(),
        },
      );

    return response.aggregations;
  }
}