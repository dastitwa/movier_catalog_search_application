export function buildCombinedQuery(
  query: string,
  genre?: string,
  year?: number,
) {
  const filters: any[] = [];

  if (genre) {
    filters.push({
      term: {
        genre,
      },
    });
  }

  if (year) {
    filters.push({
      range: {
        releaseYear: {
          gte: year,
        },
      },
    });
  }

  return {
    bool: {
      must: [
        {
          bool: {
            should: [
              {
                term: {
                  'title.keyword': {
                    value: query,
                    boost: 20,
                  },
                },
              },

              {
                match_phrase: {
                  title: {
                    query,
                    boost: 10,
                  },
                },
              },

              {
                multi_match: {
                  query,

                  fields: [
                    'title^3',
                    'description',
                  ],
                },
              },
            ],

            minimum_should_match: 1,
          },
        },
      ],

      filter: filters,
    },
  };
}