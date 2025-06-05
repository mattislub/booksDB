const API_URL = import.meta.env.VITE_API_URL || '';

export const apiGet = async (path) => {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error('API request failed');
  }
  return res.json();
};

export const apiPost = async (path, body) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error('API request failed');
  }
  return res.json();
};
