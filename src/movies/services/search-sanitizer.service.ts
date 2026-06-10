import { Injectable } from "@nestjs/common";

@Injectable()
export class SearchSanitizerService {
  sanitize(value: string): string {
    return value
      .trim()
      .replace(/[<>]/g, '')
      .replace(/[*?]/g, '');
  }
}