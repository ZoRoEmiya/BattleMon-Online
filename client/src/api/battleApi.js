import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export async function playTestTurn({ player1, player2, move1, move2 }) {
  const response = await axios.post(`${API_BASE_URL}/battle/test-turn`, {
    player1,
    player2,
    move1,
    move2
  });

  return response.data;
}
