document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ login.js carregado e DOM pronto.");

  const form = document.getElementById("login-form");
  const feedback = document.getElementById("login-feedback");
  const spinner = document.querySelector(".loading");
  const buttonText = document.querySelector(".button-text");

  if (!form) {
    console.error("❌ Formulário #login-form não encontrado!");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (!emailInput || !passwordInput) {
      console.error("❌ Campos de email ou senha não encontrados.");
      feedback.textContent = "Erro interno: campos não encontrados.";
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      feedback.textContent = "Preencha todos os campos.";
      return;
    }

    // Ativa o spinner
    spinner.classList.remove("spinner-hidden");
    buttonText.textContent = "Entrando...";

    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        feedback.textContent = data.detail || "Credenciais inválidas.";
        return;
      }

      // Salva os tokens
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("userEmail", email);

      feedback.textContent = "";
      console.log("✅ Login bem-sucedido! Redirecionando...");
      window.location.href = "/index.html";
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      feedback.textContent = "Erro ao conectar ao servidor.";
    } finally {
      spinner.classList.add("spinner-hidden");
      buttonText.textContent = "Entrar";
    }
  });
});