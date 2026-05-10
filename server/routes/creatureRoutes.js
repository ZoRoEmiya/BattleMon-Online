const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

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