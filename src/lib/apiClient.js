const origin =
  typeof window !== 'undefined' ? window.location.origin : '';
const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
const DEFAULT_API_URL = isLocal
  ? 'http://localhost:3000'
  : 'https://api.talpiot-books.com';

export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

async function handleResponse(res) {
  if (res.ok) return res.json();
  let message = 'API request failed';
  try {
    const data = await res.json();
    message = data.error || JSON.stringify(data);
  } catch (_) {
    try {
      const text = await res.text();
      if (text) message = text;
    } catch (e) {
      // ignore
    }
  }
  const error = new Error(message);
  error.status = res.status;
  throw error;
}

export const apiGet = async (path) => {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include'
  });
  return handleResponse(res);
};

export const apiPost = async (path, body) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return handleResponse(res);
};

export const apiPostFormData = async (path, formData) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  return handleResponse(res);
};

export const apiDelete = async (path, body) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return handleResponse(res);
};
