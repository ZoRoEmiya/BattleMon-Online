const { createBattleState, playTurn } = require("./battleEngine");

const player1 = {
  id: 1,
  name: "Player 1",
  currentHp: 60,
  modifiers: { atk: 1, def: 1, spd: 1 },
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
  modifiers: { atk: 1, def: 1, spd: 1 },
  creature: {
    name: "Thornon",
    type: "Grass",
    hp: 95,
    atk: 70,
    def: 100,
    spd: 40
  }
};

const flameBurst = {
  name: "Flame Burst",
  type: "Fire",
  power: 70,
  accuracy: 95
};

const vineLash = {
  name: "Vine Lash",
  type: "Grass",
  power: 70,
  accuracy: 100
};

let battle = createBattleState(player1, player2);

battle = playTurn(battle, flameBurst, vineLash);
console.log(JSON.stringify(battle, null, 2));

if (battle.status !== "finished") {
  battle = playTurn(battle, flameBurst, vineLash);
  console.log(JSON.stringify(battle, null, 2));
}