import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import CustomerLayout from './layouts/CustomerLayout';
import Home from './pages/Home';
import NewChat from './pages/customer/NewChat';
import LiveChat from './pages/customer/LiveChat';
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentTicketView from './pages/agent/AgentTicketView';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            
            <Route path="customer" element={<CustomerLayout />}>
              <Route index element={<NewChat />} />
              <Route path="new" element={<NewChat />} />
              <Route path="tickets/:id" element={<LiveChat />} />
            </Route>

            <Route path="agent">
              <Route index element={<AgentDashboard />} />
              <Route path="tickets/:id" element={<AgentTicketView />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
