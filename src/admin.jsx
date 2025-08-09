import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'
import Dashboard from './pages/admin/Dashboard'
import Orders from './pages/admin/Orders'
import Products from './pages/admin/Products'
import Reports from './pages/admin/Reports'
import EmailPreview from './pages/admin/EmailPreview'
import AddBook from './pages/admin/AddBook'
import Categories from './pages/admin/Categories'
import Settings from './pages/admin/Settings'
import UploadImages from './pages/admin/UploadImages'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin/*" element={<Dashboard />} />
        <Route path="/admin/orders/*" element={<Orders />} />
        <Route path="/admin/products/*" element={<Products />} />
        <Route path="/admin/add-book/*" element={<AddBook />} />
        <Route path="/admin/categories/*" element={<Categories />} />
        <Route path="/admin/reports/*" element={<Reports />} />
        <Route path="/admin/email-preview/*" element={<EmailPreview />} />
        <Route path="/admin/settings/*" element={<Settings />} />
        <Route path="/admin/upload-images/*" element={<UploadImages />} />
      </Routes>
    </Router>
  </React.StrictMode>,
);

