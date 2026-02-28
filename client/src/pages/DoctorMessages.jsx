import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, AlertCircle } from 'lucide-react';
import { Card, LoadingSpinner, Button, Input } from '../components/UI';
import apiClient from '../utils/apiClient';

const DoctorMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/messages');
      const rows = response.data.data || [];
      const mapped = rows.map((r) => ({
        id: r.id || r.conversationUserId,
        patientName: r.fullName,
        lastMessage: r.lastMessage,
        unread: r.unreadCount || 0
      }));
      setConversations(mapped);
      if (mapped.length > 0) {
        setSelectedConversation(mapped[0]);
        await loadMessages(mapped[0].id);
      }
    } catch (_err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const res = await apiClient.get(`/messages/conversation/${conversationId}`);
      const rows = res.data.data || [];
      const me = JSON.parse(localStorage.getItem('user') || '{}');
      setMessages(rows.map((m) => ({
        id: m._id,
        text: m.message,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: (m.senderId?._id || m.senderId) !== me.userId
      })));
    } catch (_err) {
      setError('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      await apiClient.post('/messages/send', {
        receiverId: selectedConversation.id,
        message: newMessage.trim()
      });
      setNewMessage('');
      await loadMessages(selectedConversation.id);
      await fetchConversations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-10 h-full">
      <h1 className="text-4xl font-bold mb-2">Messages</h1>
      <p className="text-gray-600 mb-6">Chat with your patients</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <Card className="flex h-96">
        <div className="w-full md:w-1/3 border-r">
          <div className="p-4 border-b">
            <Input placeholder="Search conversations..." />
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={async () => {
                    setSelectedConversation(conv);
                    await loadMessages(conv.id);
                  }}
                  className={`p-4 border-b cursor-pointer transition ${selectedConversation?.id === conv.id ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{conv.patientName}</h3>
                    {conv.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{conv.unread}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {selectedConversation ? (
          <div className="w-full md:w-2/3 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">{selectedConversation.patientName}</h2>
              <p className="text-sm text-gray-600">Conversation</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.isUser ? 'bg-gray-200 text-gray-900' : 'bg-blue-600 text-white'}`}>
                    <p>{msg.text}</p>
                    <p className="text-xs opacity-75 mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t flex gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button variant="primary" size="sm" onClick={handleSendMessage} className="px-4 btn-premium shadow-lg shadow-blue-100">
                <Send size={18} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full md:w-2/3 flex items-center justify-center text-gray-500">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DoctorMessages;
