// /static/js/menu.js

document.addEventListener('DOMContentLoaded', function() {
    
    const menuToggle = document.querySelector('#menu-toggle');
    const sidebarClose = document.querySelector('#sidebar-close'); // O botão de fechar
    const wrapper = document.querySelector('#wrapper');

    // Função única que abre/fecha o menu
    function toggleMenu(event) {
        event.preventDefault(); 
        wrapper.classList.toggle('toggled');
    }

    if (wrapper) {
        // Adiciona o evento ao botão de abrir (hambúrguer)
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMenu);
        }
        // Adiciona o mesmo evento ao botão de fechar (X)
        if (sidebarClose) {
            sidebarClose.addEventListener('click', toggleMenu);
        }
    }
});