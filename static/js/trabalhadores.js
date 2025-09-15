// /static/js/trabalhadores.js

const workersData = [
    { id: 1, serial: 'SV-1001', name: 'Cleber Xavier', imageUrl: 'https://i.pravatar.cc/150?img=1', heartRate: 78, oxygen: 99, role: 'Operador' },
    { id: 2, serial: 'SV-1002', name: 'Marina Silva',  imageUrl: 'https://i.pravatar.cc/150?img=5', heartRate: 95, oxygen: 98, role: 'Supervisor' },
    { id: 3, serial: 'SV-1003', name: 'Lucas Alves',   imageUrl: 'https://i.pravatar.cc/150?img=3', heartRate: 125, oxygen: 96, role: 'Operador' },
    { id: 4, serial: 'SV-1004', name: 'Fernanda Dias', imageUrl: 'https://i.pravatar.cc/150?img=4', heartRate: 165, oxygen: 91, role: 'Administrador' },
    { id: 5, serial: 'SV-1005', name: 'Patrícia Souza',imageUrl: 'https://i.pravatar.cc/150?img=8', heartRate: 82, oxygen: 94, role: 'Operador' },
    { id: 6, serial: 'SV-1006', name: 'Bruno Araújo',  imageUrl: 'https://i.pravatar.cc/150?img=6', heartRate: 65, oxygen: 88, role: 'Supervisor' },
];

function calcularStatus(worker) {
    if (worker.heartRate > 160 || worker.heartRate < 50 || worker.oxygen < 90) return 'Emergência';
    if (worker.heartRate > 120 || worker.heartRate < 60 || worker.oxygen < 95) return 'Alerta';
    return 'Seguro';
}

function renderWorkersAsCards(workers, containerId) {
    const container = document.querySelector(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    if (workers.length === 0) {
        container.innerHTML = `<div class="col-12"><div class="alert alert-secondary mt-2 text-center">Nenhum trabalhador encontrado.</div></div>`;
        return;
    }

    workers.forEach(worker => {
        const statusAtual = calcularStatus(worker);
        let statusClass = '';
        if (statusAtual === 'Seguro') statusClass = 'status-seguro';
        if (statusAtual === 'Alerta') statusClass = 'status-alerta';
        if (statusAtual === 'Emergência') statusClass = 'status-emergencia';

        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12 mb-4';
        cardWrapper.innerHTML = `
            <div class="worker-card" data-worker-id="${worker.id}">
                <div class="status-dot ${statusClass}" title="Status: ${statusAtual}"></div>
                <img src="${worker.imageUrl}" alt="Avatar de ${worker.name}" class="worker-card-avatar">
                <div class="worker-card-name">${worker.name}</div>
                <div class="worker-card-serial">${worker.serial}</div>
            </div>
        `;
        
        cardWrapper.querySelector('.worker-card').addEventListener('click', () => {
            window.location.href = `/detalhes.html?id=${worker.id}`;
        });
        container.appendChild(cardWrapper);
    });
}

function renderWorkersAsTable(workers, containerId) {
    const tableBody = document.querySelector(containerId);
    if (!tableBody) return;
    const feedbackMessage = document.querySelector('#feedback-message');
    tableBody.innerHTML = '';
    
    if (workers.length === 0) {
        tableBody.style.display = 'none';
        if (feedbackMessage) feedbackMessage.style.display = 'block';
    } else {
        tableBody.style.display = '';
        if (feedbackMessage) feedbackMessage.style.display = 'none';
    }

    workers.forEach(worker => {
        const statusAtual = calcularStatus(worker);
        let statusClass = '';
        if (statusAtual === 'Seguro') statusClass = 'status-indicator-seguro';
        if (statusAtual === 'Alerta') statusClass = 'status-indicator-alerta';
        if (statusAtual === 'Emergência') statusClass = 'status-indicator-emergencia';
        
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.dataset.workerId = worker.id;
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <img src="${worker.imageUrl}" alt="Avatar de ${worker.name}" class="rounded-circle me-3" style="width: 40px; height: 40px; object-fit: cover;">
                    <div>
                        <div class="fw-bold">${worker.name}</div>
                        <div class="text-muted small">${worker.role}</div>
                    </div>
                </div>
            </td>
            <td>${worker.serial}</td>
            <td>
                <div class="status-indicator ${statusClass}">
                    <span class="status-indicator-dot"></span>
                    <span>${statusAtual}</span>
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-eye"></i> Detalhes
                </button>
            </td>
        `;
        row.addEventListener('click', () => {
            window.location.href = `/detalhes.html?id=${worker.id}`;
        });
        tableBody.appendChild(row);
    });
}