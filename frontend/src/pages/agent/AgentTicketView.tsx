import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { socket } from '../../services/socket';
import type { Ticket, Message } from '../../types';
import { 
  Send, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  User, 
  Mail, 
  Tag, 
  FileText
} from 'lucide-react';

export default function AgentTicketView() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'dossier'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !id || sending) return;
    
    const messageContent = input.trim();
    setInput('');
    setSending(true);

    try {
      await api.post(`/tickets/${id}/messages`, { senderType: 'AGENT', message: messageContent });
    } catch (err) {
      console.error('Failed to send message', err);
      setInput(messageContent);
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      const res = await api.patch(`/tickets/${id}/status`, { status });
      if (res.data.success) {
        setTicket(res.data.data);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (!ticket) return (
    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
      Loading ticket workspace...
    </div>
  );

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'HIGH': 
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'MEDIUM': 
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'LOW': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      default: 
        return 'bg-zinc-50 text-zinc-600 border-zinc-200';
    }
  };

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
    <div className="flex flex-col md:flex-row w-full h-full bg-zinc-50/40 overflow-hidden">
      
      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 bg-zinc-100 border-b border-zinc-200 shrink-0">
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-zinc-200/80 shadow-2xs w-full">
          <button 
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition text-center cursor-pointer ${
              mobileTab === 'chat' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Live Conversation
          </button>
          <button 
            onClick={() => setMobileTab('dossier')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition text-center cursor-pointer ${
              mobileTab === 'dossier' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Ticket Dossier & Status
          </button>
        </div>
      </div>

      {/* Left Panel: Customer Dossier & Ticket Controls */}
      <div className={`w-full md:w-80 lg:w-96 h-full bg-white border-b md:border-b-0 md:border-r border-zinc-200/80 flex-col shrink-0 overflow-y-auto ${
        mobileTab === 'dossier' ? 'flex' : 'hidden md:flex'
      }`}>
        {/* Navigation Bar */}
        <div className="p-3.5 border-b border-zinc-100 flex items-center gap-2.5 bg-zinc-50/50 shrink-0">
          <Link 
            to="/agent" 
            className="p-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition text-zinc-600 shadow-2xs"
            title="Return to Queue"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-800">Ticket Workspace</span>
            <span className="font-mono text-[10px] text-zinc-400 bg-white border border-zinc-200 px-1.5 py-0.5 rounded">
              #{ticket.id.slice(0, 8)}
            </span>
          </div>
        </div>
        
        {/* Dossier Body */}
        <div className="p-4 sm:p-5 space-y-5">
          {/* Title & Metadata */}
          <div>
            <h1 className="text-base font-bold text-zinc-900 tracking-tight leading-snug mb-2">{ticket.title}</h1>
            <div className="flex gap-2 items-center flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusConfig.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                {statusConfig.label}
              </span>
              <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
          </div>

          {/* Customer Profile Card */}
          <div className="bg-zinc-50/60 rounded-xl p-3.5 border border-zinc-200/70">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User size={13} />
              <span>Customer Information</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                {ticket.customer?.name ? ticket.customer.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900 truncate">{ticket.customer?.name || 'Anonymous User'}</div>
                <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
                  <Mail size={11} className="shrink-0 text-zinc-400" />
                  <span className="truncate">{ticket.customer?.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText size={13} />
              <span>Initial Description</span>
            </div>
            <div className="bg-zinc-50/50 p-3 rounded-xl border border-zinc-200/70 text-zinc-700 text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {ticket.description || 'No description provided.'}
            </div>
          </div>

          {/* Lifecycle Timestamps */}
          <div className="text-[11px] text-zinc-500 grid grid-cols-2 gap-2 bg-zinc-50/50 p-3 rounded-xl border border-zinc-200/70">
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Created</span>
              <span className="text-zinc-700 font-medium">{new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Updated</span>
              <span className="text-zinc-700 font-medium">{new Date(ticket.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Lifecycle & Status Transition Controls */}
          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={13} />
              <span>Update Lifecycle Status</span>
            </div>
            
            <select 
              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-2xs transition cursor-pointer"
              value={ticket.status}
              onChange={(e) => updateStatus(e.target.value)}
            >
              <option value="OPEN">Mark as OPEN</option>
              <option value="IN_PROGRESS">Mark as IN PROGRESS</option>
              <option value="RESOLVED">Mark as RESOLVED</option>
              <option value="CLOSED">Mark as CLOSED</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => updateStatus('RESOLVED')}
                disabled={ticket.status === 'RESOLVED'}
                className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 text-emerald-800 font-semibold py-2 rounded-xl border border-emerald-200 transition text-xs shadow-2xs cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Resolve</span>
              </button>
              <button 
                onClick={() => updateStatus('CLOSED')}
                disabled={ticket.status === 'CLOSED'}
                className="flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 text-zinc-700 font-semibold py-2 rounded-xl border border-zinc-200 transition text-xs shadow-2xs cursor-pointer"
              >
                <Lock size={14} />
                <span>Close</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Right Panel: Real-time Communication Channel */}
      <div className={`flex-1 flex-col h-full bg-white relative ${mobileTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
        {/* Stream Header */}
        <div className="bg-white border-b border-zinc-200/80 px-4 sm:px-6 py-3 flex justify-between items-center shadow-xs shrink-0 z-10">
          <div>
            <span className="text-xs font-semibold text-zinc-900">Communication Stream</span>
            <span className="text-[11px] text-zinc-400 ml-2">Live with {ticket.customer?.name || 'Customer'}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Socket Live
          </div>
        </div>
        
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-zinc-50/20">
          {messages.map((m) => {
            const isAgent = m.senderType === 'AGENT';
            return (
              <div key={m.id} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-end gap-2.5 max-w-[85%] sm:max-w-[75%] ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {!isAgent && (
                    <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-[11px] font-bold shrink-0">
                      {ticket.customer?.name ? ticket.customer.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  
                  <div>
                    <span className={`text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1 ${isAgent ? 'text-right pr-1' : 'pl-1'}`}>
                      {isAgent ? 'You (Agent)' : (ticket.customer?.name || 'Customer')}
                    </span>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isAgent 
                        ? 'bg-zinc-900 text-white rounded-tr-xs shadow-xs' 
                        : 'bg-white border border-zinc-200/90 text-zinc-800 rounded-tl-xs shadow-xs'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.message}</p>
                    </div>
                    <span className={`text-[10px] font-medium text-zinc-400 mt-1 block ${isAgent ? 'text-right pr-1' : 'pl-1'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Agent Reply Composer */}
        <div className="bg-white border-t border-zinc-200/80 p-3 sm:p-4 shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
            <input 
              type="text" 
              value={input} 
              onChange={e=>setInput(e.target.value)} 
              placeholder="Send response to customer..." 
              className="flex-1 bg-zinc-50 border border-zinc-200/80 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition" 
            />
            <button 
              type="submit" 
              disabled={!input.trim() || sending} 
              className="bg-zinc-900 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs hover:bg-zinc-800 cursor-pointer shrink-0 active:scale-95"
            >
              <Send size={14} />
              <span>Reply</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
