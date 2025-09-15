// /static/js/search.js

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#searchInput');
    if (!searchInput) return; // Se a página não tem busca, não faz nada

    // Identifica qual visualização a página atual está usando
    const isCardsView = document.querySelector('#worker-cards-container');
    const isTableView = document.querySelector('#workers-table-body');

    // A função principal que executa a busca
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        // Filtra a lista de dados principal (que vem do trabalhadores.js)
        const filteredWorkers = workersData.filter(worker => {
            const name = worker.name.toLowerCase();
            const serial = worker.serial.toLowerCase();
            return name.includes(searchTerm) || serial.includes(searchTerm);
        });

        // Chama a função de renderização correta com os dados filtrados
        if (isCardsView) {
            renderWorkersAsCards(filteredWorkers, '#worker-cards-container');
        } else if (isTableView) {
            renderWorkersAsTable(filteredWorkers, '#workers-table-body');
        }
    }

    // "Ouve" cada tecla que o usuário digita no campo de busca
    searchInput.addEventListener('keyup', performSearch);
});