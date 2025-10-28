// Gerenciamento de tokens JWT e wrapper fetch que tenta refresh automático.

// Configuração: endpoints (ajuste se necessário)
const AUTH_ENDPOINTS = {
    token_obtain: '/api/token/',
    token_refresh: '/api/token/refresh/'
};

// --- Helpers de armazenamento (localStorage) ---
const TOKEN_KEY = 'safevest_tokens_v1'; // namespace

function saveTokens({ access, refresh }) {
    const obj = { access, refresh };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(obj));
}

function loadTokens() {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
}

// --- Função para fazer login: recebe email e senha, solicita /api/token/ ---
async function loginWithCredentials(email, password) {
    const resp = await fetch(AUTH_ENDPOINTS.token_obtain, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: password }),
        credentials: 'include' // não obrigatório p/ JWT, mas ok deixar
    });

    if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || `Erro ${resp.status}`);
    }
    const data = await resp.json();
    // data deve conter access e refresh
    saveTokens({ access: data.access, refresh: data.refresh });
    return data;
}

// --- Tenta refresh do access usando refresh token; retorna novo access (ou null) ---
async function refreshAccessToken() {
    const tokens = loadTokens();
    if (!tokens || !tokens.refresh) return null;
    try {
        const resp = await fetch(AUTH_ENDPOINTS.token_refresh, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: tokens.refresh }),
        });
        if (!resp.ok) {
            // refresh inválido/expirado
            clearTokens();
            return null;
        }
        const data = await resp.json();
        // normalmente data.access existe; se ROTATE_REFRESH_TOKENS True, pode vir novo refresh também.
        const newAccess = data.access;
        const newRefresh = data.refresh || tokens.refresh;
        saveTokens({ access: newAccess, refresh: newRefresh });
        return newAccess;
    } catch (e) {
        clearTokens();
        return null;
    }
}

// --- Wrapper fetch com Authorization e refresh automatico ---
// options: mesmos de fetch. Retorna Response.
async function fetchWithAuth(url, options = {}, attemptRefresh = true) {
    const opts = Object.assign({}, options);
    opts.headers = opts.headers ? Object.assign({}, opts.headers) : {};

    // colocar default content-type só se houver body e não for FormData
    if (opts.body && !(opts.body instanceof FormData) && !opts.headers['Content-Type'] && !opts.headers['content-type']) {
        opts.headers['Content-Type'] = 'application/json';
    }

    // anexar Bearer token
    const tokens = loadTokens();
    if (tokens && tokens.access) {
        opts.headers['Authorization'] = `Bearer ${tokens.access}`;
    }

    // credentials não estritamente necessário para JWT, mas manter se necessário
    opts.credentials = opts.credentials || 'same-origin';

    let resp = await fetch(url, opts);

    // Se 401 e tentativa de refresh permitida -> tentar refresh e repetir
    if (resp.status === 401 && attemptRefresh) {
        const newAccess = await refreshAccessToken();
        if (newAccess) {
            // retry com novo token, mas impedir loop infinito
            opts.headers['Authorization'] = `Bearer ${newAccess}`;
            resp = await fetch(url, opts);
        }
    }

    return resp;
}

// --- Utilitários para mostrar mensagens simples na UI ---
function showFormAlert(containerSelector, message, type = 'info') {
    const container = document.querySelector(containerSelector);
    if (!container) {
        alert(message);
        return;
    }
    container.className = `alert alert-${type}`;
    container.innerHTML = message;
    container.classList.remove('d-none');
}
function clearFormAlert(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.className = 'alert d-none';
    container.innerHTML = '';
}

// Exportar no window para scripts usarem
window.SafeVestAuth = {
    loginWithCredentials,
    clearTokens,
    loadTokens,
    saveTokens,
    fetchWithAuth,
    showFormAlert,
    clearFormAlert
};
