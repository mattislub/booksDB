import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders Catalog component on home page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const catalogElement = screen.getByText(/קטלוג הספרים/i);
  expect(catalogElement).toBeInTheDocument();
});

test('renders Header component', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const searchInput = screen.getByPlaceholderText(/חפש ספרים.../i);
  expect(searchInput).toBeInTheDocument();
});