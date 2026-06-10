export function buildLanguageAggregation() {
    return {
      languages: {
        terms: {
          field: 'language',
          size: 20,
        },
      },
    };
  }