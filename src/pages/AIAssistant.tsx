import { useState } from "react";
import { Send, Mic, Bot, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const suggestions = ["What causes headaches?", "Diabetes symptoms", "Blood pressure tips"];

export default function AIAssistant() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input }]);
    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: "This feature requires Lovable Cloud to be enabled for AI responses. Please enable Cloud to use the AI Health Assistant." }]);
    }, 500);
    setInput("");
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold">AI Health Assistant</h1>
        <p className="text-muted-foreground">Ask any health-related question</p>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-semibold">Hello! 👋</p>
            <p className="text-muted-foreground mt-1">I can only help with medical and health-related questions.</p>
            <div className="flex gap-2 mt-6 flex-wrap justify-center">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="px-4 py-2 rounded-full border border-border text-sm hover:bg-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning-foreground text-sm mb-3">
        <AlertCircle className="h-4 w-4 text-warning shrink-0" />
        This is for awareness only. Please consult a licensed doctor.
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border border-border rounded-xl p-2 bg-card">
        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
          <Mic className="h-5 w-5 text-muted-foreground" />
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type your health question..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <Button size="icon" onClick={sendMessage} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
