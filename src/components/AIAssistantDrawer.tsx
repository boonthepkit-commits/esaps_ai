import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Clock,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { aiSuggestedQuestions, getAIResponse, type AIChatMessage } from '@/data/aiData';

interface AIAssistantDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (action: string) => void;
}

const severityConfig = {
  high: { bg: 'bg-error-50', text: 'text-error-600', border: 'border-error-200', dot: 'bg-error-500' },
  medium: { bg: 'bg-warning-50', text: 'text-warning-600', border: 'border-warning-200', dot: 'bg-warning-500' },
  low: { bg: 'bg-success-50', text: 'text-success-600', border: 'border-success-200', dot: 'bg-success-500' },
  info: { bg: 'bg-brand-50', text: 'text-brand-600', border: 'border-brand-200', dot: 'bg-brand-500' },
};

export function AIAssistantDrawer({ open, onClose, onNavigate }: AIAssistantDrawerProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Good morning, Alex. I've analyzed your asset portfolio. Here are 3 things that need your attention today: 7 assets have high lifecycle risk, 14 assets have been idle for 90+ days, and 23 warranties expire within 60 days.",
      timestamp: '9:00 AM',
      sources: [
        { label: 'Asset Database', ref: '1,248 assets' },
        { label: 'Maintenance Log', ref: '7 records' },
      ],
      confidence: 94,
      actions: [
        { label: 'View Insights', action: 'insights' },
        { label: 'Open Recommendations', action: 'recommendations' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const query = text ?? input;
    if (!query.trim()) return;

    const userMsg: AIChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: 'now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(query);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 900);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-surface-950/30 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 bg-gradient-to-r from-brand-50 to-accent-50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-title font-bold text-surface-900 flex items-center gap-1.5">
                RAISE AI
                <span className="inline-flex items-center gap-1 text-caption text-success-600 font-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
                  Online
                </span>
              </h2>
              <p className="text-caption text-surface-500">Asset Intelligence Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-md text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-50">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[85%]', msg.role === 'user' ? '' : 'w-full')}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="h-6 w-6 rounded-md bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-caption font-medium text-surface-600">RAISE AI</span>
                    <span className="text-caption text-surface-400">{msg.timestamp}</span>
                  </div>
                )}
                <div className={cn(
                  'rounded-xl px-4 py-3 text-body',
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-sm'
                    : 'bg-white border border-surface-200 text-surface-800 rounded-tl-sm shadow-sm'
                )}>
                  <p className="leading-relaxed">{msg.content}</p>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-surface-100">
                      <p className="text-caption font-medium text-surface-500 mb-1.5">Sources</p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((s, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-caption bg-surface-100 text-surface-600 px-2 py-0.5 rounded-md">
                            <ShieldCheck className="h-3 w-3 text-surface-400" />
                            {s.label}: <span className="font-medium">{s.ref}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confidence */}
                  {msg.confidence !== undefined && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-caption text-surface-500">Confidence</span>
                      <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden max-w-[120px]">
                        <div className={cn('h-full rounded-full', msg.confidence >= 85 ? 'bg-success-500' : msg.confidence >= 70 ? 'bg-warning-500' : 'bg-error-500')} style={{ width: `${msg.confidence}%` }} />
                      </div>
                      <span className="text-caption font-medium text-surface-600">{msg.confidence}%</span>
                    </div>
                  )}

                  {/* Actions */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.actions.map((a, i) => (
                        <button
                          key={i}
                          onClick={() => onNavigate?.(a.action)}
                          className="inline-flex items-center gap-1 text-caption font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          {a.label}
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <p className="text-caption text-surface-400 mt-1 text-right">{msg.timestamp}</p>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-caption font-medium text-surface-600">RAISE AI is analyzing...</span>
              </div>
              <div className="bg-white border border-surface-200 rounded-xl rounded-tl-sm shadow-sm px-4 py-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && !isTyping && (
          <div className="px-4 pb-2 bg-surface-50">
            <p className="text-caption font-medium text-surface-500 mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5" /> Suggested questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {aiSuggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-caption text-surface-600 bg-white border border-surface-200 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 px-2.5 py-1.5 rounded-md transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-surface-200 bg-white">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask AI about your assets..."
                rows={1}
                className="w-full resize-none rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-body text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all min-h-[42px] max-h-32"
                style={{ height: 'auto' }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="h-[42px] w-[42px] flex items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
          <p className="text-caption text-surface-400 mt-2 flex items-center gap-1">
            <Activity className="h-3 w-3" />
            AI responses are based on portfolio data. Always verify before taking action.
          </p>
        </div>
      </div>
    </>
  );
}
