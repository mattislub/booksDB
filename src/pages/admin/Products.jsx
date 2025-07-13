import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import useBooksStore from '../../store/booksStore';
import useCategoriesStore from '../../store/categoriesStore';

export default function Products() {
  const { books, addBook, updateBook, deleteBook } = useBooksStore();
  const { categories } = useCategoriesStore();
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    availability: 'available',
    isbn: '',
    publisher: '',
    publication_year: '',
    pages: '',
    language: 'hebrew',
    binding: 'hardcover',
    dimensions: '',
    weight: '',
    stock: '1',
    is_new_arrival: false,
    is_new_in_market: false
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'שם הספר הוא שדה חובה';
    if (!formData.price || formData.price <= 0) errors.price = 'יש להזין מחיר תקין';
    if (!formData.category) errors.category = 'יש לבחור קטגוריה';
    
    if (formData.isbn && !/^[\d-]{10,13}$/.test(formData.isbn)) {
      errors.isbn = 'מספר ISBN לא תקין';
    }
    if (formData.stock && (isNaN(formData.stock) || formData.stock < 0)) {
      errors.stock = 'כמות במלאי חייבת להיות מספר חיובי';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const bookData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      pages: formData.pages ? Number(formData.pages) : null,
      publication_year: formData.publication_year ? Number(formData.publication_year) : null
    };

    if (selectedBook) {
      updateBook(selectedBook.id, bookData);
    } else {
      addBook(bookData);
    }
    
    setIsModalOpen(false);
    setSelectedBook(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      availability: 'available',
      isbn: '',
      publisher: '',
      publication_year: '',
      pages: '',
      language: 'hebrew',
      binding: 'hardcover',
      dimensions: '',
      weight: '',
      stock: '1',
      is_new_arrival: false,
      is_new_in_market: false
    });
    setImagePreview('');
    setValidationErrors({});
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setFormData({
      ...book,
      price: book.price?.toString() || '',
      stock: book.stock?.toString() || '1'
    });
    setImagePreview(book.image_url || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק ספר זה?')) {
      try {
        await deleteBook(id);
      } catch (error) {
        alert('שגיאה במחיקת הספר');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.value;
    setFormData({ ...formData, image_url: file });
    setImagePreview(file);
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn?.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#112a55]">ניהול מוצרים</h1>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="חיפוש לפי שם, מחבר או ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#a48327] focus:border-transparent outline-none"
            />
          </div>
          
          <Link
            to="/admin/add-book"
            className="flex items-center gap-2 bg-[#a48327] text-white px-4 py-2 rounded-lg hover:bg-[#8b6f1f] transition-colors"
          >
            <Plus size={20} />
            הוסף מוצר
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-w-3 aspect-h-4 bg-gray-100">
              {book.image_url ? (
                <img
                  src={book.image_url}
                  alt={book.title}
                  className="w-full h-48 object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-48">
                  <Image className="text-gray-400" size={48} />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-[#112a55] mb-2">{book.title}</h3>
              <p className="text-gray-600 text-sm mb-1">{book.author}</p>
              {book.isbn && <p className="text-gray-500 text-sm mb-2">ISBN: {book.isbn}</p>}
              <p className="text-[#a48327] font-bold mb-2">{book.price} ₪</p>
              <p className="text-gray-500 text-sm mb-4">במלאי: {book.stock} יחידות</p>
              
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  book.availability === 'available'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {book.availability === 'available' ? 'במלאי' : 'אזל מהמלאי'}
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(book)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full my-8">
            <h2 className="text-2xl font-bold text-[#112a55] mb-6">
              {selectedBook ? 'עריכת מוצר' : 'הוספת מוצר חדש'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">שם הספר *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full border rounded-lg p-2 ${
                      validationErrors.title ? 'border-red-500' : ''
                    }`}
                  />
                  {validationErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">מחבר</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">מחיר *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full border rounded-lg p-2 ${
                      validationErrors.price ? 'border-red-500' : ''
                    }`}
                    step="0.01"
                  />
                  {validationErrors.price && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">קטגוריה *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full border rounded-lg p-2 ${
                      validationErrors.category ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">בחר קטגוריה</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  {validationErrors.category && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className={`w-full border rounded-lg p-2 ${
                      validationErrors.isbn ? 'border-red-500' : ''
                    }`}
                    placeholder="XXX-XXXXXXXXX"
                  />
                  {validationErrors.isbn && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.isbn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">הוצאה לאור</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">שנת הוצאה</label>
                  <input
                    type="number"
                    value={formData.publication_year}
                    onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
                    className="w-full border rounded-lg p-2"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">מספר עמודים</label>
                  <input
                    type="number"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                    className="w-full border rounded-lg p-2"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">שפה</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
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
                    value={formData.binding}
                    onChange={(e) => setFormData({ ...formData, binding: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="hardcover">קשה</option>
                    <option value="softcover">רכה</option>
                    <option value="leather">עור</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">מידות (ס"מ)</label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full border rounded-lg p-2"
                    placeholder="אורך x רוחב x גובה"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">משקל (גרם)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full border rounded-lg p-2"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">כמות במלאי *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className={`w-full border rounded-lg p-2 ${
                      validationErrors.stock ? 'border-red-500' : ''
                    }`}
                    min="0"
                  />
                  {validationErrors.stock && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.stock}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">חדש באתר</label>
                  <input
                    type="checkbox"
                    checked={formData.is_new_arrival}
                    onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-[#a48327]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">חדש בשוק</label>
                  <input
                    type="checkbox"
                    checked={formData.is_new_in_market}
                    onChange={(e) => setFormData({ ...formData, is_new_in_market: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-[#a48327]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">תיאור</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">תמונה (URL)</label>
                <div className="flex gap-4 items-start">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={handleImageChange}
                    className="flex-1 border rounded-lg p-2"
                    placeholder="הכנס קישור לתמונה"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="תצוגה מקדימה"
                      className="w-20 h-20 object-contain border rounded"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">זמינות</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="available">במלאי</option>
                  <option value="out-of-stock">אזל מהמלאי</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedBook(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#a48327] text-white rounded hover:bg-[#8b6f1f]"
                >
                  {selectedBook ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}