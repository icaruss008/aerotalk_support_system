import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { socket } from '../../services/socket';
import type { Ticket } from '../../types';
import { BarChart, CheckCircle2, Clock, Inbox, PlayCircle, ShieldAlert } from 'lucide-react';

export default function AgentDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

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
    try {
      const res = await api.get('/tickets');
      setTickets(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setTickets([]);
    }
  };

  const filteredTickets = filter === 'ALL' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  const metrics = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length,
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-50 overflow-y-auto">
      <div className="p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShieldAlert className="text-blue-600" /> Support Agent Dashboard
        </h1>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center">
            <div className="text-gray-500 text-sm font-semibold mb-1 flex items-center gap-1"><Inbox size={16}/> Total</div>
            <div className="text-2xl font-bold text-gray-900">{metrics.total}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center border-b-4 border-b-blue-500">
            <div className="text-gray-500 text-sm font-semibold mb-1 flex items-center gap-1"><BarChart size={16}/> Open</div>
            <div className="text-2xl font-bold text-blue-600">{metrics.open}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center border-b-4 border-b-purple-500">
            <div className="text-gray-500 text-sm font-semibold mb-1 flex items-center gap-1"><PlayCircle size={16}/> In Progress</div>
            <div className="text-2xl font-bold text-purple-600">{metrics.inProgress}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center border-b-4 border-b-emerald-500">
            <div className="text-gray-500 text-sm font-semibold mb-1 flex items-center gap-1"><CheckCircle2 size={16}/> Resolved</div>
            <div className="text-2xl font-bold text-emerald-600">{metrics.resolved}</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center border-b-4 border-b-gray-400">
            <div className="text-gray-500 text-sm font-semibold mb-1 flex items-center gap-1"><Clock size={16}/> Closed</div>
            <div className="text-2xl font-bold text-gray-600">{metrics.closed}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-gray-200 p-1 rounded-lg w-full md:w-max mb-6">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
            <button 
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition flex-1 md:flex-none whitespace-nowrap ${filter === status ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'}`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span title={ticket.id}>{ticket.id ? ticket.id.slice(0,8) : 'Unknown'}...</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.customer?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{ticket.customer?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{ticket.title || 'No Title'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getPriorityBadge(ticket.priority || 'MEDIUM')}`}>
                        {ticket.priority || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getStatusBadge(ticket.status || 'OPEN')}`}>
                        {(ticket.status || 'OPEN').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/agent/tickets/${ticket.id}`} className="text-blue-600 hover:text-blue-900 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition">
                        View Chat
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No tickets found matching this filter.
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
