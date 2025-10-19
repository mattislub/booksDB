import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const API_BASE = "https://api.talpiot-books.com";

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
    setSelectedImageIndex(0);
  }, [book]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

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
    };
  }, [book]);

  if (loading) return <div className="text-center py-8">טוען...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!book) return <div className="text-center py-8">הספר לא נמצא</div>;

  const images = book.image_urls?.length
    ? book.image_urls
    : book.image_url
    ? [book.image_url]
    : [];

  return (
    <div className="max-w-4xl mx-auto p-4 text-right">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← חזור לקטלוג
      </Link>
      <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row gap-6">
        {images.length > 0 ? (
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="group w-full"
                aria-label="הצג תמונה מלאה"
              >
                <img
                  src={`${API_BASE}${images[selectedImageIndex]}`}
                  alt={book.title}
                  className="w-full h-64 object-contain rounded transition-transform duration-200 group-hover:scale-[1.02]"
                />
                <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  צפייה מלאה
                </span>
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex mt-4 gap-2 overflow-x-auto pb-2">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`relative w-16 h-16 flex-shrink-0 rounded border transition-all focus:outline-none focus:ring-2 focus:ring-[#a48327] ${
                      idx === selectedImageIndex
                        ? "border-[#a48327] shadow"
                        : "border-transparent"
                    }`}
                    onClick={() => setSelectedImageIndex(idx)}
                    onDoubleClick={() => {
                      setSelectedImageIndex(idx);
                      setIsLightboxOpen(true);
                    }}
                    aria-label={`הצג ${book.title} מספר ${idx + 1}`}
                  >
                    <img
                      src={`${API_BASE}${url}`}
                      alt={`${book.title} ${idx + 1}`}
                      className="w-full h-full object-contain rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
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
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-white text-2xl"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="סגור תצוגה מלאה"
          >
            ×
          </button>
          <div
            className="max-h-[85vh] max-w-[90vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={`${API_BASE}${images[selectedImageIndex]}`}
              alt={book.title}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}