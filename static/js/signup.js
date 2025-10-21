// Toggle de senha
const toggleBtn = document.getElementById('togglePassword');
const senhaInput = document.getElementById('senha_admin');
const eyeIcon = toggleBtn.querySelector('i');

toggleBtn.addEventListener('click', () => {
    const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
    senhaInput.setAttribute('type', type);
    eyeIcon.classList.toggle('bi-eye');
    eyeIcon.classList.toggle('bi-eye-slash');
});

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
