-- ============================================
-- Complete Supabase Schema for NextAuth v5
-- Using @auth/supabase-adapter v1.11.2
-- 
-- IMPORTANT: This script uses the EXACT column names that @auth/supabase-adapter expects:
-- - users.email_verified (snake_case)
-- - accounts.userId, accounts.providerAccountId (camelCase with quotes)
-- - sessions.userId, sessions.sessionToken (camelCase with quotes)
-- ============================================

-- Step 1: Drop existing tables and schema (to start fresh)
DROP TABLE IF EXISTS next_auth.profiles CASCADE;
DROP TABLE IF EXISTS next_auth.subscriptions CASCADE;
DROP TABLE IF EXISTS next_auth.analyses CASCADE;
DROP TABLE IF EXISTS next_auth.verification_tokens CASCADE;
DROP TABLE IF EXISTS next_auth.sessions CASCADE;
DROP TABLE IF EXISTS next_auth.accounts CASCADE;
DROP TABLE IF EXISTS next_auth.users CASCADE;
DROP SCHEMA IF EXISTS next_auth CASCADE;

-- Step 2: Create next_auth schema
CREATE SCHEMA next_auth;

-- Step 3: Create tables with correct column names

-- Users table
CREATE TABLE next_auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table (OAuth accounts)
CREATE TABLE next_auth.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES next_auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, "providerAccountId")
);

-- Sessions table
CREATE TABLE next_auth.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES next_auth.users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  "sessionToken" TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification tokens table
CREATE TABLE next_auth.verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(identifier, token)
);

-- Analyses table (application-specific)
CREATE TABLE next_auth.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  video_url TEXT,
  scores JSONB NOT NULL,
  advice JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table (application-specific)
CREATE TABLE next_auth.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,
  price_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (application-specific)
CREATE TABLE next_auth.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES next_auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes

CREATE INDEX idx_analyses_user_created ON next_auth.analyses(user_id, created_at DESC);
CREATE INDEX idx_accounts_userId ON next_auth.accounts("userId");
CREATE INDEX idx_sessions_userId ON next_auth.sessions("userId");
CREATE INDEX idx_sessions_sessionToken ON next_auth.sessions("sessionToken");

-- Step 5: Enable Row Level Security

ALTER TABLE next_auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for users table

CREATE POLICY "Users can view own data" ON next_auth.users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON next_auth.users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON next_auth.users 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own data" ON next_auth.users 
  FOR DELETE USING (auth.uid() = id);

-- Step 7: Create RLS policies for accounts table

CREATE POLICY "Users can view own accounts" ON next_auth.accounts 
  FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can insert own accounts" ON next_auth.accounts 
  FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update own accounts" ON next_auth.accounts 
  FOR UPDATE USING (auth.uid() = "userId");

CREATE POLICY "Users can delete own accounts" ON next_auth.accounts 
  FOR DELETE USING (auth.uid() = "userId");

-- Step 8: Create RLS policies for sessions table

CREATE POLICY "Users can view own sessions" ON next_auth.sessions 
  FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can insert own sessions" ON next_auth.sessions 
  FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update own sessions" ON next_auth.sessions 
  FOR UPDATE USING (auth.uid() = "userId");

CREATE POLICY "Users can delete own sessions" ON next_auth.sessions 
  FOR DELETE USING (auth.uid() = "userId");

-- Step 9: Create RLS policies for verification_tokens table

CREATE POLICY "Service role can manage verification tokens" ON next_auth.verification_tokens 
  FOR ALL USING (true);

-- Step 10: Create RLS policies for analyses table

CREATE POLICY "Users can view own analyses" ON next_auth.analyses 
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own analyses" ON next_auth.analyses 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own analyses" ON next_auth.analyses 
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own analyses" ON next_auth.analyses 
  FOR DELETE USING (auth.uid()::text = user_id);

-- Step 11: Create RLS policies for subscriptions table

CREATE POLICY "Users can view own subscriptions" ON next_auth.subscriptions 
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own subscriptions" ON next_auth.subscriptions 
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Step 12: Create RLS policies for profiles table

CREATE POLICY "Users can view own profiles" ON next_auth.profiles 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" ON next_auth.profiles 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles" ON next_auth.profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 13: Grant permissions for PostgREST API access
-- This is required for @auth/supabase-adapter to work

-- Grant schema usage to service_role (used by Service Role Key)
GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA next_auth TO service_role;
GRANT SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA next_auth TO service_role;

-- Grant schema usage to authenticated role (for regular users)
GRANT USAGE ON SCHEMA next_auth TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA next_auth TO authenticated;
GRANT SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA next_auth TO authenticated;

-- Grant schema usage to anon role (for anonymous access if needed)
GRANT USAGE ON SCHEMA next_auth TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA next_auth TO anon;

-- ============================================
-- Script completed successfully!
-- All tables created with correct column names for @auth/supabase-adapter
-- ============================================
