import { saveTokens, clearTokens, getRefreshToken } from "./session.js";
import { apiFetch } from "./fetch-com-auth.js";

// URL base do teu backend Django
const BASE_URL = "http://127.0.0.1:8000/api";

export async function login(username, password) {
  const response = await fetch(`${BASE_URL}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Login inválido. Verifique usuário e senha.");
  }

  const data = await response.json();
  saveTokens(data.access, data.refresh);
  return data;
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("Nenhum refresh token disponível.");

  const response = await fetch(`${BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) throw new Error("Falha ao renovar token.");

  const data = await response.json();
  localStorage.setItem("accessToken", data.access);
  return data.access;
}

export function logout() {
  clearTokens();
  window.location.href = "/login.html"; // redireciona pra página de login
}
