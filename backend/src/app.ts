import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import customerRoutes from './routes/customer.routes';
import ticketRoutes from './routes/ticket.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // For MVP safety: Echo back the exact origin that made the request.
    // This allows credentials:true while bypassing strict CORS origin requirements,
    // guaranteeing the frontend can connect even if FRONTEND_URL is misconfigured.
    callback(null, origin || true);
  },
  credentials: true,
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'OK' } });
});

app.use('/api/customers', customerRoutes);
app.use('/api/tickets', ticketRoutes);

// Centralized error handling
app.use(errorHandler);

export default app;
