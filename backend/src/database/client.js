const { PrismaClient } = require('@prisma/client');

let prisma = globalThis.__moodWellnessPrisma;

if (!prisma) {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__moodWellnessPrisma = prisma;
  }
}

module.exports = { prisma };
