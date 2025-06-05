/*
  # Insert sample data for bookstore

  1. Sample Data
    - Categories for different types of books
    - Sample books with various attributes
    - Proper Hebrew text handling
    
  2. Changes
    - Insert base categories first
    - Insert subcategories with references to parent categories
    - Insert sample books with all required fields
*/

-- Insert base categories first
DO $$
DECLARE
  halacha_id uuid;
BEGIN
  -- Insert base categories and store IDs
  INSERT INTO categories (name, parent_id)
  VALUES ('הלכה', NULL)
  RETURNING id INTO halacha_id;

  -- Insert other base categories
  INSERT INTO categories (name, parent_id)
  VALUES 
    ('תנ"ך', NULL),
    ('מחשבה', NULL),
    ('קבלה', NULL);

  -- Insert subcategories using the stored IDs
  INSERT INTO categories (name, parent_id)
  VALUES 
    ('שו"ע', halacha_id),
    ('משנה ברורה', halacha_id);
END $$;

-- Insert sample books
INSERT INTO books (
  title, 
  author, 
  description, 
  price, 
  category,
  availability,
  isbn,
  publisher,
  publication_year,
  pages,
  language,
  binding,
  stock,
  is_new_arrival,
  is_new_in_market
) VALUES
  (
    'שולחן ערוך',
    'רבי יוסף קארו',
    'ספר יסוד בהלכה היהודית, מקיף את כל תחומי ההלכה',
    120.00,
    'הלכה',
    'available',
    '9789657265254',
    'מכון ירושלים',
    2020,
    850,
    'hebrew',
    'hardcover',
    50,
    true,
    false
  ),
  (
    'משנה ברורה',
    'החפץ חיים',
    'ביאור מקיף על חלק אורח חיים של השולחן ערוך',
    110.00,
    'הלכה',
    'available',
    '9789657265261',
    'עוז והדר',
    2019,
    1200,
    'hebrew',
    'hardcover',
    35,
    false,
    true
  ),
  (
    'תנ"ך קורן',
    NULL,
    'מהדורה מדויקת של התנ"ך בניקוד מלא',
    80.00,
    'תנ"ך',
    'available',
    '9789657265278',
    'קורן',
    2021,
    1500,
    'hebrew',
    'hardcover',
    100,
    true,
    true
  ),
  (
    'ספר התודעה',
    'הרב אליהו כי טוב',
    'ספר מקיף על המועדים והזמנים בלוח העברי',
    90.00,
    'מחשבה',
    'available',
    '9789657265285',
    'פלדהיים',
    2018,
    600,
    'hebrew',
    'hardcover',
    25,
    true,
    false
  ),
  (
    'נפש החיים',
    'רבי חיים מוולוזין',
    'ספר יסוד במחשבת ישראל',
    95.00,
    'מחשבה',
    'available',
    '9789657265292',
    'אשכול',
    2017,
    400,
    'hebrew',
    'hardcover',
    15,
    false,
    true
  );