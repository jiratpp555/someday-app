-- Storage bucket for item photos
-- รันใน Supabase SQL Editor

insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload
create policy "Auth users upload photos" on storage.objects
  for insert with check (
    bucket_id = 'item-photos' AND auth.role() = 'authenticated'
  );

-- Public read
create policy "Photos publicly readable" on storage.objects
  for select using (bucket_id = 'item-photos');

-- Users delete own photos (folder = user_id)
create policy "Users delete own photos" on storage.objects
  for delete using (
    bucket_id = 'item-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
