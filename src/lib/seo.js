export function applyProductSEO(book) {
  if (!book) return () => {};

  const previousTitle = document.title;

  const getOrCreate = (selector, create) => {
    const existing = document.querySelector(selector);
    if (existing) return existing;
    const tag = create();
    document.head.appendChild(tag);
    return tag;
  };

  const createName = name => {
    const tag = document.createElement('meta');
    tag.name = name;
    return tag;
  };

  const createProperty = property => {
    const tag = document.createElement('meta');
    tag.setAttribute('property', property);
    return tag;
  };

  const descriptionTag = getOrCreate('meta[name="description"]', () => createName('description'));
  const keywordsTag = getOrCreate('meta[name="keywords"]', () => createName('keywords'));
  const ogTitleTag = getOrCreate('meta[property="og:title"]', () => createProperty('og:title'));
  const ogDescriptionTag = getOrCreate('meta[property="og:description"]', () => createProperty('og:description'));
  const ogImageTag = getOrCreate('meta[property="og:image"]', () => createProperty('og:image'));
  const priceTag = getOrCreate('meta[property="product:price:amount"]', () => createProperty('product:price:amount'));
  const currencyTag = getOrCreate('meta[property="product:price:currency"]', () => createProperty('product:price:currency'));
  const availabilityTag = getOrCreate('meta[property="product:availability"]', () => createProperty('product:availability'));

  const previous = {
    description: descriptionTag.getAttribute('content'),
    keywords: keywordsTag.getAttribute('content'),
    ogTitle: ogTitleTag.getAttribute('content'),
    ogDescription: ogDescriptionTag.getAttribute('content'),
    ogImage: ogImageTag.getAttribute('content'),
    price: priceTag.getAttribute('content'),
    currency: currencyTag.getAttribute('content'),
    availability: availabilityTag.getAttribute('content')
  };

  const category = book.category || book.categories?.[0] || '';
  const title = `${book.title}${category ? ' - ' + category : ''}`;
  document.title = title;

  const description = book.description || title;
  descriptionTag.setAttribute('content', description);
  const keywords = [book.title, ...(book.categories || [])].filter(Boolean).join(', ');
  keywordsTag.setAttribute('content', keywords);
  ogTitleTag.setAttribute('content', book.title);
  ogDescriptionTag.setAttribute('content', description);
  const imageUrl =
    book.image_urls?.[0] ||
    book.image_url ||
    `https://via.placeholder.com/400x600.png?text=${encodeURIComponent(book.title)}`;
  ogImageTag.setAttribute('content', imageUrl);

  const price = book.final_price ?? book.price;
  if (price !== undefined && price !== null) {
    priceTag.setAttribute('content', price);
    currencyTag.setAttribute('content', 'ILS');
  }
  availabilityTag.setAttribute(
    'content',
    book.availability === 'available' ? 'in stock' : 'out of stock'
  );

  return () => {
    document.title = previousTitle;
    if (previous.description !== null) descriptionTag.setAttribute('content', previous.description);
    if (previous.keywords !== null) keywordsTag.setAttribute('content', previous.keywords);
    if (previous.ogTitle !== null) ogTitleTag.setAttribute('content', previous.ogTitle);
    if (previous.ogDescription !== null) ogDescriptionTag.setAttribute('content', previous.ogDescription);
    if (previous.ogImage !== null) ogImageTag.setAttribute('content', previous.ogImage);
    if (previous.price !== null) priceTag.setAttribute('content', previous.price);
    if (previous.currency !== null) currencyTag.setAttribute('content', previous.currency);
    if (previous.availability !== null) availabilityTag.setAttribute('content', previous.availability);
  };
}
