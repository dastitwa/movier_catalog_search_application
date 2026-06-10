# Movie Search Application using Elasticsearch

## Overview

The objective of this project is to gain hands-on experience with Elasticsearch by building a movie search application using NestJS and TypeScript.

The application ingests movie data from CSV files, creates an Elasticsearch index with custom mappings, indexes thousands of movie documents, and exposes REST APIs demonstrating different search capabilities and relevance-ranking concepts.

The project covers:

* Elasticsearch installation and setup
* Secure Elasticsearch connection
* Index creation and mappings
* Data ingestion and bulk indexing
* Full-text search
* Keyword search
* Partial search
* Fuzzy search
* Autocomplete
* Filtered search
* Combined search
* Search ranking optimization
* Aggregations and analytics
* Pagination

The final dataset contains 4,803 movie documents indexed into Elasticsearch.

---

# System Architecture

The application consists of three major layers:

## Data Ingestion Layer

Responsible for:

* Reading CSV files
* Transforming raw records
* Creating movie documents
* Bulk indexing into Elasticsearch

Flow:

CSV Files → Transformer → Elasticsearch Bulk API → Movies Index

---

## Search Layer

Responsible for:

* Query generation
* Search execution
* Ranking
* Pagination

Flow:

REST API → Search Service → Elasticsearch Query → Search Results

---

## Analytics Layer

Responsible for:

* Genre distribution
* Language distribution
* Director statistics
* Release year trends

Flow:

REST API → Aggregation Query → Elasticsearch → Aggregated Results

---

# Dataset Selection

The TMDB 5000 Movie Dataset was selected because it contains:

* Movie title
* Overview
* Genres
* Cast
* Director
* Release year
* Language
* Ratings
* Popularity metrics

This dataset is rich enough to demonstrate almost every common Elasticsearch search feature.

---

# Movie Schema Design

The application uses the following document structure:

```typescript
export interface Movie {
  id: string;

  title: string;

  description: string;

  genre: string[];

  cast: string[];

  director: string;

  releaseYear: number;

  language: string;

  rating: number;

  popularity: number;

  voteCount: number;
}
```

The schema was designed around the search requirements.

The assignment required:

* Full Text Search
* Keyword Search
* Partial Search
* Filtered Search
* Combined Search
* Autocomplete
* Fuzzy Search

Each field was selected specifically to support one or more of these search patterns.

---

# Mapping Design

The Movies index uses the following mapping:

```json
{
  "mappings": {
    "properties": {
      "id": {
        "type": "keyword"
      },

      "title": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          },
          "autocomplete": {
            "type": "search_as_you_type"
          }
        }
      },

      "description": {
        "type": "text"
      },

      "genre": {
        "type": "keyword"
      },

      "cast": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },

      "director": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },

      "releaseYear": {
        "type": "integer"
      },

      "language": {
        "type": "keyword"
      },

      "rating": {
        "type": "float"
      },

      "popularity": {
        "type": "float"
      },

      "voteCount": {
        "type": "integer"
      }
    }
  }
}
```

---

# Why Each Data Type Was Chosen

## id → keyword

Movie IDs must match exactly.

Examples:

* 155
* 272
* 209112

These values are never tokenized or analyzed.

Keyword fields provide exact matching and efficient lookups.

---

## title → text

Movie titles need:

* Full-text search
* Fuzzy search
* Partial search

Example:

Searching:

Batman

should match:

* Batman
* Batman Begins
* Batman Forever

Text fields are analyzed into tokens and therefore support natural language search.

---

## title.keyword → keyword

Used for exact title matching.

Example:

Searching:

Batman Begins

returns only the exact title.

---

## title.autocomplete → search_as_you_type

Used for autocomplete functionality.

Example:

Input:

Bat

Suggestions:

* Batman
* Batman Begins
* Batman Forever

This field was specifically added to support search-as-you-type behavior.

---

## description → text

Movie descriptions contain large amounts of natural language text.

Example:

"The Dark Knight of Gotham City begins his war on crime..."

These fields benefit from tokenization and relevance scoring.

---

## genre → keyword

Genres represent categories.

Examples:

* Action
* Drama
* Comedy

Users filter by genres rather than perform linguistic searches.

Keyword fields are ideal for filtering and aggregations.

---

## cast → text + keyword

Supports:

* Actor search
* Exact actor filtering

Examples:

Christian Bale

Tom Cruise

The text field supports searching.

The keyword subfield supports exact matches and aggregations.

---

