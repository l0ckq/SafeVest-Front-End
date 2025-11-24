document.addEventListener("DOMContentLoaded", async () => {
  console.log("[LOG] Script trabalhadores.js carregado");

  const API_BASE = "http://127.0.0.1:8000/api";
  const TABELA = document.querySelector("#workers-table-body");
  const FEEDBACK = document.querySelector("#feedback-message");
  const SEARCH_INPUT = document.querySelector("#searchInput");

  function getTokens() {
    const tokens = {
      access: localStorage.getItem("accessToken"),
      refresh: localStorage.getItem("accessToken"),
    };
    console.log("[LOG] Tokens recuperados:", tokens);
    return tokens;
  }

  function logout() {
    console.log("[LOG] Logout chamado");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accessToken");
    window.location.href = "/templates/login.html";
  }

  async function refreshToken() {
    const { refresh } = getTokens();
    console.log("[LOG] Tentando refresh token:", refresh);
    if (!refresh) return false;

    try {
      const resp = await fetch(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      console.log("[LOG] Resposta refresh token:", resp.status);
      if (!resp.ok) return false;

      const data = await resp.json();
      console.log("[LOG] Novo access token recebido:", data.access);
      localStorage.setItem("accessToken", data.access);
      return true;
    } catch (err) {
      console.error("[LOG] Erro no refresh token:", err);
      return false;
    }
  }

  async function fetchWithAuth(url, options = {}, retry = true) {
    const { access } = getTokens();
    console.log("[LOG] FetchWithAuth chamada para:", url);
    if (!access) {
      console.warn("[LOG] Sem access token, logout");
      logout();
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
      ...options.headers,
    };

    let resp;
    try {
      resp = await fetch(url, { ...options, headers });
      console.log("[LOG] Resposta fetch:", resp.status);
    } catch (err) {
      console.error("[LOG] Erro na fetch:", err);
      throw err;
    }

    if (resp.status === 401 && retry) {
      console.warn("[LOG] 401 recebido, tentando refresh token");
      const ok = await refreshToken();
      if (ok) return fetchWithAuth(url, options, false);

      console.warn("[LOG] Sessão expirada após refresh");
      logout();
      return;
    }

    return resp;
  }

  // =============== Render e Eventos ===================
  function renderUsuarios(usuarios) {
    TABELA.innerHTML = "";

    if (!usuarios || usuarios.length === 0) {
      FEEDBACK.style.display = "block";
      return;
    } else {
      FEEDBACK.style.display = "none";
    }

    usuarios.forEach((u) => {
      const ativoBadge = u.ativo
        ? `<span class="badge bg-success">Ativo</span>`
        : `<span class="badge bg-secondary">Inativo</span>`;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${u.nome}</td>
        <td>${u.funcao}</td>
        <td>${ativoBadge}</td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-outline-danger btn-sm ver-btn" title="Ver detalhes" data-id="${u.id}">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-outline-primary btn-sm editar-btn" title="Editar" data-id="${u.id}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-secondary btn-sm excluir-btn" title="Excluir" data-id="${u.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      `;
      TABELA.appendChild(row);
    });

    registrarEventosAcoes();
  }

  function registrarEventosAcoes() {
    document.querySelectorAll(".ver-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        window.location.href = `/templates/detalhes.html?id=${id}`;
      });
    });

    document.querySelectorAll(".editar-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        window.location.href = `/templates/editar-usuario.html?id=${id}`;
      });
    });

    document.querySelectorAll(".excluir-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm("Tem certeza que deseja excluir este usuário?")) {
          await excluirUsuario(id);
        }
      });
    });
  }

  async function excluirUsuario(id) {
    try {
      const resp = await fetchWithAuth(`${API_BASE}/usuarios/delete/${id}/`, {
        method: "DELETE",
      });
      if (resp && resp.ok) {
        alert("Usuário excluído com sucesso!");
        await carregarUsuarios();
      } else {
        const err = resp ? await resp.json().catch(() => ({})) : {};
        alert("Erro ao excluir: " + (err.erro || "desconhecido"));
      }
    } catch (error) {
      console.error(error);
      alert("Erro de rede: " + error.message);
    }
  }

  function filtrarUsuarios(lista, termo) {
    termo = termo.toLowerCase();
    return lista.filter(
      (u) =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
    );
  }

  // ==================== LÓGICA PRINCIPAL =====================
  let listaUsuarios = [];

  async function carregarUsuarios() {
    try {
      const resp = await fetchWithAuth(`${API_BASE}/usuarios/`);
      if (!resp) return;

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Erro ao buscar usuários: ${txt}`);
      }

      const data = await resp.json();
      listaUsuarios = data.usuarios || [];
      renderUsuarios(listaUsuarios);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      FEEDBACK.textContent = "Erro ao carregar usuários.";
      FEEDBACK.style.display = "block";
    }
  }

  SEARCH_INPUT.addEventListener("input", () => {
    const termo = SEARCH_INPUT.value.trim();
    const filtrados = filtrarUsuarios(listaUsuarios, termo);
    renderUsuarios(filtrados);
  });

  // Carrega na inicialização
  await carregarUsuarios();
});