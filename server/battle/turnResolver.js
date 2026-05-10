const { calculateDamage, checkAccuracy } = require("./damage");

function isPriorityMove(move) {
  return move.name === "Quick Hit";
}

function getFirstActor(player1, player2, move1, move2) {
  const move1Priority = isPriorityMove(move1);
  const move2Priority = isPriorityMove(move2);

  if (move1Priority && !move2Priority) {
    return [player1, player2, move1, move2];
  }

  if (!move1Priority && move2Priority) {
    return [player2, player1, move2, move1];
  }

  if (player1.creature.spd >= player2.creature.spd) {
    return [player1, player2, move1, move2];
  }

  return [player2, player1, move2, move1];
}

function applyDamage(target, damage) {
  target.currentHp = Math.max(target.currentHp - damage, 0);
}

function resolveMove(attackerPlayer, defenderPlayer, move) {
  const attacker = attackerPlayer.creature;
  const defender = defenderPlayer.creature;

  const result = {
    attacker: attacker.name,
    defender: defender.name,
    move: move.name,
    hit: false,
    damage: 0,
    remainingHp: defenderPlayer.currentHp,
    fainted: false
  };

  const hit = checkAccuracy(move);

  if (!hit) {
    return result;
  }

  const damage = calculateDamage(attacker, defender, move);

  applyDamage(defenderPlayer, damage);

  result.hit = true;
  result.damage = damage;
  result.remainingHp = defenderPlayer.currentHp;
  result.fainted = defenderPlayer.currentHp <= 0;

  return result;
}

function resolveTurn(player1, player2, move1, move2) {
  const logs = [];

  const [firstPlayer, secondPlayer, firstMove, secondMove] =
    getFirstActor(player1, player2, move1, move2);

  const firstResult = resolveMove(firstPlayer, secondPlayer, firstMove);
  logs.push(firstResult);

  if (secondPlayer.currentHp <= 0) {
    return {
      logs,
      player1,
      player2,
      turnEnded: true
    };
  }

  const secondResult = resolveMove(secondPlayer, firstPlayer, secondMove);
  logs.push(secondResult);

  return {
    logs,
    player1,
    player2,
    turnEnded: true
  };
}

module.exports = {
  resolveTurn,
  getFirstActor,
  resolveMove
};