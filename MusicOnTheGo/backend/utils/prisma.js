// Prisma Client setup for Express
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

// Filter connection closed errors (common with connection poolers like Supabase)
// Prisma automatically reconnects on the next query, so these are expected
prisma.$on('error', (e) => {
  const message = e.message || String(e);
  if (message.includes('Closed') || message.includes('kind: Closed')) {
    // Suppress - connection pooler timeouts are expected with Supabase
    // Prisma will auto-reconnect on the next query
    return;
  }
  console.error('[Prisma Error]', message);
});

prisma.$on('warn', (e) => {
  console.warn('[Prisma Warn]', e.message || e);
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
