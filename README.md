# BooksDB

This project contains a React frontend built with Vite and a simple Express API server.

## Environment Variables

Create a `.env` file (you can copy `.env.example`) and set the following variables:

- `DATABASE_URL` – PostgreSQL connection string used by the API server.
- `PORT` – Port for the Express server (defaults to `3000` if not set).

The Vite development server also listens on port `3000`. If you plan to run the
API server and frontend simultaneously, set `PORT` to a different value (for
example `3001`) in your `.env` file or adjust the port in `vite.config.js`.

## Installing Dependencies

Install the JavaScript dependencies for both the frontend and server:

```bash
npm install
```

## Running the Express Server

Start the API server with:

```bash
npm run server
```

The server reads the environment variables above and listens on `PORT`.

### Initializing Extra Tables

To create optional tables for orders, promotions and other admin features run:

```bash
curl -X POST http://localhost:3000/api/setup
```

This route creates the `orders`, `order_items`, `promotions`, `email_subscribers`,
`settings` and `statistics` tables if they do not exist.

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
