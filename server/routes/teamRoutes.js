const express = require("express");
const prisma = require("../prismaClient");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const TEAM_SIZE = 3;
const SAVED_TEAM_NAME = "Saved Team";

function formatTeam(team) {
  if (!team) {
    return null;
  }

  return {
    id: team.id,
    name: team.name,
    creatures: team.creatures
      .sort((a, b) => a.slot - b.slot)
      .map((teamCreature) => teamCreature.creature)
  };
}

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const team = await prisma.team.findFirst({
      where: {
        userId: req.user.id,
        name: SAVED_TEAM_NAME
      },
      include: {
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
      }
    });

    return res.json({ team: formatTeam(team) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not load team" });
  }
});

router.post("/my", authMiddleware, async (req, res) => {
  const { creatureIds } = req.body;

  if (!Array.isArray(creatureIds) || creatureIds.length !== TEAM_SIZE) {
    return res.status(400).json({ error: "Team must have exactly 3 creatures" });
  }

  const ids = creatureIds.map((id) => Number(id));
  const uniqueIds = new Set(ids);

  if (ids.some((id) => !Number.isInteger(id)) || uniqueIds.size !== TEAM_SIZE) {
    return res.status(400).json({ error: "Team creature IDs are invalid" });
  }

  try {
    const creatures = await prisma.creature.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    if (creatures.length !== TEAM_SIZE) {
      return res.status(400).json({ error: "One or more creatures do not exist" });
    }

    let team = await prisma.team.findFirst({
      where: {
        userId: req.user.id,
        name: SAVED_TEAM_NAME
      }
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          name: SAVED_TEAM_NAME,
          userId: req.user.id
        }
      });
    }

    await prisma.$transaction([
      prisma.teamCreature.deleteMany({
        where: { teamId: team.id }
      }),
      prisma.teamCreature.createMany({
        data: ids.map((creatureId, index) => {
          const creature = creatures.find((item) => item.id === creatureId);

          return {
            teamId: team.id,
            creatureId,
            slot: index + 1,
            currentHp: creature.hp
          };
        })
      })
    ]);

    const savedTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
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
      }
    });

    return res.json({ team: formatTeam(savedTeam) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not save team" });
  }
});

module.exports = router;
