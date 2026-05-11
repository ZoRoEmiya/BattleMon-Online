const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const router = express.Router();

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db"
});

const prisma = new PrismaClient({
  adapter
});

router.get("/", async (req, res) => {
  try {
    const creatures = await prisma.creature.findMany({
      include: {
        moves: {
          include: {
            move: true
          }
        }
      }
    });

    res.json(creatures);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch creatures"
    });
  }
});

module.exports = router;