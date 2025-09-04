// app/lib/prisma.js
import { PrismaClient } from '@prisma/client';
// import { middleware } from '@/middleware';

const prisma = new PrismaClient();
// prisma.$use(middleware);

export default prisma;