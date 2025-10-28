document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#form-cadastro-vestes');
    if (!form) return;

    const textArea = form.querySelector('#seriais-input');
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');
    const feedbackContainer = document.querySelector('#feedback-container');
    const feedbackAlert = document.querySelector('#feedback-alert');

    const ENDPOINT = '/api/vestes/bulk-create/';

    function normalizeSerial(s) {
        return s.replace(/\s+/g, '').toUpperCase();
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        SafeVestAuth.clearFormAlert('#feedback-alert');
        feedbackContainer.classList.add('d-none');

        const textoSeriais = textArea.value;
        if (!textoSeriais || !textoSeriais.trim()) {
            SafeVestAuth.showFormAlert('#feedback-alert', 'Por favor, insira ao menos um número de série.', 'warning');
            feedbackContainer.classList.remove('d-none');
            return;
        }

        let lista = textoSeriais.split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(normalizeSerial);

        lista = Array.from(new Set(lista));
        if (lista.length === 0) {
            SafeVestAuth.showFormAlert('#feedback-alert', 'Nenhum número de série válido encontrado.', 'warning');
            feedbackContainer.classList.remove('d-none');
            return;
        }

        submitButton.disabled = true;
        if (spinner) spinner.classList.remove('d-none');

        try {
            const resp = await SafeVestAuth.fetchWithAuth(ENDPOINT, {
                method: 'POST',
                body: JSON.stringify({ seriais: lista })
            });

            if (resp.ok) {
                const data = await resp.json();
                feedbackAlert.className = 'alert alert-success';
                let html = `<p class="mb-1">${data.mensagem || 'Processamento concluído.'}</p>`;
                if (Array.isArray(data.criadas) && data.criadas.length) {
                    html += '<strong>Criadas:</strong><ul class="mb-2">';
                    data.criadas.forEach(s => html += `<li>${s}</li>`);
                    html += '</ul>';
                }
                if (Array.isArray(data.ignoradas) && data.ignoradas.length) {
                    html += '<strong>Ignoradas (já existiam):</strong><ul class="mb-0">';
                    data.ignoradas.forEach(s => html += `<li>${s}</li>`);
                    html += '</ul>';
                }
                feedbackAlert.innerHTML = html;
                feedbackContainer.classList.remove('d-none');
                textArea.value = '';
            } else if (resp.status === 400) {
                const err = await resp.json().catch(() => ({ detail: 'Erro' }));
                const msg = err.detail || JSON.stringify(err);
                feedbackAlert.className = 'alert alert-danger';
                feedbackAlert.textContent = `Erro de validação: ${msg}`;
                feedbackContainer.classList.remove('d-none');
            } else if (resp.status === 401) {
                feedbackAlert.className = 'alert alert-danger';
                feedbackAlert.textContent = 'Não autorizado. Faça login.';
                feedbackContainer.classList.remove('d-none');
            } else {
                const txt = await resp.text();
                feedbackAlert.className = 'alert alert-danger';
                feedbackAlert.textContent = `Erro: ${txt}`;
                feedbackContainer.classList.remove('d-none');
            }
        } catch (error) {
            feedbackAlert.className = 'alert alert-danger';
            feedbackAlert.textContent = `Erro de rede: ${error.message}`;
            feedbackContainer.classList.remove('d-none');
        } finally {
            submitButton.disabled = false;
            if (spinner) spinner.classList.add('d-none');
        }
    });
});
