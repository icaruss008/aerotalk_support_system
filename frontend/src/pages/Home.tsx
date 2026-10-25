import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import { Headphones, ArrowRight, ShieldCheck, Zap, Clock } from 'lucide-react';

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, customer } = useAuth();
  const navigate = useNavigate();

  if (customer) {
    return <Navigate to="/customer" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !email.trim()) {
      setError('Please fill out all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/customers', { name, email });
      if (res.data.success) {
        login(res.data.data);
        navigate('/customer');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-zinc-50 via-white to-zinc-50/50">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-white rounded-2xl p-7 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.02)] border border-zinc-200/80 transition-all">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
              <Headphones size={22} strokeWidth={2.2} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Customer Support Portal</h1>
            <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed max-w-xs">
              Connect directly with our customer support and engineering team in real-time.
            </p>
          </div>
          
          {error && (
            <div className="bg-rose-50/80 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl mb-5 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Your Full Name</label>
              <input 
                type="text" 
                className="w-full bg-zinc-50/50 border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition" 
                value={name} 
                onChange={e=>setName(e.target.value)} 
                placeholder="Jane Cooper" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-zinc-50/50 border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="jane@company.com" 
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white text-sm font-semibold py-3 px-4 rounded-xl transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <span>Enter Support Hub</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2 pt-6 mt-6 border-t border-zinc-100 text-center">
            <div className="flex flex-col items-center">
              <Zap size={14} className="text-zinc-400 mb-1" />
              <span className="text-[11px] font-medium text-zinc-500">Live Socket</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock size={14} className="text-zinc-400 mb-1" />
              <span className="text-[11px] font-medium text-zinc-500">&lt; 2m SLA</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck size={14} className="text-zinc-400 mb-1" />
              <span className="text-[11px] font-medium text-zinc-500">Verified Agents</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
