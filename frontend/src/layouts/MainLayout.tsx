import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Headphones, Shield, User } from 'lucide-react';

export default function MainLayout() {
  const { customer, logout } = useAuth();
  const location = useLocation();
  const isCustomer = location.pathname.startsWith('/customer');
  const isAgent = location.pathname.startsWith('/agent');
  
  return (
    <div className="h-[100dvh] flex flex-col bg-zinc-50/50">
      {/* Sleek Enterprise App Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-6 h-16 flex justify-between items-center shrink-0 z-40">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20 group-hover:bg-indigo-700 transition">
              <Headphones size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900 tracking-tight text-base">AeroTalk</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                </span>
              </div>
            </div>
          </Link>

          {/* Role Navigation Segmented Control */}
          <nav className="hidden sm:flex items-center bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/60">
            <Link 
              to="/customer" 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isCustomer 
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/40 font-semibold' 
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <User size={14} /> Customer Portal
            </Link>
            <Link 
              to="/agent" 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isAgent 
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/40 font-semibold' 
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Shield size={14} /> Agent Console
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile switcher */}
          <div className="sm:hidden flex items-center bg-zinc-100 p-0.5 rounded-lg text-xs">
            <Link 
              to="/customer" 
              className={`px-2.5 py-1 rounded-md ${isCustomer ? 'bg-white font-medium shadow-xs' : 'text-zinc-500'}`}
            >
              Customer
            </Link>
            <Link 
              to="/agent" 
              className={`px-2.5 py-1 rounded-md ${isAgent ? 'bg-white font-medium shadow-xs' : 'text-zinc-500'}`}
            >
              Agent
            </Link>
          </div>

          {customer ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-medium text-zinc-800 leading-tight">{customer.name}</span>
                <span className="text-[11px] text-zinc-400 leading-tight truncate max-w-[120px]">{customer.email}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-xs font-bold text-indigo-700">
                {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button 
                onClick={logout} 
                title="Log out"
                className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
              >
                <LogOut size={16}/>
              </button>
            </div>
          ) : (
            <Link
              to="/"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
