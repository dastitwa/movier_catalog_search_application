export type RankingMode =
  | 'rating'
  | 'popularity'
  | 'recency'
  | 'all';

export function buildRankingQuery(
  query: string,
  mode: RankingMode = 'all',
) {
  const functions: any[] = [];

  if (mode === 'rating' || mode === 'all') {
    functions.push({
      field_value_factor: {
        field: 'rating',
        factor: 2,
        missing: 1,
      },
    });
  }

  if (mode === 'popularity' || mode === 'all') {
    functions.push({
      field_value_factor: {
        field: 'popularity',
        factor: 0.02,
        missing: 1,
      },
    });
  }

  if (mode === 'recency' || mode === 'all') {
    functions.push({
      gauss: {
        releaseYear: {
          origin: 2026,
          scale: 15,
          offset: 2,
          decay: 0.5,
        },
      },
      weight: 2,
    });
  }

  return {
    function_score: {
      query: {
        multi_match: {
          query,
          fields: [
            'title^3',
            'description',
          ],
        },
      },

      functions,

      score_mode: 'sum',
      boost_mode: 'sum',
    },
  };
}