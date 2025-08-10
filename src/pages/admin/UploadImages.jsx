import React, { useState, useEffect } from 'react';
import { Upload, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiPostFormData, apiGet, apiPost, apiDelete, API_URL } from '../../lib/apiClient';

export default function UploadImages() {
  const [files, setFiles] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverImages, setServerImages] = useState([]);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const handleFilesChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const fetchImages = async () => {
    try {
      const res = await apiGet('/api/images');
      const images = res.images
        .map((img) => ({
          url: `${API_URL}${img.url}`,
          path: img.url,
          size: img.size,
          createdAt: img.createdAt,
          inUse: img.inUse,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const grouped = images.reduce((acc, img) => {
        const date = img.createdAt.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(img);
        return acc;
      }, {});

      const groups = Object.entries(grouped)
        .map(([date, imgs]) => ({ date, images: imgs }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setServerImages(groups);
    } catch (err) {
      console.error('Error fetching images:', err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async () => {
    if (!files.length) return;
    setLoading(true);
    const urls = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await apiPostFormData('/api/upload-image', formData);
        if (res.url) urls.push(`${API_URL}${res.url}`);
        if (res.urls) urls.push(...res.urls.map(u => `${API_URL}${u}`));
      }
      setUploadedUrls(urls);
      await fetchImages();
    } catch (err) {
      console.error('Error uploading image:', err);
      const message = err?.message || 'שגיאה בהעלאת התמונה';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (path) => {
    setSelected((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const handleCompressSelected = async () => {
    if (selected.length === 0) return;
    try {
      const urls = selected;
      await apiPost('/api/images/compress', { urls });
      await fetchImages();
      setSelected([]);
    } catch (err) {
      console.error('Error compressing images:', err);
      alert(err?.message || 'שגיאה בהקטנת התמונות');
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    if (!window.confirm('האם למחוק את התמונות שנבחרו?')) return;
    try {
      const urls = selected;
      await apiDelete('/api/images', { urls });
      await fetchImages();
      setSelected([]);
    } catch (err) {
      console.error('Error deleting images:', err);
      alert(err?.message || 'שגיאה במחיקת התמונות');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#112a55] mb-8">העלאת תמונות</h1>
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
        <input
          type="file"
          multiple
          onChange={handleFilesChange}
          className="w-full mb-4"
          accept="image/*,.zip"
        />
        <button
          onClick={handleUpload}
          disabled={loading || files.length === 0}
          className="w-full sm:w-auto bg-[#a48327] text-white px-4 py-2 rounded-md hover:bg-[#916f22] disabled:opacity-50 flex items-center gap-2 justify-center"
        >
          {loading ? <Loader className="animate-spin" size={20} /> : <Upload size={20} />}
          העלאה
        </button>
      </div>
      {uploadedUrls.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">קישורים לתמונות:</h2>
          <ul className="list-disc pr-5 text-[#112a55] mb-4 break-all">
            {uploadedUrls.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {serverImages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">כל התמונות בשרת:</h2>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <button
              onClick={handleCompressSelected}
              disabled={selected.length === 0}
              className="w-full sm:w-auto bg-[#a48327] text-white px-4 py-2 rounded-md hover:bg-[#916f22] disabled:opacity-50"
            >
              הקטן תמונות נבחרות
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selected.length === 0}
              className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              מחק תמונות נבחרות
            </button>
          </div>
          {serverImages.map((group) => (
            <div key={group.date} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{group.date}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {group.images.map((img) => (
                  <div key={img.path} className="border rounded overflow-hidden relative flex flex-col">
                    <input
                      type="checkbox"
                      className="absolute top-2 left-2"
                      checked={selected.includes(img.path)}
                      onChange={() => toggleSelect(img.path)}
                    />
                    {img.inUse && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1 rounded">
                        בשימוש
                      </div>
                    )}
                    <img
                      src={img.url}
                      alt="Uploaded"
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-1 text-xs text-center">
                      {(img.size / 1024).toFixed(1)} KB
                    </div>
                    <button
                      onClick={() => navigate(`/admin/add-book?mode=ai&image=${encodeURIComponent(img.url)}`)}
                      className="bg-[#a48327] text-white text-xs py-1 hover:bg-[#916f22]"
                    >
                      רישום חכם
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
