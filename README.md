# BooksDB

This project is a simple bookstore application built with Vite, React and an Express API using PostgreSQL.

## Prerequisites
- Node.js
- PostgreSQL

## Setup
1. Copy `.env.example` to `.env` and update `DATABASE_URL` with your local database connection string.
2. Run `./setup-database.sh` to create the required tables.
3. Start the API server:
   ```bash
   npm run server
   ```
4. In a separate terminal start the frontend:
   ```bash
   npm run dev
   ```
