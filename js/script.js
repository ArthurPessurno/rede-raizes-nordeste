
const formulario = document.getElementById("form-unidade");
const campoUnidade = document.getElementById("unidade");
const mensagem = document.getElementById("mensagem");

formulario.addEventListener("submit", function(evento) {
  evento.preventDefault();

  const unidade = campoUnidade.value;

  if (unidade === "") {
    mensagem.textContent = "Escolha uma unidade para continuar.";
    return;
  }

  // Guarda a unidade escolhida no navegador.
  localStorage.setItem("unidadeSelecionada", unidade);

  // Abre a página do cardápio.
  window.location.href = "cardapio.html";
});
