// Esta função pode ser movida para um arquivo 'utils.js' no futuro para ser reutilizada.
function calcularStatus(leitura) {
    if (!leitura) return { texto: 'Desconhecido', classe: 'status-indicator-offline' };

    const batimento = leitura.batimento;
    if (batimento > 160 || batimento < 50) return { texto: 'Emergência', classe: 'status-indicator-emergencia' };
    if (batimento > 120 || batimento < 60) return { texto: 'Alerta', classe: 'status-indicator-alerta' };
    return { texto: 'Seguro', classe: 'status-indicator-seguro' };
}

async function carregarDetalhesTrabalhador() {
    const container = document.querySelector('#detalhes-container');
    if (!container) return;

    try {
        // 1. LER A URL para pegar o ID do Profile (que é o mesmo ID do User).
        const params = new URLSearchParams(window.location.search);
        const profileId = params.get('id');

        if (!profileId) {
            throw new Error("ID do trabalhador não fornecido na URL.");
        }

        // 2. BUSCAR OS DADOS REAIS DA API DJANGO.
        // Fazemos a chamada para o endpoint do Profile específico.
        const response = await fetch(`http://127.0.0.1:8000/api/profile/${profileId}/`);
        
        if (!response.ok) {
            throw new Error(`Trabalhador não encontrado (Status: ${response.status})`);
        }

        const profileData = await response.json();
        
        // --- SIMULAÇÃO DE DADOS DE SENSOR ---
        // No futuro, aqui você faria outra chamada para buscar a ÚLTIMA leitura do sensor
        // para este trabalhador, ex: /api/leiturasensor/?profile=${profileId}&latest=true
        const ultimaLeitura = { batimento: Math.floor(Math.random() * 40) + 70 }; // Dado fake por enquanto
        const status = calcularStatus(ultimaLeitura);

        // 3. DESENHAR A PÁGINA com os dados recebidos.
        container.innerHTML = `
            <div class="bg-white p-4 rounded shadow-sm">
                <div class="row align-items-center">
                    <div class="col-lg-2 col-md-3 text-center">
                        <img src="https://i.pravatar.cc/150?u=${profileData.user.id}" alt="${profileData.user.first_name}" class="img-fluid rounded-circle mb-3" style="width: 120px; height: 120px; object-fit: cover;">
                    </div>
                    <div class="col-lg-10 col-md-9">
                        <h2 class="mb-1">${profileData.user.first_name}</h2>
                        <p class="text-muted fs-5 mb-2">${profileData.setor ? profileData.setor.nome : 'Setor não definido'}</p>
                        <div class="d-flex align-items-center">
                            <strong class="me-2">Status Atual:</strong>
                            <div class="status-indicator ${status.classe}">
                                <span class="status-indicator-dot"></span>
                                <span>${status.texto}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <hr class="my-4">
                <h4>Dados Atuais dos Sensores</h4>
                <div class="row g-3">
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-header"><i class="bi bi-heart-pulse-fill text-danger me-2"></i>Batimento Cardíaco</div>
                            <div class="card-body">
                                <h3 class="card-title">${ultimaLeitura.batimento} <span class="fs-6 text-muted">BPM</span></h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-header"><i class="bi bi-lungs-fill text-primary me-2"></i>Oxigenação (SpO2)</div>
                            <div class="card-body">
                                <h3 class="card-title">-- <span class="fs-6 text-muted">%</span></h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                         <div class="card text-center">
                            <div class="card-header"><i class="bi bi-thermometer-half text-info me-2"></i>Temperatura</div>
                            <div class="card-body">
                                <h3 class="card-title">-- <span class="fs-6 text-muted">°C</span></h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Falha ao carregar detalhes:", error);
        container.innerHTML = `
            <div class="alert alert-danger text-center">
                <h4>Erro ao Carregar Dados</h4>
                <p>${error.message}</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', carregarDetalhesTrabalhador);