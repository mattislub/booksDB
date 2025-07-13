import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto p-4 text-center">
      <h2 className="text-3xl font-bold text-[#112a55] mb-4">404 - העמוד לא נמצא</h2>
      <p className="text-gray-600 mb-6">העמוד שחיפשת אינו קיים. אולי תרצה לחזור לעמוד הראשי?</p>
      <Link to="/" className="bg-[#a48327] hover:bg-[#8b6f1f] text-white px-4 py-2 rounded">
        חזרה לעמוד הראשי
      </Link>
    </div>
  );
}