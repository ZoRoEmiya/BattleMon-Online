import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: "./dev.db",
  }),
});

/**
 * Seeds the database with initial data for development and testing.
 * Clears existing data and inserts base creatures, moves, and relations.
 */
async function main() {
  console.log("Seeding database");

  /**
   * Clear existing data to avoid duplicates.
   * Order matters due to foreign key constraints.
   */
  await prisma.battleTurn.deleteMany();
  await prisma.battle.deleteMany();
  await prisma.teamCreature.deleteMany();
  await prisma.team.deleteMany();
  await prisma.creatureMove.deleteMany();
  await prisma.move.deleteMany();
  await prisma.creature.deleteMany();
  await prisma.user.deleteMany();

  /**
   * Create moves.
   */
  const flameSlash = await prisma.move.create({
    data: {
      name: "Flame Slash",
      type: "Fire",
      power: 70,
      accuracy: 100,
    },
  });

  const aquaBlast = await prisma.move.create({
    data: {
      name: "Aqua Blast",
      type: "Water",
      power: 75,
      accuracy: 95,
    },
  });

  const thunderCut = await prisma.move.create({
    data: {
      name: "Thunder Cut",
      type: "Electric",
      power: 65,
      accuracy: 100,
    },
  });

  const leafStrike = await prisma.move.create({
    data: {
      name: "Leaf Strike",
      type: "Grass",
      power: 60,
      accuracy: 100,
    },
  });

  /**
   * Create creatures.
   */
  const burnix = await prisma.creature.create({
    data: {
      name: "Burnix",
      type: "Fire",
      hp: 70,
      atk: 90,
      def: 60,
      spd: 80,
    },
  });

  const hydrake = await prisma.creature.create({
    data: {
      name: "Hydrake",
      type: "Water",
      hp: 80,
      atk: 75,
      def: 70,
      spd: 65,
    },
  });

  const zapika = await prisma.creature.create({
    data: {
      name: "Zapika",
      type: "Electric",
      hp: 60,
      atk: 85,
      def: 50,
      spd: 95,
    },
  });

  const thornon = await prisma.creature.create({
    data: {
      name: "Thornon",
      type: "Grass",
      hp: 75,
      atk: 70,
      def: 80,
      spd: 60,
    },
  });

  /**
   * Link creatures to their moves.
   */
  await prisma.creatureMove.createMany({
    data: [
      { creatureId: burnix.id, moveId: flameSlash.id },
      { creatureId: hydrake.id, moveId: aquaBlast.id },
      { creatureId: zapika.id, moveId: thunderCut.id },
      { creatureId: thornon.id, moveId: leafStrike.id },
    ],
  });

  /**
   * Create a test user.
   */
  const user = await prisma.user.create({
    data: {
      username: "ZoRoEmiya",
      passwordHash: "123",
    },
  });

  /**
   * Create a team for the user.
   */
  const team = await prisma.team.create({
    data: {
      name: "Starter Squad",
      userId: user.id,
    },
  });

  /**
   * Assign creatures to the team.
   */
  await prisma.teamCreature.createMany({
    data: [
      {
        teamId: team.id,
        creatureId: burnix.id,
        slot: 1,
        currentHp: burnix.hp,
      },
      {
        teamId: team.id,
        creatureId: hydrake.id,
        slot: 2,
        currentHp: hydrake.hp,
      },
      {
        teamId: team.id,
        creatureId: zapika.id,
        slot: 3,
        currentHp: zapika.hp,
      },
    ],
  });

  console.log("Seed completed successfully");
}

/**
 * Entry point for the seed script.
 */
main()
  .catch((error) => {
    console.error(error);
    return Promise.reject(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });