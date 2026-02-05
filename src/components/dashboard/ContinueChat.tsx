import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface ContinueChatProps {
  conversationId: string | null;
  conversationStatus: 'engaging' | 'completed' | 'terminated' | undefined;
  onSendMessage: (message: string) => Promise<void>;
  isProcessing: boolean;
}

export function ContinueChat({ 
  conversationId, 
  conversationStatus, 
  onSendMessage, 
  isProcessing 
}: ContinueChatProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversationId) return;
    
    await onSendMessage(message);
    setMessage('');
  };

  if (!conversationId) return null;

  const isDisabled = conversationStatus !== 'engaging';

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          placeholder={
            isDisabled 
              ? "This conversation has ended" 
              : "Continue the scam message (as scammer)..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isDisabled || isProcessing}
          className="min-h-[60px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button 
          type="submit" 
          size="icon"
          className="h-[60px] w-[60px]"
          disabled={isDisabled || isProcessing || !message.trim()}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </Card>
  );
}
