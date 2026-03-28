-- DEDICATED TOURIST AUTHENTICATION MATRIX
-- IMPORTANT: Run this exclusively in your NEW Supabase Database: https://rhlskcsojcpgicpnkvfr.supabase.co

DROP TABLE IF EXISTS public.tourists CASCADE;

CREATE TABLE public.tourists (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protect internal table architectures while enforcing open transparency for Username mapping Lookups during login
ALTER TABLE public.tourists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to tourists for logic" ON public.tourists FOR SELECT USING (true);
CREATE POLICY "Individuals can update their own passports" ON public.tourists FOR UPDATE USING (auth.uid() = id);

-- Core Auth Pipeline trigger injecting metadata seamlessly to postgres
CREATE OR REPLACE FUNCTION public.handle_new_tourist()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tourists (id, email, username, phone_number)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Map logical runtime constraints to natively bound Supabase events
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_tourist();
