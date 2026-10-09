import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller';

const router = Router();

router.post('/', ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.patch('/:id/status', ticketController.updateTicketStatus);
router.get('/:id/messages', ticketController.getTicketMessages);
router.post('/:id/messages', ticketController.addMessage);

export default router;
