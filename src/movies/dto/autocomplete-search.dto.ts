import {
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class AutocompleteSearchDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  query: string;
}