
import { PrismaClient } from '@prisma/client';

//  global scope with prisma instance
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
    }

//singelton instance of PrismaClient
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, preserving the Prisma Client instance in hot reload
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}