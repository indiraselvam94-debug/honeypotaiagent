import { useState } from 'react';
import { Play, Shuffle, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRandomScamMessage, getScamTypeLabel, type ScamType } from '@/lib/scamTemplates';
import { toast } from 'sonner';

interface ScamSimulatorProps {
  onStartConversation: (scamType: ScamType, message: string) => Promise<void>;
  isProcessing: boolean;
}

export function ScamSimulator({ onStartConversation, isProcessing }: ScamSimulatorProps) {
  const [selectedType, setSelectedType] = useState<ScamType>('banking');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const handleGenerateRandom = () => {
    const { type, message } = getRandomScamMessage(selectedType);
    setSelectedType(type);
    setGeneratedMessage(message);
  };

  const handleStartAuto = async () => {
    if (!generatedMessage) {
      const { type, message } = getRandomScamMessage(selectedType);
      setSelectedType(type);
      setGeneratedMessage(message);
      await onStartConversation(type, message);
    } else {
      await onStartConversation(selectedType, generatedMessage);
    }
  };

  const handleStartManual = async () => {
    if (!customMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    await onStartConversation(selectedType, customMessage);
    setCustomMessage('');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Mock Scammer API</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="auto" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="auto">Auto Generate</TabsTrigger>
            <TabsTrigger value="manual">Manual Input</TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="space-y-4">
            <div className="space-y-2">
              <Label>Scam Category</Label>
              <Select 
                value={selectedType} 
                onValueChange={(v) => setSelectedType(v as ScamType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banking">{getScamTypeLabel('banking')}</SelectItem>
                  <SelectItem value="prize">{getScamTypeLabel('prize')}</SelectItem>
                  <SelectItem value="government">{getScamTypeLabel('government')}</SelectItem>
                  <SelectItem value="employment">{getScamTypeLabel('employment')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Message</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleGenerateRandom}
                  className="h-7 text-xs"
                >
                  <Shuffle className="h-3 w-3 mr-1" />
                  Randomize
                </Button>
              </div>
              <div className="min-h-[100px] p-3 rounded-lg bg-muted/50 border text-sm">
                {generatedMessage || (
                  <span className="text-muted-foreground">
                    Click "Randomize" to generate a scam message
                  </span>
                )}
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleStartAuto}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Honeypot Session
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label>Scam Category</Label>
              <Select 
                value={selectedType} 
                onValueChange={(v) => setSelectedType(v as ScamType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banking">{getScamTypeLabel('banking')}</SelectItem>
                  <SelectItem value="prize">{getScamTypeLabel('prize')}</SelectItem>
                  <SelectItem value="government">{getScamTypeLabel('government')}</SelectItem>
                  <SelectItem value="employment">{getScamTypeLabel('employment')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Custom Scam Message</Label>
              <Textarea
                placeholder="Enter a custom scam message to test..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleStartManual}
              disabled={isProcessing || !customMessage.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Honeypot
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
