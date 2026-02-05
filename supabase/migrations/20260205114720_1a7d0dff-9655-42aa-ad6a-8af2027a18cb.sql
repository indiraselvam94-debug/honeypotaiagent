-- Create enum for scam types
CREATE TYPE public.scam_type AS ENUM ('banking', 'prize', 'government', 'employment');

-- Create enum for conversation status
CREATE TYPE public.conversation_status AS ENUM ('engaging', 'completed', 'terminated');

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scam_type scam_type NOT NULL,
  scam_confidence DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  status conversation_status NOT NULL DEFAULT 'engaging',
  extracted_bank_account TEXT,
  extracted_ifsc TEXT,
  extracted_upi_id TEXT,
  extracted_phishing_link TEXT,
  extracted_phone_number TEXT,
  extracted_wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('scammer', 'honeypot')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables (public access for this demo)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create public access policies (no auth required for this simulated demo)
CREATE POLICY "Public read access for conversations"
  ON public.conversations FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access for conversations"
  ON public.conversations FOR UPDATE
  USING (true);

CREATE POLICY "Public read access for messages"
  ON public.messages FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

-- Create index for faster message queries
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_scam_type ON public.conversations(scam_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;