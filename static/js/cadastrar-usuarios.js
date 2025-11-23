console.log("🟢 [INIT] Script cadastro-usuarios.js carregado");

document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 [DOM] DOMContentLoaded disparado");

  const form = document.getElementById("form-cadastro-usuario");
  const feedback = document.getElementById("feedback-alert");
  const submitBtn = form.querySelector("button[type='submit']");
  const btnTextSpan = submitBtn.querySelector(".button-text");
  
  console.log("🟢 [ELEMENTOS] Elementos do DOM capturados:", {
    form: !!form,
    feedback: !!feedback,
    submitBtn: !!submitBtn,
    btnTextSpan: !!btnTextSpan
  });

  // ✅ ENDPOINT CORRIGIDO
  const ENDPOINT = "http://127.0.0.1:8000/api/usuarios/create/";
  console.log("🟢 [CONFIG] Endpoint configurado:", ENDPOINT);

  // Toggle de visibilidade das senhas
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eyeIcon");

  const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
  const confirmPasswordInput = document.getElementById("confirm_password");
  const eyeIconConfirm = document.getElementById("eyeIconConfirm");

  togglePassword?.addEventListener("click", () => {
    console.log("👁️ [UI] Toggle senha clicado");
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    eyeIcon.classList.toggle("bi-eye");
    eyeIcon.classList.toggle("bi-eye-slash");
  });

  toggleConfirmPassword?.addEventListener("click", () => {
    console.log("👁️ [UI] Toggle confirmar senha clicado");
    const type = confirmPasswordInput.type === "password" ? "text" : "password";
    confirmPasswordInput.type = type;
    eyeIconConfirm.classList.toggle("bi-eye");
    eyeIconConfirm.classList.toggle("bi-eye-slash");
  });

  function showAlert(message, type = "warning") {
    console.log(`🔔 [ALERT] Mostrando alerta [${type}]:`, message);
    feedback.textContent = message;
    feedback.className = `alert alert-${type} mt-3`;
    feedback.classList.remove("d-none");
    feedback.style.display = "block";
  }

  function hideAlert() {
    console.log("🔕 [ALERT] Escondendo alerta");
    feedback.classList.add("d-none");
    feedback.style.display = "none";
  }

  function validateEmail(email) {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    console.log("✉️ [VALIDAÇÃO] Email:", email, "→", isValid ? "✅ Válido" : "❌ Inválido");
    return isValid;
  }

  function validatePassword(pw) {
    const isValid = typeof pw === "string" && pw.length >= 8;
    console.log("🔐 [VALIDAÇÃO] Senha:", `${pw.length} caracteres`, "→", isValid ? "✅ Válida" : "❌ Inválida");
    return isValid;
  }

  async function fetchWithAuth(url, options = {}) {
    console.log("🔐 [AUTH] Buscando token no localStorage...");
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      console.error("❌ [AUTH] Token não encontrado no localStorage!");
      showAlert("Sessão expirada. Faça login novamente.", "danger");
      setTimeout(() => {
        console.log("🔄 [REDIRECT] Redirecionando para login...");
        window.location.href = "/templates/login.html";
      }, 1500);
      return null;
    }

    console.log("✅ [AUTH] Token encontrado:", token.substring(0, 20) + "...");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    console.log("📡 [REQUEST] Preparando requisição:", {
      url,
      method: options.method || "GET",
      headers: {
        "Content-Type": headers["Content-Type"],
        Authorization: `Bearer ${token.substring(0, 20)}...`
      }
    });

    return fetch(url, { ...options, headers });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("🚀 [SUBMIT] Formulário enviado!");
    hideAlert();

    // Captura dos valores
    const firstName = document.getElementById("first_name").value.trim();
    const lastName = document.getElementById("last_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    const funcao = document.getElementById("funcao").value;

    console.log("📝 [FORM DATA] Dados capturados:", {
      firstName,
      lastName,
      email,
      funcao,
      passwordLength: password.length,
      confirmPasswordLength: confirmPassword.length,
      passwordsMatch: password === confirmPassword
    });

    // Validações
    if (!firstName) {
      console.warn("⚠️ [VALIDAÇÃO] Nome vazio");
      return showAlert("Informe o nome.", "warning");
    }
    if (!lastName) {
      console.warn("⚠️ [VALIDAÇÃO] Sobrenome vazio");
      return showAlert("Informe o sobrenome.", "warning");
    }
    if (!validateEmail(email)) {
      console.warn("⚠️ [VALIDAÇÃO] Email inválido");
      return showAlert("Email inválido.", "warning");
    }
    if (!funcao) {
      console.warn("⚠️ [VALIDAÇÃO] Função não selecionada");
      return showAlert("Selecione uma função.", "warning");
    }
    if (password !== confirmPassword) {
      console.warn("⚠️ [VALIDAÇÃO] Senhas não conferem");
      return showAlert("Senhas não conferem.", "danger");
    }
    if (!validatePassword(password)) {
      console.warn("⚠️ [VALIDAÇÃO] Senha muito curta");
      return showAlert("Senha fraca (mínimo 8 caracteres).", "warning");
    }

    console.log("✅ [VALIDAÇÃO] Todas as validações passaram!");

    // Desabilita botão
    submitBtn.disabled = true;
    const originalText = btnTextSpan?.textContent || submitBtn.textContent;
    if (btnTextSpan) btnTextSpan.textContent = "Criando...";
    console.log("🔒 [UI] Botão desabilitado");

    // Monta o payload
    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      grupo: funcao, // backend espera "grupo"
    };

    console.log("📦 [PAYLOAD] Payload montado:", {
      ...payload,
      password: "***OCULTO***"
    });

    try {
      console.log("📡 [FETCH] Iniciando requisição...");
      const resp = await fetchWithAuth(ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!resp) {
        console.error("❌ [FETCH] Resposta nula (provavelmente token ausente)");
        return;
      }

      console.log("📨 [RESPONSE] Status recebido:", resp.status, resp.statusText);

      if (resp.ok) {
        console.log("✅ [SUCCESS] Requisição bem-sucedida!");
        const data = await resp.json();
        console.log("📄 [RESPONSE DATA]:", data);
        
        showAlert(data.mensagem || "Usuário criado com sucesso!", "success");
        form.reset();
        
        console.log("🔄 [REDIRECT] Redirecionando em 2s...");
        setTimeout(() => {
          window.location.href = "/templates/trabalhadores.html";
        }, 2000);
      } else {
        console.error("❌ [ERROR] Requisição falhou!");
        const err = await resp.json().catch(() => {
          console.error("❌ [ERROR] Não foi possível fazer parse do JSON de erro");
          return {};
        });
        console.error("📄 [ERROR DATA]:", err);
        
        let msg = err.erro || err.mensagem || err.detail || resp.statusText || "Erro desconhecido";
        
        if (resp.status === 403) {
          msg = "Apenas administradores podem criar usuários.";
          console.error("🚫 [403] Usuário não tem permissão");
        }
        if (resp.status === 401) {
          msg = "Sessão expirada. Faça login novamente.";
          console.error("🔐 [401] Token inválido ou expirado");
        }
        if (resp.status === 400 && err.email) {
          msg = "Este email já está cadastrado.";
          console.error("📧 [400] Email duplicado");
        }
        
        showAlert(msg, "danger");
        
        if (resp.status === 401) {
          console.log("🔄 [REDIRECT] Redirecionando para login em 1.5s...");
          setTimeout(() => (window.location.href = "/templates/login.html"), 1500);
        }
      }
    } catch (error) {
      console.error("💥 [EXCEPTION] Erro de rede/execução:", error);
      console.error("Stack trace:", error.stack);
      showAlert("Erro de rede: " + error.message, "danger");
    } finally {
      console.log("🔓 [UI] Reabilitando botão");
      submitBtn.disabled = false;
      if (btnTextSpan) btnTextSpan.textContent = originalText;
    }
  });

  console.log("✅ [READY] Script totalmente inicializado e pronto!");
});