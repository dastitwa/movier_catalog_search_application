import {
  IsString,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';

export class RankingSearchDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  query: string;

  @IsIn([
    'rating',
    'popularity',
    'recency',
    'all',
  ])
  mode:
    | 'rating'
    | 'popularity'
    | 'recency'
    | 'all';
}