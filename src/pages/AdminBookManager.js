import React, { useState, useEffect } from "react";
import useBooksStore from '../store/booksStore';
import useCategoriesStore from '../store/categoriesStore';

export default function AdminBookManager() {
  const { books, loading, error, initialize, addBook, updateBook, deleteBook } = useBooksStore();
  const { categories, initialize: initCategories } = useCategoriesStore();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    availability: "available",
    image_url: "",
    category: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    initialize();
    initCategories();
  }, [initialize, initCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const result = formData.id 
        ? await updateBook(formData.id, formData)
        : await addBook(formData);

      if (result.success) {
        setMessage(formData.id ? "✅ הספר עודכן בהצלחה!" : "✅ הספר נוסף בהצלחה!");
        setFormData({
          title: "",
          author: "",
          description: "",
          price: "",
          availability: "available",
          image_url: "",
          category: ""
        });
      } else {
        throw result.error;
      }
    } catch (err) {
      setMessage(formData.id ? "❌ שגיאה בעדכון הספר" : "❌ שגיאה בהוספת הספר");
      console.error("שגיאה בשמירת ספר:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (book) => {
    setFormData({
      id: book.id,
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      price: book.price?.toString() || "",
      availability: book.availability || "available",
      image_url: book.image_url || "",
      category: book.category || ""
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הספר?")) return;
    try {
      const result = await deleteBook(id);
      if (result.success) {
        setMessage("✅ הספר נמחק בהצלחה!");
      } else {
        throw result.error;
      }
    } catch (err) {
      setMessage("❌ שגיאה במחיקה");
      console.error("שגיאה במחיקת ספר:", err);
    }
  };

  if (loading) return <div className="text-center py-8">טוען...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  const filteredBooks = books.filter(book =>
    book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-4 text-right">
      <h2 className="text-2xl font-bold mb-4 text-[#112a55]">➕ ניהול ספרים</h2>

      <input
        type="text"
        placeholder="חפש ספרים לפי כותרת או מחבר..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-4 rounded mb-6">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="כותרת הספר"
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleChange}
          placeholder="שם מחבר"
          className="w-full border px-3 py-2 rounded"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="תיאור"
          required
          rows={2}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="מחיר"
          required
          min="0"
          step="0.01"
          className="w-full border px-3 py-2 rounded"
        />

        <select
          name="availability"
          value={formData.availability}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="available">✅ במלאי</option>
          <option value="out-of-stock">❌ לא במלאי</option>
        </select>

        <input
          type="text"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="קישור לתמונה"
          className="w-full border px-3 py-2 rounded"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">בחר קטגוריה</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-[#a48327] text-white py-2 rounded hover:bg-[#8b6f1f]"
        >
          {formData.id ? "עדכן ספר" : "שמור ספר"}
        </button>
        {message && <div className="text-sm mt-2">{message}</div>}
      </form>

      <h3 className="text-xl font-bold mb-2 mt-6">📚 ספרים קיימים</h3>
      <div className="space-y-4">
        {filteredBooks.map((book) => (
          <div key={book.id} className="bg-gray-50 border rounded p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="font-bold text-[#112a55]">{book.title}</div>
                <div className="text-sm text-gray-600">
                  {book.author || "אין מחבר"} | {book.price ? `${book.price} ₪` : "מחיר לא זמין"}
                </div>
                <div className="text-sm text-gray-500">
                  {book.availability === "available" ? "✅ במלאי" : "❌ לא במלאי"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(book)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  ✏️ ערוך
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  🗑️ מחק
                </button>
              </div>
            </div>
            {book.image_url && (
              <img
                src={book.image_url}
                alt={book.title}
                className="w-32 h-40 object-contain bg-white rounded mb-2"
              />
            )}
            <div className="text-sm text-gray-700">{book.description || "אין תיאור"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}