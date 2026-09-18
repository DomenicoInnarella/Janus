-- ==============================================================================
-- JANUS — SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('berlina', 'suv', 'utilitaria', 'moto', 'furgone')),
    length NUMERIC,
    width NUMERIC,
    height NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PARKING_SPACES TABLE
CREATE TABLE IF NOT EXISTS public.parking_spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    parking_type TEXT NOT NULL CHECK (parking_type IN ('posto_auto', 'garage', 'box', 'cortile_privato')),
    covered BOOLEAN DEFAULT false,
    security_camera BOOLEAN DEFAULT false,
    ev_charging BOOLEAN DEFAULT false,
    access_24_7 BOOLEAN DEFAULT false,
    automatic_gate BOOLEAN DEFAULT false,
    suv_compatible BOOLEAN DEFAULT true,
    price_hour NUMERIC NOT NULL CHECK (price_hour >= 0),
    price_day NUMERIC NOT NULL CHECK (price_day >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PARKING_PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.parking_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parking_id UUID NOT NULL REFERENCES public.parking_spaces(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parking_id UUID NOT NULL REFERENCES public.parking_spaces(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parking_id UUID NOT NULL REFERENCES public.parking_spaces(id) ON DELETE CASCADE,
    parker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    subtotal NUMERIC NOT NULL,
    platform_fee NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    booking_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewed_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Utente Janus'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
        NEW.phone
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Vehicles Policies
CREATE POLICY "Users can view only their own vehicles"
    ON public.vehicles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
    ON public.vehicles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
    ON public.vehicles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
    ON public.vehicles FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Parking Spaces Policies
CREATE POLICY "Active parking spaces are viewable by everyone"
    ON public.parking_spaces FOR SELECT
    USING (status = 'active' OR auth.uid() = host_id);

CREATE POLICY "Hosts can insert their own parking spaces"
    ON public.parking_spaces FOR INSERT
    WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own parking spaces"
    ON public.parking_spaces FOR UPDATE
    USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own parking spaces"
    ON public.parking_spaces FOR DELETE
    USING (auth.uid() = host_id);

-- 4. Parking Photos Policies
CREATE POLICY "Parking photos are viewable by everyone"
    ON public.parking_photos FOR SELECT
    USING (true);

CREATE POLICY "Hosts can manage photos of their own parking spaces"
    ON public.parking_photos FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.parking_spaces
            WHERE public.parking_spaces.id = parking_photos.parking_id
            AND public.parking_spaces.host_id = auth.uid()
        )
    );

-- 5. Availability Policies
CREATE POLICY "Availability viewable by everyone"
    ON public.availability FOR SELECT
    USING (true);

CREATE POLICY "Hosts can manage their own parking availability"
    ON public.availability FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.parking_spaces
            WHERE public.parking_spaces.id = availability.parking_id
            AND public.parking_spaces.host_id = auth.uid()
        )
    );

-- 6. Bookings Policies
CREATE POLICY "Users can view bookings they made or received on their parkings"
    ON public.bookings FOR SELECT
    USING (
        auth.uid() = parker_id OR
        EXISTS (
            SELECT 1 FROM public.parking_spaces
            WHERE public.parking_spaces.id = bookings.parking_id
            AND public.parking_spaces.host_id = auth.uid()
        )
    );

CREATE POLICY "Users can create bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (auth.uid() = parker_id);

CREATE POLICY "Parkers and Hosts can update their bookings"
    ON public.bookings FOR UPDATE
    USING (
        auth.uid() = parker_id OR
        EXISTS (
            SELECT 1 FROM public.parking_spaces
            WHERE public.parking_spaces.id = bookings.parking_id
            AND public.parking_spaces.host_id = auth.uid()
        )
    );

-- 7. Reviews Policies
CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can submit reviews for their completed bookings"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

-- Create helpful spatial and foreign key indexes
CREATE INDEX IF NOT EXISTS idx_parking_spaces_lat_lng ON public.parking_spaces (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_host ON public.parking_spaces (host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_parker ON public.bookings (parker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_parking ON public.bookings (parking_id);
