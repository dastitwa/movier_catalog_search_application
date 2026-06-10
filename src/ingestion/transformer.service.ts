import { Logger } from '@nestjs/common';

import { Movie } from '../movies/interfaces/movie.interface';

export class TransformerService {
  private readonly logger = new Logger(
    TransformerService.name,
  );

  transformMovie(
    movieRow: any,
    creditRow: any,
  ): Movie {
    return {
      id: String(movieRow.id),

      title: movieRow.title ?? '',

      description:
        movieRow.overview ?? '',

      genre: this.extractGenres(
        movieRow.genres,
      ),

      cast: this.extractCast(
        creditRow?.cast,
      ),

      director: this.extractDirector(
        creditRow?.crew,
      ),

      releaseYear:
        movieRow.release_date
          ? new Date(
              movieRow.release_date,
            ).getFullYear()
          : 0,

      language:
        movieRow.original_language ??
        '',

      rating:
        Number(
          movieRow.vote_average,
        ) || 0,

      popularity:
        Number(
          movieRow.popularity,
        ) || 0,

      voteCount:
        Number(
          movieRow.vote_count,
        ) || 0,
    };
  }

  private extractGenres(
    genresJson: string,
  ): string[] {
    try {
      const genres =
        JSON.parse(genresJson);

      return genres.map(
        (genre: {
          name: string;
        }) => genre.name,
      );
    } catch {
      return [];
    }
  }

  private extractCast(
    castJson: string,
  ): string[] {
    try {
      const cast =
        JSON.parse(castJson);

      return cast
        .slice(0, 10)
        .map(
          (actor: {
            name: string;
          }) => actor.name,
        );
    } catch {
      return [];
    }
  }

  private extractDirector(
    crewJson: string,
  ): string {
    try {
      const crew =
        JSON.parse(crewJson);

      const director = crew.find(
        (member: {
          job: string;
        }) =>
          member.job === 'Director',
      );

      return director?.name ?? '';
    } catch {
      return '';
    }
  }

  logTransformationStats(
    count: number,
  ): void {
    this.logger.log(
      `Transformed ${count} movies`,
    );
  }
}