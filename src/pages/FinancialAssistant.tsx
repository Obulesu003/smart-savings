import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useGoals } from '@/hooks/useGoals';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { webLlmService, AITraceLog } from '@/lib/ai/local-llm-engine';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function FinancialAssistant() {
  const { user } = useAuth();
  const { transactions, getIncome, getExpenses } = useTransactions();
  const { goals } = useGoals();
  const { toast } = useToast();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [aiLogs, setAiLogs] = useState<AITraceLog[]>([]);

  // 1. Initialize System Context (Local RAG)
  useEffect(() => {
    if (!user) return;
    
    // Build personalized string from local IndexedDB
    const totalInc = getIncome().reduce((s, t) => s + t.amount, 0);
    const totalExp = getExpenses().reduce((s, t) => s + t.amount, 0);
    const topGoals = goals.slice(0, 3).map(g => `${g.name} (${g.currentAmount}/${g.targetAmount})`).join(', ');

    const systemContext = `You are a highly advanced Financial Assistant AI.
    You have exclusive access to the user's localized financial state:
    - Monthly Income (Avg): ₹${Math.round(totalInc / Math.max(1, getIncome().length))}
    - Monthly Expenses (Avg): ₹${Math.round(totalExp / Math.max(1, getExpenses().length))}
    - Active Savings Goals: ${topGoals || 'None'}
    
    Answer the user's questions based primarily on their personal data. Provide actionable advice. 
    If they ask about macroeconomic trends, give a concise intelligent response. Do not use extremely long text blocks.`;

    setMessages([
      { id: 'sys', role: 'system', content: systemContext },
      { id: 'welcome', role: 'assistant', content: `Hello ${user.user_metadata?.full_name?.split(' ')[0] || ''}! I'm your private AI financial advisor. Based on your IndexedDB data, I see you're currently bringing in an average of ₹${Math.round(totalInc / Math.max(1, getIncome().length))} per month. How can I help you optimize your portfolio or savings today?` }
    ]);

  }, [user, transactions, goals]);

  // 2. Load ML Engine
  useEffect(() => {
    let mounted = true;

    async function initAI() {
      try {
        if (!webLlmService.isReady()) {
          webLlmService.setTraceCallback((log) => {
            if (mounted) setAiLogs(prev => [...prev, log]);
          });
          await webLlmService.initializeEngine();
        } else {
          webLlmService.setTraceCallback((log) => {
            if (mounted) setAiLogs(prev => [...prev, log]);
          });
        }
        if (mounted) setIsEngineReady(true);
      } catch (error) {
        if (mounted) {
          toast({
            title: "AI Offline",
            description: "Failed to initialize the Edge AI or Cloud Fallback.",
            variant: "destructive"
          });
        }
      }
    }

    initAI();
    return () => { mounted = false; };
  }, []);

  // 3. Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !isEngineReady || isTyping) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Map to the format WebLLM expects
      const chatHistory: {role: 'system'|'user'|'assistant', content: string}[] = messages.concat(userMessage).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Inference
      const responseContent = await webLlmService.chatIterative(chatHistory);

      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseContent };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      toast({
        title: "Inference Error",
        description: "Failed to generate AI response.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <MainLayout>
      <div className="container py-6 h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-6">
        
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col bg-card border rounded-xl overflow-hidden shadow-sm relative">
          
          {/* Header */}
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  Financial Assistant 
                  <span className="flex h-2 w-2 rounded-full relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isEngineReady ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Powered by DeepMind Edge Architecture
                </p>
              </div>
            </div>
          </div>

          {/* Message Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {messages.filter(m => m.role !== 'system').map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-8 w-8 rounded-full flex shrink-0 items-center justify-center ${msg.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/20 border border-primary/30 text-primary'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl max-w-[80%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 text-primary flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-muted/50 border flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-muted/10 relative">
            <div className="relative">
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isEngineReady ? "Ask about your budget, investments, or market trends..." : "Initializing Neural Engine..."}
                disabled={!isEngineReady || isTyping}
                className="pr-14 min-h-[60px] max-h-[150px] resize-none pb-4 pt-4 rounded-xl"
              />
              <Button 
                size="icon" 
                onClick={handleSend}
                disabled={!input.trim() || !isEngineReady || isTyping}
                className="absolute right-2 bottom-2 h-10 w-10 rounded-lg hover:scale-105 transition-transform"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center mt-2 text-[10px] text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" /> Data never leaves your device unless using cloud fallback.
            </div>
          </div>
        </div>

        {/* Developer Trace Side Panel */}
        <div className="lg:w-1/3 flex flex-col bg-neutral-950 rounded-xl overflow-hidden shadow-sm border border-neutral-800 font-mono text-xs">
           <div className="px-4 py-3 border-b border-neutral-800 bg-black/40 flex items-center justify-between text-neutral-400">
              <span className="uppercase text-[10px] tracking-widest font-bold">Inference Matrix Trace</span>
              {isTyping && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
           </div>
           <ScrollArea className="flex-1 p-4 h-[300px] lg:h-auto">
              <div className="space-y-2 pb-4">
                {aiLogs.length === 0 && (
                  <div className="text-neutral-600 italic">Waiting for Engine Initialization...</div>
                )}
                {aiLogs.map((log, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5 animate-in fade-in slide-in-from-left-2">
                    <div className="flex gap-2">
                      <span className="text-neutral-500">[{log.timestamp}]</span>
                      <span className={
                        log.source === 'WEBGPU' ? 'text-green-400' : 
                        log.source === 'CLOUD_API' ? 'text-blue-400' : 
                        log.source === 'ERROR' ? 'text-red-400' :
                        'text-purple-400'
                      }>
                        [{log.source}]
                      </span>
                    </div>
                    <span className="text-neutral-300 break-words pl-[85px] leading-relaxed">
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
           </ScrollArea>
        </div>

      </div>
    </MainLayout>
  );
}
