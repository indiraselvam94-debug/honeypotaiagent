import { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bot, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Message, Conversation } from '@/hooks/useConversations';
import { getScamTypeLabel, getScamTypeColor } from '@/lib/scamTemplates';

interface ChatViewProps {
  conversation: Conversation | null | undefined;
  messages: Message[] | undefined;
  isLoading: boolean;
  isProcessing?: boolean;
}

export function ChatView({ conversation, messages, isLoading, isProcessing }: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!conversation) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground p-8">
          <Bot className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm">or start a new honeypot session</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-3/4" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Honeypot Session</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline" 
                className={`text-xs ${getScamTypeColor(conversation.scam_type)}`}
              >
                {getScamTypeLabel(conversation.scam_type)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {Math.round(Number(conversation.scam_confidence) * 100)}% scam confidence
              </span>
            </div>
          </div>
          <Badge 
            variant={conversation.status === 'engaging' ? 'default' : 'secondary'}
            className={
              conversation.status === 'completed' 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : conversation.status === 'terminated'
                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                : ''
            }
          >
            {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-4 space-y-4">
            {messages?.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'honeypot' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`shrink-0 p-2 rounded-full h-fit ${
                  message.role === 'scammer' 
                    ? 'bg-red-500/10 text-red-500' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {message.role === 'scammer' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className={`max-w-[75%] ${
                  message.role === 'honeypot' ? 'text-right' : ''
                }`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.role === 'scammer'
                      ? 'bg-muted text-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-3 flex-row-reverse">
                <div className="shrink-0 p-2 rounded-full h-fit bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
