const { resolveTurn } = require("./turnResolver");

const player1 = {
  id: 1,
  name: "Player 1",
  currentHp: 80,
  modifiers: { atk: 1, def: 1, spd: 1 },
  creature: {
    name: "Sawgnite",
    type: "Fire",
    hp: 80,
    atk: 95,
    def: 70,
    spd: 95
  }
};

const player2 = {
  id: 2,
  name: "Player 2",
  currentHp: 100,
  modifiers: { atk: 1, def: 1, spd: 1 },
  creature: {
    name: "Terruinox",
    type: "Earth",
    hp: 100,
    atk: 90,
    def: 110,
    spd: 30
  }
};

const boostMove = {
  name: "Focus Boost",
  type: "Normal",
  power: 0,
  accuracy: 100
};

const attackMove = {
  name: "Rock Slam",
  type: "Earth",
  power: 80,
  accuracy: 90
};

const result = resolveTurn(player1, player2, boostMove, attackMove);

console.log(JSON.stringify(result, null, 2));