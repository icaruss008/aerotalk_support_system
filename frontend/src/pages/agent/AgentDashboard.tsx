import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { socket } from '../../services/socket';
import type { Ticket } from '../../types';
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  ArrowUpRight, 
  Search, 
  Filter,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function AgentDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    socket.connect();
    fetchTickets();

    const handleTicketUpdated = (updatedTicket: Ticket) => {
      setTickets(prev => {
        const exists = prev.find(t => t.id === updatedTicket.id);
        if (exists) {
          return prev.map(t => t.id === updatedTicket.id ? updatedTicket : t);
        }
        return [updatedTicket, ...prev];
      });
    };

    socket.on('ticket_updated', handleTicketUpdated);

    return () => {
      socket.off('ticket_updated', handleTicketUpdated);
    };
  }, []);

  const fetchTickets = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/tickets');
      setTickets(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setTickets([]);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesFilter = filter === 'ALL' || t.status === filter;
      if (!matchesFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.title?.toLowerCase().includes(q) ||
        t.customer?.name?.toLowerCase().includes(q) ||
        t.customer?.email?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q)
      );
    });
  }, [tickets, filter, search]);

  const metrics = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length,
  };

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

  return (
    <div className="flex flex-col w-full h-full bg-zinc-50/40 overflow-y-auto">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Executive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={24} />
              <span>Agent Command Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Live customer ticket queues, triage actions, and incident metrics.
            </p>
          </div>

          <button 
            onClick={fetchTickets}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-2 rounded-xl transition shadow-2xs cursor-pointer active:scale-95"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-indigo-600' : 'text-zinc-500'} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Minimalist Executive KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">All Tickets</span>
              <Inbox size={16} className="text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 tracking-tight">{metrics.total}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-xs font-medium">Open Queue</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </div>
            <div className="text-2xl font-bold text-zinc-900 tracking-tight">{metrics.open}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-indigo-700 mb-2">
              <span className="text-xs font-medium">In Progress</span>
              <PlayCircle size={16} className="text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 tracking-tight">{metrics.inProgress}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-medium">Resolved</span>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 tracking-tight">{metrics.resolved}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-medium">Closed</span>
              <Clock size={16} className="text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 tracking-tight">{metrics.closed}</div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          {/* Segmented Status Tabs */}
          <div className="flex items-center bg-zinc-200/60 p-1 rounded-xl overflow-x-auto">
            {[
              { id: 'ALL', label: 'All', count: metrics.total },
              { id: 'OPEN', label: 'Open', count: metrics.open },
              { id: 'IN_PROGRESS', label: 'In Progress', count: metrics.inProgress },
              { id: 'RESOLVED', label: 'Resolved', count: metrics.resolved },
              { id: 'CLOSED', label: 'Closed', count: metrics.closed },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
                  filter === tab.id 
                    ? 'bg-white text-zinc-900 font-semibold shadow-xs' 
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filter === tab.id ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-200/80 text-zinc-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by customer, title, ID..."
              className="w-full bg-white border border-zinc-200/80 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-2xs transition"
            />
          </div>
        </div>

        {/* Triage Data Table */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200/80 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Ticket ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredTickets.map(ticket => {
                  const statusConfig = getStatusBadge(ticket.status || 'OPEN');
                  return (
                    <tr key={ticket.id} className="hover:bg-zinc-50/70 transition-colors group">
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] text-zinc-500">
                        #{ticket.id ? ticket.id.slice(0, 8) : 'N/A'}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[11px] font-bold text-zinc-700">
                            {ticket.customer?.name ? ticket.customer.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="font-medium text-zinc-900">{ticket.customer?.name || 'Anonymous'}</div>
                            <div className="text-[11px] text-zinc-400">{ticket.customer?.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 max-w-xs truncate font-medium text-zinc-800">
                        {ticket.title || 'Untitled Ticket'}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(ticket.priority || 'MEDIUM')}`}>
                          {ticket.priority || 'MEDIUM'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusConfig.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                          {statusConfig.label}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px] text-zinc-400">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <Link 
                          to={`/agent/tickets/${ticket.id}`} 
                          className="inline-flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition shadow-2xs group-hover:bg-indigo-600"
                        >
                          <span>Open</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-2">
                        <Filter size={18} />
                      </div>
                      <p className="text-xs font-medium text-zinc-700">No tickets match this view</p>
                      <p className="text-[11px] text-zinc-400 mt-1">Try switching to another tab or clearing your search term</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
