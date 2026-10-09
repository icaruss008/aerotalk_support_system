import { Router } from 'express';
import { createCustomer } from '../controllers/customer.controller';

const router = Router();

router.post('/', createCustomer);

export default router;
