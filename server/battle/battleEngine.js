const { resolveTurn } = require("./turnResolver");

function createBattleState(player1, player2) {
  return {
    turnNumber: 1,
    status: "active",
    winner: null,
    player1,
    player2,
    logs: []
  };
}

function isPlayerDefeated(player) {
  return player.currentHp <= 0;
}

function checkWinner(battleState) {
  if (isPlayerDefeated(battleState.player1)) {
    battleState.status = "finished";
    battleState.winner = battleState.player2.name;
    return battleState.player2;
  }

  if (isPlayerDefeated(battleState.player2)) {
    battleState.status = "finished";
    battleState.winner = battleState.player1.name;
    return battleState.player1;
  }

  return null;
}

function playTurn(battleState, player1Move, player2Move) {
  if (battleState.status === "finished") {
    return battleState;
  }

  const turnResult = resolveTurn(
    battleState.player1,
    battleState.player2,
    player1Move,
    player2Move
  );

  battleState.player1 = turnResult.player1;
  battleState.player2 = turnResult.player2;

  battleState.logs.push({
    turnNumber: battleState.turnNumber,
    actions: turnResult.logs
  });

  checkWinner(battleState);

  if (battleState.status !== "finished") {
    battleState.turnNumber += 1;
  }

  return battleState;
}

module.exports = {
  createBattleState,
  playTurn,
  checkWinner
};