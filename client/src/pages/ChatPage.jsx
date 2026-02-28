import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../components/UI';
import apiClient from '../utils/apiClient';

export const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, createdAt: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        message: userMessage,
        saveHistory: false
      });

      if (res.data.success) {
        const data = res.data.data;
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message, createdAt: new Date().toISOString() }]);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to get AI response. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg, createdAt: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex gap-6 h-[calc(100vh-200px)]">
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">AI Health Assistant</h2>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">No chat history is saved</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight">
              AI suggestions are not medical diagnosis. Always consult a qualified doctor.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-blue-100 p-6 rounded-full mb-4">
                  <Bot size={48} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Hello! I am your Health Assistant</h3>
                <p className="text-gray-500 max-w-md mb-6 font-medium">Ask a health question to start.</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-1.5 rounded-full flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-gray-600" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-md shadow-sm' : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'}`}>
                    <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="bg-gray-200 p-1.5 rounded-full">
                    <Bot size={16} className="text-gray-600" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                      <Loader2 size={16} className="animate-spin" />
                      AI is thinking...
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your health question..."
                className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                variant="primary"
                size="sm"
                className="px-5 py-3 rounded-xl shadow-lg shadow-blue-200"
              >
                <Send size={18} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
