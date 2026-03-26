-- Supabase Database Schema for SkillSwap

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Extends Supabase Auth optionally or custom profiles)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Maps to auth.users.id if using Supabase Auth
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user', -- 'user' or 'admin'
    accept_payments BOOLEAN DEFAULT true,
    wallet_balance NUMERIC DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Skills Table (Offered and Wanted)
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                   -- e.g., 'React.js', 'Guitar'
    level TEXT NOT NULL,                  -- 'Beginner', 'Intermediate', 'Expert'
    type TEXT NOT NULL,                   -- 'offered' or 'wanted'
    price_per_hour NUMERIC DEFAULT 0.00,  -- 0.00 implies Free Swap
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Sessions (Booking) Table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',         -- 'pending', 'accepted', 'completed', 'cancelled'
    is_paid BOOLEAN DEFAULT false,
    amount NUMERIC DEFAULT 0.00,
    escrow_status TEXT DEFAULT 'none',     -- 'none', 'held', 'released'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Messages (Chat) Table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Reviews Table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) can be enabled later for production security
