import {
  IsString,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';

export class KeywordSearchDto {
  @IsIn([
    'director',
    'genre',
    'language',
  ])
  field: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  value: string;
}