## director → text + keyword

Supports:

* Searching directors
* Aggregating movies by director

Example:

Christopher Nolan

Steven Spielberg

---

## releaseYear → integer

Used for:

* Numeric filtering
* Sorting
* Histograms

Example:

Movies after 2010.

---

## language → keyword

Supports exact filtering.

Examples:

* en
* fr
* es

No text analysis is required.

---

## rating → float

Used for ranking and boosting.

Higher-rated movies can receive higher relevance scores.

---

## popularity → float

Represents movie popularity.

Used as an additional ranking signal.

---

## voteCount → integer

Provides additional quality signals.

Useful for future ranking enhancements.

---

# Data Ingestion Pipeline

The ingestion pipeline follows these steps:

## Step 1

Read:

tmdb_5000_movies.csv

## Step 2

Read:

tmdb_5000_credits.csv

## Step 3

Merge movie information and cast information.

## Step 4

Transform raw CSV rows into Movie documents.

## Step 5

Bulk index documents into Elasticsearch.

The final ingestion process indexed:

4,803 movies

using Elasticsearch Bulk API.

---

# Search Features

## Full Text Search

Purpose:

Search natural language text.

Example:

Search:

Batman

Query:

```json
{
  "multi_match": {
    "query": "batman",
    "fields": [
      "title^3",
      "description"
    ]
  }
}
```

Title receives a higher boost than description.

---

## Keyword Search

Purpose:

Exact matching.

Example:

director = Christopher Nolan

Query:

```json
{
  "term": {
    "director.keyword": "Christopher Nolan"
  }
}
```

---

## Partial Search

Purpose:

Match partial words.

Example:

dark

Matches:

* Dark Knight
* Dark Water
* Dark Shadows

Implemented using wildcard search.

---

## Fuzzy Search

Purpose:

Handle spelling mistakes.

Example:

intersteller

Returns:

Interstellar

Query:

```json
{
  "match": {
    "title": {
      "query": "intersteller",
      "fuzziness": "AUTO"
    }
  }
}
```

---

## Autocomplete Search

Purpose:

Search-as-you-type experience.

Example:

Bat

Returns:

* Batman
* Batman Begins
* Batman Forever

Implemented using:

search_as_you_type

mapping.

---

## Filter Search

Purpose:

Structured filtering.

Example:

Genre = Action

Language = English

Query:

```json
{
  "bool": {
    "filter": [
      {
        "term": {
          "genre": "Action"
        }
      }
    ]
  }
}
```

---

## Combined Search

Purpose:

Combine text search and filtering.

Example:

Batman

Genre = Action

Release Year > 2000

This combines full-text relevance with structured filtering.

---

# Ranking Strategy

Elasticsearch uses BM25 by default.

BM25 considers:

* Term frequency
* Document frequency
* Field length

This provides strong relevance ranking.

---

# Field Boosting

Titles are more important than descriptions.

Example:

```json
{
  "fields": [
    "title^3",
    "description"
  ]
}
```

A title match receives three times more importance.

---

# Rating Boost

Higher-rated movies should rank higher.

Example:

Interstellar (8.1)

should rank above

Random Movie (5.0)

when both match the query.

---

# Popularity Boost

Popular movies receive additional score improvements.

Example:

The Dark Knight

ranks higher than less popular Batman movies.

---

# Recency Boost

Recent movies receive a freshness advantage.

Newer releases are often more relevant to users.

---

# Pagination

Pagination was implemented to avoid returning large result sets.

Example:

```http
GET /movies/search/full-text?q=batman&page=2&size=5
```

This returns:

* Page number
* Page size
* Total documents
* Total pages
* Results

---

# Analytics and Aggregations

Elasticsearch aggregations were used to generate insights.

---

## Genre Analytics

Returns the most common genres.

Example:

* Drama
* Action
* Comedy

---

## Language Analytics

Returns language distribution.

Example:

* English
* French
* Spanish

---

## Director Analytics

Returns directors with the most movies.

Example:

* Steven Spielberg
* Ridley Scott
* Christopher Nolan

---

## Release Year Analytics

Implemented using histogram aggregations.

Shows how movie releases are distributed over time.

---

# Results

The application successfully:

* Indexed 4,803 movies
* Created optimized mappings
* Implemented multiple search strategies
* Demonstrated relevance ranking
* Implemented aggregations
* Added pagination support
* Exposed REST APIs using NestJS

The project provides a practical demonstration of Elasticsearch fundamentals and common real-world search engine features.
