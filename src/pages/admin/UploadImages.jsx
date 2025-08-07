import React, { useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import { apiPostFormData, API_URL } from '../../lib/apiClient';

export default function UploadImages() {
  const [files, setFiles] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFilesChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

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
    } catch (err) {
      console.error('Error uploading image:', err);
      const message = err?.message || 'שגיאה בהעלאת התמונה';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-[#112a55] mb-8">העלאת תמונות</h1>
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <input
          type="file"
          multiple
          onChange={handleFilesChange}
          className="mb-4"
          accept="image/*,.zip"
        />
        <button
          onClick={handleUpload}
          disabled={loading || files.length === 0}
          className="bg-[#a48327] text-white px-4 py-2 rounded-md hover:bg-[#916f22] disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader className="animate-spin" size={20} /> : <Upload size={20} />}
          העלאה
        </button>
      </div>
      {uploadedUrls.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">קישורים לתמונות:</h2>
          <ul className="list-disc pr-5 text-[#112a55] mb-4">
            {uploadedUrls.map(url => (
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedUrls.map(url => (
              <div key={url} className="border rounded overflow-hidden">
                <img
                  src={url}
                  alt="Uploaded"
                  className="w-full h-40 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
