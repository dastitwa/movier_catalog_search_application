export function buildKeywordQuery(
  field: string,
  value: string,
) {
  const allowedFields = {
    director: 'director.keyword',
    genre: 'genre',
    language: 'language',
  };

  const targetField =
    allowedFields[
      field as keyof typeof allowedFields
    ];

  if (!targetField) {
    throw new Error(
      'Invalid keyword field',
    );
  }

  return {
    term: {
      [targetField]: {
        value,
      },
    },
  };
}