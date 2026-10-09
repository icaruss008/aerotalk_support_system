import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function MainLayout() {
  const { customer, logout } = useAuth();
  const location = useLocation();
  
  return (
    <div className="h-[100dvh] flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center shrink-0">
        <Link to="/" className="text-xl font-bold">AeroTalk Support</Link>
        <nav className="flex gap-4 items-center">
          <Link to="/customer" className={`hover:underline ${location.pathname.startsWith('/customer') ? 'font-bold' : ''}`}>Customer View</Link>
          <span className="text-blue-300">|</span>
          <Link to="/agent" className={`hover:underline ${location.pathname.startsWith('/agent') ? 'font-bold' : ''}`}>Agent Dashboard</Link>
          
          {customer && (
            <button 
              onClick={logout} 
              className="ml-4 flex items-center gap-1 bg-blue-700 px-3 py-1.5 rounded hover:bg-blue-800 transition"
            >
              <LogOut size={16}/> Logout
            </button>
          )}
        </nav>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
