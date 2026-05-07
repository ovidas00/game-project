import { PrismaClient } from 'generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  const games = [
    {
      name: 'Gameroom',
      category: 'Slots',
      slug: 'gameroom',
      image: '/gameroom.png',
      badge: 'New',
      isFeatured: true,
    },
    {
      name: 'Mafia',
      category: 'Casino',
      slug: 'mafia',
      image: '/mafia.png',
      badge: null,
      isFeatured: true,
    },
  ];

  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {},
      create: game,
    });
  }
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
