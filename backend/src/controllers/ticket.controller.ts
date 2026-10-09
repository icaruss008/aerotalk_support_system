import { Request, Response, NextFunction } from 'express';
import * as ticketService from '../services/ticket.service';
import { getIO } from '../socket';

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, customerId } = req.query;
    const tickets = await ticketService.getTickets(status as string, customerId as string);
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id as string);
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticketId = req.params.id as string;
    const ticket = await ticketService.updateTicketStatus(ticketId, req.body.status);
    
    // Broadcast status updates
    const io = getIO();
    io.to(`ticket:${ticketId}`).emit('status_updated', ticket);
    io.emit('ticket_updated', ticket);

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const getTicketMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await ticketService.getTicketMessages(req.params.id as string);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

export const addMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticketId = req.params.id as string;
    const { senderType, message } = req.body;
    
    const newMessage = await ticketService.addMessage(ticketId, senderType, message);
    const updatedTicket = await ticketService.getTicketById(ticketId);

    // Broadcast new message
    const io = getIO();
    io.to(`ticket:${ticketId}`).emit('new_message', newMessage);
    io.emit('ticket_updated', updatedTicket);

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    next(error);
  }
};
