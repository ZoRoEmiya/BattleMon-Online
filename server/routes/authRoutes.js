const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");
const { authMiddleware, JWT_SECRET } = require("../middleware/authMiddleware");

const router = express.Router();

function createToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username
  };
}

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const cleanUsername = username?.trim();

  if (!cleanUsername || !password || password.length < 4) {
    return res.status(400).json({
      error: "Username and password are required"
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        passwordHash
      }
    });

    return res.status(201).json({
      user: publicUser(user),
      token: createToken(user)
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Username already exists" });
    }

    console.error(error);
    return res.status(500).json({ error: "Could not register user" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const cleanUsername = username?.trim();

  if (!cleanUsername || !password) {
    return res.status(400).json({
      error: "Username and password are required"
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    return res.json({
      user: publicUser(user),
      token: createToken(user)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not log in" });
  }
});

router.get("/me", authMiddleware, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
