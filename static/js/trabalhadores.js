// /static/js/trabalhadores.js

// --- PASSO 1: A ESTRUTURA DOS DADOS MUDA ---
// Agora, em vez de 'status', temos os dados brutos que viriam dos sensores.
const workersData = [
    { id: 1, serial: 'SV-1001', name: 'Cleber Xavier', imageUrl: 'https://i.pravatar.cc/150?img=1', heartRate: 78, oxygen: 99 },
    { id: 2, serial: 'SV-1002', name: 'Marina Silva',  imageUrl: 'https://i.pravatar.cc/150?img=5', heartRate: 95, oxygen: 98 },
    { id: 3, serial: 'SV-1003', name: 'Lucas Alves',   imageUrl: 'https://i.pravatar.cc/150?img=3', heartRate: 125, oxygen: 96 }, // Frequência um pouco alta -> Alerta
    { id: 4, serial: 'SV-1004', name: 'Fernanda Dias', imageUrl: 'https://i.pravatar.cc/150?img=4', heartRate: 165, oxygen: 91 }, // Frequência muito alta -> Emergência
    { id: 5, serial: 'SV-1005', name: 'Patrícia Souza',imageUrl: 'https://i.pravatar.cc/150?img=8', heartRate: 82, oxygen: 94 }, // Oxigênio um pouco baixo -> Alerta
    { id: 6, serial: 'SV-1006', name: 'Bruno Araújo',  imageUrl: 'https://i.pravatar.cc/150?img=6', heartRate: 65, oxygen: 88 }, // Oxigênio muito baixo -> Emergência
];

// --- PASSO 2: A "INTELIGÊNCIA" - A FUNÇÃO DE REGRAS ---
// Esta função recebe os dados de um trabalhador e retorna o status calculado.
function calcularStatus(worker) {
    // Regras de Emergência (têm prioridade máxima)
    if (worker.heartRate > 160 || worker.heartRate < 50 || worker.oxygen < 90) {
        return 'Emergência';
    }
    // Regras de Alerta
    if (worker.heartRate > 120 || worker.heartRate < 60 || worker.oxygen < 95) {
        return 'Alerta';
    }
    // Se nenhuma das condições acima for atendida, o status é Seguro.
    return 'Seguro';
}


// --- PASSO 3: A RENDERIZAÇÃO USA A INTELIGÊNCIA ---
// Esta função não muda muito, apenas como ela OBTÉM o status.
function renderWorkers(workersToRender) {
    const container = document.querySelector('#worker-list-container');
    if (!container) return;

    container.innerHTML = '';
    
    if (workersToRender.length === 0) {
        container.innerHTML = `<div class="alert alert-secondary mt-2 text-center">Nenhum trabalhador encontrado.</div>`;
        return;
    }

    workersToRender.forEach(worker => {
        // AQUI ESTÁ A MUDANÇA: Calculamos o status em vez de apenas lê-lo.
        const statusAtual = calcularStatus(worker);

        let statusClass = '';
        if (statusAtual === 'Seguro') statusClass = 'status-seguro';
        if (statusAtual === 'Alerta') statusClass = 'status-alerta';
        if (statusAtual === 'Emergência') statusClass = 'status-emergencia';

        const card = document.createElement('div');
        card.className = 'worker-card';
        card.dataset.workerId = worker.id;

        card.innerHTML = `
            <div class="status-dot ${statusClass}" title="Status: ${statusAtual}"></div>
            <img src="${worker.imageUrl}" alt="Avatar de ${worker.name}" class="worker-card-avatar">
            <div class="worker-card-name">${worker.name}</div>
            <div class="worker-card-serial">${worker.serial}</div>
        `;

        card.addEventListener('click', () => {
            window.location.href = `/detalhes.html?id=${worker.id}`;
        });

        container.appendChild(card);
    });
}

// --- PASSO 4: PREPARANDO PARA O FUTURO ---
// A estrutura para carregar os dados do servidor.
document.addEventListener('DOMContentLoaded', () => {
    // QUANDO O BACKEND ESTIVER PRONTO, VOCÊ VAI DESCOMENTAR O CÓDIGO ABAIXO
    /*
    fetch('/api/trabalhadores') // Endereço da sua API Django
        .then(response => response.json())
        .then(dadosDoServidor => {
            renderWorkers(dadosDoServidor); // Usa os dados reais
        })
        .catch(error => console.error('Falha ao buscar dados:', error));
    */

    // POR ENQUANTO, continuamos usando nossos dados "fake"
    renderWorkers(workersData);
});