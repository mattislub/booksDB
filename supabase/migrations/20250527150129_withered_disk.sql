-- Create a storage bucket for book images
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-images', 'book-images', true);

-- Allow public access to view images
CREATE POLICY "Book images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'book-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload book images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'book-images' AND
  (storage.foldername(name))[1] = 'books'
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own book images"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner) 
WITH CHECK (bucket_id = 'book-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own book images"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'book-images');