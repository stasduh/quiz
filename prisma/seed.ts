import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Учётка админа для входа в панель управления вопросами.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@felix-quiz.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'change-me-please';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash },
  });
  console.log(`Admin ready: ${adminEmail} / ${adminPassword} (смени пароль после первого входа!)`);

  // Раунд 1
  const round1 = await prisma.round.upsert({
    where: { roundNumber: 1 },
    update: {},
    create: { roundNumber: 1, isPublished: true },
  });

  await prisma.question.create({
    data: {
      roundId: round1.id,
      orderIndex: 1,
      textQuestion: 'Столица Австралии?',
      options: {
        create: [
          { orderIndex: 1, text: 'Сидней', isCorrect: false },
          { orderIndex: 2, text: 'Канберра', isCorrect: true },
          { orderIndex: 3, text: 'Мельбурн', isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      roundId: round1.id,
      orderIndex: 2,
      textQuestion: 'Сколько будет 7 x 8?',
      options: {
        create: [
          { orderIndex: 1, text: '54', isCorrect: false },
          { orderIndex: 2, text: '56', isCorrect: true },
          { orderIndex: 3, text: '58', isCorrect: false },
          { orderIndex: 4, text: '64', isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      roundId: round1.id,
      orderIndex: 3,
      textQuestion: 'Земля вращается вокруг Солнца?',
      options: {
        create: [
          { orderIndex: 1, text: 'Да', isCorrect: true },
          { orderIndex: 2, text: 'Нет', isCorrect: false },
        ],
      },
    },
  });

  // Раунд 2
  const round2 = await prisma.round.upsert({
    where: { roundNumber: 2 },
    update: {},
    create: { roundNumber: 2, isPublished: true },
  });

  await prisma.question.create({
    data: {
      roundId: round2.id,
      orderIndex: 1,
      textQuestion: 'Какой газ растения поглощают при фотосинтезе?',
      options: {
        create: [
          { orderIndex: 1, text: 'Кислород', isCorrect: false },
          { orderIndex: 2, text: 'Углекислый газ', isCorrect: true },
          { orderIndex: 3, text: 'Азот', isCorrect: false },
          { orderIndex: 4, text: 'Водород', isCorrect: false },
          { orderIndex: 5, text: 'Гелий', isCorrect: false },
          { orderIndex: 6, text: 'Метан', isCorrect: false },
        ],
      },
    },
  });

  console.log('Seed complete:', { round1: round1.id, round2: round2.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
