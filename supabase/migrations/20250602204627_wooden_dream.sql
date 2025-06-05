/*
  # Add support for multiple categories per book

  1. New Tables
    - `book_categories` - Junction table for books and categories relationship
      - `book_id` (uuid) - References books(id)
      - `category_id` (uuid) - References categories(id)

  2. Changes
    - Remove category column from books table
    - Add indexes and foreign keys
    - Update RLS policies
*/

-- Create junction table
CREATE TABLE IF NOT EXISTS book_categories (
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS book_categories_book_id_idx ON book_categories(book_id);
CREATE INDEX IF NOT EXISTS book_categories_category_id_idx ON book_categories(category_id);

-- Enable RLS
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Book categories are viewable by everyone"
  ON book_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Book categories are editable by authenticated users"
  ON book_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Remove old category column from books
ALTER TABLE books DROP COLUMN IF EXISTS category;