import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function getBattleHistory(token) {
  const response = await axios.get(`${API_BASE_URL}/battles/history`, {
    headers: authHeaders(token)
  });

  return response.data;
}

export async function saveBattleHistory(token, battleResult) {
  const response = await axios.post(
    `${API_BASE_URL}/battles/history`,
    battleResult,
    {
      headers: authHeaders(token)
    }
  );

  return response.data;
}
