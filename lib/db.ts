import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
 prisma: PrismaClient | undefined
}

// Prisma 7's client engine requires a driver adapter. Neon's pooled endpoint
// over node-postgres works on the Node.js (serverless) runtime used here.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const prisma =
 globalForPrisma.prisma ??
 new PrismaClient({
 adapter,
 // Avoid 'query' logging in production: query text can contain PII (emails in
 // WHERE clauses) and floods serverless logs.
 log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
 })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
