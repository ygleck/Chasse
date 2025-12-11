import { prisma } from './prisma';

async function main() {
  console.log('🌱 Peuplement de la base de données...');

  // Créer des uploads approuvés
  const upload1 = await prisma.userUpload.create({
    data: {
      type: 'record',
      title: 'Magnifique Orignal 300+ points',
      description: 'Trophée impressionnant de 2024',
      uploaderName: 'Jean-Pierre Dupont',
      uploaderEmail: 'jp@example.com',
      species: 'Orignal',
      weight: 450,
      points: 305,
      region: 'Laurentides',
      weaponType: 'Carabine',
      caliber: '30-06',
      status: 'approved',
      photos: {
        create: [
          {
            path: '/uploads/sample1.webp',
            thumbnailPath: '/uploads/sample1-thumb.webp',
          },
          {
            path: '/uploads/sample2.webp',
            thumbnailPath: '/uploads/sample2-thumb.webp',
          },
        ],
      },
    },
  });

  const upload2 = await prisma.userUpload.create({
    data: {
      type: 'souvenir',
      title: 'Journée mémorable au camp',
      description: 'Beau temps et bonne ambiance',
      uploaderName: 'Marie Gagnon',
      uploaderEmail: 'marie@example.com',
      category: 'Camp',
      status: 'approved',
      photos: {
        create: [
          {
            path: '/uploads/camp1.webp',
            thumbnailPath: '/uploads/camp1-thumb.webp',
          },
        ],
      },
    },
  });

  const upload3 = await prisma.userUpload.create({
    data: {
      type: 'record',
      title: 'Chevreuil exceptionnel',
      description: 'Belle chasse automnale',
      uploaderName: 'Lucas Mercier',
      uploaderEmail: 'lucas@example.com',
      species: 'Chevreuil',
      weight: 85,
      points: 125,
      region: 'Abitibi',
      weaponType: 'Arc',
      status: 'pending',
      photos: {
        create: [
          {
            path: '/uploads/deer1.webp',
            thumbnailPath: '/uploads/deer1-thumb.webp',
          },
        ],
      },
    },
  });

  console.log('✅ Base de données peuplée!');
  console.log('📊 Uploads créés:');
  console.log(`  - ${upload1.title} (approuvé)`);
  console.log(`  - ${upload2.title} (approuvé)`);
  console.log(`  - ${upload3.title} (en attente)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
