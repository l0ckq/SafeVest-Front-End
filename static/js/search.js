document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const tableBody = document.getElementById("workers-table-body");
  const feedback = document.getElementById("feedback-message");

  if (!searchInput || !tableBody) return;

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();

    // Verifica se os dados já estão disponíveis no escopo global
    const data = window.workersData || [];
    if (!data.length) return;

    const filtered = data.filter(
      (w) =>
        (w.name && w.name.toLowerCase().includes(term)) ||
        (w.role && w.role.toLowerCase().includes(term))
    );

    renderFilteredTable(filtered, tableBody, feedback);
  });
});

function renderFilteredTable(workers, container, feedbackEl) {
  container.innerHTML = "";

  if (!workers.length) {
    feedbackEl.style.display = "block";
    return;
  }

  feedbackEl.style.display = "none";

  workers.forEach((w) => {
    const row = document.createElement("tr");
    const status = w.serial === "—" ? "Não associado" : "Ativo";
    row.innerHTML = `
      <td>${w.name}</td>
      <td>${w.role}</td>
      <td>${status}</td>
      <td>
        <button class="btn btn-outline-danger btn-sm"><i class="bi bi-eye"></i></button>
      </td>
    `;
    container.appendChild(row);
  });
}
