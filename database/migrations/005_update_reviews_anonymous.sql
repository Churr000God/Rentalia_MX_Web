alter table reviews_internal alter column user_id drop not null;
alter table reviews_internal add column author_name text;

-- Allow public inserts
create policy "Public can insert reviews"
  on reviews_internal
  for insert
  with check (true);
