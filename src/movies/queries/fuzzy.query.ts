export function buildFuzzyQuery(
    query: string,
  ) {
    return {
      match: {
        title: {
          query,
          fuzziness: 'AUTO',
        },
      },
    };
  }