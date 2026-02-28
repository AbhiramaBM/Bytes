import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, MessageCircle, Send } from 'lucide-react';
import { Card, Input, Button, LoadingSpinner } from '../components/UI';
import apiClient from '../utils/apiClient';

const PatientMessages = () => {
  const [searchParams] = useSearchParams();
  const doctorIdFromQuery = searchParams.get('doctorId');

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      await fetchConversations(false);
      if (selectedConversation?.id) {
        await loadMessages(selectedConversation.id);
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [selectedConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async (withLoading = true) => {
    try {
      if (withLoading) setLoading(true);
      setError('');
      const response = await apiClient.get('/messages');
      const rows = response.data.data || [];
      let mapped = rows.map((r) => ({
        id: r.id || r.conversationUserId,
        doctorName: r.fullName,
        lastMessage: r.lastMessage,
        unread: r.unreadCount || 0
      }));

      if (doctorIdFromQuery && !mapped.some((item) => item.id === doctorIdFromQuery)) {
        try {
          const doctorRes = await apiClient.get(`/doctors/${doctorIdFromQuery}`);
          const doctor = doctorRes.data?.data;
          if (doctor?._id) {
            mapped = [{
              id: doctor._id,
              doctorName: doctor.fullName || 'Doctor',
              lastMessage: 'Start your conversation',
              unread: 0
            }, ...mapped];
          }
        } catch {
          // Ignore; if doctor lookup fails keep current list
        }
      }

      setConversations(mapped);

      if (mapped.length > 0) {
        const preferred = (doctorIdFromQuery && mapped.find((item) => item.id === doctorIdFromQuery))
          || (selectedConversation?.id && mapped.find((item) => item.id === selectedConversation.id))
          || mapped[0];
        setSelectedConversation(preferred);
        await loadMessages(preferred.id);
      }
    } catch (_err) {
      setError('Failed to load conversations');
    } finally {
      if (withLoading) setLoading(false);
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
        isSelf: (m.senderId?._id || m.senderId) === me.userId
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
      await fetchConversations(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const filteredConversations = conversations.filter((conv) => (
    `${conv.doctorName || ''}`.toLowerCase().includes(searchTerm.trim().toLowerCase())
  ));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-10 h-full">
      <h1 className="text-4xl font-bold mb-2">Doctor Messages</h1>
      <p className="text-gray-600 mb-6">Chat directly with your assigned doctors</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <Card className="flex h-96">
        <div className="w-full md:w-1/3 border-r">
          <div className="p-4 border-b">
            <Input placeholder="Search doctors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="overflow-y-auto h-full">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={async () => {
                    setSelectedConversation(conv);
                    await loadMessages(conv.id);
                  }}
                  className={`p-4 border-b cursor-pointer transition ${selectedConversation?.id === conv.id ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">Dr. {conv.doctorName}</h3>
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
                <p>{searchTerm ? 'No doctor matches search' : 'No conversations yet'}</p>
              </div>
            )}
          </div>
        </div>

        {selectedConversation ? (
          <div className="w-full md:w-2/3 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">Dr. {selectedConversation.doctorName}</h2>
              <p className="text-sm text-gray-600">Conversation</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.isSelf ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button variant="primary" size="sm" onClick={handleSendMessage} className="px-4 btn-premium shadow-lg shadow-blue-100">
                <Send size={18} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full md:w-2/3 flex items-center justify-center text-gray-500">
            <p>Select a doctor conversation to start messaging</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PatientMessages;
