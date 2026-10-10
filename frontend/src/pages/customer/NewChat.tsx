import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { Send } from 'lucide-react';

export default function NewChat() {
  const { customer } = useAuth();
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  
  const navigate = useNavigate();
  const { refreshTickets } = useOutletContext<any>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, input.trim()]);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpenModal = () => {
    setDescription(messages.join('\n\n'));
    setShowModal(true);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/tickets', {
        customerId: customer?.id,
        title,
        description,
        priority,
        initialMessages: messages
      });
      if (res.data.success) {
        refreshTickets();
        navigate(`/customer/tickets/${res.data.data.id}`);
      }
    } catch (err) {
      alert('Failed to create ticket. Please check your connection.');
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-gray-50/30">
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm z-10 gap-4 md:gap-0 shrink-0">
        <div className="flex items-start md:items-center gap-3">
          <button 
            onClick={() => window.location.href = '/customer'}
            className="md:hidden bg-gray-100 hover:bg-gray-200 p-2 rounded-lg text-gray-700 transition shrink-0 mt-1 md:mt-0"
          >
            ← Back
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">How can we help you?</h2>
            <p className="text-sm md:text-base text-gray-500 mt-1">Briefly describe your issue below, then generate a ticket to connect with our team.</p>
          </div>
        </div>
        <button 
          onClick={handleOpenModal} 
          disabled={messages.length === 0} 
          className="w-full md:w-auto bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 md:px-6 py-3 md:py-3.5 rounded-xl font-bold text-base md:text-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all transform active:scale-95"
        >
          Create Support Ticket
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.length === 0 && (
          <div className="flex justify-center mt-12 mb-8">
            <div className="bg-blue-50 border-2 border-blue-200 text-blue-900 rounded-2xl p-8 max-w-2xl text-center shadow-sm">
              <h3 className="text-2xl font-black mb-3">👋 Welcome to AeroTalk Support</h3>
              <p className="text-lg font-medium opacity-80 leading-relaxed">
                Please type out your issue in the box below. You can send multiple messages.<br/><br/>
                When you are ready, click the <strong>"Create Support Ticket"</strong> button at the top right to instantly route your issue to an available agent.
              </p>
            </div>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className="flex justify-end">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-6 py-4 text-lg max-w-[80%] shadow-md whitespace-pre-wrap leading-relaxed">
              {m}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSend} className="flex gap-4 max-w-5xl mx-auto">
          <input 
            type="text" 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            placeholder="Type your issue here..." 
            className="flex-1 border-2 border-gray-300 rounded-full px-6 py-4 text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-inner" 
          />
          <button 
            type="submit" 
            disabled={!input.trim()} 
            className="bg-blue-600 disabled:bg-gray-300 text-white rounded-full w-16 h-16 flex items-center justify-center transition-all shadow-md hover:shadow-lg hover:bg-blue-700"
          >
            <Send size={28} className="ml-1" />
          </button>
        </form>
      </div>

      {showModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 transform transition-all animate-in fade-in zoom-in duration-200">
            <h3 className="text-3xl font-extrabold mb-6 text-gray-900 border-b pb-4">Create Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">Issue Title (Required)</label>
                <input 
                  required 
                  type="text" 
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                  value={title} 
                  onChange={e=>setTitle(e.target.value)} 
                  placeholder="E.g., Cannot login to account" 
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">Priority Level</label>
                <select 
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white transition-all cursor-pointer" 
                  value={priority} 
                  onChange={e=>setPriority(e.target.value)}
                >
                  <option value="LOW">🟢 Low (Not urgent)</option>
                  <option value="MEDIUM">🟡 Medium (Standard)</option>
                  <option value="HIGH">🔴 High (Critical issue)</option>
                </select>
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">Issue Description</label>
                <textarea 
                  required 
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 h-32 text-lg text-gray-700 bg-gray-50 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                  value={description} 
                  onChange={e=>setDescription(e.target.value)} 
                />
              </div>
              <div className="flex justify-end gap-4 border-t pt-6">
                <button 
                  type="button" 
                  onClick={()=>setShowModal(false)} 
                  className="px-6 py-4 text-gray-600 font-bold text-lg rounded-xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
