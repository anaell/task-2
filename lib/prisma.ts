import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

export const prisma = new PrismaClient({
  // The below was adjusted for Task-2
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_TASK_2 }),
});
