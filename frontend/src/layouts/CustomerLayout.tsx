import { Outlet, Link, Navigate, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Ticket } from '../types';
import { MessageSquarePlus } from 'lucide-react';

export default function CustomerLayout() {
  const { customer } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { id } = useParams();
  const location = useLocation();

  const isNewChat = location.pathname.endsWith('/new');
  const isMobileChatOpen = id || isNewChat;

  const fetchTickets = useCallback(() => {
    if (customer) {
      api.get(`/tickets?customerId=${customer.id}`).then(res => {
        setTickets(res.data.data);
      }).catch(console.error);
    }
  }, [customer]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  if (!customer) return <Navigate to="/" replace />;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex w-full h-full relative">
      {/* Sidebar */}
      <div className={`w-full md:w-96 bg-white border-r border-gray-300 flex-col h-full shrink-0 shadow-sm z-10 ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <Link to="/customer/new" className="flex items-center gap-2 w-full justify-center bg-blue-600 text-white py-3.5 px-4 rounded-xl hover:bg-blue-700 transition font-bold text-lg shadow-md hover:shadow-lg">
            <MessageSquarePlus size={24} />
            Start New Support Chat
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Your Active Tickets</h3>
          {tickets.map(t => (
            <Link 
              key={t.id} 
              to={`/customer/tickets/${t.id}`} 
              className={`block p-4 rounded-xl mb-3 border-2 transition shadow-sm hover:shadow-md ${id === t.id ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:border-blue-300'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900 truncate pr-2 text-base">{t.title}</span>
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-extrabold shrink-0 border ${getStatusColor(t.status)}`}>{t.status}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                <span className="truncate font-mono bg-gray-100 px-2 py-0.5 rounded">ID: {t.id.slice(0,8)}</span>
                <span className="uppercase text-[11px] font-black tracking-wider text-gray-400">{t.priority} Priority</span>
              </div>
            </Link>
          ))}
          {tickets.length === 0 && (
            <div className="text-base text-gray-500 text-center mt-10 bg-white p-6 rounded-xl border border-dashed border-gray-300">
              You don't have any tickets yet.<br/><br/>Click the button above to get help!
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 bg-white h-full flex-col overflow-hidden relative ${isMobileChatOpen ? 'flex' : 'hidden md:flex'}`}>
        <Outlet context={{ refreshTickets: fetchTickets }} />
      </div>
    </div>
  );
}
