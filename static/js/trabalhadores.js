document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = "http://127.0.0.1:8000/api";
  const TABELA = document.querySelector("#workers-table-body");
  const FEEDBACK = document.querySelector("#feedback-message");
  const SEARCH_INPUT = document.querySelector("#searchInput");

  // =============== 🧠 Funções auxiliares ===================

  // Fetch autenticado usando token JWT
  async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("access_token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const resp = await fetch(url, { ...options, headers });
    return resp;
  }

  // Renderiza tabela de usuários
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

  // Registra eventos dos botões de ação
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

  // Excluir usuário (soft delete)
  async function excluirUsuario(id) {
    try {
      const resp = await fetchWithAuth(`${API_BASE}/usuarios/${id}/`, {
        method: "DELETE",
      });

      if (resp.ok) {
        alert("Usuário excluído com sucesso!");
        await carregarUsuarios();
      } else {
        const err = await resp.json().catch(() => ({}));
        alert("Erro ao excluir: " + (err.erro || "desconhecido"));
      }
    } catch (error) {
      console.error(error);
      alert("Erro de rede: " + error.message);
    }
  }

  // Filtrar usuários por texto (nome/email)
  function filtrarUsuarios(lista, termo) {
    termo = termo.toLowerCase();
    return lista.filter(
      (u) =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
    );
  }

  // ==================== 🚀 Lógica Principal =====================

  let listaUsuarios = [];

  async function carregarUsuarios() {
    try {
      const resp = await fetchWithAuth(`${API_BASE}/usuarios/`);
      if (resp.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "/templates/login.html";
        return;
      }

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

  // Evento de pesquisa
  SEARCH_INPUT.addEventListener("input", () => {
    const termo = SEARCH_INPUT.value.trim();
    const filtrados = filtrarUsuarios(listaUsuarios, termo);
    renderUsuarios(filtrados);
  });

  // Carrega na inicialização
  await carregarUsuarios();
});