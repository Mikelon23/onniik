import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Iniciando Seeding de Base de Datos ---');

  // Limpiar datos existentes
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  // 1. Crear Organizaciones
  const acme = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      googleCustomerId: 'C_acme123',
    },
  });

  const stark = await prisma.organization.create({
    data: {
      name: 'Stark Industries',
      googleCustomerId: 'C_stark456',
    },
  });

  console.log(`Organizaciones creadas: ${acme.name} y ${stark.name}`);

  // Generar hash dinámico de la contraseña de prueba 'admin123'
  const passwordHash = bcryptjs.hashSync('admin123', 10);

  // 2. Crear Usuarios para Acme Corporation
  const usersAcme = [
    {
      email: 'admin@acme.com',
      passwordHash: passwordHash,
      name: 'Alice Admin',
      role: 'ADMIN' as const,
      organizationId: acme.id,
    },
    {
      email: 'it@acme.com',
      passwordHash: passwordHash,
      name: 'Bob IT Manager',
      role: 'IT_MANAGER' as const,
      organizationId: acme.id,
    },
    {
      email: 'reader@acme.com',
      passwordHash: passwordHash,
      name: 'Charlie Reader',
      role: 'READER' as const,
      organizationId: acme.id,
    },
  ];

  for (const userData of usersAcme) {
    const user = await prisma.user.create({ data: userData });
    console.log(`Usuario creado en Acme: ${user.name} (${user.role})`);
  }

  // 3. Crear Usuarios para Stark Industries
  const usersStark = [
    {
      email: 'tony@stark.com',
      passwordHash: passwordHash,
      name: 'Tony Stark',
      role: 'ADMIN' as const,
      organizationId: stark.id,
    },
    {
      email: 'pepper@stark.com',
      passwordHash: passwordHash,
      name: 'Pepper Potts',
      role: 'IT_MANAGER' as const,
      organizationId: stark.id,
    },
  ];

  for (const userData of usersStark) {
    const user = await prisma.user.create({ data: userData });
    console.log(`Usuario creado en Stark: ${user.name} (${user.role})`);
  }

  console.log('✅ Seeding de base de datos completado con éxito.');

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error('Error durante el seeding:', error);
  process.exit(1);
});
