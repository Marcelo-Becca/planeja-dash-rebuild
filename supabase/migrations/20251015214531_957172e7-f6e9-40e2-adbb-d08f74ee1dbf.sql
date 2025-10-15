-- Create enum for user roles
create type public.app_role as enum ('admin', 'manager', 'developer', 'designer', 'analyst', 'other');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  display_name text,
  role text,
  company text,
  phone text,
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- RLS Policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

create policy "Admins can manage all roles"
  on public.user_roles
  for all
  using (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, display_name, role, company, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'displayName',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

-- Trigger to automatically create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for profiles updated_at
create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();