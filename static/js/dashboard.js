// dashboard.js - Dashboard Administrativo Completo
document.addEventListener("DOMContentLoaded", async () => {
  console.log("[DASHBOARD] Script carregado");

  const API_BASE = "http://127.0.0.1:8000/api";
  const CONTAINER = document.querySelector("#worker-cards-container");
  const TABELAS_CONTAINER = document.querySelector("#recent-activity-container");
  const FEEDBACK = document.querySelector("#dashboard-feedback");

  // ============== AUTENTICAÇÃO ==============
  function getTokens() {
    return {
      access: localStorage.getItem("accessToken"),
      refresh: localStorage.getItem("refreshToken"),
    };
  }

  function logout() {
    console.log("[DASHBOARD] Logout - sessão expirada");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/templates/login.html";
  }

  async function refreshToken() {
    const { refresh } = getTokens();
    if (!refresh) return false;

    try {
      const resp = await fetch(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!resp.ok) return false;

      const data = await resp.json();
      localStorage.setItem("accessToken", data.access);
      console.log("[DASHBOARD] Token renovado");
      return true;
    } catch (err) {
      console.error("[DASHBOARD] Erro ao renovar token:", err);
      return false;
    }
  }

  async function fetchWithAuth(url, options = {}, retry = true) {
    const { access } = getTokens();

    if (!access) {
      console.warn("[DASHBOARD] Sem token");
      logout();
      return null;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
      ...options.headers,
    };

    try {
      const resp = await fetch(url, { ...options, headers });

      if (resp.status === 401 && retry) {
        console.warn("[DASHBOARD] Token expirado, renovando...");
        const renovado = await refreshToken();
        if (renovado) return fetchWithAuth(url, options, false);
        logout();
        return null;
      }

      return resp;
    } catch (err) {
      console.error("[DASHBOARD] Erro na requisição:", err);
      throw err;
    }
  }

  // ============== RENDERIZAÇÃO DE ESTATÍSTICAS ==============
  function renderEstatisticas(stats) {
    CONTAINER.innerHTML = "";

    const cardColaboradores = criarCardEstatistica(
      "Colaboradores Cadastrados",
      stats.totalColaboradores,
      "bi-people-fill",
      "primary",
      "/templates/trabalhadores.html"
    );

    const cardVestes = criarCardEstatistica(
      "SafeVests Cadastradas",
      stats.totalVestes,
      "bi-shield-check",
      "success",
      "/templates/vestes.html"
    );

    const cardVestesSemAssoc = criarCardEstatistica(
      "SafeVests Sem Associação",
      stats.vestesSemAssociacao,
      "bi-shield-exclamation",
      "warning",
      "/templates/vestes.html"
    );

    const cardColabSemVeste = criarCardEstatistica(
      "Colaboradores Sem SafeVest",
      stats.colaboradoresSemVeste,
      "bi-person-x",
      "danger",
      "/templates/trabalhadores.html"
    );

    CONTAINER.appendChild(cardColaboradores);
    CONTAINER.appendChild(cardVestes);
    CONTAINER.appendChild(cardVestesSemAssoc);
    CONTAINER.appendChild(cardColabSemVeste);
  }

  function criarCardEstatistica(titulo, valor, icone, cor, link) {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-3 mb-4";

    col.innerHTML = `
      <a href="${link}" class="text-decoration-none">
        <div class="card border-0 shadow-sm h-100 hover-lift">
          <div class="card-body text-center">
            <div class="mb-3">
              <i class="bi ${icone} fs-1 text-${cor}"></i>
            </div>
            <h3 class="display-4 fw-bold text-${cor} mb-2">${valor}</h3>
            <p class="text-muted mb-0">${titulo}</p>
          </div>
        </div>
      </a>
    `;

    return col;
  }

  // ============== RENDERIZAÇÃO DE ATIVIDADES RECENTES ==============
  function renderAtividadesRecentes(usuarios, vestes) {
    TABELAS_CONTAINER.innerHTML = "";

    // Ordena por ID (mais recentes primeiro) e pega os 5 últimos
    const ultimosUsuarios = usuarios.slice().sort((a, b) => b.id - a.id).slice(0, 5);
    const ultimasVestes = vestes.slice().sort((a, b) => b.id - a.id).slice(0, 5);

    // Coluna da esquerda - Últimos Colaboradores
    const colUsuarios = document.createElement("div");
    colUsuarios.className = "col-md-6 mb-4";
    colUsuarios.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">
            <i class="bi bi-clock-history me-2"></i>
            Últimos Colaboradores
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="list-group list-group-flush">
            ${ultimosUsuarios.map(u => `
              <a href="/templates/detalhes.html?id=${u.id}" class="list-group-item list-group-item-action">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <i class="bi bi-person-circle me-2 text-primary"></i>
                    <strong>${u.nome || u.username}</strong>
                    <br>
                    <small class="text-muted">${u.email || ''}</small>
                  </div>
                  <span class="badge bg-primary">${u.groups?.[0] || 'N/A'}</span>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
        <div class="card-footer text-center">
          <a href="/templates/trabalhadores.html" class="btn btn-sm btn-outline-primary">
            Ver Todos <i class="bi bi-arrow-right ms-1"></i>
          </a>
        </div>
      </div>
    `;

    // Coluna da direita - Últimas Vestes
    const colVestes = document.createElement("div");
    colVestes.className = "col-md-6 mb-4";
    colVestes.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0">
            <i class="bi bi-clock-history me-2"></i>
            Últimas SafeVests
          </h5>
        </div>
        <div class="card-body p-0">
          <div class="list-group list-group-flush">
            ${ultimasVestes.map(v => {
              const associada = v.profile ? 'Associada' : 'Disponível';
              const badgeCor = v.profile ? 'success' : 'warning';
              return `
                <div class="list-group-item">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <i class="bi bi-shield-check me-2 text-success"></i>
                      <strong>${v.numero_de_serie || 'N/A'}</strong>
                      <br>
                      <small class="text-muted">ID: ${v.id}</small>
                    </div>
                    <span class="badge bg-${badgeCor}">${associada}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        <div class="card-footer text-center">
          <a href="/templates/vestes.html" class="btn btn-sm btn-outline-success">
            Ver Todas <i class="bi bi-arrow-right ms-1"></i>
          </a>
        </div>
      </div>
    `;

    TABELAS_CONTAINER.appendChild(colUsuarios);
    TABELAS_CONTAINER.appendChild(colVestes);
  }

  // ============== CÁLCULO DAS ESTATÍSTICAS ==============
  async function calcularEstatisticas() {
    try {
      console.log("[DASHBOARD] Buscando dados para estatísticas...");

      // Busca usuários
      const respUsuarios = await fetchWithAuth(`${API_BASE}/usuarios/`);
      if (!respUsuarios || !respUsuarios.ok) {
        throw new Error("Erro ao buscar usuários");
      }
      const dataUsuarios = await respUsuarios.json();
      const usuarios = dataUsuarios.usuarios || dataUsuarios.results || dataUsuarios;

      // Busca vestes (endpoint do router DRF)
      const respVestes = await fetchWithAuth(`${API_BASE}/veste/`);
      if (!respVestes || !respVestes.ok) {
        throw new Error("Erro ao buscar vestes");
      }
      const dataVestes = await respVestes.json();
      // DRF router geralmente retorna array direto ou dentro de 'results'
      const vestes = Array.isArray(dataVestes) ? dataVestes : (dataVestes.results || []);

      // Calcula estatísticas
      const stats = {
        totalColaboradores: usuarios.length,
        totalVestes: vestes.length,
        // Vestes sem profile associado (profile é quem liga veste ao usuário)
        vestesSemAssociacao: vestes.filter(v => !v.profile).length,
        // Colaboradores sem veste
        colaboradoresSemVeste: usuarios.filter(u => {
          // Verifica se é operador (não admin/supervisor) sem veste
          const isOperador = u.groups?.some(g => g.toLowerCase() === 'operador');
          // Verifica se tem alguma veste com o profile desse usuário
          const temVeste = vestes.some(v => v.profile?.user === u.id);
          return isOperador && !temVeste;
        }).length
      };

      console.log("[DASHBOARD] Estatísticas calculadas:", stats);
      return { stats, usuarios, vestes };

    } catch (error) {
      console.error("[DASHBOARD] Erro ao calcular estatísticas:", error);
      throw error;
    }
  }

  // ============== CARREGAMENTO PRINCIPAL ==============
  async function carregarDashboard() {
    try {
      // Mostra loading
      CONTAINER.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-danger" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
          <p class="text-muted mt-3">Carregando estatísticas...</p>
        </div>
      `;

      const { stats, usuarios, vestes } = await calcularEstatisticas();
      renderEstatisticas(stats);
      renderAtividadesRecentes(usuarios, vestes);

    } catch (error) {
      console.error("[DASHBOARD] Erro ao carregar dashboard:", error);
      FEEDBACK.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Erro ao carregar estatísticas: ${error.message}
        </div>
      `;
    }
  }

  // ============== INICIALIZAÇÃO ==============
  await carregarDashboard();
});