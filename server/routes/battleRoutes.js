const express = require("express");
const {
  createBattleState,
  playSwitchTurn,
  playTurn
} = require("../battle/battleEngine");

const router = express.Router();

function handleTurn(req, res) {
  const { battleState, player1, player2, move1, move2, player1Action } = req.body;

  if (!move2 || (player1Action !== "switch" && !move1)) {
    return res.status(400).json({
      error: "Missing move data"
    });
  }

  let battle = battleState;

  if (!battle) {
    if (!player1 || !player2) {
      return res.status(400).json({
        error: "Missing player data"
      });
    }

    battle = createBattleState(player1, player2);
  }

  if (player1Action === "switch") {
    battle.player2 = player2;
    battle = playSwitchTurn(battle, player1, move2);
  } else {
    battle = playTurn(battle, move1, move2);
  }

  return res.json(battle);
}

router.post("/turn", handleTurn);
router.post("/test-turn", handleTurn);

module.exports = router;
