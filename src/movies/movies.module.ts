import { Module } from '@nestjs/common';

import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';

import { SearchController } from './controllers/search.controller';

import { SearchService } from './services/search.service';

import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';

import { SearchSanitizerService } from './services/search-sanitizer.service';

import { BulkIndexService } from '../ingestion/bulk-index.service';

@Module({
  imports: [
    ElasticsearchModule,
  ],

  controllers: [
    SearchController,
    AnalyticsController,
  ],

  providers: [
    SearchService,
    AnalyticsService,
    SearchSanitizerService,
    BulkIndexService,
  ],

  exports: [
    BulkIndexService,
  ],
})
export class MoviesModule {}