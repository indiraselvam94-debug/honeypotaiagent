import { CreditCard, Building, Smartphone, Link, Phone, Wallet, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/hooks/useConversations';

interface IntelligencePanelProps {
  conversation: Conversation | null | undefined;
}

interface IntelItem {
  icon: React.ElementType;
  label: string;
  value: string | null;
  type: string;
}

export function IntelligencePanel({ conversation }: IntelligencePanelProps) {
  if (!conversation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Intelligence Extracted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Select a conversation to view extracted intelligence
          </p>
        </CardContent>
      </Card>
    );
  }

  const intelItems: IntelItem[] = [
    { 
      icon: CreditCard, 
      label: 'Bank Account', 
      value: conversation.extracted_bank_account,
      type: 'bank'
    },
    { 
      icon: Building, 
      label: 'IFSC Code', 
      value: conversation.extracted_ifsc,
      type: 'ifsc'
    },
    { 
      icon: Smartphone, 
      label: 'UPI ID', 
      value: conversation.extracted_upi_id,
      type: 'upi'
    },
    { 
      icon: Link, 
      label: 'Phishing Link', 
      value: conversation.extracted_phishing_link,
      type: 'link'
    },
    { 
      icon: Phone, 
      label: 'Phone Number', 
      value: conversation.extracted_phone_number,
      type: 'phone'
    },
    { 
      icon: Wallet, 
      label: 'Wallet Address', 
      value: conversation.extracted_wallet_address,
      type: 'wallet'
    },
  ];

  const hasAnyIntel = intelItems.some(item => item.value);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Intelligence Extracted
          {hasAnyIntel && (
            <Badge className="ml-auto bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              Data Found
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {intelItems.map((item) => (
            <div 
              key={item.type} 
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                item.value 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : 'bg-muted/30 border-transparent'
              }`}
            >
              <item.icon className={`h-5 w-5 mt-0.5 ${
                item.value ? 'text-emerald-500' : 'text-muted-foreground'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                {item.value ? (
                  <p className="text-sm font-mono break-all text-emerald-600 dark:text-emerald-400">
                    {item.value}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not detected</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
