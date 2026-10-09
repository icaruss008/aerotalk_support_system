import React, { createContext, useContext, useState } from 'react';
import type { Customer } from '../types';

interface AuthContextType {
  customer: Customer | null;
  login: (c: Customer) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('customer');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      localStorage.removeItem('customer');
      return null;
    }
  });

  const login = (c: Customer) => {
    setCustomer(c);
    localStorage.setItem('customer', JSON.stringify(c));
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('customer');
  };

  return (
    <AuthContext.Provider value={{ customer, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
