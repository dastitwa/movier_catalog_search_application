export function buildReleaseYearAggregation() {
    return {
      releaseYears: {
        histogram: {
          field: 'releaseYear',
          interval: 5,
        },
      },
    };
  }