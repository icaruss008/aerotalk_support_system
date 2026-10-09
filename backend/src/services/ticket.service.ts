import prisma from '../prisma';
import { AppError } from '../utils/AppError';

export const createTicket = async (data: any) => {
  const { customerId, title, description, priority, initialMessages } = data;
  
  if (!customerId) throw new AppError(400, 'customerId is required');
  if (!title || typeof title !== 'string' || title.trim() === '') throw new AppError(400, 'Title is required and must be non-empty');
  if (!description) throw new AppError(400, 'Description is required');
  if (!['LOW', 'MEDIUM', 'HIGH'].includes(priority)) throw new AppError(400, 'Invalid priority');

  const ticket = await prisma.$transaction(async (tx) => {
    const newTicket = await tx.ticket.create({
      data: {
        customerId,
        title: title.trim(),
        description,
        priority,
        status: 'OPEN',
      }
    });

    if (initialMessages && Array.isArray(initialMessages) && initialMessages.length > 0) {
      await tx.message.createMany({
        data: initialMessages.map((msg: string) => ({
          ticketId: newTicket.id,
          senderType: 'CUSTOMER',
          message: msg
        }))
      });
    }

    return newTicket;
  });

  return ticket;
};

export const getTickets = async (status?: string, customerId?: string) => {
  const where: any = {};
  if (status) where.status = status;
  if (customerId) where.customerId = customerId;

  return prisma.ticket.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      customer: {
        select: { name: true, email: true }
      }
    }
  });
};

export const getTicketById = async (id: string) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { customer: true }
  });
  
  if (!ticket) throw new AppError(404, 'Ticket not found');
  return ticket;
};

export const updateTicketStatus = async (id: string, status: string) => {
  if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
    throw new AppError(400, 'Invalid status');
  }

  // Will throw P2025 handled by middleware if ticket not found
  return prisma.ticket.update({
    where: { id },
    data: { status }
  });
};

export const getTicketMessages = async (id: string) => {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw new AppError(404, 'Ticket not found');

  return prisma.message.findMany({
    where: { ticketId: id },
    orderBy: { createdAt: 'asc' }
  });
};

export const addMessage = async (ticketId: string, senderType: string, message: string) => {
  if (!['CUSTOMER', 'AGENT'].includes(senderType)) throw new AppError(400, 'Invalid senderType');
  if (!message || message.trim() === '') throw new AppError(400, 'Message cannot be empty');

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new AppError(404, 'Ticket not found');

  const [newMessage] = await prisma.$transaction([
    prisma.message.create({
      data: {
        ticketId,
        senderType,
        message: message.trim()
      }
    }),
    prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    })
  ]);

  return newMessage;
};
