export const movieMapping = {
  properties: {
    id: {
      type: 'keyword',
    },

    title: {
      type: 'text',
      fields: {
        keyword: {
          type: 'keyword',
        },

        autocomplete: {
          type: 'search_as_you_type',
        },
      },
    },

    description: {
      type: 'text',
    },

    genre: {
      type: 'keyword',
    },

    cast: {
      type: 'text',
      fields: {
        keyword: {
          type: 'keyword',
        },
      },
    },

    director: {
      type: 'text',
      fields: {
        keyword: {
          type: 'keyword',
        },
      },
    },

    language: {
      type: 'keyword',
    },

    releaseYear: {
      type: 'integer',
    },

    rating: {
      type: 'float',
    },

    popularity: {
      type: 'float',
    },

    voteCount: {
      type: 'integer',
    },
  },
};