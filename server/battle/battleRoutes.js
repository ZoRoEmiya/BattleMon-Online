const express = require("express");
const { createBattleState, playTurn } = require("../battle/battleEngine");

const router = express.Router();

router.post("/test-turn", (req, res) => {
  const { player1, player2, move1, move2 } = req.body;

  if (!player1 || !player2 || !move1 || !move2) {
    return res.status(400).json({
      error: "Missing player or move data"
    });
  }

  let battle = createBattleState(player1, player2);
  battle = playTurn(battle, move1, move2);

  return res.json(battle);
});

module.exports = router;