document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const usernameInput = loginForm.querySelector('#username');
        const passwordInput = loginForm.querySelector('#password');
        const feedbackEl = document.querySelector('#login-feedback');
        const submitButton = loginForm.querySelector('button[type="submit"]');

        const buttonText = submitButton.querySelector('.button-text');
        const spinner = submitButton.querySelector('.loading');
        const originalButtonText = buttonText.textContent;

        feedbackEl.textContent = '';
        usernameInput.classList.remove('is-invalid');
        passwordInput.classList.remove('is-invalid');

        // Mostra o spinner e ajusta o texto
        submitButton.disabled = true;
        buttonText.textContent = 'Entrando';
        spinner.classList.remove('spinner-hidden');

        fetch('http://127.0.0.1:8000/api/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameInput.value,
                password: passwordInput.value
            })
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const errorMessage = data.detail || 'Ocorreu um erro.';
                    usernameInput.classList.add('is-invalid');
                    passwordInput.classList.add('is-invalid');
                    throw new Error(errorMessage);
                }
                return data;
            })
            .then(data => {
                localStorage.setItem('accessToken', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                window.location.href = '/index.html';
            })
            .catch(error => {
                let mensagem = error.message;
                if (mensagem.includes("No active account")) {
                    mensagem = "Nenhuma conta encontrada com essas credenciais.";
                } else if (mensagem.includes("Invalid token")) {
                    mensagem = "Sessão expirada, faça login novamente.";
                } else if (mensagem.includes("network") || mensagem.includes("Failed to fetch")) {
                    mensagem = "Falha de comunicação com o servidor. Verifique sua conexão e tente novamente.";
                } else if (mensagem === "Ocorreu um erro.") {
                    mensagem = "Erro ao autenticar. Tente novamente em instantes.";
                }

                feedbackEl.textContent = mensagem;
                submitButton.disabled = false;
                buttonText.textContent = originalButtonText;
                spinner.classList.add('spinner-hidden');
            });

    });
});