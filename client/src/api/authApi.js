import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export async function registerUser({ username, password }) {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    username,
    password
  });

  return response.data;
}

export async function loginUser({ username, password }) {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    username,
    password
  });

  return response.data;
}

export async function getCurrentUser(token) {
  const response = await axios.get(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}
