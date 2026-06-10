export function buildAutocompleteQuery(
    query: string,
  ) {
    return {
      multi_match: {
        query,
  
        type: 'bool_prefix',
  
        fields: [
          'title.autocomplete',
          'title.autocomplete._2gram',
          'title.autocomplete._3gram',
        ],
      },
    };
  }