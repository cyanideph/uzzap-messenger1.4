-- Create bot_config table
CREATE TABLE IF NOT EXISTS public.bot_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID NOT NULL,
    email VARCHAR NOT NULL,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bot_config ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access bot config
CREATE POLICY "Bot config accessible by service role only" 
ON public.bot_config 
FOR ALL 
USING (auth.role() = 'service_role');

-- Insert bot credentials (password should be hashed in production)
INSERT INTO public.bot_config (bot_id, email, password_hash)
VALUES (
    '00000000-0000-0000-0000-000000000666',
    'uzzapbot@uzzap.com',
    crypt('bisdak', gen_salt('bf'))
);
