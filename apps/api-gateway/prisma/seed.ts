import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. HRD Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin.hrd@company.com' },
    update: {
      password: passwordHash,
      role: 'HRD_ADMIN',
    },
    create: {
      email: 'admin.hrd@company.com',
      password: passwordHash,
      name: 'Dewi Lestari, S.Psi',
      phone: '081234567890',
      position: 'Head of People & HR Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      role: 'HRD_ADMIN',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // 2. Employee 1: Budi Santoso
  const budi = await prisma.user.upsert({
    where: { email: 'budi.santoso@company.com' },
    update: {
      password: passwordHash,
      role: 'EMPLOYEE',
    },
    create: {
      email: 'budi.santoso@company.com',
      password: passwordHash,
      name: 'Budi Santoso',
      phone: '081398765432',
      position: 'Senior Backend Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      role: 'EMPLOYEE',
    },
  });
  console.log(`✅ Employee created: ${budi.email}`);

  // 3. Employee 2: Siti Aminah
  const siti = await prisma.user.upsert({
    where: { email: 'siti.aminah@company.com' },
    update: {
      password: passwordHash,
      role: 'EMPLOYEE',
    },
    create: {
      email: 'siti.aminah@company.com',
      password: passwordHash,
      name: 'Siti Aminah',
      phone: '082155443322',
      position: 'Frontend UI/UX Specialist',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      role: 'EMPLOYEE',
    },
  });
  console.log(`✅ Employee created: ${siti.email}`);

  // 4. Employee 3: Andi Wijaya
  const andi = await prisma.user.upsert({
    where: { email: 'andi.wijaya@company.com' },
    update: {
      password: passwordHash,
      role: 'EMPLOYEE',
    },
    create: {
      email: 'andi.wijaya@company.com',
      password: passwordHash,
      name: 'Andi Wijaya',
      phone: '081299887766',
      position: 'DevOps & Cloud Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      role: 'EMPLOYEE',
    },
  });
  console.log(`✅ Employee created: ${andi.email}`);

  // 5. Seed sample attendance history for this month
  const pastDates = [
    { date: '2026-10-01', in: '08:12:00', out: '17:05:00' },
    { date: '2026-10-02', in: '08:25:00', out: '17:15:00' },
    { date: '2026-10-05', in: '08:05:00', out: '17:30:00' },
    { date: '2026-10-06', in: '08:40:00', out: '17:10:00' },
    { date: '2026-10-07', in: '08:15:00', out: '17:00:00' },
    { date: '2026-10-08', in: '08:30:00', out: '17:20:00' },
    { date: '2026-10-09', in: '08:20:00', out: '17:08:00' },
  ];

  for (const item of pastDates) {
    const inDate = new Date(`${item.date}T${item.in}Z`);
    const outDate = new Date(`${item.date}T${item.out}Z`);

    // Attendance for Budi
    await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: budi.id,
          date: item.date,
        },
      },
      update: {},
      create: {
        userId: budi.id,
        date: item.date,
        inTime: inDate,
        outTime: outDate,
        status: 'OUT',
      },
    });

    // Attendance for Siti
    await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: siti.id,
          date: item.date,
        },
      },
      update: {},
      create: {
        userId: siti.id,
        date: item.date,
        inTime: inDate,
        outTime: outDate,
        status: 'OUT',
      },
    });
  }

  console.log('✅ Past attendance history seeded successfully!');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
