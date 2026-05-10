const typeChart = require("./typeChart");

function getTypeMultiplier(moveType, defenderType) {
  if (!typeChart[moveType]) {
    return 1;
  }

  return typeChart[moveType][defenderType] ?? 1;
}

function getRandomMultiplier() {
  return Math.random() * (1 - 0.85) + 0.85;
}

function hasStab(attacker, move) {
  return attacker.type === move.type;
}

function calculateDamage(attacker, defender, move) {
  if (!move.power || move.power <= 0) {
    return 0;
  }

  const level = 50;
  const attack = attacker.atk;
  const defense = defender.def;

  const baseDamage =
    (((2 * level) / 5 + 2) * move.power * (attack / defense)) / 50 + 2;

  const stab = hasStab(attacker, move) ? 1.5 : 1;
  const typeMultiplier = getTypeMultiplier(move.type, defender.type);
  const randomMultiplier = getRandomMultiplier();

  const finalDamage = Math.floor(baseDamage * stab * typeMultiplier * randomMultiplier);

  return Math.max(finalDamage, 1);
}

function checkAccuracy(move) {
  const roll = Math.random() * 100;
  return roll <= move.accuracy;
}

module.exports = {
  calculateDamage,
  checkAccuracy,
  getTypeMultiplier
};