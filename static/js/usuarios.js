import { apiFetch } from "./fetch-com-auth.js";

const BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchUserForm");
  const result = document.getElementById("result");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("emailInput").value;

    try {
      const response = await apiFetch(`${BASE_URL}/usuarios/por-email/?email=${email}`);
      if (!response.ok) throw new Error("Erro ao buscar usuário");

      const data = await response.json();
      result.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (err) {
      result.innerHTML = `<p style="color:red">${err.message}</p>`;
    }
  });
});