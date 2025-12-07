import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.photo.deleteMany({});
  await prisma.userUpload.deleteMany({});

  console.log('Seeding database...');

  // Create sample memory
  const memory1 = await prisma.userUpload.create({
    data: {
      type: 'souvenir',
      status: 'approved',
      title: 'Belle journée au camp',
      description: 'Une journée mémorable avec les gars au camp en septembre. La température était parfaite et on a eu du beau gibier!',
      uploaderName: 'Jean Chasseur',
      uploaderEmail: null,
      category: 'Camp',
      eventDate: new Date('2024-09-15'),
      participants: 'Jean, Marc, Pierre',
      photos: {
        create: [
          {
            path: '/placeholder.jpg',
            thumbnailPath: '/placeholder.jpg',
          },
        ],
      },
    },
  });

  // Create sample trophy
  const trophy1 = await prisma.userUpload.create({
    data: {
      type: 'record',
      status: 'approved',
      title: 'Magnifique orignal - 2024',
      description: 'Un magnifique orignal pris à la limite de la zone 1. Chasse exceptionnelle après 3 jours de dur travail.',
      uploaderName: 'Marc Trappeur',
      uploaderEmail: null,
      species: 'Orignal',
      huntDate: new Date('2024-09-20'),
      region: 'Mauricie',
      weight: 1050,
      points: 185,
      weaponType: 'Carabine',
      caliber: '7mm Rem Mag, Burris Predator 4',
      photos: {
        create: [
          {
            path: '/placeholder.jpg',
            thumbnailPath: '/placeholder.jpg',
          },
        ],
      },
    },
  });

  // Create pending submission (for admin testing)
  const pending = await prisma.userUpload.create({
    data: {
      type: 'souvenir',
      status: 'pending',
      title: 'Trip au lac en attente',
      description: 'Soumission en test pour voir le workflow de modération',
      uploaderName: 'Pierre Modérateur',
      uploaderEmail: 'pierre@example.com',
      category: 'Trip',
      eventDate: new Date('2024-10-01'),
      photos: {
        create: [
          {
            path: '/placeholder.jpg',
            thumbnailPath: '/placeholder.jpg',
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`Created: ${memory1.title}`);
  console.log(`Created: ${trophy1.title}`);
  console.log(`Created (pending): ${pending.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
