import { useEffect, useState, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { socket } from '../../services/socket';
import type { Ticket, Message } from '../../types';
import { Send, ShieldAlert } from 'lucide-react';

export default function LiveChat() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { refreshTickets } = useOutletContext<any>();

  useEffect(() => {
    socket.connect();
    if (id) {
      api.get(`/tickets/${id}`).then(res => setTicket(res.data.data)).catch(console.error);
      api.get(`/tickets/${id}/messages`).then(res => setMessages(res.data.data)).catch(console.error);
      
      socket.emit('join_ticket', id);

      const handleNewMessage = (msg: Message) => {
        setMessages(prev => [...prev, msg]);
      };
      
      const handleStatusUpdated = (updatedTicket: Ticket) => {
        setTicket(updatedTicket);
        refreshTickets(); // update sidebar
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !id) return;
    
    api.post(`/tickets/${id}/messages`, { senderType: 'CUSTOMER', message: input.trim() })
      .then(() => setInput(''))
      .catch(console.error);
  };

  if (!ticket) return (
    <div className="flex h-full items-center justify-center text-gray-500">
      Loading ticket details...
    </div>
  );

  const isClosed = ticket.status === 'CLOSED';

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
            {ticket.title} 
            <span className="text-gray-400 font-medium text-lg">#{ticket.id.slice(0,8)}</span>
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-sm px-3.5 py-1 rounded-full font-black border uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className="text-sm uppercase font-black text-gray-500 bg-gray-100 border border-gray-200 px-3.5 py-1 rounded-full tracking-wider">
              {ticket.priority} Priority
            </span>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {messages.map((m) => {
          const isCustomer = m.senderType === 'CUSTOMER';
          return (
            <div key={m.id} className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-end gap-4 max-w-[85%] ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {!isCustomer && (
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <ShieldAlert size={24}/>
                  </div>
                )}
                
                <div className={`px-6 py-4 shadow-md ${
                  isCustomer 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm'
                }`}>
                  {!isCustomer && <div className="text-xs font-black text-slate-500 mb-1.5 tracking-widest uppercase">Support Agent</div>}
                  <p className="whitespace-pre-wrap leading-relaxed text-lg">{m.message}</p>
                </div>
              </div>
              
              <span className={`text-xs font-bold text-gray-400 mt-2 ${isCustomer ? 'mr-2' : 'ml-16'}`}>
                {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
        {isClosed ? (
          <div className="text-center text-lg font-bold text-gray-500 bg-gray-100 py-4 rounded-xl border-2 border-gray-200">
            This ticket is closed. You can no longer send messages.
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex gap-4 max-w-5xl mx-auto">
            <input 
              type="text" 
              value={input} 
              onChange={e=>setInput(e.target.value)} 
              placeholder="Type a message..." 
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
        )}
      </div>
    </div>
  );
}
