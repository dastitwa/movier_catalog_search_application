import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { SearchService } from '../services/search.service';

import { FullTextSearchDto } from '../dto/full-text-search.dto';
import { KeywordSearchDto } from '../dto/keyword-search.dto';
import { FuzzySearchDto } from '../dto/fuzzy-search.dto';
import { AutocompleteSearchDto } from '../dto/autocomplete-search.dto';
import { FilteredSearchDto } from '../dto/filtered-search.dto';
import { CombinedSearchDto } from '../dto/combined-search.dto';
import { RankingSearchDto } from '../dto/ranking-search.dto';

import type {
  RankingMode,
} from '../queries/ranking.query';

@Controller('movies/search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
  ) {}

  @Get('full-text')
  async fullTextSearch(
    @Query() dto: FullTextSearchDto,

    @Query('page')
    page = '1',

    @Query('size')
    size = '10',
  ) {
    return this.searchService.fullTextSearch(
      dto.query,
      Number(page),
      Number(size),
    );
  }

  @Get('keyword')
  async keywordSearch(
    @Query() dto: KeywordSearchDto,

    @Query('page')
    page = '1',

    @Query('size')
    size = '10',
  ) {
    return this.searchService.keywordSearch(
      dto.field,
      dto.value,
      Number(page),
      Number(size),
    );
  }

  @Get('fuzzy')
  async fuzzySearch(
    @Query() dto: FuzzySearchDto,

    @Query('page')
    page = '1',

    @Query('size')
    size = '10',
  ) {
    return this.searchService.fuzzySearch(
      dto.query,
      Number(page),
      Number(size),
    );
  }

  @Get('autocomplete')
  async autocompleteSearch(
    @Query() dto: AutocompleteSearchDto,

    @Query('page')
    page = '1',

    @Query('size')
    size = '10',
  ) {
    return this.searchService.autocompleteSearch(
      dto.query,
      Number(page),
      Number(size),
    );
  }

  @Get('partial')
  async partialSearch(
    @Query() dto: FuzzySearchDto,

    @Query('page')
    page = '1',

    @Query('size')
    size = '10',
  ) {
    return this.searchService.partialSearch(
      dto.query,
      Number(page),
      Number(size),
    );
  }

  @Get('filter')
  async filterSearch(
    @Query() dto: FilteredSearchDto,

    @Query('page')
    page = '1',

    @Query('size')
    size = '10',
  ) {
    return this.searchService.filterSearch(
      dto.genre,
      dto.language,
      Number(page),
      Number(size),
    );
  }

  @Get('combined')
  async combinedSearch(
    @Query() dto: CombinedSearchDto,

    @Query('page')
    page = '1',

    @Query('size')
    size = '10',
  ) {
    return this.searchService.combinedSearch(
      dto.query,
      dto.genre,
      dto.year,
      Number(page),
      Number(size),
    );
  }

  @Get('ranking')
  async rankingSearch(
    @Query() dto: RankingSearchDto,

    @Query('page')
    page = '1',

    @Query('size')
    size = '10',
  ) {
    return this.searchService.rankingSearch(
      dto.query,
      dto.mode as RankingMode,
      Number(page),
      Number(size),
    );
  }
}