
-- Create table for wallet connections
CREATE TABLE public.wallet_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  wallet_address TEXT NOT NULL,
  wallet_type TEXT NOT NULL DEFAULT 'metamask',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, wallet_address)
);

-- Create table for crypto transactions
CREATE TABLE public.crypto_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
  chain_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  amount DECIMAL(36, 18) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  gas_fee DECIMAL(36, 18),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  block_number BIGINT,
  from_address TEXT,
  to_address TEXT
);

-- Create table for wallet balances
CREATE TABLE public.wallet_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  wallet_address TEXT NOT NULL,
  chain_name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  balance DECIMAL(36, 18) NOT NULL DEFAULT 0,
  usd_value DECIMAL(20, 8),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, wallet_address, chain_name, token_symbol)
);

-- Enable RLS on all tables
ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallet_connections
CREATE POLICY "Users can manage their own wallet connections" 
  ON public.wallet_connections 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for crypto_transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.crypto_transactions 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for wallet_balances
CREATE POLICY "Users can view their own balances" 
  ON public.wallet_balances 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_wallet_connections_user_id ON public.wallet_connections(user_id);
CREATE INDEX idx_crypto_transactions_user_id ON public.crypto_transactions(user_id);
CREATE INDEX idx_crypto_transactions_status ON public.crypto_transactions(status);
CREATE INDEX idx_wallet_balances_user_id ON public.wallet_balances(user_id);
CREATE INDEX idx_wallet_balances_wallet_address ON public.wallet_balances(wallet_address);
