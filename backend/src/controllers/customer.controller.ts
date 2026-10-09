import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customer.service';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;
    const { customer, isNew } = await customerService.createOrUpdateCustomer(name, email);
    res.status(isNew ? 201 : 200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};
