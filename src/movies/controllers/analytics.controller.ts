import {
    Controller,
    Get,
  } from '@nestjs/common';
  
  import { AnalyticsService } from '../services/analytics.service';
  
  @Controller('movies/analytics')
  export class AnalyticsController {
    constructor(
      private readonly analyticsService: AnalyticsService,
    ) {}
  
    @Get('genres')
    async genres() {
      return this.analyticsService.genres();
    }
  
    @Get('languages')
    async languages() {
      return this.analyticsService.languages();
    }
  
    @Get('directors')
    async directors() {
      return this.analyticsService.directors();
    }
  
    @Get('release-years')
    async releaseYears() {
      return this.analyticsService.releaseYears();
    }
  }