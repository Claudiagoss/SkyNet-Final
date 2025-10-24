// app/api/authApi.js
import axios from "axios";

const BASE_URL = "http://localhost:5058/api/auth";

export const login = async ({ username, password }) => {
  const { data } = await axios.post(`${BASE_URL}/login`, { username, password });
  // data = { token, usuario, rol }
  return data;
};
