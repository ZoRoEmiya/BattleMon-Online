import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export async function playTurn({ battleState, player1, player2, move1, move2 }) {
  const response = await axios.post(`${API_BASE_URL}/battle/turn`, {
    battleState,
    player1,
    player2,
    move1,
    move2
  });

  return response.data;
}

export const playTestTurn = playTurn;
