// /static/js/layout.js

// 1. A "RECEITA" DO MENU: Um único lugar para definir os links
const menuItems = [
    { href: "/index.html", icon: "bi-house", text: "Homepage" },
    { href: "/templates/trabalhadores.html", icon: "bi-people", text: "Trabalhadores" },
    { href: "/templates/configuracoes.html", icon: "bi-gear", text: "Configurações" },
    { href: "/templates/login.html", icon: "bi-box-arrow-left", text: "Logout" },
];

// 2. A FUNÇÃO "CONSTRUTORA"
function buildSidebar() {
    const sidebar = document.querySelector('#sidebar-wrapper');
    if (!sidebar) return; // Se a página não tem sidebar, não faz nada

    const currentPagePath = window.location.pathname;

    // Constrói o cabeçalho
    const headerHTML = `
        <div class="sidebar-heading py-4 fs-4 fw-bold d-flex justify-content-between align-items-center px-3">
            <span>SafeVest</span>
            <a href="#" class="fs-4" id="sidebar-close"><i class="bi bi-x-lg"></i></a>
        </div>
    `;

    // Constrói os links do menu a partir da "receita"
    const linksHTML = menuItems.map(item => {
        // Verifica se o link corresponde à página atual para adicionar a classe 'active'
        const isActive = currentPagePath.endsWith(item.href) ? 'active' : '';
        return `
            <a href="${item.href}" class="list-group-item list-group-item-action p-3 ${isActive}">
                <i class="bi ${item.icon} me-2"></i>${item.text}
            </a>
        `;
    }).join(''); // Junta tudo em uma única string de HTML

    // Insere o HTML construído na sidebar
    sidebar.innerHTML = headerHTML + `<div class="list-group list-group-flush">${linksHTML}</div>`;
}

// 3. RODA TUDO
// Espera a página carregar e então constrói a sidebar
document.addEventListener('DOMContentLoaded', buildSidebar);

// Separação
// Adicione ao final de /static/js/layout.js

function setupMenuToggle() {
    const menuToggle = document.querySelector('#menu-toggle');
    const sidebarClose = document.querySelector('#sidebar-close');
    const wrapper = document.querySelector('#wrapper');

    function toggleMenu(event) {
        if (event) event.preventDefault();
        wrapper.classList.toggle('toggled');
    }

    if (wrapper) {
        if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
        if (sidebarClose) sidebarClose.addEventListener('click', toggleMenu);
    }
}

// /static/js/layout.js

function setupMenuToggle() {
    const menuToggle = document.querySelector('#menu-toggle');
    const sidebarClose = document.querySelector('#sidebar-close');
    const wrapper = document.querySelector('#wrapper');

    function toggleMenu(event) {
        if (event) event.preventDefault();
        wrapper.classList.toggle('toggled');
    }

    if (wrapper) {
        if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
        if (sidebarClose) sidebarClose.addEventListener('click', toggleMenu);
    }

    // Ouvinte para a tecla 'Escape'
    document.addEventListener('keydown', function (event) {
        // Verifica se a tecla pressionada foi 'Escape' e se o menu está aberto
        if (event.key === 'Escape' && wrapper.classList.contains('toggled')) {
            // Fecha o menu removendo a classe (não usamos toggle aqui para não correr o risco de abrir)
            wrapper.classList.remove('toggled');
        }
    });
}

// Modifique a última linha para chamar as duas funções
document.addEventListener('DOMContentLoaded', () => {
    buildSidebar();
    setupMenuToggle();
});