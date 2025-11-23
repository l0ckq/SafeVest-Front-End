// cadastro-usuarios.js - Versão com Debug Turbinado e Múltiplos Formatos
console.log("🟢 [INIT] Script cadastro-usuarios.js carregado");

document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 [DOM] DOMContentLoaded disparado");

  const form = document.getElementById("form-cadastro-usuario");
  const feedback = document.getElementById("feedback-alert");
  const submitBtn = form.querySelector("button[type='submit']");
  const btnTextSpan = submitBtn.querySelector(".button-text");

  const API_BASE = "http://127.0.0.1:8000/api";
  const ENDPOINT = `${API_BASE}/usuarios/create/`;
  
  console.log("🟢 [CONFIG] Endpoint:", ENDPOINT);

  // ============== UTILITÁRIOS ==============
  function showAlert(message, type = "warning") {
    console.log(`📢 [ALERT] ${type.toUpperCase()}:`, message);
    feedback.textContent = message;
    feedback.className = `alert alert-${type} mt-3`;
    feedback.classList.remove("d-none");
    feedback.style.display = "block";
  }

  function hideAlert() {
    feedback.classList.add("d-none");
    feedback.style.display = "none";
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(pw) {
    return typeof pw === "string" && pw.length >= 8;
  }

  // ============== AUTENTICAÇÃO ==============
  function getTokens() {
    return {
      access: localStorage.getItem("accessToken"),
      refresh: localStorage.getItem("refreshToken"),
    };
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/templates/login.html";
  }

  async function refreshToken() {
    const { refresh } = getTokens();
    if (!refresh) return false;

    try {
      const resp = await fetch(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!resp.ok) return false;

      const data = await resp.json();
      localStorage.setItem("accessToken", data.access);
      console.log("🔄 [AUTH] Token renovado");
      return true;
    } catch (err) {
      console.error("❌ [AUTH] Erro ao renovar token:", err);
      return false;
    }
  }

  async function fetchWithAuth(url, options = {}, retry = true) {
    const { access } = getTokens();

    if (!access) {
      console.error("❌ [AUTH] Token não encontrado!");
      showAlert("Sessão expirada. Faça login novamente.", "danger");
      setTimeout(() => logout(), 1500);
      return null;
    }

    console.log("🔑 [AUTH] Token encontrado:", access.substring(0, 20) + "...");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
      ...options.headers,
    };

    try {
      const resp = await fetch(url, { ...options, headers });

      if (resp.status === 401 && retry) {
        console.warn("⚠️ [AUTH] Token expirado, tentando renovar...");
        const renovado = await refreshToken();
        if (renovado) return fetchWithAuth(url, options, false);
        logout();
        return null;
      }

      return resp;
    } catch (err) {
      console.error("💥 [FETCH] Erro de rede:", err);
      throw err;
    }
  }

  // ============== TOGGLE DE SENHA ==============
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eyeIcon");

  const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
  const confirmPasswordInput = document.getElementById("confirm_password");
  const eyeIconConfirm = document.getElementById("eyeIconConfirm");

  togglePassword?.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    eyeIcon.classList.toggle("bi-eye");
    eyeIcon.classList.toggle("bi-eye-slash");
  });

  toggleConfirmPassword?.addEventListener("click", () => {
    const type = confirmPasswordInput.type === "password" ? "text" : "password";
    confirmPasswordInput.type = type;
    eyeIconConfirm.classList.toggle("bi-eye");
    eyeIconConfirm.classList.toggle("bi-eye-slash");
  });

  // ============== SUBMIT DO FORMULÁRIO ==============
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("🚀 [SUBMIT] Formulário enviado!");
    hideAlert();

    // Captura valores
    const firstName = document.getElementById("first_name").value.trim();
    const lastName = document.getElementById("last_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    const funcao = document.getElementById("funcao").value;

    console.log("📝 [FORM] Dados capturados:", {
      firstName,
      lastName,
      email,
      funcao,
      passwordLength: password.length,
    });

    // Validações
    if (!firstName) return showAlert("Informe o nome.", "warning");
    if (!lastName) return showAlert("Informe o sobrenome.", "warning");
    if (!validateEmail(email)) return showAlert("Email inválido.", "warning");
    if (!funcao) return showAlert("Selecione uma função.", "warning");
    if (password !== confirmPassword) return showAlert("Senhas não conferem.", "danger");
    if (!validatePassword(password)) return showAlert("Senha muito curta (mínimo 8 caracteres).", "warning");

    console.log("✅ [VALIDAÇÃO] Todas as validações passaram!");

    // Desabilita botão
    submitBtn.disabled = true;
    const originalText = btnTextSpan?.textContent || submitBtn.textContent;
    if (btnTextSpan) btnTextSpan.textContent = "Criando...";

    // ========== PAYLOADS ALTERNATIVOS ==========
    // Testa 3 formatos diferentes que o backend pode aceitar

    const payloads = {
      formato1: {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        grupo: funcao,
      },
      formato2: {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        funcao: funcao,
      },
      formato3: {
        nome: `${firstName} ${lastName}`,
        email,
        password,
        funcao: funcao,
      },
    };

    console.log("📦 [PAYLOADS] Formatos preparados:");
    console.log("   Formato 1 (grupo):", payloads.formato1);
    console.log("   Formato 2 (funcao):", payloads.formato2);
    console.log("   Formato 3 (nome completo):", payloads.formato3);

    // Tenta formato 1 primeiro (o que estava no código original)
    let payload = payloads.formato1;

    try {
      console.log("📡 [FETCH] Tentando formato 1 (grupo)...");
      console.log("📦 [PAYLOAD]:", JSON.stringify(payload, null, 2));

      const resp = await fetchWithAuth(ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!resp) {
        console.error("❌ [FETCH] Resposta nula");
        return;
      }

      console.log("📨 [RESPONSE] Status:", resp.status, resp.statusText);
      console.log("📨 [RESPONSE] Headers:", Object.fromEntries(resp.headers.entries()));

      // Tenta ler o body (pode ser JSON ou texto)
      const contentType = resp.headers.get("content-type");
      console.log("📨 [RESPONSE] Content-Type:", contentType);

      let responseData;
      if (contentType?.includes("application/json")) {
        responseData = await resp.json();
        console.log("📄 [RESPONSE] JSON:", responseData);
      } else {
        const text = await resp.text();
        console.log("📄 [RESPONSE] Texto:", text);
        responseData = { mensagem: text };
      }

      if (resp.ok) {
        console.log("✅ [SUCCESS] Usuário criado com sucesso!");
        showAlert(responseData.mensagem || "Usuário criado com sucesso!", "success");
        form.reset();

        setTimeout(() => {
          window.location.href = "/templates/trabalhadores.html";
        }, 2000);
      } else {
        console.error("❌ [ERROR] Requisição falhou!");
        console.error("📄 [ERROR] Detalhes:", responseData);

        // Mensagens de erro específicas
        let msg = responseData.erro || responseData.mensagem || responseData.detail || "Erro desconhecido";

        // Se for 400, mostra TODOS os erros do backend
        if (resp.status === 400 && typeof responseData === "object") {
          console.error("🔍 [400] Erros de validação:", responseData);
          
          // Tenta extrair mensagens de erro de diferentes formatos
          const erros = [];
          for (const [campo, mensagens] of Object.entries(responseData)) {
            if (Array.isArray(mensagens)) {
              erros.push(`${campo}: ${mensagens.join(", ")}`);
            } else if (typeof mensagens === "string") {
              erros.push(`${campo}: ${mensagens}`);
            }
          }
          
          if (erros.length > 0) {
            msg = "Erros de validação:\n" + erros.join("\n");
          }
        }

        if (resp.status === 403) {
          msg = "Apenas administradores podem criar usuários.";
        }
        if (resp.status === 401) {
          msg = "Sessão expirada. Faça login novamente.";
          setTimeout(() => logout(), 1500);
        }

        showAlert(msg, "danger");

        // Sugestão de formato alternativo
        if (resp.status === 400) {
          console.log("💡 [DICA] Tente verificar se o backend espera outro formato!");
          console.log("💡 [DICA] Formatos alternativos disponíveis:", Object.keys(payloads));
        }
      }
    } catch (error) {
      console.error("💥 [EXCEPTION] Erro:", error);
      console.error("Stack:", error.stack);
      showAlert("Erro de rede: " + error.message, "danger");
    } finally {
      submitBtn.disabled = false;
      if (btnTextSpan) btnTextSpan.textContent = originalText;
    }
  });

  console.log("✅ [READY] Script inicializado!");
});