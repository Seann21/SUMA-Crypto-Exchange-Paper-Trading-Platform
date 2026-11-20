-- SUMA Crypto Exchange & Paper Trading Platform
-- Database Schema for Supabase (PostgreSQL)

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Portfolios Table (Virtual Cash Balance)
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  cash_idr NUMERIC(18, 2) DEFAULT 100000000.00 NOT NULL, -- Rp 100 Juta default
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Holdings Table (Crypto Asset Holdings)
CREATE TABLE IF NOT EXISTS public.holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  symbol VARCHAR(10) NOT NULL, -- 'BTC', 'ETH', 'SOL'
  amount NUMERIC(18, 8) DEFAULT 0 NOT NULL,
  avg_buy_price_idr NUMERIC(18, 2) DEFAULT 0 NOT NULL,
  total_invested_idr NUMERIC(18, 2) DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, symbol)
);

-- 4. Orders Table (Paper Trading Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pair VARCHAR(20) NOT NULL, -- 'BTC/IDR'
  side VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
  type VARCHAR(10) NOT NULL, -- 'market' or 'limit'
  price NUMERIC(18, 2) NOT NULL,
  amount NUMERIC(18, 8) NOT NULL,
  total_idr NUMERIC(18, 2) NOT NULL,
  fee_idr NUMERIC(18, 2) DEFAULT 0 NOT NULL,
  status VARCHAR(20) DEFAULT 'filled' NOT NULL, -- 'filled', 'pending', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  filled_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Sample RLS Policies (Users can only read and mutate their own data)
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own portfolio" ON public.portfolios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own holdings" ON public.holdings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own orders" ON public.orders FOR ALL USING (auth.uid() = user_id);

-- 5. Auto Trigger to Create Profile and Portfolio on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'Trader'), new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.portfolios (user_id, cash_idr)
  VALUES (new.id, 100000000.00)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
