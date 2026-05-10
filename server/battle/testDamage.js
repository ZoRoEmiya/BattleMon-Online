const { calculateDamage, checkAccuracy, getTypeMultiplier } = require("./damage");

const attacker = {
  name: "Burnix",
  type: "Fire",
  hp: 60,
  atk: 85,
  def: 50,
  spd: 110
};

const defender = {
  name: "Thornon",
  type: "Grass",
  hp: 95,
  atk: 70,
  def: 100,
  spd: 40
};

const move = {
  name: "Flame Burst",
  type: "Fire",
  power: 70,
  accuracy: 95
};

console.log("Type multiplier:", getTypeMultiplier(move.type, defender.type));
console.log("Move hit:", checkAccuracy(move));
console.log("Damage:", calculateDamage(attacker, defender, move));
