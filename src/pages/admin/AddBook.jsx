import React, { useState, useEffect } from 'react';
import { Upload, ArrowRight, Loader, Plus } from 'lucide-react';
import { apiPostFormData } from '../../lib/apiClient';
import { compressImage } from '../../lib/imageUtils';
import useCategoriesStore from '../../store/categoriesStore';
import useBooksStore from '../../store/booksStore';

export default function AddBook() {
  const { categories, initialize: initCategories, addCategory } = useCategoriesStore();
  const { addBook } = useBooksStore();
  const [mode, setMode] = useState('select');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [aiData, setAiData] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    console.log('Initializing categories');
    initCategories();
  }, [initCategories]);

  useEffect(() => {
    if (mode === 'ai' && step === 2 && categories.length === 0) {
      initCategories();
    }
  }, [mode, step, categories.length, initCategories]);
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    image_url: '',
    availability: 'available',
    isbn: '',
    publisher: '',
    publication_year: '',
    pages: '',
    language: 'hebrew',
    binding: 'hardcover',
    stock: '1',
    is_new_arrival: false,
    is_new_in_market: false
  });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressed = await compressImage(file);
    setImageFile(compressed);
    setImagePreview(URL.createObjectURL(compressed));
    console.log('Selected image for upload', compressed);

    if (mode === 'ai') {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('image', file);

        const aiResponse = await apiPostFormData('/api/analyze-book-image', formData);
        console.log('AI response', aiResponse);

        setAiData(aiResponse);
        setBookData(prev => ({
          ...prev,
          title: aiResponse.title || '',
          author: aiResponse.author || '',
          description: aiResponse.description || '',
          isbn: aiResponse.isbn || ''
        }));

        setStep(2);
      } catch (error) {
        console.error('Error analyzing image:', error);
        alert(`שגיאה בזיהוי הספר: ${error.message || error}. אנא נסה שוב או הזן את הפרטים ידנית.`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = bookData.image_url;

      if (imageFile) {
        const finalFile = await compressImage(imageFile);
        const reader = new FileReader();
        imageUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(finalFile);
        });
      }

      const finalBookData = {
        ...bookData,
        image_url: imageUrl,
        categories: selectedCategories
      };

      console.log('Submitting new book', finalBookData);
      const result = await addBook(finalBookData);
      console.log('Add book result', result);
      if (!result.success) throw result.error;

      console.log('Book added successfully');
      alert('הספר נוסף בהצלחה!');
      setBookData({
        title: '',
        author: '',
        description: '',
        price: '',
        image_url: '',
        availability: 'available',
        isbn: '',
        publisher: '',
        publication_year: '',
        pages: '',
        language: 'hebrew',
        binding: 'hardcover',
        stock: '1',
        is_new_arrival: false,
        is_new_in_market: false
      });
      setSelectedCategories([]);
      setImageFile(null);
      setImagePreview('');
      setStep(1);
    } catch (error) {
      console.error('Error adding book:', error);
      alert(`שגיאה בהוספת הספר: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'select') {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-[#112a55] mb-8">הוספת ספר חדש</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setMode('simple')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center"
          >
            <h2 className="text-xl font-bold text-[#112a55] mb-4">הוספה רגילה</h2>
            <p className="text-gray-600">הזנה ידנית של כל פרטי הספר</p>
          </button>

          <button
            onClick={() => setMode('ai')}
            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center"
          >
            <h2 className="text-xl font-bold text-[#112a55] mb-4">הוספה חכמה</h2>
            <p className="text-gray-600">העלאת תמונה וזיהוי אוטומטי של פרטי הספר</p>
          </button>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-8 text-[#112a55] hover:text-[#1a3c70] flex items-center gap-2"
        >
          <ArrowRight size={20} />
          חזרה
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-8">
        {mode === 'ai' ? 'הוספת ספר - זיהוי חכם' : 'הוספת ספר'}
      </h1>

      {mode === 'ai' && step === 1 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#112a55] mb-4">העלאת תמונת הספר</h2>
            <p className="text-gray-600">העלה תמונה ברורה של כריכת הספר לזיהוי אוטומטי</p>
          </div>

          <label className="block w-full max-w-md mx-auto">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-[#112a55] transition-colors cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">לחץ להעלאת תמונה</p>
            </div>
          </label>

          {loading && (
            <div className="mt-8 flex items-center justify-center gap-4 text-[#112a55]">
              <Loader className="animate-spin" />
              <span>מזהה את הספר...</span>
            </div>
          )}
        </div>
      )}

      {(mode === 'simple' || step === 2) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {imagePreview && (
              <div className="md:col-span-2">
                <img
                  src={imagePreview}
                  alt="תצוגה מקדימה"
                  className="max-h-64 mx-auto object-contain"
                />
              </div>
            )}

            {mode === 'simple' && (
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-1">תמונת הספר</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-1">שם הספר *</label>
              <input
                type="text"
                value={bookData.title}
                onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                required
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">מחבר</label>
              <input
                type="text"
                value={bookData.author}
                onChange={(e) => setBookData({ ...bookData, author: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-1">תיאור</label>
              <textarea
                value={bookData.description}
                onChange={(e) => setBookData({ ...bookData, description: e.target.value })}
                rows="3"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">מחיר *</label>
              <input
                type="number"
                value={bookData.price}
                onChange={(e) => setBookData({ ...bookData, price: e.target.value })}
                required
                min="0"
                step="0.01"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">קטגוריות *</label>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="הזן קטגוריה חדשה"
                  className="flex-1 border rounded-lg p-2"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newCategory.trim()) return;
                    try {
                      const result = await addCategory({ name: newCategory.trim() });
                      if (result.success) {
                        setNewCategory('');
                        setSelectedCategories((prev) => [...prev, result.data.id]);
                      } else {
                        throw result.error;
                      }
                    } catch (err) {
                      console.error('שגיאה בהוספת קטגוריה:', err);
                      alert('אירעה שגיאה. נסה שוב.');
                    }
                  }}
                  className="bg-[#112a55] text-white px-4 py-2 rounded-lg hover:bg-[#1a3c70]"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        let updated;
                        if (e.target.checked) {
                          updated = [...selectedCategories, category.id];
                        } else {
                          updated = selectedCategories.filter(id => id !== category.id);
                        }
                        setSelectedCategories(updated);
                        console.log('Selected categories', updated);
                      }}
                      className="form-checkbox h-5 w-5 text-[#112a55]"
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
              {selectedCategories.length === 0 && (
                <p className="text-red-500 text-sm mt-1">יש לבחור לפחות קטגוריה אחת</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">ISBN</label>
              <input
                type="text"
                value={bookData.isbn}
                onChange={(e) => setBookData({ ...bookData, isbn: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">הוצאה לאור</label>
              <input
                type="text"
                value={bookData.publisher}
                onChange={(e) => setBookData({ ...bookData, publisher: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">שנת הוצאה</label>
              <input
                type="number"
                value={bookData.publication_year}
                onChange={(e) => setBookData({ ...bookData, publication_year: e.target.value })}
                min="1800"
                max={new Date().getFullYear()}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">מספר עמודים</label>
              <input
                type="number"
                value={bookData.pages}
                onChange={(e) => setBookData({ ...bookData, pages: e.target.value })}
                min="1"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">שפה</label>
              <select
                value={bookData.language}
                onChange={(e) => setBookData({ ...bookData, language: e.target.value })}
                className="w-full border rounded-lg p-2"
              >
                <option value="hebrew">עברית</option>
                <option value="english">אנגלית</option>
                <option value="aramaic">ארמית</option>
                <option value="other">אחר</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">כריכה</label>
              <select
                value={bookData.binding}
                onChange={(e) => setBookData({ ...bookData, binding: e.target.value })}
                className="w-full border rounded-lg p-2"
              >
                <option value="hardcover">קשה</option>
                <option value="softcover">רכה</option>
                <option value="leather">עור</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">כמות במלאי *</label>
              <input
                type="number"
                value={bookData.stock}
                onChange={(e) => setBookData({ ...bookData, stock: e.target.value })}
                required
                min="0"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bookData.is_new_arrival}
                  onChange={(e) => setBookData({ ...bookData, is_new_arrival: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-[#112a55]"
                />
                <span>חדש באתר</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bookData.is_new_in_market}
                  onChange={(e) => setBookData({ ...bookData, is_new_in_market: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-[#112a55]"
                />
                <span>חדש בשוק</span>
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                if (mode === 'ai' && step === 2) {
                  setStep(1);
                } else {
                  setMode('select');
                }
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              חזרה
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#112a55] text-white rounded-lg hover:bg-[#1a3c70] disabled:bg-gray-400"
            >
              {loading ? 'שומר...' : 'שמור ספר'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
