import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

import { Type } from 'class-transformer';

export class FilteredSearchDto {
  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;
}