/*
  # הקמת מסד נתונים לחנות ספרי קודש

  1. טבלאות חדשות
    - `books` - ספרים
    - `categories` - קטגוריות
    - `orders` - הזמנות
    - `order_items` - פריטים בהזמנה
    - `wishlists` - רשימות משאלות

  2. אבטחה
    - הפעלת RLS על כל הטבלאות
    - מדיניות גישה למשתמשים מאומתים

  3. אינדקסים
    - אינדקסים על שדות חיפוש נפוצים
    - אינדקסים על מפתחות זרים
*/

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  description text,
  price numeric(10,2) NOT NULL,
  image_url text,
  category text,
  availability text DEFAULT 'available',
  isbn text,
  publisher text,
  publication_year integer,
  pages integer,
  language text DEFAULT 'hebrew',
  binding text DEFAULT 'hardcover',
  dimensions text,
  weight integer,
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create basic indexes for books
CREATE INDEX IF NOT EXISTS books_title_idx ON books(title);
CREATE INDEX IF NOT EXISTS books_author_idx ON books(author);
CREATE INDEX IF NOT EXISTS books_category_idx ON books(category);
CREATE INDEX IF NOT EXISTS books_isbn_idx ON books(isbn);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  parent_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_name_idx ON categories(name);
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories(parent_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending',
  total numeric(10,2) NOT NULL,
  shipping_address text NOT NULL,
  phone text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_book_id_idx ON order_items(book_id);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  book_id uuid REFERENCES books(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, book_id)
);

CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS wishlists_book_id_idx ON wishlists(book_id);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Create policies for books
CREATE POLICY "Books are viewable by everyone"
  ON books FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Books are editable by authenticated users"
  ON books FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "Books are insertable by authenticated users"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

-- Create policies for categories
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Categories are editable by authenticated users"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- Create policies for orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for order items
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create policies for wishlists
CREATE POLICY "Users can view their own wishlist"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist"
  ON wishlists FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for books
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();