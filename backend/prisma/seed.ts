import { PrismaClient } from 'generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  const games = [
    {
      name: 'Gameroom',
      category: 'Slots',
      slug: 'gameroom',
      image: '/assets/gameroom.png',
      badge: 'New',
      isFeatured: true,
    },
    {
      name: 'Mafia',
      category: 'Casino',
      slug: 'mafia',
      image: '/assets/mafia.png',
      badge: null,
      isFeatured: true,
    },
    {
      name: 'Mrallinone',
      category: 'Casino',
      slug: 'mrallinone',
      image: '/assets/mrallinone.png',
      badge: null,
      isFeatured: true,
    },
    {
      name: 'Cash Frenzy',
      category: 'Casino',
      slug: 'cashfrenzy',
      image: '/assets/cashfrenzy.png',
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
