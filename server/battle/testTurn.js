const { resolveTurn } = require("./turnResolver");

const player1 = {
  id: 1,
  name: "Player 1",
  currentHp: 60,
  creature: {
    name: "Burnix",
    type: "Fire",
    hp: 60,
    atk: 85,
    def: 50,
    spd: 110
  }
};

const player2 = {
  id: 2,
  name: "Player 2",
  currentHp: 95,
  creature: {
    name: "Thornon",
    type: "Grass",
    hp: 95,
    atk: 70,
    def: 100,
    spd: 40
  }
};

const move1 = {
  name: "Flame Burst",
  type: "Fire",
  power: 70,
  accuracy: 95
};

const move2 = {
  name: "Vine Lash",
  type: "Grass",
  power: 70,
  accuracy: 100
};

const result = resolveTurn(player1, player2, move1, move2);

console.log(JSON.stringify(result, null, 2));