import { uuidv7 } from 'uuidv7';
import Seed from './seed.json';
import { prisma } from 'lib/prisma';
// import { seed } from 'src/app.type';

const SeedDb = async () => {
  try {
    const profile = Seed;
    const processed = profile.profiles.map((profile) => {
      return { ...profile, id: uuidv7() };
    });

    await SeedDatabase(processed);

    console.log('Seeding Successful. Database is seeded.');
  } catch (error) {
    console.log(`The Error Below Occurred: \n${error} \n \nAn error Occurred `);
  }
};

const SeedDatabase = async (seedData: any) => {
  try {
    await prisma.profile.createMany({ data: seedData, skipDuplicates: true });
    // const createMany = await prisma.user.createMany({
    //   data: seedData,
    //   skipDuplicates: true, // Skip records with duplicate unique fields
    // });
    // Returns: { count: 2 }
  } catch (error) {
    console.log('Database could not be reached. Try again later.');
  }
};

SeedDb();
