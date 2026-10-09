import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import customerRoutes from './routes/customer.routes';
import ticketRoutes from './routes/ticket.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();

const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) 
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
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
