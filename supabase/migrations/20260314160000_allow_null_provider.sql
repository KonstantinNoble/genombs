-- Allow NULL provider for cache hits
-- Cache is a virtual provider and is stored as NULL in the provider column

ALTER TABLE public.gateway_request_logs
ALTER COLUMN provider DROP NOT NULL;
