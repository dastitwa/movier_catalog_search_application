export function buildDirectorAggregation() {
    return {
      directors: {
        terms: {
          field: 'director.keyword',
          size: 20,
        },
      },
    };
  }