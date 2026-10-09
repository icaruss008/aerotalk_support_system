import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import * as ticketService from './services/ticket.service';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL 
        ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) 
        : ['http://localhost:5173'],
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_ticket', (ticketId: string) => {
      socket.join(`ticket:${ticketId}`);
      console.log(`Socket ${socket.id} joined room ticket:${ticketId}`);
    });

    socket.on('leave_ticket', (ticketId: string) => {
      socket.leave(`ticket:${ticketId}`);
      console.log(`Socket ${socket.id} left room ticket:${ticketId}`);
    });

    socket.on('send_message', async (data: { ticketId: string; senderType: string; message: string }) => {
      try {
        const { ticketId, senderType, message } = data;
        const newMessage = await ticketService.addMessage(ticketId, senderType, message);
        const updatedTicket = await ticketService.getTicketById(ticketId);

        // Broadcast to the ticket room
        io!.to(`ticket:${ticketId}`).emit('new_message', newMessage);
        // Broadcast globally to all connected clients (e.g. agent dashboard)
        io!.emit('ticket_updated', updatedTicket);
      } catch (error) {
        console.error('Socket send_message error:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
