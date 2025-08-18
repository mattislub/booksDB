import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const API_BASE = "https://api.talpiot-books.com";

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/books/${id}`);
        setBook(res.data);
      } catch (err) {
        setError("שגיאה בטעינת הספר");
        console.error("שגיאה בשליפת ספר:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (!book) return;

    const previousTitle = document.title;
    const descriptionTag =
      document.querySelector('meta[name="description"]') ||
      (() => {
        const tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
        return tag;
      })();
    const previousDescription = descriptionTag.getAttribute("content");

    const keywordsTag =
      document.querySelector('meta[name="keywords"]') ||
      (() => {
        const tag = document.createElement("meta");
        tag.name = "keywords";
        document.head.appendChild(tag);
        return tag;
      })();
    const previousKeywords = keywordsTag.getAttribute("content");

    const ogTitleTag =
      document.querySelector('meta[property="og:title"]') ||
      (() => {
        const tag = document.createElement("meta");
        tag.setAttribute("property", "og:title");
        document.head.appendChild(tag);
        return tag;
      })();
    const previousOgTitle = ogTitleTag.getAttribute("content");

    const ogDescriptionTag =
      document.querySelector('meta[property="og:description"]') ||
      (() => {
        const tag = document.createElement("meta");
        tag.setAttribute("property", "og:description");
        document.head.appendChild(tag);
        return tag;
      })();
    const previousOgDescription = ogDescriptionTag.getAttribute("content");

    const ogImageTag =
      document.querySelector('meta[property="og:image"]') ||
      (() => {
        const tag = document.createElement("meta");
        tag.setAttribute("property", "og:image");
        document.head.appendChild(tag);
        return tag;
      })();
    const previousOgImage = ogImageTag.getAttribute("content");

    const priceTag =
      document.querySelector('meta[property="product:price:amount"]') ||
      (() => {
        const tag = document.createElement("meta");
        tag.setAttribute("property", "product:price:amount");
        document.head.appendChild(tag);
        return tag;
      })();
    const previousPrice = priceTag.getAttribute("content");

    const currencyTag =
      document.querySelector('meta[property="product:price:currency"]') ||
      (() => {
        const tag = document.createElement("meta");
        tag.setAttribute("property", "product:price:currency");
        document.head.appendChild(tag);
        return tag;
      })();
    const previousCurrency = currencyTag.getAttribute("content");

    const availabilityTag =
      document.querySelector('meta[property="product:availability"]') ||
      (() => {
        const tag = document.createElement("meta");
        tag.setAttribute("property", "product:availability");
        document.head.appendChild(tag);
        return tag;
      })();
    const previousAvailability = availabilityTag.getAttribute("content");

    const category = book.category || book.categories?.[0] || "";
    document.title = `${book.title}${category ? " - " + category : ""}`;

    descriptionTag.setAttribute(
      "content",
      `${book.title}${category ? " - " + category : ""}`
    );

    const keywords = [book.title, ...(book.categories || [])].filter(Boolean);
    keywordsTag.setAttribute("content", keywords.join(", "));

    ogTitleTag.setAttribute("content", book.title);
    ogDescriptionTag.setAttribute(
      "content",
      `${book.title}${category ? " - " + category : ""}`
    );

    const imageUrl = book.image_urls?.[0] || book.image_url;
    if (imageUrl) {
      ogImageTag.setAttribute("content", `${API_BASE}${imageUrl}`);
    }
    if (book.final_price) {
      priceTag.setAttribute("content", book.final_price);
      currencyTag.setAttribute("content", "ILS");
    }
    availabilityTag.setAttribute(
      "content",
      book.availability === "available" ? "in stock" : "out of stock"
    );

    return () => {
      document.title = previousTitle;
      if (previousDescription !== null) {
        descriptionTag.setAttribute("content", previousDescription);
      }
      if (previousKeywords !== null) {
        keywordsTag.setAttribute("content", previousKeywords);
      }
      if (previousOgTitle !== null) {
        ogTitleTag.setAttribute("content", previousOgTitle);
      }
      if (previousOgDescription !== null) {
        ogDescriptionTag.setAttribute("content", previousOgDescription);
      }
      if (previousOgImage !== null) {
        ogImageTag.setAttribute("content", previousOgImage);
      }
      if (previousPrice !== null) {
        priceTag.setAttribute("content", previousPrice);
      }
      if (previousCurrency !== null) {
        currencyTag.setAttribute("content", previousCurrency);
      }
      if (previousAvailability !== null) {
        availabilityTag.setAttribute("content", previousAvailability);
      }
    };
  }, [book]);

  if (loading) return <div className="text-center py-8">טוען...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!book) return <div className="text-center py-8">הספר לא נמצא</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 text-right">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← חזור לקטלוג
      </Link>
      <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row gap-6">
        {book.image_urls?.[0] || book.image_url ? (
          <img
            src={`${API_BASE}${book.image_urls?.[0] || book.image_url}`}
            alt={book.title}
            className="w-full md:w-1/3 h-64 object-contain rounded"
          />
        ) : (
          <div className="w-full md:w-1/3 h-64 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-500">אין תמונה</span>
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#112a55] mb-2">{book.title}</h2>
          <p className="text-gray-600 mb-2">{book.author || "אין מחבר"}</p>
          <p className="text-lg font-bold text-[#a48327] mb-2">
            {book.final_price ? `${book.final_price} ₪` : "מחיר לא זמין"}
          </p>
          <p className="text-gray-600 mb-4">
            {book.availability === "available" ? "✅ במלאי" : "❌ לא במלאי"}
          </p>
          <p className="text-gray-700 mb-4">{book.description || "אין תיאור"}</p>
          <button
            className={`px-4 py-2 rounded ${
              book.availability === "available"
                ? "bg-[#a48327] text-white hover:bg-[#8b6f1f]"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
            disabled={book.availability !== "available"}
          >
            {book.availability === "available" ? "הוסף לעגלה" : "לא זמין"}
          </button>
        </div>
      </div>
    </div>
  );
}