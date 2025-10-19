import React, { useState, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import useBooksStore from '../store/booksStore';
import useCategoriesStore from '../store/categoriesStore';
import { apiPostFormData } from '../lib/apiClient';
import {
  compressImage,
  normalizeApiImageUrl,
  getAbsoluteImageUrl
} from '../lib/imageUtils';

export default function AdminBookManager() {
  const { books, loading, error, initialize, addBook, updateBook, deleteBook } = useBooksStore();
  const { categories, initialize: initCategories } = useCategoriesStore();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    availability: "available",
    image_url: '',
    categories: []
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [additionalImages, setAdditionalImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    initialize();
    initCategories();
  }, [initialize, initCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const normalizedMain = normalizeApiImageUrl(formData.image_url);
      const normalizedAdditional = additionalImages.map(normalizeApiImageUrl);
      const imageUrls = [normalizedMain, ...normalizedAdditional].filter(Boolean);

      const payload = {
        ...formData,
        image_url: imageUrls[0] || '',
        image_urls: imageUrls,
      };

      const result = formData.id
        ? await updateBook(formData.id, payload)
        : await addBook(payload);

      if (result.success) {
        setMessage(formData.id ? "✅ הספר עודכן בהצלחה!" : "✅ הספר נוסף בהצלחה!");
        setFormData({
          title: "",
          author: "",
          description: "",
          price: "",
          availability: "available",
          image_url: '',
          categories: []
        });
        setMainImagePreview('');
        setAdditionalImages([]);
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
    const selected = categories
      .filter(cat => book.categories?.includes(cat.name))
      .map(cat => cat.id);
    const primaryImage = book.image_urls?.[0] || book.image_url || '';
    const normalizedPrimary = normalizeApiImageUrl(primaryImage);
    const normalizedAdditional = (book.image_urls?.slice(1) || [])
      .map(normalizeApiImageUrl)
      .filter(Boolean);
    setFormData({
      id: book.id,
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      price: book.price?.toString() || "",
      availability: book.availability || "available",
      image_url: normalizedPrimary,
      categories: selected
    });
    setMainImagePreview(getAbsoluteImageUrl(primaryImage));
    setAdditionalImages(normalizedAdditional);
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

  const handleMainImageUrlChange = (e) => {
    const normalized = normalizeApiImageUrl(e.target.value);
    setFormData(prev => ({ ...prev, image_url: normalized }));
    setMainImagePreview(getAbsoluteImageUrl(normalized));
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      let processed = file;
      try {
        processed = await compressImage(file, 0.3);
      } catch (err) {
        console.error('שגיאה בדחיסת התמונה:', err);
      }
      const form = new FormData();
      form.append('image', processed);
      const res = await apiPostFormData('/api/upload-image', form);
      const relativeUrl = normalizeApiImageUrl(res?.url);
      setFormData(prev => ({ ...prev, image_url: relativeUrl }));
      setMainImagePreview(getAbsoluteImageUrl(relativeUrl));
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        let processed = file;
        try {
          processed = await compressImage(file, 0.3);
        } catch (err) {
          console.error('שגיאה בדחיסת התמונה:', err);
        }
        const form = new FormData();
        form.append('image', processed);
        const res = await apiPostFormData('/api/upload-image', form);
        const relativeUrl = normalizeApiImageUrl(res?.url);
        if (relativeUrl) {
          urls.push(relativeUrl);
        }
      }
      setAdditionalImages(prev => [...prev, ...urls]);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, idx) => idx !== index));
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

        <div>
          <label className="block text-gray-700 mb-1">תמונת מוצר ראשית</label>
          <div className="flex flex-col gap-2">
            {mainImagePreview ? (
              <img
                src={mainImagePreview}
                alt="תמונה ראשית"
                className="w-32 h-40 object-contain bg-white border rounded"
              />
            ) : (
              <div className="w-32 h-40 flex items-center justify-center bg-gray-100 border rounded text-gray-400">
                <ImageIcon size={32} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              className="w-full border px-3 py-2 rounded"
              disabled={uploading}
            />
            <div className="flex items-center gap-2">
              <Upload size={16} className="text-gray-500" />
              <input
                type="text"
                name="image_url"
                value={formData.image_url}
                onChange={handleMainImageUrlChange}
                placeholder="או הדביקו קישור לתמונה"
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">תמונות נוספות</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdditionalImagesUpload}
            className="w-full border px-3 py-2 rounded"
            disabled={uploading}
          />
          {additionalImages.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {additionalImages.map((url, idx) => (
                <div key={url + idx} className="relative">
                  <img
                    src={getAbsoluteImageUrl(url)}
                    alt={`תמונה ${idx + 1}`}
                    className="w-16 h-16 object-cover border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalImage(idx)}
                    className="absolute -top-2 -left-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    aria-label="הסר תמונה"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-1">קטגוריות</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.categories.includes(cat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, categories: [...prev.categories, cat.id] }));
                    } else {
                      setFormData(prev => ({ ...prev, categories: prev.categories.filter(id => id !== cat.id) }));
                    }
                  }}
                  className="form-checkbox h-5 w-5 text-[#112a55]"
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#a48327] text-white py-2 px-4 rounded hover:bg-[#8b6f1f]"
            disabled={uploading}
          >
            {formData.id ? "עדכן ספר" : "שמור ספר"}
          </button>
        </div>
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
            {(book.image_urls?.[0] || book.image_url) && (
              <img
                src={getAbsoluteImageUrl(book.image_urls?.[0] || book.image_url)}
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