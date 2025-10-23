// app/api/http.js
import axios from "axios";
import { getToken } from "../utils/auth";

export const http = axios.create({
  baseURL: "http://localhost:5058/api",
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
