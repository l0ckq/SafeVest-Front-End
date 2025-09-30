// /static/js/cadastro-vestes.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#form-cadastro-vestes');
    if (!form) return;

    const textArea = form.querySelector('#seriais-input');
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');
    const feedbackContainer = document.querySelector('#feedback-container');
    const feedbackAlert = document.querySelector('#feedback-alert');
    
    // Ouve o evento de "submit" do formulário
    form.addEventListener('submit', function(event) {
        // Previne o comportamento padrão do formulário, que é recarregar a página
        event.preventDefault();

        // 1. PREPARAÇÃO: Pega o texto do textarea
        const textoSeriais = textArea.value;
        if (!textoSeriais.trim()) {
            alert('Por favor, insira ao menos um número de série.');
            return;
        }

        // Transforma o texto em uma lista de seriais, limpando linhas vazias
        const listaSeriais = textoSeriais.split('\n').map(s => s.trim()).filter(s => s);

        // Feedback visual para o usuário
        submitButton.disabled = true;
        spinner.classList.remove('d-none');
        feedbackContainer.classList.add('d-none');

        // 2. ENVIO: Faz a chamada para o nosso endpoint no backend
        fetch('http://127.0.0.1:8000/api/vestes/bulk-create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Monta o corpo da requisição no formato que a API espera
            body: JSON.stringify({ seriais: listaSeriais }),
        })
        .then(response => {
            if (!response.ok) {
                // Se a resposta da API for um erro (4xx ou 5xx), nós o capturamos
                throw new Error(`Erro na API: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // 3. FEEDBACK DE SUCESSO: Mostra o relatório detalhado que a API retornou
            feedbackAlert.className = 'alert alert-success'; // Deixa o alerta verde
            let htmlFeedback = `<p class="mb-1">${data.mensagem}</p>`;
            
            if (data.criadas && data.criadas.length > 0) {
                htmlFeedback += '<strong>Criadas:</strong><ul class="mb-2">';
                data.criadas.forEach(s => { htmlFeedback += `<li>${s}</li>`; });
                htmlFeedback += '</ul>';
            }
            if (data.ignoradas && data.ignoradas.length > 0) {
                htmlFeedback += '<strong>Ignoradas (já existiam):</strong><ul class="mb-0">';
                data.ignoradas.forEach(s => { htmlFeedback += `<li>${s}</li>`; });
                htmlFeedback += '</ul>';
            }

            feedbackAlert.innerHTML = htmlFeedback;
            feedbackContainer.classList.remove('d-none');
            textArea.value = ''; // Limpa o campo de texto
        })
        .catch(error => {
            // 4. FEEDBACK DE ERRO: Mostra uma mensagem de erro genérica
            feedbackAlert.className = 'alert alert-danger'; // Deixa o alerta vermelho
            feedbackAlert.textContent = `Ocorreu um erro ao processar a solicitação: ${error.message}`;
            feedbackContainer.classList.remove('d-none');
        })
        .finally(() => {
            // Roda sempre no final, tanto em sucesso quanto em erro
            submitButton.disabled = false;
            spinner.classList.add('d-none');
        });
    });
});