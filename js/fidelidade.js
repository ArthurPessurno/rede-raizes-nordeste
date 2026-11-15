

const usuario = obterUsuarioAtual();

if (!usuarioEhCliente()) {
  window.location.replace("login.html");
} else {


  document.getElementById("cliente-fidelidade").textContent =
    "Cliente: " + usuario.nome;

  const saldo = calcularSaldoPontos(usuario.email);

  document.getElementById("saldo-pontos").textContent =
    saldo;

  const mensagem = document.getElementById(
    "mensagem-recompensa"
  );

  if (saldo >= REGRAS_FIDELIDADE.custoRecompensa) {
    mensagem.textContent =
      "Você já pode utilizar uma recompensa " +
      "de R$ 10,00 na próxima compra!";
  } else {
    mensagem.textContent =
      "Faltam " +
      (REGRAS_FIDELIDADE.custoRecompensa - saldo) +
      " pontos para sua próxima recompensa.";
  }

  const historico = document.getElementById(
    "historico-pontos"
  );

  const pedidos = lerPedidosFidelidade()
    .filter(pedido =>
      pedido.cliente?.email === usuario.email &&
      pedido.pagamento === "aprovado"
    )
    .reverse();


  historico.innerHTML = "";

  if (pedidos.length === 0) {
    historico.textContent =
      "Você ainda não possui histórico de pontos.";
  } else {
    const listaHistorico = document.createElement("ul");
    listaHistorico.className = "lista-historico-pontos";

    pedidos.forEach(function(pedido) {
      const linha = document.createElement("li");
      linha.className = "linha-resumo";


    const detalhes = document.createElement("span");
    detalhes.textContent =
      pedido.id + " — " + pedido.status;

    const pontos = document.createElement("strong");


    if (pedido.status === "Cancelado") {
      pontos.textContent =
        "Pedido cancelado — pontos desconsiderados";
    } else {

      const ganhos = Number.isFinite(
        Number(pedido.pontosGanhos)
      )
        ? Number(pedido.pontosGanhos)
        : Math.floor(Number(pedido.total) || 0);

      const usados = Number(
        pedido.pontosUtilizados
      ) || 0;


      pontos.textContent =
        ganhos + " pontos ganhos; " +
        usados + " pontos utilizados";

    }


      linha.append(detalhes, pontos);
      listaHistorico.appendChild(linha);
    });

    historico.appendChild(listaHistorico);
  }
}

