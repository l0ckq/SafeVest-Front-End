// js/workers.js

// 1. DADOS (iguais aos de antes)
const workersData = [
    { id: 1, serial: 'SV-1001', name: 'Cleber Xavier', status: 'Online',  imageUrl: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, serial: 'SV-1002', name: 'Marina Silva',  status: 'Online',  imageUrl: 'https://i.pravatar.cc/150?img=5' }, // Imagem trocada para variedade
    { id: 3, serial: 'SV-1003', name: 'Lucas Alves',   status: 'Offline', imageUrl: 'https://i.pravatar.cc/150?img=3' },
    { id: 4, serial: 'SV-1004', name: 'Fernanda Dias', status: 'Alerta',  imageUrl: 'https://i.pravatar.cc/150?img=4' },
    { id: 5, serial: 'SV-1005', name: 'Patrícia Souza',status: 'Online',  imageUrl: 'https://i.pravatar.cc/150?img=8' }, // Imagem trocada
    { id: 6, serial: 'SV-1006', name: 'Bruno Araújo',  status: 'Online',  imageUrl: 'https://i.pravatar.cc/150?img=6' },
];

// 2. O CONSTRUTOR DE CARDS (VERSÃO CORRIGIDA)
function renderWorkers(workers) {
    const listBody = document.querySelector('#workersListBody');
    const feedbackMessage = document.querySelector('#feedbackMessage');

    if (!listBody || !feedbackMessage) {
        console.error("Elemento da lista ou de feedback não encontrado!");
        return;
    }

    // Limpa a lista antes de recriar
    listBody.innerHTML = '';

    if (workers.length === 0) {
        feedbackMessage.style.display = 'block';
        listBody.style.display = 'none'; // Esconde o corpo da lista
    } else {
        feedbackMessage.style.display = 'none';
        listBody.style.display = 'block'; // Garante que o corpo da lista esteja visível

        // Transforma cada objeto 'worker' em uma string de HTML
        const workersHtml = workers.map(worker => {
            let statusClass = '';
            if (worker.status === 'Online')  statusClass = 'status-online';
            if (worker.status === 'Offline') statusClass = 'status-offline';
            if (worker.status === 'Alerta')  statusClass = 'status-alerta';

            // Retorna a string HTML para este trabalhador específico
            return `
                <div class="worker-item">
                    <div class="worker-name-col">
                        <img src="${worker.imageUrl}" alt="Avatar de ${worker.name}" class="worker-avatar">
                        <span>${worker.name}</span>
                    </div>
                    <div class="worker-serial-col">${worker.serial}</div>
                    <div class="worker-status-col">
                        <span class="status-badge ${statusClass}">${worker.status}</span>
                    </div>
                    <div class="worker-actions-col">
                        <button class="btn btn-sm btn-outline-secondary" title="Ver detalhes de ${worker.name}">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join(''); // Junta todas as strings em uma só

        // Insere a string gigante de HTML no corpo da lista de uma vez
        listBody.innerHTML = workersHtml;
    }
}

// 3. EVENTO INICIAL (sem alterações)
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona um pequeno atraso para garantir que tudo carregou, só por segurança
    setTimeout(() => {
        renderWorkers(workersData);
    }, 100);
});