import { useEffect, useState, useRef } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { socket } from '../../services/socket';
import type { Ticket, Message } from '../../types';
import { Send, ArrowLeft, Headphones, CheckCircle2, Lock } from 'lucide-react';

export default function LiveChat() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { refreshTickets } = useOutletContext<any>();
  const navigate = useNavigate();

  useEffect(() => {
    socket.connect();
    if (id) {
      api.get(`/tickets/${id}`).then(res => setTicket(res.data.data)).catch(console.error);
      api.get(`/tickets/${id}/messages`).then(res => setMessages(res.data.data)).catch(console.error);
      
      socket.emit('join_ticket', id);

      const handleNewMessage = (msg: Message) => {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      };
      
      const handleStatusUpdated = (updatedTicket: Ticket) => {
        setTicket(updatedTicket);
        refreshTickets();
      };

      socket.on('new_message', handleNewMessage);
      socket.on('status_updated', handleStatusUpdated);

      return () => {
        socket.emit('leave_ticket', id);
        socket.off('new_message', handleNewMessage);
        socket.off('status_updated', handleStatusUpdated);
      };
    }
  }, [id, refreshTickets]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !id || sending) return;
    
    const messageContent = input.trim();
    setInput('');
    setSending(true);

    try {
      await api.post(`/tickets/${id}/messages`, { senderType: 'CUSTOMER', message: messageContent });
    } catch (err) {
      console.error(err);
      setInput(messageContent); // restore on failure
    } finally {
      setSending(false);
    }
  };

  if (!ticket) return (
    <div className="flex h-full items-center justify-center text-xs text-zinc-400">
      Loading conversation...
    </div>
  );

  const isClosed = ticket.status === 'CLOSED';

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': 
        return { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200/60', label: 'Open' };
      case 'IN_PROGRESS': 
        return { dot: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/60', label: 'In Progress' };
      case 'RESOLVED': 
        return { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', label: 'Resolved' };
      case 'CLOSED': 
        return { dot: 'bg-zinc-400', badge: 'bg-zinc-100 text-zinc-600 border-zinc-200', label: 'Closed' };
      default: 
        return { dot: 'bg-zinc-400', badge: 'bg-zinc-100 text-zinc-600 border-zinc-200', label: status };
    }
  };

  const statusConfig = getStatusBadge(ticket.status);

  return (
    <div className="flex flex-col h-full relative bg-zinc-50/30">
      {/* Refined Header */}
      <div className="bg-white border-b border-zinc-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/customer')}
            className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition"
            title="Back to Tickets"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-zinc-900 tracking-tight">{ticket.title}</h2>
              <span className="font-mono text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/60">
                #{ticket.id.slice(0, 8)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusConfig.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                {statusConfig.label}
              </span>
              <span className="text-[10px] uppercase font-semibold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                {ticket.priority} priority
              </span>
            </div>
          </div>
        </div>

        {ticket.status === 'RESOLVED' && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            <CheckCircle2 size={14} />
            <span>Issue Resolved</span>
          </div>
        )}
      </div>
      
      {/* Live Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isCustomer = m.senderType === 'CUSTOMER';
          return (
            <div key={m.id} className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-end gap-2.5 max-w-[85%] sm:max-w-[75%] ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {!isCustomer && (
                  <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-2xs">
                    <Headphones size={13} />
                  </div>
                )}
                
                <div>
                  {!isCustomer && (
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1 pl-1">
                      Support Engineer
                    </span>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isCustomer 
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs' 
                      : 'bg-white border border-zinc-200/90 text-zinc-800 rounded-tl-xs shadow-xs'
                  }`}>
                    <p className="whitespace-pre-wrap">{m.message}</p>
                  </div>
                  <span className={`text-[10px] font-medium text-zinc-400 mt-1 block ${isCustomer ? 'text-right pr-1' : 'pl-1'}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Docked Composer */}
      <div className="bg-white border-t border-zinc-200/80 p-3 sm:p-4 shrink-0">
        {isClosed ? (
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-50 py-3 rounded-xl border border-zinc-200/80">
            <Lock size={14} className="text-zinc-400" />
            <span>This ticket is closed. You can create a new ticket if you need further help.</span>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
            <input 
              type="text" 
              value={input} 
              onChange={e=>setInput(e.target.value)} 
              placeholder="Reply to support..." 
              className="flex-1 bg-zinc-50 border border-zinc-200/80 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition" 
            />
            <button 
              type="submit" 
              disabled={!input.trim() || sending} 
              className="bg-indigo-600 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-xl w-10 h-10 flex items-center justify-center transition shadow-xs hover:bg-indigo-700 cursor-pointer shrink-0 active:scale-95"
            >
              <Send size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
