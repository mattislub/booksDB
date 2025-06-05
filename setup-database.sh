#!/bin/bash

set -e

# Load environment variables from .env if present
if [ -f .env ]; then
  set -o allexport
  source .env
  set +o allexport
fi

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL must be set in the environment or .env file"
  exit 1
fi

psql "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    price INTEGER,
    image_url TEXT,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
SQL

echo "Database schema initialized."
