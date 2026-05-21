const express = require("express");
const prisma = require("../prismaClient");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const TEAM_SIZE = 3;

const teamInclude = {
  creatures: {
    include: {
      creature: {
        include: {
          moves: {
            include: {
              move: true
            }
          }
        }
      }
    }
  }
};

function formatTeam(team) {
  return {
    id: team.id,
    name: team.name,
    creatures: team.creatures
      .sort((a, b) => a.slot - b.slot)
      .map((teamCreature) => teamCreature.creature)
  };
}

async function validateTeamInput(req, res) {
  const { name, creatureIds } = req.body;
  const cleanName = name?.trim();

  if (!cleanName) {
    res.status(400).json({ error: "Team name is required" });
    return null;
  }

  if (!Array.isArray(creatureIds) || creatureIds.length !== TEAM_SIZE) {
    res.status(400).json({ error: "Team must have exactly 3 creatures" });
    return null;
  }

  const ids = creatureIds.map((id) => Number(id));
  const uniqueIds = new Set(ids);

  if (ids.some((id) => !Number.isInteger(id)) || uniqueIds.size !== TEAM_SIZE) {
    res.status(400).json({ error: "Team creature IDs are invalid" });
    return null;
  }

  const creatures = await prisma.creature.findMany({
    where: {
      id: {
        in: ids
      }
    }
  });

  if (creatures.length !== TEAM_SIZE) {
    res.status(400).json({ error: "One or more creatures do not exist" });
    return null;
  }

  return { name: cleanName, ids, creatures };
}

function teamCreatureData(teamId, ids, creatures) {
  return ids.map((creatureId, index) => {
    const creature = creatures.find((item) => item.id === creatureId);

    return {
      teamId,
      creatureId,
      slot: index + 1,
      currentHp: creature.hp
    };
  });
}

async function getUserTeam(teamId, userId) {
  return prisma.team.findFirst({
    where: {
      id: teamId,
      userId
    },
    include: teamInclude
  });
}

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        userId: req.user.id
      },
      include: teamInclude,
      orderBy: {
        id: "desc"
      }
    });

    return res.json({ teams: teams.map(formatTeam) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not load teams" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const input = await validateTeamInput(req, res);

    if (!input) {
      return;
    }

    const team = await prisma.team.create({
      data: {
        name: input.name,
        userId: req.user.id
      }
    });

    await prisma.teamCreature.createMany({
      data: teamCreatureData(team.id, input.ids, input.creatures)
    });

    const savedTeam = await getUserTeam(team.id, req.user.id);

    return res.status(201).json({ team: formatTeam(savedTeam) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not create team" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const teamId = Number(req.params.id);

  if (!Number.isInteger(teamId)) {
    return res.status(400).json({ error: "Team ID is invalid" });
  }

  try {
    const existingTeam = await prisma.team.findFirst({
      where: {
        id: teamId,
        userId: req.user.id
      }
    });

    if (!existingTeam) {
      return res.status(404).json({ error: "Team not found" });
    }

    const input = await validateTeamInput(req, res);

    if (!input) {
      return;
    }

    await prisma.$transaction([
      prisma.team.update({
        where: { id: teamId },
        data: { name: input.name }
      }),
      prisma.teamCreature.deleteMany({
        where: { teamId }
      }),
      prisma.teamCreature.createMany({
        data: teamCreatureData(teamId, input.ids, input.creatures)
      })
    ]);

    const savedTeam = await getUserTeam(teamId, req.user.id);

    return res.json({ team: formatTeam(savedTeam) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not update team" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const teamId = Number(req.params.id);

  if (!Number.isInteger(teamId)) {
    return res.status(400).json({ error: "Team ID is invalid" });
  }

  try {
    const existingTeam = await prisma.team.findFirst({
      where: {
        id: teamId,
        userId: req.user.id
      }
    });

    if (!existingTeam) {
      return res.status(404).json({ error: "Team not found" });
    }

    await prisma.$transaction([
      prisma.teamCreature.deleteMany({
        where: { teamId }
      }),
      prisma.team.delete({
        where: { id: teamId }
      })
    ]);

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not delete team" });
  }
});

module.exports = router;
