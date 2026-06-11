#!/bin/sh

set -e

echo "Waiting for Elasticsearch..."

node -e "
const http = require('http');

const url = process.env.ELASTICSEARCH_NODE || 'http://elasticsearch:9200';

function check() {
  http.get(url, (res) => {
    if (res.statusCode < 500) {
      console.log('Elasticsearch ready');
      process.exit(0);
    }

    retry();
  }).on('error', retry);
}

function retry() {
  console.log('Elasticsearch not ready...');
  setTimeout(check, 5000);
}

check();
"

echo "Creating index..."
node dist/ingestion/create-index.js

if [ \"$AUTO_INGEST\" = \"true\" ]; then
  echo "Running ingestion..."
  node dist/ingestion/index-data.js
fi

echo "Starting API..."
exec node dist/main.js