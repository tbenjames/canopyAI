ALTER TABLE public.uploads
  ADD COLUMN IF NOT EXISTS location_source text
  CHECK (location_source IN ('exif','device_gps','manual_pin','none'));

UPDATE public.uploads
  SET location_source = CASE
    WHEN captured_lat IS NOT NULL AND captured_lng IS NOT NULL THEN 'exif'
    ELSE 'none'
  END
  WHERE location_source IS NULL;