/**
 * Retorna o valor do cookie csrftoken (ou "" se não existe).
 */
function getCSRFToken() {
    const name = 'csrftoken=';
    const decoded = decodeURIComponent(document.cookie || '');
    const parts = decoded.split(';');
    for (let p of parts) {
        p = p.trim();
        if (p.startsWith(name)) return p.substring(name.length);
    }
    return '';
}

/**
 * Wrapper para fetch que já inclui headers comuns:
 * - Content-Type (se json)
 * - X-CSRFToken
 * - credentials: 'include'
 *
 * Retorna a Promise do fetch para que o chamador trate respostas.
 *
 * Uso:
 *  fetchWithCSRF('/api/endpoint/', { method: 'POST', body: JSON.stringify(data) })
 */
function fetchWithCSRF(url, options = {}) {
    const opts = Object.assign({}, options);

    opts.credentials = 'include';

    // Headers: preserva/mescla
    opts.headers = opts.headers ? Object.assign({}, opts.headers) : {};

    // Se for body string (JSON) e não especificou content-type, define
    if (opts.body && !(opts.body instanceof FormData)) {
        if (!opts.headers['Content-Type'] && !opts.headers['content-type']) {
            opts.headers['Content-Type'] = 'application/json';
        }
    }

    // CSRF
    const csrf = getCSRFToken();
    if (csrf) {
        opts.headers['X-CSRFToken'] = csrf;
    }

    return fetch(url, opts);
}

/**
 * Mostra um alerta dentro de um container (cria se não existir).
 * type: 'success' | 'danger' | 'warning' | 'info'
 */
function showFormAlert(containerSelector, message, type = 'info') {
    const container = document.querySelector(containerSelector);
    if (!container) {
        // fallback: alert browser
        alert(message);
        return;
    }
    container.className = `alert alert-${type}`;
    container.innerHTML = message;
    container.classList.remove('d-none');
}

/**
 * Limpa o alerta dentro do container
 */
function clearFormAlert(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.className = 'alert d-none';
    container.innerHTML = '';
}

/**
 * Converte erros de resposta (400) vindos do DRF em string amigável
 * Espera que o payload de erro seja um objeto com chaves de campo ou 'detail'.
 */
async function parseErrorResponse(response) {
    let text;
    try {
        const data = await response.json();
        if (data === null) return `Erro ${response.status} ${response.statusText}`;
        // Se houver "detail"
        if (data.detail) return data.detail;
        // Se for dict com arrays
        const parts = [];
        for (const [k, v] of Object.entries(data)) {
            const val = Array.isArray(v) ? v.join(' ') : v;
            parts.push(`${k}: ${val}`);
        }
        text = parts.join(' • ');
        if (!text) text = JSON.stringify(data);
    } catch (e) {
        text = `Erro ${response.status} ${response.statusText}`;
    }
    return text;
}
