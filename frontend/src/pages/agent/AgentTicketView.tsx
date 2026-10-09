import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { socket } from '../../services/socket';
import type { Ticket, Message } from '../../types';
import { Send, UserCircle, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function AgentTicketView() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      };

      socket.on('new_message', handleNewMessage);
      socket.on('status_updated', handleStatusUpdated);
      socket.on('ticket_updated', handleStatusUpdated);

      return () => {
        socket.emit('leave_ticket', id);
        socket.off('new_message', handleNewMessage);
        socket.off('status_updated', handleStatusUpdated);
        socket.off('ticket_updated', handleStatusUpdated);
      };
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !id) return;
    
    api.post(`/tickets/${id}/messages`, { senderType: 'AGENT', message: input.trim() })
      .then(() => setInput(''))
      .catch(console.error);
  };

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/tickets/${id}/status`, { status });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (!ticket) return (
    <div className="flex h-full w-full items-center justify-center text-gray-500">
      Loading ticket details...
    </div>
  );

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex w-full h-full bg-gray-50">
      {/* Left Panel: Ticket Details */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
          <Link to="/agent" className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition text-gray-600 shadow-sm">
            <ArrowLeft size={18} />
          </Link>
          <h2 className="text-lg font-bold text-gray-800">Back to Dashboard</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ticket Details</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{ticket.title}</h1>
            <div className="flex gap-2 flex-wrap mb-4">
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border uppercase ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority} Priority
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-mono bg-gray-50 p-2 rounded border border-gray-100">ID: {ticket.id}</p>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Customer</div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <UserCircle size={36} className="text-gray-400" />
              <div>
                <div className="font-semibold text-gray-900">{ticket.customer?.name || 'Unknown'}</div>
                <div className="text-sm text-gray-500">{ticket.customer?.email || 'No email provided'}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 text-sm whitespace-pre-wrap leading-relaxed shadow-inner max-h-60 overflow-y-auto">
              {ticket.description}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Timestamps</div>
            <div className="text-[11px] text-gray-600 grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div><span className="font-semibold text-gray-700">Created:</span><br/>{new Date(ticket.createdAt).toLocaleString()}</div>
              <div><span className="font-semibold text-gray-700">Updated:</span><br/>{new Date(ticket.updatedAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status Controls</div>
            <div className="grid grid-cols-1 gap-2 mb-3">
              <select 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
                value={ticket.status}
                onChange={(e) => updateStatus(e.target.value)}
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => updateStatus('RESOLVED')}
                disabled={ticket.status === 'RESOLVED'}
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-40 text-emerald-800 font-bold py-2.5 rounded-lg border border-emerald-200 transition text-[13px] shadow-sm"
              >
                <CheckCircle size={16} /> Mark Resolved
              </button>
              <button 
                onClick={() => updateStatus('CLOSED')}
                disabled={ticket.status === 'CLOSED'}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gray-200 hover:bg-gray-300 disabled:opacity-40 text-gray-800 font-bold py-2.5 rounded-lg border border-gray-300 transition text-[13px] shadow-sm"
              >
                <XCircle size={16} /> Close Ticket
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-gray-50 relative">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Live Agent Chat</h2>
          <div className="text-[11px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1.5 rounded-full border border-green-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Connected
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m) => {
            const isAgent = m.senderType === 'AGENT';
            return (
              <div key={m.id} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-end gap-3 max-w-[85%] ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {!isAgent && (
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm font-bold border border-blue-200">
                      {ticket.customer?.name ? ticket.customer.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  
                  <div className={`px-5 py-3 shadow-sm ${
                    isAgent 
                      ? 'bg-slate-700 text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm'
                  }`}>
                    {!isAgent && <div className="text-[10px] font-bold text-blue-600 mb-1 tracking-wide uppercase">{ticket.customer?.name || 'Customer'}</div>}
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">{m.message}</p>
                  </div>
                </div>
                
                <span className={`text-[11px] font-medium text-gray-400 mt-1 ${isAgent ? 'mr-2' : 'ml-12'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-200 p-4 shrink-0">
          <form onSubmit={handleSend} className="flex gap-3">
            <input 
              type="text" 
              value={input} 
              onChange={e=>setInput(e.target.value)} 
              placeholder="Type your response to the customer..." 
              className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition shadow-sm text-sm" 
            />
            <button 
              type="submit" 
              disabled={!input.trim()} 
              className="bg-slate-700 disabled:bg-gray-300 text-white rounded-full w-12 h-12 flex items-center justify-center transition shadow-sm"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
