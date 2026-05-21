import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function getMyTeams(token) {
  const response = await axios.get(`${API_BASE_URL}/teams/my`, {
    headers: authHeaders(token)
  });

  return response.data;
}

export async function createTeam(token, { name, creatureIds }) {
  const response = await axios.post(
    `${API_BASE_URL}/teams`,
    { name, creatureIds },
    {
      headers: authHeaders(token)
    }
  );

  return response.data;
}

export async function updateTeam(token, teamId, { name, creatureIds }) {
  const response = await axios.put(
    `${API_BASE_URL}/teams/${teamId}`,
    { name, creatureIds },
    {
      headers: authHeaders(token)
    }
  );

  return response.data;
}

export async function deleteTeam(token, teamId) {
  const response = await axios.delete(`${API_BASE_URL}/teams/${teamId}`, {
    headers: authHeaders(token)
  });

  return response.data;
}
