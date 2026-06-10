#!/bin/sh

set -e

echo "Waiting for Elasticsearch..."

until curl -s "$ELASTICSEARCH_NODE" > /dev/null
do
  echo "Elasticsearch not ready..."
  sleep 5
done

echo "Elasticsearch ready"

echo "Creating index..."
node dist/ingestion/create-index.js

if [ "$AUTO_INGEST" = "true" ]; then
  echo "Running ingestion..."
  node dist/ingestion/index-data.js
fi

echo "Starting API..."
node dist/main.js