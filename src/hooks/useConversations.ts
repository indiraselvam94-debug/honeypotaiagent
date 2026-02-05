import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ScamType } from '@/lib/scamTemplates';

export interface Conversation {
  id: string;
  scam_type: ScamType;
  scam_confidence: number;
  status: 'engaging' | 'completed' | 'terminated';
  extracted_bank_account: string | null;
  extracted_ifsc: string | null;
  extracted_upi_id: string | null;
  extracted_phishing_link: string | null;
  extracted_phone_number: string | null;
  extracted_wallet_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'scammer' | 'honeypot';
  content: string;
  created_at: string;
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Conversation[];
    }
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Conversation;
    },
    enabled: !!id
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (scamType: ScamType) => {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ scam_type: scamType })
        .select()
        .single();
      
      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
}

export function useAddMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, role, content }: { 
      conversationId: string; 
      role: 'scammer' | 'honeypot'; 
      content: string 
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, role, content })
        .select()
        .single();
      
      if (error) throw error;
      return data as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    }
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { 
      id: string; 
      updates: Partial<Omit<Conversation, 'id' | 'created_at' | 'updated_at'>> 
    }) => {
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', data.id] });
    }
  });
}

export function useConversationStats() {
  const { data: conversations } = useConversations();
  
  const stats = {
    total: conversations?.length || 0,
    engaging: conversations?.filter(c => c.status === 'engaging').length || 0,
    completed: conversations?.filter(c => c.status === 'completed').length || 0,
    terminated: conversations?.filter(c => c.status === 'terminated').length || 0,
    avgConfidence: conversations?.length 
      ? conversations.reduce((sum, c) => sum + Number(c.scam_confidence), 0) / conversations.length 
      : 0,
    extractedCount: conversations?.filter(c => 
      c.extracted_bank_account || 
      c.extracted_ifsc || 
      c.extracted_upi_id || 
      c.extracted_phishing_link || 
      c.extracted_phone_number || 
      c.extracted_wallet_address
    ).length || 0
  };
  
  return stats;
}
