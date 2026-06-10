export function buildFullTextQuery(
  searchText: string,
) {
  return {
    bool: {
      should: [
        {
          term: {
            'title.keyword': {
              value: searchText,
              boost: 50,
            },
          },
        },

        {
          match_phrase: {
            title: {
              query: searchText,
              boost: 25,
            },
          },
        },

        {
          multi_match: {
            query: searchText,

            fields: [
              'title^5',
              'description',
            ],
          },
        },
      ],

      minimum_should_match: 1,
    },
  };
}