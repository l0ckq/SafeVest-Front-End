// /static/js/signup.js

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.querySelector('#signup-form');
    if (!signupForm) return;

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const feedbackAlert = document.querySelector('#feedback-alert');
        const submitButton = signupForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML; // Salva o texto original do botão

        const formData = {
            nome_empresa: document.querySelector('#nome_empresa').value,
            cnpj: document.querySelector('#cnpj').value,
            nome_admin: document.querySelector('#nome_admin').value,
            email_admin: document.querySelector('#email_admin').value,
            senha_admin: document.querySelector('#senha_admin').value,
        };

        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Criando...`;
        feedbackAlert.classList.add('d-none');

        fetch('http://127.0.0.1:8000/api/onboarding/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                // Pega a mensagem de erro da API ou usa uma padrão
                const errorMessage = data.erro || Object.values(data).join(' ') || 'Não foi possível completar o cadastro.';
                throw new Error(errorMessage);
            }
            return data;
        })
        .then(data => {
            signupForm.reset();
            feedbackAlert.className = 'alert alert-success';
            feedbackAlert.textContent = `${data.sucesso} Você será redirecionado para a página de login em 3 segundos.`;
            feedbackAlert.classList.remove('d-none');

            setTimeout(() => {
                window.location.href = '/login.html';
            }, 3000);
        })
        .catch(error => {
            feedbackAlert.className = 'alert alert-danger';
            feedbackAlert.textContent = error.message;
            feedbackAlert.classList.remove('d-none');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText; // Restaura o texto original
        });
    });
});