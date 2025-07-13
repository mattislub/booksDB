# BooksDB

This project contains a React frontend built with Vite and a simple Express API server.

## Environment Variables

Create a `.env` file (you can copy `.env.example`) and set the following variables:

- `DATABASE_URL` – PostgreSQL connection string used by the API server.
- `PORT` – Port for the Express server (defaults to `3000` if not set).
- `OPENAI_API_KEY` – API key with access to GPT‑4 Vision used to extract book
  details directly from uploaded cover images. If omitted, the `/api/analyze-book-image`
  endpoint will return a `503` response and book image analysis will be disabled.
- `CORS_ORIGIN` – Frontend origin allowed to access the API. Set this to the URL
  where the React app is hosted (e.g. `https://talpiot-books.com`).
- `VITE_API_URL` – Base URL of the API used by the frontend. In production this
  should match the public address of the Express server (e.g.
  `https://api.talpiot-books.com`).

The Vite development server also listens on port `3000`. If you plan to run the
API server and frontend simultaneously, set `PORT` to a different value (for
example `3001`) in your `.env` file or adjust the port in `vite.config.js`.

## Installing Dependencies

Install the JavaScript dependencies for both the frontend and server:

```bash
npm install
```

This project now uses `bcrypt` to securely hash passwords. If you're pulling
these changes into an existing checkout, run `npm install` again to make sure
the new dependency is installed.

## Running the Express Server

Start the API server with:

```bash
npm run server
```

The server reads the environment variables above and listens on `PORT`.

### Initializing the Database

To create the tables required by the API (books, categories and other admin features) run:

```bash
curl -X POST http://localhost:$PORT/api/setup
```

This uses the port configured by the `PORT` variable in your `.env` file. The server
defaults to port `3000` if `PORT` is not set. The route creates the `books`,
`categories`, `book_categories`, `orders`, `order_items`, `promotions`,
`email_subscribers`, `settings`, `statistics` and `site_content` tables if they
do not exist.

## Building and Serving the React Frontend

During development you can run:

```bash
npm run dev
```

To create a production build run:

```bash
npm run build
```

To preview the built frontend locally run:

```bash
npm run preview
```

This serves the content of the `dist` directory on the port configured in `vite.config.js` (defaults to `3000`).

## הוראות בעברית

### משתני סביבה

1. העתיקו את הקובץ `.env.example` לקובץ בשם `.env`.
2. ערכו את הערכים:
   - `DATABASE_URL` – כתובת החיבור למסד הנתונים PostgreSQL.
   - `PORT` – מספר הפורט שעליו ירוץ שרת Express (ברירת מחדל 3000). אם אתם מפעילים גם את שרת Vite במקביל, מומלץ לבחור פורט אחר (למשל 3001).

### התקנת חבילות

הפעילו בתיקיית הפרויקט:

```bash
npm install
```

### הפעלת שרת Express

לאחר התקנת החבילות ניתן להריץ:

```bash
npm run server
```

### הפעלת פרונטאנד React

בזמן פיתוח אפשר להריץ:

```bash
npm run dev
```

להכנת גרסת הפקה:

```bash
npm run build
```

להרצת הגרסה הבנויה מקומית:

```bash
npm run preview
```
