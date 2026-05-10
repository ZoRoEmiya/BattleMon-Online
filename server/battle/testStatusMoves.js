const { resolveTurn } = require("./turnResolver");

const player1 = {
  id: 1,
  name: "Player 1",
  currentHp: 50,
  modifiers: { atk: 1, def: 1, spd: 1 },
  creature: {
    name: "Originox",
    type: "Normal",
    hp: 75,
    atk: 75,
    def: 75,
    spd: 75
  }
};

const player2 = {
  id: 2,
  name: "Player 2",
  currentHp: 80,
  modifiers: { atk: 1, def: 1, spd: 1 },
  creature: {
    name: "Hydrake",
    type: "Water",
    hp: 80,
    atk: 70,
    def: 75,
    spd: 70
  }
};

const move1 = {
  name: "Recover",
  type: "Normal",
  power: 0,
  accuracy: 100
};

const move2 = {
  name: "Aqua Shot",
  type: "Water",
  power: 65,
  accuracy: 100
};

const result = resolveTurn(player1, player2, move1, move2);

console.log(JSON.stringify(result, null, 2));