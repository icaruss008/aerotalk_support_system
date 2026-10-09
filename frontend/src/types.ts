export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  customerId?: string;
  customer?: {
    name: string;
    email: string;
  };
}

export interface Message {
  id: string;
  ticketId: string;
  senderType: 'CUSTOMER' | 'AGENT';
  message: string;
  createdAt: string;
}
