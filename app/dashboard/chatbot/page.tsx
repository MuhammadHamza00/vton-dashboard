'use client';

import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabaseClient";
import Script from 'next/script';


export default function AdminAIPage() {
  const [puterReady, setPuterReady] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkPuterReady = () => {
      if (typeof window !== 'undefined' && window.puter?.ai?.chat) {
        setPuterReady(true);
        console.log("✅ Puter ready in this component!");
      } else {
        setTimeout(checkPuterReady, 300);
      }
    };

    checkPuterReady();
  }, []);


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const [dbData, setDbData] = useState<{
    products: any[];
    users: any[];
    orders: any[];
  }>({ products: [], users: [], orders: [] });

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, usersRes, ordersRes] = await Promise.all([
        supabase.from('Products').select('*'),
        supabase.from('Users').select('*'),
        supabase.from('Orders').select('*'),
      ]);

      setDbData({
        products: productsRes.data || [],
        users: usersRes.data || [],
        orders: ordersRes.data || [],
      });
    };

    fetchData();
  }, []);
  const handleAsk = async () => {
    if (!query) return;
    setLoading(true);

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);

    try {
      const rawResponse = await window.puter.ai.chat([
        {
          role: 'system',
          content: `You are an admin assistant. You have access to the following data:
Products: ${JSON.stringify(dbData.products).slice(0, 8000)}
Users: ${JSON.stringify(dbData.users).slice(0, 3000)}
Orders: ${JSON.stringify(dbData.orders).slice(0, 4000)}
Please respond based on this data in best Format for Users.`,
        },
        ...messages,
        userMessage,
      ]);
      const responseText = rawResponse?.message?.content || rawResponse?.content || '⚠️ Unknown response';

      const aiMessage = { role: 'assistant', content: responseText };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ Failed to get a response from AI.' },
      ]);
    } finally {
      setQuery('');
      setLoading(false);
    }
  };

  return (
    <div className="relative">
    


      <div className="max-w-full mx-auto p-4 h-screen flex flex-col scrollbar-track-black bg-[#111827] border-1 border-[#334155] rounded-2xl">
        <h1 className="text-2xl font-bold mb-4 text-white">🧠 Admin AI Assistant</h1>

        {/* Scrollable Message Area */}
        <div
          className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black max-w-full"
          style={{ maxWidth: "100%" }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`relative p-3 rounded-lg max-w-[90%] ${msg.role === "user"
                ? "bg-gray-800  text-white ml-auto"
                : "border-1 border-gray-800 text-gray-200 mr-auto"
                }`}
            >
              <p className="whitespace-pre-wrap break-words">
                {msg.content.replace(/[*_`#>-]/g, '')}
              </p>


              {/* Copy button */}
              <button
                onClick={() => copyToClipboard(msg.content)}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded-lg transition cursor-pointer"
                aria-label="Copy message"
                title="Copy message"
                type="button"
              >
                Copy
              </button>
            </div>
          ))}
        </div>

        {/* Fixed Input at Bottom */}
        <div className="flex gap-2 sticky bottom-0  py-3 border-t border-gray-700">
          <input
            className="flex-1 p-3 text-sm text-gray-300 rounded-md bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
            placeholder="Ask about products, users or orders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            spellCheck={false}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            onClick={handleAsk}
            disabled={loading}
            type="button"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>

      </div>
    </div>

  );
}
