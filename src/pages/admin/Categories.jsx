import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    parent_id: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('שגיאה בטעינת הקטגוריות');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategory) {
        const { error } = await supabase
          .from('categories')
          .update({ 
            name: formData.name,
            parent_id: formData.parent_id || null
          })
          .eq('id', selectedCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ 
            name: formData.name,
            parent_id: formData.parent_id || null
          }]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', parent_id: '' });
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      alert('שגיאה בשמירת הקטגוריה');
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      parent_id: category.parent_id || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('שגיאה במחיקת הקטגוריה');
    }
  };

  const buildCategoryTree = (categories) => {
    const map = {};
    const roots = [];

    categories.forEach(cat => {
      map[cat.id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
      if (cat.parent_id) {
        map[cat.parent_id]?.children.push(map[cat.id]);
      } else {
        roots.push(map[cat.id]);
      }
    });

    return roots;
  };

  const renderCategory = (category, level = 0) => (
    <div 
      key={category.id}
      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
      style={{ marginRight: `${level * 20}px` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {level > 0 && <ChevronRight size={16} className="text-gray-400" />}
          <span className="font-medium">{category.name}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(category)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(category.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {category.children?.length > 0 && (
        <div className="mt-2 space-y-2">
          {category.children.map(child => renderCategory(child, level + 1))}
        </div>
      )}
    </div>
  );

  if (loading) return <div className="text-center py-8">טוען...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  const categoryTree = buildCategoryTree(categories);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#112a55]">ניהול קטגוריות</h1>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setFormData({ name: '', parent_id: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#a48327] text-white px-4 py-2 rounded-lg hover:bg-[#8b6f1f] transition-colors"
        >
          <Plus size={20} />
          הוסף קטגוריה
        </button>
      </div>

      <div className="space-y-4">
        {categoryTree.map(category => renderCategory(category))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#112a55] mb-6">
              {selectedCategory ? 'עריכת קטגוריה' : 'הוספת קטגוריה חדשה'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">שם הקטגוריה</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">קטגוריית אב</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">ללא קטגוריית אב</option>
                  {categories.map(cat => (
                    <option 
                      key={cat.id} 
                      value={cat.id}
                      disabled={selectedCategory?.id === cat.id}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedCategory(null);
                    setFormData({ name: '', parent_id: '' });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#112a55] text-white rounded-lg hover:bg-[#1a3c70]"
                >
                  {selectedCategory ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}