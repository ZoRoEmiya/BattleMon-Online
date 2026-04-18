import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.creatureMove.deleteMany();
  await prisma.teamCreature.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.move.deleteMany();
  await prisma.creature.deleteMany();

  await prisma.move.createMany({
    data: [
      { name: "Flame Burst", type: "Fire", power: 70, accuracy: 95 },
      { name: "Inferno Slash", type: "Fire", power: 85, accuracy: 90 },

      { name: "Aqua Shot", type: "Water", power: 65, accuracy: 100 },
      { name: "Tidal Crash", type: "Water", power: 85, accuracy: 90 },

      { name: "Vine Lash", type: "Grass", power: 70, accuracy: 100 },
      { name: "Thorn Spike", type: "Grass", power: 80, accuracy: 90 },

      { name: "Volt Strike", type: "Electric", power: 75, accuracy: 95 },
      { name: "Thunder Crash", type: "Electric", power: 90, accuracy: 85 },

      { name: "Rock Slam", type: "Earth", power: 80, accuracy: 90 },
      { name: "Quake Smash", type: "Earth", power: 95, accuracy: 85 },

      { name: "Quick Hit", type: "Normal", power: 40, accuracy: 100 },
      { name: "Heavy Strike", type: "Normal", power: 85, accuracy: 90 },
      { name: "Focus Boost", type: "Normal", power: 0, accuracy: 100 },
      { name: "Guard Up", type: "Normal", power: 0, accuracy: 100 },
      { name: "Speed Up", type: "Normal", power: 0, accuracy: 100 },
      { name: "Recover", type: "Normal", power: 0, accuracy: 100 }
    ],
  });

  await prisma.creature.createMany({
    data: [
      { name: "Burnix", type: "Fire", hp: 60, atk: 85, def: 50, spd: 110 },
      { name: "Hydrake", type: "Water", hp: 80, atk: 70, def: 75, spd: 70 },
      { name: "Thornon", type: "Grass", hp: 95, atk: 70, def: 100, spd: 40 },
      { name: "Zapika", type: "Electric", hp: 55, atk: 75, def: 50, spd: 115 },
      { name: "Terruinox", type: "Earth", hp: 100, atk: 90, def: 110, spd: 30 },
      { name: "Originox", type: "Normal", hp: 75, atk: 75, def: 75, spd: 75 },

      { name: "Sawrch", type: "Fire", hp: 50, atk: 65, def: 45, spd: 80 },
      { name: "Sawgnite", type: "Fire", hp: 80, atk: 95, def: 70, spd: 95 },

      { name: "Voltix", type: "Electric", hp: 45, atk: 60, def: 40, spd: 90 },
      { name: "Cleavolt", type: "Electric", hp: 75, atk: 85, def: 65, spd: 110 }
    ],
  });

  const moves = await prisma.move.findMany();
  const creatures = await prisma.creature.findMany();

  const m = (n: string) => moves.find(x => x.name === n)!;
  const c = (n: string) => creatures.find(x => x.name === n)!;

  await prisma.creatureMove.createMany({
    data: [
      { creatureId: c("Burnix").id, moveId: m("Flame Burst").id },
      { creatureId: c("Burnix").id, moveId: m("Quick Hit").id },

      { creatureId: c("Hydrake").id, moveId: m("Aqua Shot").id },
      { creatureId: c("Hydrake").id, moveId: m("Tidal Crash").id },

      { creatureId: c("Thornon").id, moveId: m("Vine Lash").id },
      { creatureId: c("Thornon").id, moveId: m("Thorn Spike").id },

      { creatureId: c("Zapika").id, moveId: m("Volt Strike").id },
      { creatureId: c("Zapika").id, moveId: m("Quick Hit").id },

      { creatureId: c("Terruinox").id, moveId: m("Rock Slam").id },
      { creatureId: c("Terruinox").id, moveId: m("Quake Smash").id },

      { creatureId: c("Originox").id, moveId: m("Quick Hit").id },
      { creatureId: c("Originox").id, moveId: m("Recover").id },

      { creatureId: c("Sawrch").id, moveId: m("Flame Burst").id },
      { creatureId: c("Sawrch").id, moveId: m("Focus Boost").id },

      { creatureId: c("Sawgnite").id, moveId: m("Inferno Slash").id },
      { creatureId: c("Sawgnite").id, moveId: m("Heavy Strike").id },

      { creatureId: c("Voltix").id, moveId: m("Volt Strike").id },
      { creatureId: c("Voltix").id, moveId: m("Speed Up").id },

      { creatureId: c("Cleavolt").id, moveId: m("Thunder Crash").id },
      { creatureId: c("Cleavolt").id, moveId: m("Heavy Strike").id }
    ],
  });

  const user = await prisma.user.create({
    data: {
      username: "ZoRoEmiya",
      passwordHash: "123"
    }
  });

  const team = await prisma.team.create({
    data: {
      name: "ZoRo Team",
      userId: user.id
    }
  });

  await prisma.teamCreature.createMany({
    data: [
      { teamId: team.id, creatureId: c("Burnix").id, slot: 1, currentHp: 60 },
      { teamId: team.id, creatureId: c("Zapika").id, slot: 2, currentHp: 55 },
      { teamId: team.id, creatureId: c("Voltix").id, slot: 3, currentHp: 45 }
    ],
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });