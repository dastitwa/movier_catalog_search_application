export function buildPartialQuery(
  query: string,
) {
  const sanitizedQuery =
    query
      .trim()
      .replace(/[*?]/g, '');

  if (sanitizedQuery.length < 2) {
    throw new Error(
      'Query must contain at least 2 characters',
    );
  }

  return {
    wildcard: {
      'title.keyword': {
        value: `*${sanitizedQuery}*`,
        case_insensitive: true,
      },
    },
  };
}