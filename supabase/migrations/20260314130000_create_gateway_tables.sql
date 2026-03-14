-- Create gateway_cache_entries table for semantic cache storage
-- This table stores cached API responses indexed by prompt hash and embeddings

CREATE TABLE IF NOT EXISTS public.gateway_cache_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    prompt_hash TEXT NOT NULL,
    prompt_text TEXT,
    embedding VECTOR(384),
    response_data JSONB NOT NULL,
    model TEXT NOT NULL,
    provider TEXT NOT NULL,
    tokens_saved INTEGER DEFAULT 0,
    hit_count INTEGER DEFAULT 0,
    last_hit_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_gateway_cache_entries_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for efficient cache lookups
CREATE INDEX IF NOT EXISTS idx_gateway_cache_entries_user_id ON public.gateway_cache_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_gateway_cache_entries_prompt_hash ON public.gateway_cache_entries(user_id, prompt_hash);
CREATE INDEX IF NOT EXISTS idx_gateway_cache_entries_expires_at ON public.gateway_cache_entries(expires_at);

-- Create gateway_request_logs table for request tracking and analytics
-- This table logs every request made through the gateway for auditing and insights

CREATE TABLE IF NOT EXISTS public.gateway_request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    model_requested TEXT NOT NULL,
    model_used TEXT NOT NULL,
    provider TEXT,
    latency_ms INTEGER DEFAULT 0,
    is_streaming BOOLEAN DEFAULT FALSE,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'success',
    cache_hit BOOLEAN DEFAULT FALSE,
    cache_entry_id UUID,
    error_code TEXT,
    prompt_optimized BOOLEAN DEFAULT FALSE,
    fallback_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_gateway_request_logs_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_gateway_request_logs_cache_entry FOREIGN KEY (cache_entry_id) REFERENCES public.gateway_cache_entries(id) ON DELETE SET NULL,
    CONSTRAINT chk_status CHECK (status IN ('success', 'cached', 'error'))
);

-- Create indexes for efficient log queries
CREATE INDEX IF NOT EXISTS idx_gateway_request_logs_user_id ON public.gateway_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_gateway_request_logs_created_at ON public.gateway_request_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gateway_request_logs_cache_hit ON public.gateway_request_logs(user_id, cache_hit) WHERE cache_hit = TRUE;
CREATE INDEX IF NOT EXISTS idx_gateway_request_logs_provider ON public.gateway_request_logs(provider);

-- Enable RLS (Row Level Security) for gateway_cache_entries
ALTER TABLE public.gateway_cache_entries ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only see their own cache entries
CREATE POLICY IF NOT EXISTS cache_entries_user_isolation ON public.gateway_cache_entries
    FOR ALL USING (auth.uid() = user_id);

-- Enable RLS for gateway_request_logs
ALTER TABLE public.gateway_request_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only see their own logs
CREATE POLICY IF NOT EXISTS request_logs_user_isolation ON public.gateway_request_logs
    FOR ALL USING (auth.uid() = user_id);
