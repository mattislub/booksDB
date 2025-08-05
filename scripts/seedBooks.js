const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const books = [
  {
    title: "שולחן ערוך",
    author: "רבי יוסף קארו",
    description: "ספר יסוד בהלכה",
    price: 120,
    image_urls: ["/Uploads/shulchan_aruch.jpg"],
    category: "הלכה"
  },
  {
    title: "משנה ברורה",
    author: "החפץ חיים",
    description: "ביאור להלכות שו\"ע",
    price: 110,
    image_urls: ["/Uploads/mishna_berura.jpg"],
    category: "הלכה"
  },
  {
    title: "תנ\"ך קורן",
    author: "",
    description: "התנ\"ך בניקוד מלא",
    price: 80,
    image_urls: ["/Uploads/tanach_koren.jpg"],
    category: "תנ\"ך"
  },
  {
    title: "תורת הנסתר",
    author: "האר\"י",
    description: "יסודות הקבלה",
    price: 130,
    image_urls: ["/Uploads/torat_hanistar.jpg"],
    category: "קבלה"
  },
  {
    title: "ספר התודעה",
    author: "הרב אליהו קפלן",
    description: "חגים ומועדים",
    price: 90,
    image_urls: ["/Uploads/sefer_hatoda.jpg"],
    category: "מחשבה"
  },
  {
    title: "ספר החינוך",
    author: "לא נודע",
    description: "טעמי המצוות",
    price: 100,
    image_urls: ["/Uploads/sefer_hachinuch.jpg"],
    category: "מצוות"
  },
  {
    title: "לקט יושר",
    author: "תלמיד מהר\"י וייל",
    description: "פסקים ומנהגים",
    price: 85,
    image_urls: ["/uploads/leketyosher.jpg"],
    category: "הלכה"
  },
  {
    title: "אורות",
    author: "הרב קוק",
    description: "פילוסופיה יהודית",
    price: 95,
    image_urls: ["/Uploads/orot.jpg"],
    category: "מחשבה"
  },
  {
    title: "סיפורי צדיקים",
    author: "שונים",
    description: "סיפורי השראה לילדים",
    price: 60,
    image_urls: ["/Uploads/sipurei_tzadikim.jpg"],
    category: "לילדים"
  },
  {
    title: "סידור תפילה",
    author: "נוסח ספרד",
    description: "סידור יומי",
    price: 50,
    image_urls: ["/Uploads/siddur_tefilla.jpg"],
    category: "תפילה"
  }
];

(async () => {
  for (const book of books) {
    try {
      const res = await fetch('https://api.talpiot-books.com/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      });
      if (!res.ok) throw new Error(`Failed to add ${book.title}`);
      const data = await res.json();
      console.log('הוזן:', data.title);
    } catch (error) {
    console.error(`שגיאה בהוספת ${book.title}:`, error);
    }
  }
})();