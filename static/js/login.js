// Formulário deve ter inputs #email #password e #login-feedback

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#login-form');
    if (!form) return;

    const emailInput = document.querySelector('#email');
    const passInput = document.querySelector('#password');
    const feedback = document.querySelector('#login-feedback');
    const btn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passInput.value;
        if (!email || !password) {
            SafeVestAuth.showFormAlert('#login-feedback', 'Preencha email e senha.', 'warning');
            return;
        }

        btn.disabled = true;
        SafeVestAuth.clearFormAlert('#login-feedback');
        try {
            await SafeVestAuth.loginWithCredentials(email, password);
            SafeVestAuth.showFormAlert('#login-feedback', 'Login realizado com sucesso. Redirecionando...', 'success');
            setTimeout(() => { window.location.href = '/dashboard/'; }, 700);
        } catch (err) {
            SafeVestAuth.showFormAlert('#login-feedback', 'Erro ao logar: ' + (err.message || err), 'danger');
        } finally {
            btn.disabled = false;
        }
    });
});
