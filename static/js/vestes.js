// /static/js/vestes.js

let todasAsVestes = []; // Guarda a lista original para não precisar buscar na API toda hora

// Função que desenha a tabela
function renderVestes(listaDeVestes) {
    const tableBody = document.querySelector('#vestes-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = ''; // Limpa a tabela

    if (listaDeVestes.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhuma veste encontrada.</td></tr>';
        return;
    }

    listaDeVestes.forEach(veste => {
        const row = document.createElement('tr');
        
        // Determina o status e as informações a serem exibidas
        const emUso = veste.usuario !== null;
        const statusBadge = emUso 
            ? '<span class="badge text-bg-primary">Em Uso</span>' 
            : '<span class="badge text-bg-success">Disponível</span>';
        
        const nomeUsuario = emUso ? veste.usuario.nome_completo : '<span class="text-muted">N/A</span>';
        const nomeSetor = emUso && veste.usuario.setor ? veste.usuario.setor.nome : '<span class="text-muted">N/A</span>';

        row.innerHTML = `
            <td class="fw-bold">${veste.numero_de_serie}</td>
            <td>${statusBadge}</td>
            <td>${nomeUsuario}</td>
            <td>${nomeSetor}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger btn-icon" title="Excluir ${veste.numero_de_serie}">
                    <i class="bi bi-trash3"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Função que busca os dados da API
function fetchVestes() {
    fetch('http://127.0.0.1:8000/api/veste/')
        .then(response => response.json())
        .then(data => {
            todasAsVestes = data; // Salva a lista completa
            renderVestes(todasAsVestes); // Desenha a tabela com todos os dados
        })
        .catch(error => {
            console.error("Erro ao buscar dados das vestes:", error);
            const tableBody = document.querySelector('#vestes-table-body');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Falha ao carregar dados. Verifique a API.</td></tr>';
            }
        });
}


document.addEventListener('DOMContentLoaded', () => {
    // Busca os dados assim que a página carrega
    fetchVestes();

    // Lógica dos botões de filtro
    const filterButtons = document.querySelectorAll('.btn-group .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a classe 'active' de todos os botões e adiciona ao clicado
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterType = button.dataset.filter;
            let vestesFiltradas = [];

            if (filterType === 'todas') {
                vestesFiltradas = todasAsVestes;
            } else if (filterType === 'em-uso') {
                vestesFiltradas = todasAsVestes.filter(v => v.usuario !== null);
            } else if (filterType === 'disponiveis') {
                vestesFiltradas = todasAsVestes.filter(v => v.usuario === null);
            }
            
            renderVestes(vestesFiltradas);
        });
    });
});