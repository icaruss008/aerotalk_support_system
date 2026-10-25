import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { Send, ArrowLeft, MessageSquare, Sparkles, X } from 'lucide-react';

export default function NewChat() {
  const { customer } = useAuth();
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
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
    if (!title && messages.length > 0) {
      setTitle(messages[0].slice(0, 50));
    }
    setDescription(messages.join('\n\n'));
    setShowModal(true);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await api.post('/tickets', {
        customerId: customer?.id,
        title: title.trim(),
        description: description.trim() || title.trim(),
        priority,
        initialMessages: messages
      });
      if (res.data.success) {
        refreshTickets();
        navigate(`/customer/tickets/${res.data.data.id}`);
      }
    } catch (err) {
      alert('Failed to create ticket. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-zinc-50/30">
      {/* Header Bar */}
      <div className="bg-white border-b border-zinc-200/80 px-4 sm:px-6 py-3.5 flex justify-between items-center shadow-xs z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/customer')}
            className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition"
            title="Back to Tickets"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
              <span>New Support Conversation</span>
            </h2>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Describe your question or issue below, then route it to our engineering team.
            </p>
          </div>
        </div>

        <button 
          onClick={handleOpenModal} 
          disabled={messages.length === 0} 
          className="bg-indigo-600 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed hover:bg-indigo-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Sparkles size={14} />
          <span>Create Ticket ({messages.length})</span>
        </button>
      </div>
      
      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">How can we help you today?</h3>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              Type out your issue or inquiry in the message composer below. Once you've added your details, click <strong className="text-zinc-800 font-medium">Create Ticket</strong> to connect with an agent.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <button 
                onClick={() => setInput("I am having trouble with API authentication...")}
                className="text-[11px] bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-600 px-3 py-1.5 rounded-full transition shadow-2xs hover:bg-zinc-50 cursor-pointer"
              >
                API authentication issue
              </button>
              <button 
                onClick={() => setInput("My billing cycle and invoice question...")}
                className="text-[11px] bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-600 px-3 py-1.5 rounded-full transition shadow-2xs hover:bg-zinc-50 cursor-pointer"
              >
                Billing & invoices
              </button>
            </div>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className="flex justify-end">
            <div className="bg-indigo-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] sm:max-w-[70%] shadow-xs whitespace-pre-wrap leading-relaxed">
              {m}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer Input */}
      <div className="bg-white border-t border-zinc-200/80 p-3 sm:p-4 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
          <input 
            type="text" 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            placeholder="Type your message and press Enter..." 
            className="flex-1 bg-zinc-50 border border-zinc-200/80 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition" 
          />
          <button 
            type="submit" 
            disabled={!input.trim()} 
            className="bg-indigo-600 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-xl w-10 h-10 flex items-center justify-center transition shadow-xs hover:bg-indigo-700 cursor-pointer shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Sleek Ticket Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Create Support Ticket</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Route your conversation to our active agent queue</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
                  Ticket Subject / Title <span className="text-rose-500">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-3.5 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition" 
                  value={title} 
                  onChange={e=>setTitle(e.target.value)} 
                  placeholder="Brief summary of your inquiry..." 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'LOW', label: 'Low', desc: 'General question', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                    { id: 'MEDIUM', label: 'Medium', desc: 'Normal issue', color: 'text-amber-700 bg-amber-50 border-amber-200' },
                    { id: 'HIGH', label: 'High', desc: 'Critical blocker', color: 'text-rose-700 bg-rose-50 border-rose-200' },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        priority === p.id 
                          ? `${p.color} ring-2 ring-indigo-500/20 font-semibold shadow-xs` 
                          : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="text-xs font-semibold">{p.label}</div>
                      <div className="text-[10px] text-zinc-400">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Compiled Description</label>
                <textarea 
                  rows={3}
                  className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 placeholder-zinc-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition" 
                  value={description} 
                  onChange={e=>setDescription(e.target.value)} 
                  placeholder="Ticket details..."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                <button 
                  type="button" 
                  onClick={()=>setShowModal(false)} 
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || !title.trim()}
                  className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition shadow-xs cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Confirm & Launch Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
