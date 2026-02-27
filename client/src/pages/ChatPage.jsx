import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertTriangle, Trash2, Plus, Loader2 } from 'lucide-react';
import { Card, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

export const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await apiClient.get('/ai/conversations');
      setConversations(res.data.data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadConversation = async (convId) => {
    try {
      setConversationId(convId);
      const res = await apiClient.get(`/ai/conversations/${convId}`);
      setMessages(res.data.data || []);
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setMessages([]);
  };

  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/ai/conversations/${convId}`);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (conversationId === convId) {
        startNewChat();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage, createdAt: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        message: userMessage,
        conversationId
      });

      if (res.data.success) {
        const data = res.data.data;
        if (!conversationId) {
          setConversationId(data.conversationId);
          fetchConversations();
        }
        setMessages(prev => [...prev, { role: 'assistant', content: data.message, createdAt: new Date().toISOString() }]);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to get AI response. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg, createdAt: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex gap-6 h-[calc(100vh-200px)]">

        {/* Sidebar: Conversations */}
        <div className="w-64 hidden lg:flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition"
            >
              <Plus size={16} /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loadingHistory ? (
              <div className="p-4 text-center text-gray-400 text-sm font-bold">Loading history...</div>
            ) : conversations.length > 0 ? (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer mb-1 group transition ${conversationId === conv.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{conv.title || 'New Chat'}</p>
                    <p className="text-[10px] text-gray-400 truncate font-bold">{conv.lastMessage?.substring(0, 40) || ''}</p>
                  </div>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-gray-400 text-sm font-bold">No conversations yet</p>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">AI Health Assistant</h2>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Powered by RuralCare Connect</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight">
              AI suggestions are not medical diagnosis. Always consult a qualified doctor.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-blue-100 p-6 rounded-full mb-4">
                  <Bot size={48} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Hello! I'm your Health Assistant</h3>
                <p className="text-gray-500 max-w-md mb-6 font-medium">
                  Ask me any health-related questions.
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`p-1.5 rounded-full flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                    {msg.role === 'user'
                      ? <User size={16} className="text-white" />
                      : <Bot size={16} className="text-gray-600" />
                    }
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md shadow-sm'
                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                    }`}>
                    <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-2 font-bold ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* AI Thinking Indicator */}
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

          {/* Input */}
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
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-3 rounded-xl transition font-bold flex items-center gap-2"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
