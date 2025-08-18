import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { applyProductSEO } from "../lib/seo";

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
    const bookWithImages = {
      ...book,
      image_urls: book.image_urls?.map(url => `${API_BASE}${url}`),
      image_url: book.image_url ? `${API_BASE}${book.image_url}` : undefined,
    };
    return applyProductSEO(bookWithImages);
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
