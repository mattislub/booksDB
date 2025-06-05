import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const books = [
  {
    title: "שולחן ערוך",
    author: "רבי יוסף קארו",
    description: "ספר יסוד בהלכה",
    price: 120,
    image_url: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg",
    category: "הלכה"
  },
  {
    title: "משנה ברורה",
    author: "החפץ חיים",
    description: "ביאור להלכות שו\"ע",
    price: 110,
    image_url: "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg",
    category: "הלכה"
  },
  {
    title: "תנ\"ך קורן",
    author: "",
    description: "התנ\"ך בניקוד מלא",
    price: 80,
    image_url: "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg",
    category: "תנ\"ך"
  },
  {
    title: "תורת הנסתר",
    author: "האר\"י",
    description: "יסודות הקבלה",
    price: 130,
    image_url: "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg",
    category: "קבלה"
  },
  {
    title: "ספר התודעה",
    author: "הרב אליהו קפלן",
    description: "חגים ומועדים",
    price: 90,
    image_url: "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg",
    category: "מחשבה"
  }
];

(async () => {
  for (const book of books) {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert([book])
        .select();

      if (error) throw error;
      console.log('הוזן:', data[0].title);
    } catch (error) {
      console.error(`שגיאה בהוספת ${book.title}:`, error);
    }
  }
})();