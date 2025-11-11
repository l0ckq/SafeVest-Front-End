document.addEventListener("DOMContentLoaded", () => {
  setupSidebar();
  setupMenuToggle();
});

function setupSidebar() {
  const sidebar = document.getElementById("sidebar-wrapper");
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="bg-light border-end vh-100 p-3" id="sidebar-content">
      <h5 class="fw-bold mb-4 text-danger text-center">SafeVest</h5>
      <ul class="list-unstyled">
        <li><a href="/templates/index.html" class="d-block py-2 px-3 text-dark text-decoration-none"><i class="bi bi-house-door me-2"></i>Dashboard</a></li>
        <li><a href="/templates/trabalhadores.html" class="d-block py-2 px-3 text-dark text-decoration-none"><i class="bi bi-people me-2"></i>Trabalhadores</a></li>
        <li><a href="/templates/vestes.html" class="d-block py-2 px-3 text-dark text-decoration-none"><i class="bi bi-shield-check me-2"></i>Veste</a></li>
        <li><a href="/templates/setores.html" class="d-block py-2 px-3 text-dark text-decoration-none"><i class="bi bi-diagram-3 me-2"></i>Setores</a></li>
        <li><a href="/templates/alertas.html" class="d-block py-2 px-3 text-dark text-decoration-none"><i class="bi bi-exclamation-triangle me-2"></i>Alertas</a></li>
        <li><hr></li>
        <li><a href="/templates/perfil.html" class="d-block py-2 px-3 text-dark text-decoration-none"><i class="bi bi-person-circle me-2"></i>Meu Perfil</a></li>
        <li><a href="/templates/login.html" class="d-block py-2 px-3 text-dark text-decoration-none text-danger fw-bold"><i class="bi bi-box-arrow-right me-2"></i>Sair</a></li>
      </ul>
    </div>
  `;
}

function setupMenuToggle() {
  const menuToggle = document.getElementById("menu-toggle");
  const wrapper = document.getElementById("wrapper");
  if (!menuToggle || !wrapper) return;

  menuToggle.addEventListener("click", (e) => {
    e.preventDefault();
    wrapper.classList.toggle("toggled");
  });
}