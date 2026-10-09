import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
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

    try {
      const res = await api.post('/customers', { name, email });
      if (res.data.success) {
        login(res.data.data);
        navigate('/customer');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect to the server');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Welcome to AeroTalk</h1>
        <p className="text-gray-500 text-center mb-6">Enter your details to start chatting with our support team.</p>
        
        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="Jane Doe" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              placeholder="jane@example.com" 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            Start Chatting
          </button>
        </form>
      </div>
    </div>
  );
}
