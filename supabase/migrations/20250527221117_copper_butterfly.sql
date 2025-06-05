/*
  # Add special categories for new items

  1. New Categories
    - 'new_arrivals' - חדשים באתר
    - 'new_in_market' - חדשים בשוק

  2. Changes
    - Add new columns to books table to track special categories
*/

-- Add new columns to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_new_arrival boolean DEFAULT false;
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_new_in_market boolean DEFAULT false;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS books_is_new_arrival_idx ON books(is_new_arrival) WHERE is_new_arrival = true;
CREATE INDEX IF NOT EXISTS books_is_new_in_market_idx ON books(is_new_in_market) WHERE is_new_in_market = true;