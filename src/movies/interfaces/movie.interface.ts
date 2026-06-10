export interface Movie {
  id: string;

  title: string;

  description: string;

  genre: string[];

  cast: string[];

  director: string;

  releaseYear: number;

  language: string;

  rating: number;

  popularity: number;

  voteCount: number;
}