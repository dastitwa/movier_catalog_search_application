# Movie Catalog Search Application

A NestJS + Elasticsearch application that indexes a movie dataset and exposes REST APIs demonstrating full-text search, keyword search, partial/autocomplete search, filtered search, relevance ranking, and search analytics.

Built using the [TMDB 5000 Movie Dataset](https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata) — 4,803 indexed documents.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22, TypeScript |
| Framework | NestJS 11 |
| Search Engine | Elasticsearch 8.17 |
| Containerisation | Docker + Docker Compose |
| Validation | class-validator, Joi |

---

## Project Structure

```
src/
├── app.module.ts                  # Root module — wires throttling, middleware, config
├── main.ts                        # Bootstrap, graceful shutdown (SIGTERM/SIGINT)
├── common/
│   ├── filters/
│   │   └── global-exception.filter.ts   # Catches all unhandled exceptions
│   ├── interceptors/
│   │   └── execution-time.interceptor.ts # Logs method, path, duration, requestId
│   ├── logger/
│   │   └── logger.service.ts            # Extended NestJS Logger
│   └── middleware/
│       └── correlation-id.middleware.ts # Attaches x-request-id to every request
├── config/
│   ├── configuration.ts
│   └── env.validation.ts               # Joi schema — validates required env vars on boot
├── elasticsearch/
│   ├── elasticsearch.module.ts
│   └── elasticsearch.service.ts        # Client wrapper with retry backoff + error handling
├── health/
│   ├── health.module.ts
│   └── health.controller.ts            # GET /api/v1/health
├── ingestion/
│   ├── create-index.ts                 # Script: create ES index with mapping
│   ├── index-data.ts                   # Script: read CSVs, transform, bulk index
│   ├── bulk-index.service.ts           # Batched bulk indexing (500 docs/batch)
│   ├── csv-reader.service.ts           # Streams CSV with file-wait retry logic
│   └── transformer.service.ts         # Maps raw CSV rows → Movie documents
└── movies/
    ├── constants/index.constants.ts    # Index name constant
    ├── controllers/
    │   ├── search.controller.ts        # GET /api/v1/movies/search/*
    │   └── analytics.controller.ts    # GET /api/v1/movies/analytics/*
    ├── dto/                            # Validated + typed query parameter objects
    ├── interfaces/
    │   ├── movie.interface.ts
    │   └── search-response.interface.ts
    ├── mappings/movie.mapping.ts       # Elasticsearch index mapping definition
    ├── queries/                        # Pure query builder functions
    └── services/
        ├── search.service.ts
        ├── analytics.service.ts
        └── search-sanitizer.service.ts

docker/
└── entrypoint.sh   # Waits for ES, creates index, optionally ingests, starts app
```

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Or: Node.js 22+ and a running Elasticsearch 8.x instance

---

## Quickstart — Docker (Recommended)

This is the zero-config path. Docker Compose starts Elasticsearch and the app together.

```bash
# 1. Clone the repo
git clone <repo-url>
cd movie-search-app

# 2. Start everything
docker compose up --build
```

The entrypoint script will:
1. Wait for Elasticsearch to be ready
2. Create the `movies` index
3. Ingest the TMDB dataset (because `AUTO_INGEST=true` is set in `docker-compose.yml`)
4. Start the API on port 3000

> First startup takes 2–4 minutes while data is ingested. Watch for `Movie Ingestion Completed Successfully` in the logs.

Once running, verify:
```
GET http://localhost:3000/api/v1/health
```

---

## Local Development (without Docker)

### 1. Start Elasticsearch Locally

Option A — Docker (ES only):
```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e discovery.type=single-node \
  -e xpack.security.enabled=false \
  docker.elastic.co/elasticsearch/elasticsearch:8.17.0
```

Option B — Use your existing local Elasticsearch with security enabled.

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` for your setup:

```env
# No-auth local Elasticsearch (Docker):
NODE_ENV=development
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_SECURITY_ENABLED=false
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=

