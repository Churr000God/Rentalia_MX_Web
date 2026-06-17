-- Create reviews_internal table
create table if not exists reviews_internal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  room_id uuid references habitaciones(id) on delete cascade,
  rating int check (rating between 1 and 5) not null,
  comment text not null,
  created_at timestamptz default now(),
  approved boolean default false
);

-- Enable Row Level Security
alter table reviews_internal enable row level security;

-- Policy: Anyone can read approved reviews
create policy "Public can view approved reviews"
  on reviews_internal
  for select
  using (approved = true);

-- Policy: Users can view their own reviews (even if not approved)
create policy "Users can view own reviews"
  on reviews_internal
  for select
  using (auth.uid() = user_id);

-- Policy: Authenticated users can insert reviews
create policy "Authenticated users can insert reviews"
  on reviews_internal
  for insert
  with check (auth.uid() = user_id);

-- Policy: Only service_role can update approval status (Admin/Moderation)
-- Note: Service role bypasses RLS, so explicit policy might not be needed if only admin uses service role,
-- but adding one for safety if we have an admin role system.
-- For now, we rely on service_role or manual dashboard updates.
