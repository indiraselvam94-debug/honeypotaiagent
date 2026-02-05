import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getScamTypeLabel, getScamTypeColor } from '@/lib/scamTemplates';
import type { Conversation } from '@/hooks/useConversations';

interface ConversationListProps {
  conversations: Conversation[] | undefined;
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, isLoading, selectedId, onSelect }: ConversationListProps) {
  const getStatusIcon = (status: Conversation['status']) => {
    switch (status) {
      case 'engaging':
        return <MessageSquare className="h-4 w-4 text-amber-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'terminated':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: Conversation['status']) => {
    switch (status) {
      case 'engaging':
        return 'Engaging';
      case 'completed':
        return 'Completed';
      case 'terminated':
        return 'Terminated';
    }
  };

  const hasExtractedData = (conv: Conversation) => {
    return conv.extracted_bank_account || 
           conv.extracted_ifsc || 
           conv.extracted_upi_id || 
           conv.extracted_phishing_link || 
           conv.extracted_phone_number || 
           conv.extracted_wallet_address;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Conversations
          {conversations && (
            <Badge variant="secondary" className="ml-auto">
              {conversations.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-320px)]">
          {!conversations?.length ? (
            <div className="p-6 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a new honeypot session</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`w-full p-4 text-left transition-colors hover:bg-muted/50 ${
                    selectedId === conv.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getScamTypeColor(conv.scam_type)}`}
                        >
                          {getScamTypeLabel(conv.scam_type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getStatusIcon(conv.status)}
                        <span>{getStatusLabel(conv.status)}</span>
                        <span>•</span>
                        <span>{Math.round(Number(conv.scam_confidence) * 100)}% confidence</span>
                      </div>
                      {hasExtractedData(conv) && (
                        <div className="mt-1">
                          <Badge variant="default" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            Intel extracted
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