# Secured local Elasticsearch:
NODE_ENV=development
ELASTICSEARCH_NODE=https://localhost:9200
ELASTICSEARCH_SECURITY_ENABLED=true
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-password
```

### 3. Install, Index, and Run

```bash
npm install

# Create the Elasticsearch index
npm run create-index

# Ingest the movie dataset (~4,800 docs)
npm run index-data

# Start the API
npm run start:dev
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | HTTP port |
| `NODE_ENV` | No | `development` | Environment (`development`, `production`, `test`) |
| `ELASTICSEARCH_NODE` | **Yes** | — | Elasticsearch URL |
| `ELASTICSEARCH_SECURITY_ENABLED` | No | `false` | Set `true` to enable auth |
| `ELASTICSEARCH_USERNAME` | No | — | ES username (when security enabled) |
| `ELASTICSEARCH_PASSWORD` | No | — | ES password (when security enabled) |
| `AUTO_INGEST` | No | `false` | Auto-run ingestion on container start |
| `MOVIES_CSV_PATH` | No | `./data/tmdb_5000_movies.csv` | Path to movies CSV |
| `CREDITS_CSV_PATH` | No | `./data/tmdb_5000_credits.csv` | Path to credits CSV |
| `INGESTION_RETRIES` | No | `5` | File-read retry attempts |
| `INGESTION_RETRY_DELAY_MS` | No | `3000` | Delay between retries (ms) |

---

## API Reference

All endpoints are prefixed with `/api/v1`.  
Rate limit: **30 requests per minute** per IP.  
Every response includes an `x-request-id` header for tracing.

---

### Health

#### `GET /api/v1/health`

```json
{
  "status": "ok",
  "elasticsearch": true,
  "movieCount": 4803
}
```

---

### Search Endpoints

All search endpoints support pagination:

| Parameter | Default | Constraints |
|---|---|---|
| `page` | `1` | min: 1 |
| `size` | `10` | min: 1, max: 50 |

Pagination is capped at 10,000 documents (`from + size ≤ 10000`).

---

#### `GET /api/v1/movies/search/full-text`

Searches `title` (boosted ×5) and `description` using `multi_match`. Also applies exact-title and phrase boosts.

| Param | Required | Description |
|---|---|---|
| `query` | Yes | Search text (2–100 chars) |

```
GET /api/v1/movies/search/full-text?query=dark+knight
```

```json
{
  "page": 1,
  "size": 10,
  "total": 3,
  "totalPages": 1,
  "executionTimeMs": 12,
  "results": [
    { "score": 38.4, "title": "The Dark Knight", "releaseYear": 2008, ... }
  ]
}
```

---

#### `GET /api/v1/movies/search/keyword`

Exact-match search on a specific field (no tokenisation).

| Param | Required | Allowed values |
|---|---|---|
| `field` | Yes | `director`, `genre`, `language` |
| `value` | Yes | Exact value to match |

```
GET /api/v1/movies/search/keyword?field=director&value=Christopher+Nolan
```

---

#### `GET /api/v1/movies/search/partial`

Prefix/partial search using edge n-grams (`title.autocomplete`). Best for UI typeahead.

| Param | Required | Description |
|---|---|---|
| `query` | Yes | Partial input (2–100 chars) |

```
GET /api/v1/movies/search/partial?query=inter
```

---

#### `GET /api/v1/movies/search/autocomplete`

`search_as_you_type` field query. Returns instant prefix matches as the user types.

| Param | Required | Description |
|---|---|---|
| `query` | Yes | Partial input (2–100 chars) |

```
GET /api/v1/movies/search/autocomplete?query=bat
```

---

#### `GET /api/v1/movies/search/fuzzy`

Typo-tolerant search using Elasticsearch fuzzy matching. Handles spelling mistakes.

| Param | Required | Description |
|---|---|---|
| `query` | Yes | Search text with possible typos (2–100 chars) |

```
GET /api/v1/movies/search/fuzzy?query=intersteller
```

---

#### `GET /api/v1/movies/search/filter`

