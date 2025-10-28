// cadastro-usuarios.js (atualizado)
document.addEventListener('DOMContentLoaded', () => {
    function setupPasswordToggle(toggleId, inputId, iconId) {
        const toggleButton = document.getElementById(toggleId);
        const passwordInput = document.getElementById(inputId);
        const eyeIcon = document.getElementById(iconId);
        if (toggleButton && passwordInput && eyeIcon) {
            toggleButton.addEventListener('click', () => {
                const isPassword = passwordInput.getAttribute('type') === 'password';
                passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
                eyeIcon.classList.toggle('bi-eye');
                eyeIcon.classList.toggle('bi-eye-slash');
            });
        }
    }
    setupPasswordToggle('togglePassword', 'password', 'eyeIcon');
    setupPasswordToggle('toggleConfirmPassword', 'confirm_password', 'eyeIconConfirm');

    const form = document.querySelector('#form-cadastro-usuario');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const btnTextSpan = submitBtn.querySelector('.button-text');
    const feedbackSelector = '#feedback-alert';
    const ENDPOINT = '/api/usuarios/create/'; 

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function validatePasswordStrength(pw) {
        return typeof pw === 'string' && pw.length >= 8;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        SafeVestAuth.clearFormAlert(feedbackSelector);

        const nome = document.getElementById('nome_completo').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const funcao = document.getElementById('funcao').value;
        const email = document.getElementById('email').value.trim();

        if (!nome) { SafeVestAuth.showFormAlert(feedbackSelector, 'Informe o nome.', 'warning'); return; }
        if (!validateEmail(email)) { SafeVestAuth.showFormAlert(feedbackSelector, 'Email inválido.', 'warning'); return; }
        if (password !== confirmPassword) { SafeVestAuth.showFormAlert(feedbackSelector, 'Senhas não conferem.', 'danger'); return; }
        if (!validatePasswordStrength(password)) { SafeVestAuth.showFormAlert(feedbackSelector, 'Senha fraca: mínimo 8 caracteres.', 'warning'); return; }
        if (!funcao) { SafeVestAuth.showFormAlert(feedbackSelector, 'Selecione a função.', 'warning'); return; }

        submitBtn.disabled = true;
        const originalText = btnTextSpan ? btnTextSpan.textContent : submitBtn.textContent;
        if (btnTextSpan) btnTextSpan.textContent = 'Criando...';

        const payload = {
            nome_completo: nome,
            email: email,
            funcao: funcao,
            password: password
        };

        try {
            const resp = await SafeVestAuth.fetchWithAuth(ENDPOINT, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                const data = await resp.json();
                SafeVestAuth.showFormAlert(feedbackSelector, data.mensagem || 'Usuário criado com sucesso.', 'success');
                form.reset();
            } else if (resp.status === 400) {
                const err = await resp.json();
                SafeVestAuth.showFormAlert(feedbackSelector, 'Erro: ' + (err.erro || JSON.stringify(err)), 'danger');
            } else if (resp.status === 401) {
                SafeVestAuth.showFormAlert(feedbackSelector, 'Não autorizado. Faça login novamente.', 'danger');
                // Redirecionar para login
                setTimeout(() => window.location.href = '/templates/login.html', 2000);
            } else if (resp.status === 403) {
                SafeVestAuth.showFormAlert(feedbackSelector, 'Apenas administradores podem criar usuários.', 'danger');
            } else {
                const txt = await resp.text();
                SafeVestAuth.showFormAlert(feedbackSelector, 'Erro servidor: ' + txt, 'danger');
            }
        } catch (error) {
            SafeVestAuth.showFormAlert(feedbackSelector, 'Erro de rede: ' + error.message, 'danger');
        } finally {
            submitBtn.disabled = false;
            if (btnTextSpan) btnTextSpan.textContent = originalText;
        }
    });
});