import prisma from '../prisma';
import { AppError } from '../utils/AppError';

export const createOrUpdateCustomer = async (name: string, email: string) => {
  if (!name || !email) {
    throw new AppError(400, 'Name and email are required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, 'Invalid email format');
  }

  let customer = await prisma.customer.findUnique({ where: { email } });
  
  if (customer) {
    customer = await prisma.customer.update({
      where: { email },
      data: { name },
    });
    return { customer, isNew: false };
  }

  customer = await prisma.customer.create({
    data: { name, email },
  });
  return { customer, isNew: true };
};
