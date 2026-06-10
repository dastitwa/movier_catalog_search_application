export function buildFilteredQuery(
    genre?: string,
    language?: string,
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
  
    if (language) {
      filters.push({
        term: {
          language,
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
        filter: filters,
      },
    };
  }