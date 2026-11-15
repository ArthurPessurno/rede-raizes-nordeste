

const usuarioDados = obterUsuarioAtual();

if (!usuarioEhCliente()) {
  window.location.replace("login.html");
} else {
  iniciarPaginaDados();
}


function lerListaLocal(chave) {
  try {
    const dados = JSON.parse(
      localStorage.getItem(chave) || "[]"
    );

    if (!Array.isArray(dados)) {
      throw new Error("Formato inválido");
    }

    return dados;
  } catch {
    throw new Error(
      "Não foi possível ler os dados de " + chave + "."
    );
  }
}

function pedidosDoUsuario() {
  return lerListaLocal("pedidos").filter(
    pedido =>
      pedido.cliente?.email === usuarioDados.email
  );
}

function calcularSaldoLocal(pedidos) {
  let ganhos = 0;
  let utilizados = 0;

  pedidos.forEach(function(pedido) {
    if (
      pedido.status === "Cancelado" ||
      pedido.pagamento !== "aprovado"
    ) {
      return;
    }

    const pontos = Number(pedido.pontosGanhos);

    ganhos += Number.isFinite(pontos)
      ? Math.max(0, pontos)
      : Math.max(0, Math.floor(Number(pedido.total) || 0));

    utilizados += Math.max(
      0,
      Number(pedido.pontosUtilizados) || 0
    );
  });

  return ganhos - utilizados;
}

function mostrarMensagem(texto) {
  document.getElementById("mensagem-dados")
    .textContent = texto;
}

function atualizarResumo() {
  const pedidos = pedidosDoUsuario();

  document.getElementById("dados-nome")
    .textContent = usuarioDados.nome;

  document.getElementById("dados-email")
    .textContent = usuarioDados.email;

  document.getElementById("dados-pedidos")
    .textContent =
      "Pedidos registrados: " + pedidos.length;

  document.getElementById("dados-pontos")
    .textContent =
      "Saldo de fidelidade: " +
      calcularSaldoLocal(pedidos) + " pontos.";
}

function exportarDados() {
  try {
    const cadastro = lerListaLocal(
      "clientesCadastrados"
    ).find(
      cliente => cliente.email === usuarioDados.email
    );

    const dados = {
      exportadoEm: new Date().toISOString(),
      conta: {
        nome: usuarioDados.nome,
        email: usuarioDados.email,
        perfil: usuarioDados.perfil
      },
      cadastroLocal: cadastro || null,
      pedidos: pedidosDoUsuario()
    };

    const arquivo = new Blob(
      [JSON.stringify(dados, null, 2)],
      { type: "application/json" }
    );

    const endereco = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = endereco;
    link.download = "meus-dados-rede-raizes.json";


    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(function() {
      URL.revokeObjectURL(endereco);
    }, 1000);

    mostrarMensagem(
      "Download iniciado. Verifique os arquivos baixados " +
      "para localizar meus-dados-rede-raizes.json."
    );

  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

function excluirDados() {
  try {
    const pedidos = lerListaLocal("pedidos");

    const pedidosCliente = pedidos.filter(
      pedido =>
        pedido.cliente?.email === usuarioDados.email
    );

    const statusPermitidos = [
      "Retirado",
      "Cancelado"
    ];

    const existePedidoPendente = pedidosCliente.some(
      pedido => !statusPermitidos.includes(pedido.status)
    );

    if (existePedidoPendente) {
      mostrarMensagem(
        "Existem pedidos ainda não finalizados. " +
        "A exclusão local não pode continuar."
      );
      return;
    }

    const confirmar = window.confirm(
      "Deseja excluir seus dados locais? " +
      "Esta ação não poderá ser desfeita."
    );

    if (!confirmar) return;

    const clientes = lerListaLocal(
      "clientesCadastrados"
    );

    const outrosPedidos = pedidos.filter(
      pedido =>
        pedido.cliente?.email !== usuarioDados.email
    );

    const outrosClientes = clientes.filter(
      cliente => cliente.email !== usuarioDados.email
    );


    const pedidosAnteriores = localStorage.getItem("pedidos");
    const clientesAnteriores = localStorage.getItem(
      "clientesCadastrados"
    );

    try {
      localStorage.setItem(
        "pedidos",
        JSON.stringify(outrosPedidos)
      );

      localStorage.setItem(
        "clientesCadastrados",
        JSON.stringify(outrosClientes)
      );
    } catch (erro) {
      try {
        if (pedidosAnteriores === null) {
          localStorage.removeItem("pedidos");
        } else {
          localStorage.setItem("pedidos", pedidosAnteriores);
        }

        if (clientesAnteriores === null) {
          localStorage.removeItem("clientesCadastrados");
        } else {
          localStorage.setItem(
            "clientesCadastrados",
            clientesAnteriores
          );
        }
      } catch {
        throw new Error(
          "Falha ao excluir os dados e restaurar os registros. " +
          "Verifique o armazenamento do navegador."
        );
      }

      throw new Error(
        "Não foi possível concluir a exclusão. " +
        "Os registros anteriores foram restaurados."
      );
    }

    sessionStorage.removeItem("usuarioLogado");


    alert(
      "Dados demonstrativos excluídos. " +
      "Sua sessão será encerrada."
    );

    window.location.replace("index.html");
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

function iniciarPaginaDados() {
  try {
    atualizarResumo();
  } catch (erro) {
    mostrarMensagem(erro.message);
    document.getElementById("exportar-dados")
      .disabled = true;
    document.getElementById("excluir-dados")
      .disabled = true;
    return;
  }

  document.getElementById("exportar-dados")
    .addEventListener("click", exportarDados);

  document.getElementById("excluir-dados")
    .addEventListener("click", excluirDados);
}
