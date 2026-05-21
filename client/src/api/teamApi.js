import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function getMyTeam(token) {
  const response = await axios.get(`${API_BASE_URL}/teams/my`, {
    headers: authHeaders(token)
  });

  return response.data;
}

export async function saveMyTeam(token, creatureIds) {
  const response = await axios.post(
    `${API_BASE_URL}/teams/my`,
    { creatureIds },
    {
      headers: authHeaders(token)
    }
  );

  return response.data;
}
