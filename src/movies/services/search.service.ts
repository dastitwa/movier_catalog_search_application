import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';

import { buildFullTextQuery } from '../queries/full-text.query';
import { buildKeywordQuery } from '../queries/keyword.query';
import { buildFuzzyQuery } from '../queries/fuzzy.query';
import { buildAutocompleteQuery } from '../queries/autocomplete.query';
import { buildPartialQuery } from '../queries/partial.query';
import { buildFilteredQuery } from '../queries/filtered.query';
import { buildCombinedQuery } from '../queries/combined.query';

import {
  buildRankingQuery,
  RankingMode,
} from '../queries/ranking.query';

@Injectable()
export class SearchService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async fullTextSearch(
    query: string,
    page = 1,
    size = 10,
  ) {
    return this.executeSearch(
      buildFullTextQuery(query),
      page,
      size,
    );
  }

  async keywordSearch(
    field: string,
    value: string,
    page = 1,
    size = 10,
  ) {
    return this.executeSearch(
      buildKeywordQuery(field, value),
      page,
      size,
    );
  }

  async fuzzySearch(
    query: string,
    page = 1,
    size = 10,
  ) {
    return this.executeSearch(
      buildFuzzyQuery(query),
      page,
      size,
    );
  }

  async autocompleteSearch(
    query: string,
    page = 1,
    size = 10,
  ) {
    return this.executeSearch(
      buildAutocompleteQuery(query),
      page,
      size,
    );
  }

  async partialSearch(
    query: string,
    page = 1,
    size = 10,
  ) {
    return this.executeSearch(
      buildPartialQuery(query),
      page,
      size,
    );
  }

  async filterSearch(
    genre?: string,
    language?: string,
    page = 1,
    size = 10,
  ) {
    return this.executeSearch(
      buildFilteredQuery(
        genre,
        language,
      ),
      page,
      size,
    );
  }

  async combinedSearch(
    query: string,
    genre?: string,
    year?: number,
    page = 1,
    size = 10,
  ) {
    return this.executeSearch(
      buildCombinedQuery(
        query,
        genre,
        year,
      ),
      page,
      size,
    );
  }

  async rankingSearch(
    query: string,
    mode: RankingMode = 'all',
    page = 1,
    size = 10,
  ) {
    return this.executeSearch(
      buildRankingQuery(
        query,
        mode,
      ),
      page,
      size,
    );
  }

  private async executeSearch(
    queryBody: Record<string, any>,
    page = 1,
    size = 10,
  ) {
    if (page < 1) {
      throw new BadRequestException(
        'Page must be greater than 0',
      );
    }
  
    if (size < 1 || size > 50) {
      throw new BadRequestException(
        'Size must be between 1 and 50',
      );
    }
  
    const from = (page - 1) * size;
  
    // Elasticsearch recommends avoiding deep pagination.
    // For results beyond 10,000 documents, use search_after.
    if (from + size > 10000) {
      throw new BadRequestException(
        'Deep pagination is not supported. Use search_after for results beyond 10,000 documents.',
      );
    }
  
    const start = Date.now();
  
    const response =
      await this.elasticsearchService.search(
        'movies',
        {
          query: queryBody,
          from,
          size,
        },
      );
  
    const rawTotal = response.hits.total;
  
    const total =
      typeof rawTotal === 'number'
        ? rawTotal
        : rawTotal?.value ?? 0;
  
    return {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
      executionTimeMs:
        Date.now() - start,
      results:
        response.hits.hits.map(
          (hit) => ({
            score: hit._score,
            ...(hit._source as object),
          }),
        ),
    };
  }
}