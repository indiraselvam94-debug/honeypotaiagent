import { useState } from 'react';
import { Shield, MessageSquare, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { ConversationList } from '@/components/dashboard/ConversationList';
import { ChatView } from '@/components/dashboard/ChatView';
import { IntelligencePanel } from '@/components/dashboard/IntelligencePanel';
import { ScamSimulator } from '@/components/dashboard/ScamSimulator';
import { ContinueChat } from '@/components/dashboard/ContinueChat';

import { 
  useConversations, 
  useConversation, 
  useMessages,
  useCreateConversation,
  useAddMessage,
  useUpdateConversation,
  useConversationStats
} from '@/hooks/useConversations';

import type { ScamType } from '@/lib/scamTemplates';

interface HoneypotResponse {
  scam_detected: boolean;
  scam_confidence: number;
  persona_response: string;
  extracted_intelligence: {
    bank_account: string | null;
    ifsc: string | null;
    upi_id: string | null;
    phishing_link: string | null;
    phone_number: string | null;
    wallet_address: string | null;
  };
  conversation_status: 'engaging' | 'completed' | 'terminated';
}

export default function Dashboard() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: conversations, isLoading: isLoadingConversations } = useConversations();
  const { data: selectedConversation } = useConversation(selectedConversationId);
  const { data: messages, isLoading: isLoadingMessages } = useMessages(selectedConversationId);
  const stats = useConversationStats();

  const createConversation = useCreateConversation();
  const addMessage = useAddMessage();
  const updateConversation = useUpdateConversation();

  const callHoneypotAgent = async (
    conversationMessages: { role: 'scammer' | 'honeypot'; content: string }[],
    scamType: ScamType
  ): Promise<HoneypotResponse> => {
    const { data, error } = await supabase.functions.invoke('honeypot-agent', {
      body: { messages: conversationMessages, scam_type: scamType }
    });

    if (error) throw error;
    return data as HoneypotResponse;
  };

  const handleStartConversation = async (scamType: ScamType, message: string) => {
    setIsProcessing(true);
    try {
      // Create conversation
      const conversation = await createConversation.mutateAsync(scamType);
      setSelectedConversationId(conversation.id);

      // Add scammer message
      await addMessage.mutateAsync({
        conversationId: conversation.id,
        role: 'scammer',
        content: message
      });

      // Call AI agent
      const response = await callHoneypotAgent(
        [{ role: 'scammer', content: message }],
        scamType
      );

      // Add honeypot response
      await addMessage.mutateAsync({
        conversationId: conversation.id,
        role: 'honeypot',
        content: response.persona_response
      });

      // Update conversation with extracted intelligence
      await updateConversation.mutateAsync({
        id: conversation.id,
        updates: {
          scam_confidence: response.scam_confidence,
          status: response.conversation_status,
          extracted_bank_account: response.extracted_intelligence.bank_account,
          extracted_ifsc: response.extracted_intelligence.ifsc,
          extracted_upi_id: response.extracted_intelligence.upi_id,
          extracted_phishing_link: response.extracted_intelligence.phishing_link,
          extracted_phone_number: response.extracted_intelligence.phone_number,
          extracted_wallet_address: response.extracted_intelligence.wallet_address
        }
      });

      toast.success('Honeypot session started');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start honeypot session');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueConversation = async (message: string) => {
    if (!selectedConversationId || !selectedConversation) return;

    setIsProcessing(true);
    try {
      // Add scammer message
      await addMessage.mutateAsync({
        conversationId: selectedConversationId,
        role: 'scammer',
        content: message
      });

      // Build conversation history
      const allMessages = [
        ...(messages || []).map(m => ({ role: m.role, content: m.content })),
        { role: 'scammer' as const, content: message }
      ];

      // Call AI agent
      const response = await callHoneypotAgent(allMessages, selectedConversation.scam_type);

      // Add honeypot response
      await addMessage.mutateAsync({
        conversationId: selectedConversationId,
        role: 'honeypot',
        content: response.persona_response
      });

      // Update conversation with new intelligence
      const updates: Record<string, unknown> = {
        scam_confidence: response.scam_confidence,
        status: response.conversation_status
      };

      // Only update intelligence fields if new data was extracted
      if (response.extracted_intelligence.bank_account) {
        updates.extracted_bank_account = response.extracted_intelligence.bank_account;
      }
      if (response.extracted_intelligence.ifsc) {
        updates.extracted_ifsc = response.extracted_intelligence.ifsc;
      }
      if (response.extracted_intelligence.upi_id) {
        updates.extracted_upi_id = response.extracted_intelligence.upi_id;
      }
      if (response.extracted_intelligence.phishing_link) {
        updates.extracted_phishing_link = response.extracted_intelligence.phishing_link;
      }
      if (response.extracted_intelligence.phone_number) {
        updates.extracted_phone_number = response.extracted_intelligence.phone_number;
      }
      if (response.extracted_intelligence.wallet_address) {
        updates.extracted_wallet_address = response.extracted_intelligence.wallet_address;
      }

      await updateConversation.mutateAsync({
        id: selectedConversationId,
        updates
      });

    } catch (error) {
      console.error('Failed to continue conversation:', error);
      toast.error('Failed to process message');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Honeypot</h1>
              <p className="text-sm text-muted-foreground">Scam Detection Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Conversations"
            value={stats.total}
            icon={MessageSquare}
            description={`${stats.engaging} active`}
          />
          <StatsCard
            title="Scams Detected"
            value={stats.completed + stats.engaging}
            icon={Target}
            variant="warning"
            description="High confidence"
          />
          <StatsCard
            title="Intel Extracted"
            value={stats.extractedCount}
            icon={Shield}
            variant="success"
            description="Bank accounts, UPIs, links"
          />
          <StatsCard
            title="Avg Confidence"
            value={`${Math.round(stats.avgConfidence * 100)}%`}
            icon={TrendingUp}
            description="Detection accuracy"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-6">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Left Sidebar - Conversation List */}
          <div className="lg:col-span-3">
            <ConversationList
              conversations={conversations}
              isLoading={isLoadingConversations}
              selectedId={selectedConversationId}
              onSelect={setSelectedConversationId}
            />
          </div>

          {/* Center - Chat View */}
          <div className="lg:col-span-5 space-y-4">
            <div className="h-[calc(100vh-380px)]">
              <ChatView
                conversation={selectedConversation}
                messages={messages}
                isLoading={isLoadingMessages}
                isProcessing={isProcessing}
              />
            </div>
            <ContinueChat
              conversationId={selectedConversationId}
              conversationStatus={selectedConversation?.status}
              onSendMessage={handleContinueConversation}
              isProcessing={isProcessing}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <ScamSimulator
              onStartConversation={handleStartConversation}
              isProcessing={isProcessing}
            />
            <IntelligencePanel conversation={selectedConversation} />
          </div>
        </div>
      </div>
    </div>
  );
}
