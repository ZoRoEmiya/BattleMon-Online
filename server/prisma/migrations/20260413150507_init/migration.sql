-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Creature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hp" INTEGER NOT NULL,
    "atk" INTEGER NOT NULL,
    "def" INTEGER NOT NULL,
    "spd" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Move" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "power" INTEGER,
    "accuracy" INTEGER NOT NULL,
    "effect" TEXT
);

-- CreateTable
CREATE TABLE "CreatureMove" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "creatureId" INTEGER NOT NULL,
    "moveId" INTEGER NOT NULL,
    CONSTRAINT "CreatureMove_creatureId_fkey" FOREIGN KEY ("creatureId") REFERENCES "Creature" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CreatureMove_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "Move" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Team_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamCreature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamId" INTEGER NOT NULL,
    "creatureId" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "currentHp" INTEGER NOT NULL,
    "atkModifier" REAL NOT NULL DEFAULT 1,
    "defModifier" REAL NOT NULL DEFAULT 1,
    "spdModifier" REAL NOT NULL DEFAULT 1,
    CONSTRAINT "TeamCreature_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamCreature_creatureId_fkey" FOREIGN KEY ("creatureId") REFERENCES "Creature" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "winnerId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Battle_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Battle_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BattleTurn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "battleId" INTEGER NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "actionData" TEXT NOT NULL,
    CONSTRAINT "BattleTurn_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
