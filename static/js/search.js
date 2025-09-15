// js/search.js

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('#searchInput');

    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const searchTerm = searchInput.value.toLowerCase();

            // 1. Filtra o ARRAY de dados original
            const filteredWorkers = workersData.filter(worker => {
                const name = worker.name.toLowerCase();
                const serial = worker.serial.toLowerCase();
                return name.includes(searchTerm) || serial.includes(searchTerm);
            });

            // 2. Pede para a função de renderização "desenhar" a tabela novamente
            // mas desta vez, apenas com os dados filtrados.
            renderWorkers(filteredWorkers);
        });
    }
});