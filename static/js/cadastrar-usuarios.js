// /static/js/cadastro-usuarios.js
document.addEventListener('DOMContentLoaded', () => {
    function setupPasswordToggle(toggleId, inputId, iconId) {
        const toggleButton = document.getElementById(toggleId);
        const passwordInput = document.getElementById(inputId);
        const eyeIcon = document.getElementById(iconId);
        if (toggleButton && passwordInput && eyeIcon) {
            toggleButton.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
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
    const ENDPOINT = 'http://127.0.0.1:8000/api/usuarios/criar/';

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePasswordStrength(pw) {
        return typeof pw === 'string' && pw.length >= 8;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("🧠 SUBMIT INTERCEPTADO");
        SafeVestAuth.clearFormAlert(feedbackSelector);

        const nome = document.getElementById('nome_completo').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        const funcao = document.getElementById('funcao').value;
        const email = document.getElementById('email').value.trim();

        if (!nome) return SafeVestAuth.showFormAlert(feedbackSelector, 'Informe o nome.', 'warning');
        if (!validateEmail(email)) return SafeVestAuth.showFormAlert(feedbackSelector, 'Email inválido.', 'warning');
        if (password !== confirmPassword) return SafeVestAuth.showFormAlert(feedbackSelector, 'Senhas não conferem.', 'danger');
        if (!validatePasswordStrength(password)) return SafeVestAuth.showFormAlert(feedbackSelector, 'Senha fraca (mín. 8 caracteres).', 'warning');
        if (!funcao) return SafeVestAuth.showFormAlert(feedbackSelector, 'Selecione a função.', 'warning');

        submitBtn.disabled = true;
        const originalText = btnTextSpan?.textContent || submitBtn.textContent;
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                const data = await resp.json();
                SafeVestAuth.showFormAlert(feedbackSelector, data.mensagem || 'Usuário criado com sucesso!', 'success');
                form.reset();
            } else {
                const err = await resp.json().catch(() => ({}));
                let msg = err.erro || err.mensagem || resp.statusText || 'Erro desconhecido.';
                if (resp.status === 403) msg = 'Apenas administradores podem criar usuários.';
                if (resp.status === 401) msg = 'Sessão expirada. Faça login novamente.';
                SafeVestAuth.showFormAlert(feedbackSelector, msg, 'danger');
                if (resp.status === 401) setTimeout(() => (window.location.href = '/templates/login.html'), 2000);
            }
        } catch (error) {
            SafeVestAuth.showFormAlert(feedbackSelector, 'Erro de rede: ' + error.message, 'danger');
        } finally {
            submitBtn.disabled = false;
            if (btnTextSpan) btnTextSpan.textContent = originalText;
        }
    });
});