import { getAccessToken, clearTokens } from "./session.js";
import { refreshAccessToken } from "./auth.js";

export async function apiFetch(url, options = {}) {
  let accessToken = getAccessToken();

  if (!options.headers) options.headers = {};
  options.headers["Authorization"] = `Bearer ${accessToken}`;
  options.headers["Content-Type"] = "application/json";

  let response = await fetch(url, options);

  // Se o token expirou, tenta renovar e refazer a requisição
  if (response.status === 401) {
    try {
      const newAccess = await refreshAccessToken();
      options.headers["Authorization"] = `Bearer ${newAccess}`;
      response = await fetch(url, options);
    } catch (err) {
      console.error("Erro ao renovar token:", err);
      clearTokens();
      window.location.href = "/login.html";
    }
  }

  return response;
}