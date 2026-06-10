export function buildGenreAggregation() {
    return {
      genres: {
        terms: {
          field: 'genre',
          size: 20,
        },
      },
    };
  }