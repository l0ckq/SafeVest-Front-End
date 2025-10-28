document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('#logout-btn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        SafeVestAuth.clearTokens();
        window.location.href = '/accounts/login/?next=/';
    });
});
