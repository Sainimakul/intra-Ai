-- INTRA AI - PostgreSQL Schema
-- Run: psql -U postgres -d intra_ai -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_bots INTEGER NOT NULL DEFAULT 1,
  max_messages_per_month INTEGER NOT NULL DEFAULT 100,
  max_training_files INTEGER NOT NULL DEFAULT 1,
  max_file_size_mb INTEGER NOT NULL DEFAULT 5,
  allow_custom_domain BOOLEAN DEFAULT false,
  allow_url_scraping BOOLEAN DEFAULT false,
  allow_db_connect BOOLEAN DEFAULT false,
  allow_file_upload BOOLEAN DEFAULT true,
  allow_branding_removal BOOLEAN DEFAULT false,
  allow_analytics BOOLEAN DEFAULT false,
  allow_api_access BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_token VARCHAR(255),
  verification_token_expires TIMESTAMPTZ,
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  messages_used_this_month INTEGER DEFAULT 0,
  messages_reset_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_status VARCHAR(30) DEFAULT 'free',
  subscription_id VARCHAR(255),
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS bots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  primary_color VARCHAR(20) DEFAULT '#2563EB',
  secondary_color VARCHAR(20) DEFAULT '#DBEAFE',
  text_color VARCHAR(20) DEFAULT '#1F2937',
  font_family VARCHAR(100) DEFAULT 'Inter',
  bubble_style VARCHAR(20) DEFAULT 'rounded',
  position VARCHAR(20) DEFAULT 'bottom-right',
  welcome_message TEXT DEFAULT 'Hello! How can I help you today?',
  placeholder_text VARCHAR(255) DEFAULT 'Type your message...',
  bot_name VARCHAR(100) DEFAULT 'AI Assistant',
  language VARCHAR(10) DEFAULT 'en',
  response_length VARCHAR(20) DEFAULT 'medium',
  system_prompt TEXT DEFAULT 'You are a helpful AI assistant.',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  model VARCHAR(100) DEFAULT 'gemini-1.5-flash',
  knowledge_sources JSONB DEFAULT '[]',
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  allow_file_uploads BOOLEAN DEFAULT false,
  collect_email BOOLEAN DEFAULT false,
  show_branding BOOLEAN DEFAULT true,
  embed_domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('pdf', 'url', 'database', 'text', 'qa')),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'error')),
  file_path TEXT,
  file_size INTEGER,
  url TEXT,
  db_connection_string TEXT,
  db_query TEXT,
  raw_content TEXT,
  processed_content TEXT,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  chunks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  visitor_name VARCHAR(255),
  visitor_email VARCHAR(255),
  visitor_ip VARCHAR(45),
  user_agent TEXT,
  is_resolved BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(30) DEFAULT 'pending',
  billing_period VARCHAR(10) DEFAULT 'monthly',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bots_user ON bots(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bot ON knowledge_sources(bot_id);
CREATE INDEX IF NOT EXISTS idx_conversations_bot ON conversations(bot_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ language 'plpgsql';

DO $$ BEGIN
  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_bots_updated_at BEFORE UPDATE ON bots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE TRIGGER update_knowledge_updated_at BEFORE UPDATE ON knowledge_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed plans
INSERT INTO plans (name, slug, description, price_monthly, price_yearly, max_bots, max_messages_per_month, max_training_files, max_file_size_mb, allow_url_scraping, allow_db_connect, allow_file_upload, allow_branding_removal, allow_analytics, allow_api_access, features, is_featured, sort_order)
VALUES
  ('Free','free','Perfect for trying out INTRA AI',0,0,1,100,1,5,false,false,true,false,false,false,'["1 Chatbot","100 messages/month","Basic customization","Community support"]',false,1),
  ('Pro','pro','Best for small businesses',999,9990,5,5000,10,25,true,false,true,true,true,false,'["5 Chatbots","5,000 messages/month","URL scraping","PDF training","Remove branding","Analytics","Priority support"]',true,2),
  ('Business','business','For growing businesses',2999,29990,20,25000,50,100,true,true,true,true,true,true,'["20 Chatbots","25,000 messages/month","Database connection","Custom domain","Advanced analytics","API access","Dedicated support"]',false,3)
ON CONFLICT (slug) DO NOTHING;

-- Seed admin (password: Admin@123)
INSERT INTO users (name, email, password_hash, role, is_verified, is_active)
VALUES ('Super Admin','admin@intra-ai.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewLvjBsKDpD1YTWW','admin',true,true)
ON CONFLICT (email) DO NOTHING;

\echo 'INTRA AI schema initialized successfully!'
