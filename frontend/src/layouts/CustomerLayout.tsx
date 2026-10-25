import { Outlet, Link, Navigate, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Ticket } from '../types';
import { MessageSquarePlus, Search, Ticket as TicketIcon, Clock } from 'lucide-react';

export default function CustomerLayout() {
  const { customer } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState('');
  const { id } = useParams();
  const location = useLocation();

  const isNewChat = location.pathname.endsWith('/new');
  const isMobileChatOpen = Boolean(id || isNewChat);

  const fetchTickets = useCallback(() => {
    if (customer) {
      api.get(`/tickets?customerId=${customer.id}`).then(res => {
        setTickets(Array.isArray(res.data?.data) ? res.data.data : []);
      }).catch(console.error);
    }
  }, [customer]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = useMemo(() => {
    if (!search.trim()) return tickets;
    const q = search.toLowerCase();
    return tickets.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.id.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    );
  }, [tickets, search]);

  if (!customer) return <Navigate to="/" replace />;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': 
        return {
          dot: 'bg-amber-500',
          badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
          label: 'Open'
        };
      case 'IN_PROGRESS': 
        return {
          dot: 'bg-indigo-500',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
          label: 'In Progress'
        };
      case 'RESOLVED': 
        return {
          dot: 'bg-emerald-500',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
          label: 'Resolved'
        };
      case 'CLOSED': 
        return {
          dot: 'bg-zinc-400',
          badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',
          label: 'Closed'
        };
      default: 
        return {
          dot: 'bg-zinc-400',
          badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',
          label: status
        };
    }
  };

  return (
    <div className="flex w-full h-full relative bg-zinc-50/50">
      {/* Sidebar: Conversation & Ticket Queue */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-zinc-200 flex-col h-full shrink-0 shadow-xs z-10 ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
        {/* Header Action */}
        <div className="p-4 border-b border-zinc-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <TicketIcon size={16} className="text-zinc-500" />
              <span>Your Tickets</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">{tickets.length}</span>
            </h2>
            <Link 
              to="/customer/new" 
              className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition shadow-xs cursor-pointer"
            >
              <MessageSquarePlus size={14} />
              <span>New Ticket</span>
            </Link>
          </div>

          {/* Quick Filter Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tickets by title or ID..."
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Tickets List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTickets.map(t => {
            const statusConfig = getStatusBadge(t.status);
            const isSelected = id === t.id;
            return (
              <Link 
                key={t.id} 
                to={`/customer/tickets/${t.id}`} 
                className={`group block p-3.5 rounded-xl border transition-all text-left ${
                  isSelected 
                    ? 'bg-indigo-50/50 border-indigo-200 shadow-xs ring-1 ring-indigo-500/20' 
                    : 'bg-white border-zinc-200/70 hover:border-zinc-300 hover:bg-zinc-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-950' : 'text-zinc-900'}`}>
                    {t.title}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${statusConfig.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                    {statusConfig.label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                  <span className="font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded text-[10px]">
                    #{t.id.slice(0, 8)}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-400 font-medium">
                    <Clock size={11} />
                    {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Link>
            );
          })}

          {filteredTickets.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                <TicketIcon size={18} />
              </div>
              <p className="text-xs font-medium text-zinc-700">No tickets found</p>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-[200px] mx-auto">
                {search ? 'Try adjusting your search criteria' : 'Click "New Ticket" above to reach our support team'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area (Chat or Creation form) */}
      <div className={`flex-1 bg-white h-full flex-col overflow-hidden relative ${isMobileChatOpen ? 'flex' : 'hidden md:flex'}`}>
        <Outlet context={{ refreshTickets: fetchTickets }} />
      </div>
    </div>
  );
}
