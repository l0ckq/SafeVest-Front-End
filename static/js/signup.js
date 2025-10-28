document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const toggleBtn = document.getElementById('togglePassword');
    const senhaInput = document.getElementById('senha_admin');
    const eyeIcon = toggleBtn.querySelector('i');

    toggleBtn.addEventListener('click', () => {
        const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
        senhaInput.setAttribute('type', type);
        eyeIcon.classList.toggle('bi-eye');
        eyeIcon.classList.toggle('bi-eye-slash');
    });

    // CNPJ mask
    const cnpjInput = document.getElementById('cnpj');
    cnpjInput.addEventListener('input', () => {
        let value = cnpjInput.value.replace(/\D/g, '');
        if (value.length > 14) value = value.slice(0, 14);
        value = value.replace(/^([0-9]{2})([0-9]{0,3})/, '$1.$2');
        value = value.replace(/^([0-9]{2})\.([0-9]{3})([0-9]{0,3})/, '$1.$2.$3');
        value = value.replace(/\.?([0-9]{3})([0-9]{0,4})/, '.$1/$2');
        value = value.replace(/(\d{4})(\d{0,2})$/, '$1-$2');
        cnpjInput.value = value;
    });

    // Form submission
    const form = document.getElementById('signup-form');
    const submitBtn = form.querySelector('button[type="submit"]') || form.nextElementSibling;
    
    submitBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Coletar dados
        const formData = {
            nome_empresa: document.getElementById('nome_empresa').value.trim(),
            cnpj: document.getElementById('cnpj').value.replace(/\D/g, ''),
            nome_admin: document.getElementById('nome_admin').value.trim(),
            email_admin: document.getElementById('email_admin').value.trim(),
            senha_admin: document.getElementById('senha_admin').value
        };
        
        // Validações
        if (!formData.nome_empresa) {
            alert('Por favor, informe o nome da empresa');
            return;
        }
        
        if (formData.cnpj.length !== 14) {
            alert('CNPJ deve ter 14 dígitos');
            return;
        }
        
        if (!formData.nome_admin) {
            alert('Por favor, informe o nome do administrador');
            return;
        }
        
        if (!formData.email_admin || !formData.email_admin.includes('@')) {
            alert('Por favor, informe um email válido');
            return;
        }
        
        if (!formData.senha_admin || formData.senha_admin.length < 8) {
            alert('A senha deve ter pelo menos 8 caracteres');
            return;
        }
        
        // Desabilitar botão
        submitBtn.disabled = true;
        submitBtn.textContent = 'Criando Conta...';
        
        try {
            const response = await fetch('/api/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Conta criada com sucesso! Redirecionando para login...');
                window.location.href = '/templates/login.html';
            } else {
                alert('Erro: ' + (data.erro || 'Erro desconhecido'));
            }
            
        } catch (error) {
            alert('Erro de rede: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Criar Conta';
        }
    });
});