Filter movies by field values. No relevance scoring — uses ES `filter` context (cacheable).

| Param | Required | Description |
|---|---|---|
| `genre` | No | Exact genre match e.g. `Action` |
| `language` | No | Exact language code e.g. `en` |
| `year` | No | Minimum release year (1900–2100) |

```
GET /api/v1/movies/search/filter?genre=Action&language=en&year=2010
```

---

#### `GET /api/v1/movies/search/combined`

Full-text query + filter clauses together.

| Param | Required | Description |
|---|---|---|
| `query` | Yes | Search text (2–100 chars) |
| `genre` | No | Filter by genre |
| `year` | No | Minimum release year |

```
GET /api/v1/movies/search/combined?query=action+hero&genre=Action&year=2010
```

---

#### `GET /api/v1/movies/search/ranking`

Relevance-tuned search using `function_score`. Boosts results by rating, popularity, or recency.

| Param | Required | Allowed values |
|---|---|---|
| `query` | Yes | Search text (2–100 chars) |
| `mode` | Yes | `rating`, `popularity`, `recency`, `all` |

```
GET /api/v1/movies/search/ranking?query=space&mode=rating
```

**Modes:**
- `rating` — boosts highly rated movies (`field_value_factor` on `rating`)
- `popularity` — boosts by TMDB popularity score
- `recency` — boosts newer movies (Gaussian decay from 2026)
- `all` — applies all three boosts together

---

### Analytics Endpoints

#### `GET /api/v1/movies/analytics/genres`

Top genres by document count (`terms` aggregation, top 20).

#### `GET /api/v1/movies/analytics/languages`

Language distribution across the dataset.

#### `GET /api/v1/movies/analytics/directors`

Top directors by number of movies.

#### `GET /api/v1/movies/analytics/release-years`

Movie count per release year (`histogram` aggregation, interval 1).

---

## Elasticsearch Mapping Summary

| Field | Type | Reason |
|---|---|---|
| `id` | `keyword` | Exact ID lookups, no tokenisation needed |
| `title` | `text` + `.keyword` + `.autocomplete` | Full-text search, exact match, and `search_as_you_type` for autocomplete |
| `description` | `text` | Full-text search only |
| `genre` | `keyword` | Filtering and aggregations — not tokenised |
| `cast` | `text` + `.keyword` | Actor name search and exact match |
| `director` | `text` + `.keyword` | Name search and exact keyword filter |
| `language` | `keyword` | Filter by language code |
| `releaseYear` | `integer` | Range filters and histogram aggregation |
| `rating` | `float` | Sorting and `field_value_factor` boosting |
| `popularity` | `float` | `field_value_factor` boosting |
| `voteCount` | `integer` | Informational |

---

## Running Tests

```bash
# e2e tests (requires a running Elasticsearch)
npm run test:e2e
```

> Tests spin up the full NestJS application and make real HTTP requests. Ensure Elasticsearch is running and the index is populated before running tests.

---

## Docker Details

### Compose Services

| Service | Port | Notes |
|---|---|---|
| `elasticsearch` | 9200 | Single-node, security disabled |
| `movie-search-app` | 3000 | Waits for ES health before starting |

### Entrypoint Flow

```
Container starts
  → Wait for Elasticsearch (HTTP polling)
  → node dist/ingestion/create-index.js
  → if AUTO_INGEST=true: node dist/ingestion/index-data.js
  → exec node dist/main.js
```

### Rebuild After Code Changes

```bash
docker compose up --build
```

### Stop and Remove Data

```bash
docker compose down -v   # -v removes the ES data volume
```

---

## Ingestion Scripts (Manual)

If `AUTO_INGEST` is disabled or you want to re-index:

```bash
# Create index (idempotent — skips if already exists)
npm run create-index

# Ingest data
npm run index-data
```

Re-indexing from scratch:

```bash
# Delete the index via Elasticsearch API, then re-create
curl -X DELETE http://localhost:9200/movies
npm run create-index
npm run index-data
```