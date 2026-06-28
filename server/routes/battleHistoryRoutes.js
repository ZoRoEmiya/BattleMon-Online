const express = require("express");
const prisma = require("../prismaClient");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

function formatBattleHistory(battle) {
  let logs = [];

  try {
    const parsedLogs = JSON.parse(battle.logs);
    logs = Array.isArray(parsedLogs) ? parsedLogs : [];
  } catch {
    logs = [];
  }

  return {
    id: battle.id,
    opponentName: battle.opponentName,
    result: battle.result,
    status: battle.status,
    logs,
    createdAt: battle.createdAt,
    endedAt: battle.endedAt
  };
}

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const battles = await prisma.battleHistory.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({ battles: battles.map(formatBattleHistory) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not load battle history" });
  }
});

router.post("/history", authMiddleware, async (req, res) => {
  const {
    opponentName = "NPC",
    result,
    status,
    logs = [],
    endedAt
  } = req.body;

  if (typeof result !== "string" || typeof status !== "string") {
    return res.status(400).json({ error: "Battle result and status are required" });
  }

  if (!Array.isArray(logs)) {
    return res.status(400).json({ error: "Battle logs must be an array" });
  }

  try {
    const battle = await prisma.battleHistory.create({
      data: {
        userId: req.user.id,
        opponentName,
        result,
        status,
        logs: JSON.stringify(logs),
        endedAt: endedAt ? new Date(endedAt) : new Date()
      }
    });

    return res.status(201).json({ battle: formatBattleHistory(battle) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not save battle history" });
  }
});

module.exports = router;
