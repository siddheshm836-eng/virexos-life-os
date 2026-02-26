import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm VirexAI, your intelligent assistant. I can help you analyze your workflows, suggest improvements, plan your goals, and provide productivity insights. What would you like to work on today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: newMessages.slice(1) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) setError("Rate limit reached. Please wait a moment.");
        else if (res.status === 402) setError("AI credits exhausted. Please top up.");
        else setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      setMessages(m => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) {
              assistantText += chunk;
              setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: assistantText } : msg));
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Analyze my workflow and suggest improvements",
    "Help me set SMART goals for this week",
    "What productivity techniques suit my work style?",
    "Suggest a morning routine for peak performance",
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="AI Assistant" description="VirexAI – Intelligent workflow and productivity insights" />
      <div className="flex-1 overflow-auto scrollbar-thin p-6 space-y-4">
        {messages.length === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {suggestions.map(s => (
              <button key={s} onClick={() => { setInput(s); }} className="text-left p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-sm text-foreground">
                <Sparkles size={14} className="text-primary mb-2" />
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === "assistant" ? "gradient-hero" : "bg-muted"}`}>
              {m.role === "assistant" ? <Bot size={16} className="text-white" /> : <span className="text-xs font-bold text-foreground">U</span>}
            </div>
            <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
              m.role === "assistant" ? "bg-card border border-border text-foreground" : "gradient-hero text-white"
            }`}>
              {m.content || <span className="opacity-50">...</span>}
            </div>
          </div>
        ))}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-3 items-end">
          <Textarea
            placeholder="Ask VirexAI anything about your workflows, goals, or productivity..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            className="flex-1 resize-none text-sm min-h-[44px] max-h-32"
            rows={1}
          />
          <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="gradient-hero text-white border-0 shrink-0 h-11 w-11">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">VirexAI is assistive only and will never automatically modify your data.</p>
      </div>
    </div>
  );
}
