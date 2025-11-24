// detalhes.js - Página de Detalhes com Atualização em Tempo Real
document.addEventListener("DOMContentLoaded", async () => {
  console.log("[DETALHES] Script carregado");

  const API_BASE = "http://127.0.0.1:8000/api";
  const CONTAINER = document.querySelector("#detalhes-container");
  
  let intervalId = null; // Para controlar o polling
  let vesteIdAtual = null; // Guarda ID da veste para polling

  // ============== AUTENTICAÇÃO ==============
  function getTokens() {
    return {
      access: localStorage.getItem("accessToken"),
      refresh: localStorage.getItem("refreshToken"),
    };
  }

  function logout() {
    if (intervalId) clearInterval(intervalId); // Para o polling
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
      return true;
    } catch (err) {
      console.error("[DETALHES] Erro ao renovar token:", err);
      return false;
    }
  }

  async function fetchWithAuth(url, options = {}, retry = true) {
    const { access } = getTokens();

    if (!access) {
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
        const renovado = await refreshToken();
        if (renovado) return fetchWithAuth(url, options, false);
        logout();
        return null;
      }

      return resp;
    } catch (err) {
      console.error("[DETALHES] Erro na requisição:", err);
      throw err;
    }
  }

  // ============== UTILITÁRIOS ==============
  function getTipoUsuario(usuario) {
    if (usuario.groups && usuario.groups.length > 0) {
      const grupo = typeof usuario.groups[0] === 'string' 
        ? usuario.groups[0].toLowerCase() 
        : (usuario.groups[0]?.name || '').toLowerCase();
      
      if (grupo === "administrador") return "administrador";
      if (grupo === "supervisor") return "supervisor";
      if (grupo === "operador") return "operador";
    }
    
    if (usuario.funcao) {
      const funcao = usuario.funcao.toLowerCase();
      if (funcao.includes("administrador")) return "administrador";
      if (funcao.includes("supervisor")) return "supervisor";
      if (funcao.includes("operador")) return "operador";
    }
    
    return "desconhecido";
  }

  function calcularStatus(batimento) {
    if (!batimento || batimento === 0) {
      return { texto: "Offline", classe: "secondary", icone: "bi-wifi-off" };
    }
    if (batimento > 160 || batimento < 50) {
      return { texto: "Emergência", classe: "danger", icone: "bi-exclamation-triangle-fill" };
    }
    if (batimento > 120 || batimento < 60) {
      return { texto: "Alerta", classe: "warning", icone: "bi-exclamation-circle-fill" };
    }
    return { texto: "Seguro", classe: "success", icone: "bi-check-circle-fill" };
  }

  // ============== FUNÇÕES SEGURAS PARA NÚMEROS ==============
  function safeNumber(value, defaultValue = null) {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }

  function safeToFixed(value, decimals = 1, defaultValue = '--') {
    const num = safeNumber(value);
    return num !== null ? num.toFixed(decimals) : defaultValue;
  }

  function formatBateria(value) {
    const num = safeNumber(value);
    if (num === null) return '--';
    return `${num.toFixed(1)}%`;
  }

  // ============== BUSCAR ÚLTIMA LEITURA ==============
  async function buscarUltimaLeitura(vesteId) {
    try {
      const resp = await fetchWithAuth(`${API_BASE}/leiturasensor/?veste=${vesteId}&ordering=-timestamp`);
      if (!resp || !resp.ok) return null;

      const data = await resp.json();
      const leituras = Array.isArray(data) ? data : (data.results || []);
      
      // Garantir que os campos numéricos sejam números
      if (leituras.length > 0) {
        const leitura = leituras[0];
        return {
          ...leitura,
          batimento: safeNumber(leitura.batimento),
          temperatura_A: safeNumber(leitura.temperatura_A),
          temperatura_C: safeNumber(leitura.temperatura_C),
          nivel_co: safeNumber(leitura.nivel_co),
          nivel_bateria: safeNumber(leitura.nivel_bateria)
        };
      }
      
      return null;
    } catch (err) {
      console.error("[DETALHES] Erro ao buscar leitura:", err);
      return null;
    }
  }

  // ============== ATUALIZAR DADOS EM TEMPO REAL ==============
  async function atualizarDadosSensor(vesteId) {
    const ultimaLeitura = await buscarUltimaLeitura(vesteId);
    
    if (!ultimaLeitura) {
      console.log("[DETALHES] Nenhuma leitura disponível");
      return;
    }

    console.log("[DETALHES] Leitura atualizada:", ultimaLeitura);

    // Atualiza batimento
    const batimentoEl = document.getElementById("sensor-batimento");
    if (batimentoEl) {
      const batimentoNovo = ultimaLeitura.batimento !== null ? ultimaLeitura.batimento : '--';
      if (batimentoEl.textContent !== batimentoNovo.toString()) {
        batimentoEl.textContent = batimentoNovo;
        batimentoEl.classList.add('atualizado');
        setTimeout(() => batimentoEl.classList.remove('atualizado'), 500);
      }
    }

    // Atualiza temperatura
    const temperaturaEl = document.getElementById("sensor-temperatura");
    if (temperaturaEl) {
      const tempNova = ultimaLeitura.temperatura_A !== null ? ultimaLeitura.temperatura_A : 
                      ultimaLeitura.temperatura_C !== null ? ultimaLeitura.temperatura_C : '--';
      if (temperaturaEl.textContent !== tempNova.toString()) {
        temperaturaEl.textContent = tempNova;
        temperaturaEl.classList.add('atualizado');
        setTimeout(() => temperaturaEl.classList.remove('atualizado'), 500);
      }
    }

    // Atualiza CO
    const coEl = document.getElementById("sensor-co");
    if (coEl) {
      const coNovo = ultimaLeitura.nivel_co !== null ? ultimaLeitura.nivel_co : '--';
      if (coEl.textContent !== coNovo.toString()) {
        coEl.textContent = coNovo;
        coEl.classList.add('atualizado');
        setTimeout(() => coEl.classList.remove('atualizado'), 500);
      }
    }

    // Atualiza bateria
    const bateriaEl = document.getElementById("sensor-bateria");
    if (bateriaEl) {
      const bateriaNova = formatBateria(ultimaLeitura.nivel_bateria);
      if (bateriaEl.textContent !== bateriaNova) {
        bateriaEl.textContent = bateriaNova;
        bateriaEl.classList.add('atualizado');
        setTimeout(() => bateriaEl.classList.remove('atualizado'), 500);
      }
    }

    // Atualiza status
    const statusEl = document.getElementById("status-badge");
    if (statusEl) {
      const status = calcularStatus(ultimaLeitura.batimento);
      statusEl.className = `badge bg-${status.classe} fs-6`;
      statusEl.innerHTML = `<i class="bi ${status.icone} me-1"></i>${status.texto}`;
    }

    // Atualiza timestamp
    const timestampEl = document.getElementById("ultima-atualizacao");
    if (timestampEl && ultimaLeitura.timestamp) {
      timestampEl.textContent = new Date(ultimaLeitura.timestamp).toLocaleString('pt-BR');
    }
  }

  // ============== RENDERIZAÇÃO ==============
  function renderCabecalho(usuario, tipo) {
    const corPorTipo = {
      administrador: "danger",
      supervisor: "warning",
      operador: "primary",
    };

    const cor = corPorTipo[tipo] || "secondary";

    return `
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-auto text-center">
              <div class="rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 100px; height: 100px;">
                <i class="bi bi-person" style="font-size: 3rem;"></i>
              </div>
            </div>
            <div class="col">
              <h2 class="mb-1">${usuario.nome || usuario.username || 'Usuário'}</h2>
              <p class="text-muted mb-2">
                <i class="bi bi-envelope me-2"></i>${usuario.email || "Email não cadastrado"}
              </p>
              <p class="mb-2">
                <i class="bi bi-briefcase me-2"></i>${usuario.funcao || "Função não especificada"}
              </p>
              <span class="badge bg-${cor} fs-6">
                ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderEstatisticasAdmin() {
    return `
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-danger text-white">
          <h5 class="mb-0"><i class="bi bi-graph-up me-2"></i>Estatísticas de Gestão</h5>
        </div>
        <div class="card-body">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            Administradores não podem ser associados a SafeVests.
          </div>
        </div>
      </div>
    `;
  }

  function renderEstatisticasSupervisor() {
    return `
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-warning text-dark">
          <h5 class="mb-0"><i class="bi bi-eye me-2"></i>Estatísticas de Supervisão</h5>
        </div>
        <div class="card-body">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            Supervisores não são associados a SafeVests.
          </div>
        </div>
      </div>
    `;
  }

  async function renderDadosOperador(usuario) {
    // Buscar veste associada
    let vesteData = null;
    let ultimaLeitura = null;

    try {
      const respVestes = await fetchWithAuth(`${API_BASE}/veste/`);
      if (respVestes && respVestes.ok) {
        const vestes = await respVestes.json();
        const vestesArray = Array.isArray(vestes) ? vestes : (vestes.results || []);
        
        // Busca veste associada ao usuário atual
        vesteData = vestesArray.find(v => {
          if (!v.profile) return false;
          
          // Formato 1: profile é um ID direto
          if (typeof v.profile === 'number') {
            return v.profile === usuario.id;
          }
          
          // Formato 2: profile.user é um ID
          if (typeof v.profile.user === 'number') {
            return v.profile.user === usuario.id;
          }
          
          // Formato 3: profile.user é um objeto com id
          if (v.profile.user?.id) {
            return v.profile.user.id === usuario.id;
          }
          
          return false;
        });
        
        console.log("[DETALHES] Vestes encontradas:", vestesArray.length);
        console.log("[DETALHES] Veste do operador:", vesteData);
      }
    } catch (err) {
      console.error("[DETALHES] Erro ao buscar veste:", err);
    }

    // Se tem veste, buscar última leitura
    if (vesteData) {
      vesteIdAtual = vesteData.id; // Guarda para o polling
      ultimaLeitura = await buscarUltimaLeitura(vesteData.id);
    }

    const status = ultimaLeitura ? calcularStatus(ultimaLeitura.batimento) : { texto: "Sem Dados", classe: "secondary", icone: "bi-wifi-off" };

    return `
      <style>
        .atualizado {
          animation: pulse 0.5s ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); color: #dc3545; }
        }
        .sensor-card {
          transition: all 0.3s ease;
        }
        .sensor-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
      </style>
      
      <!-- Status da Veste -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">
            <i class="bi bi-shield-check me-2"></i>
            SafeVest Associada
            ${vesteData ? '<span class="badge bg-light text-dark ms-2"><i class="bi bi-broadcast me-1"></i>Ao Vivo</span>' : ''}
          </h5>
        </div>
        <div class="card-body">
          ${vesteData ? `
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="mb-1">Número de Série: <strong>${vesteData.numero_de_serie || 'N/A'}</strong></h5>
                <p class="text-muted mb-0">ID da Veste: ${vesteData.id}</p>
              </div>
              <div>
                <span id="status-badge" class="badge bg-${status.classe} fs-6">
                  <i class="bi ${status.icone} me-1"></i>
                  ${status.texto}
                </span>
              </div>
            </div>
          ` : `
            <div class="alert alert-warning">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Este operador ainda não possui uma SafeVest associada.
            </div>
          `}
        </div>
      </div>

      <!-- Dados dos Sensores -->
      ${vesteData && ultimaLeitura ? `
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-activity me-2"></i>
              Dados dos Sensores em Tempo Real
            </h5>
            <span class="badge bg-light text-dark">
              <i class="bi bi-arrow-clockwise me-1"></i>
              Atualiza a cada 5s
            </span>
          </div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-md-3 mb-3">
                <div class="card border-danger sensor-card">
                  <div class="card-body">
                    <i class="bi bi-heart-pulse-fill text-danger fs-1"></i>
                    <h3 id="sensor-batimento" class="mt-2 mb-0">${ultimaLeitura.batimento !== null ? ultimaLeitura.batimento : '--'}</h3>
                    <p class="text-muted">BPM</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card border-info sensor-card">
                  <div class="card-body">
                    <i class="bi bi-thermometer-half text-info fs-1"></i>
                    <h3 id="sensor-temperatura" class="mt-2 mb-0">${ultimaLeitura.temperatura_A !== null ? ultimaLeitura.temperatura_A : 
                      ultimaLeitura.temperatura_C !== null ? ultimaLeitura.temperatura_C : '--'}</h3>
                    <p class="text-muted">°C</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card border-warning sensor-card">
                  <div class="card-body">
                    <i class="bi bi-wind text-warning fs-1"></i>
                    <h3 id="sensor-co" class="mt-2 mb-0">${ultimaLeitura.nivel_co !== null ? ultimaLeitura.nivel_co : '--'}</h3>
                    <p class="text-muted">CO ppm</p>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card border-success sensor-card">
                  <div class="card-body">
                    <i class="bi bi-battery-charging text-success fs-1"></i>
                    <h3 id="sensor-bateria" class="mt-2 mb-0">${formatBateria(ultimaLeitura.nivel_bateria)}</h3>
                    <p class="text-muted">Bateria</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-muted text-center">
              <small>
                <i class="bi bi-clock me-1"></i>
                Última atualização: <span id="ultima-atualizacao">${ultimaLeitura.timestamp ? new Date(ultimaLeitura.timestamp).toLocaleString('pt-BR') : 'N/A'}</span>
              </small>
            </div>
          </div>
        </div>
      ` : vesteData ? `
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          Aguardando primeira leitura dos sensores...
          <div class="spinner-border spinner-border-sm ms-2" role="status"></div>
        </div>
      ` : ''}
    `;
  }

  // ============== CARREGAMENTO PRINCIPAL ==============
  async function carregarDetalhes() {
    try {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("id");

      if (!userId) {
        throw new Error("ID do usuário não fornecido na URL");
      }

      const respUsuario = await fetchWithAuth(`${API_BASE}/usuarios/${userId}/`);
      if (!respUsuario || !respUsuario.ok) {
        throw new Error("Usuário não encontrado");
      }

      const usuario = await respUsuario.json();
      const tipo = getTipoUsuario(usuario);

      let html = renderCabecalho(usuario, tipo);

      if (tipo === "administrador") {
        html += renderEstatisticasAdmin();
      } else if (tipo === "supervisor") {
        html += renderEstatisticasSupervisor();
      } else if (tipo === "operador") {
        html += await renderDadosOperador(usuario);
        
        // Inicia polling se houver veste associada
        if (vesteIdAtual) {
          console.log("[DETALHES] Iniciando polling a cada 5 segundos...");
          intervalId = setInterval(() => {
            atualizarDadosSensor(vesteIdAtual);
          }, 5000);
        }
      }

      CONTAINER.innerHTML = html;

    } catch (error) {
      console.error("[DETALHES] Erro ao carregar:", error);
      CONTAINER.innerHTML = `
        <div class="alert alert-danger">
          <h4><i class="bi bi-exclamation-triangle me-2"></i>Erro ao Carregar Dados</h4>
          <p>${error.message}</p>
          <a href="/templates/index.html" class="btn btn-danger mt-2">Voltar ao Dashboard</a>
        </div>
      `;
    }
  }

  // Limpa interval ao sair da página
  window.addEventListener('beforeunload', () => {
    if (intervalId) clearInterval(intervalId);
  });

  await carregarDetalhes();
});