

const usuario = obterUsuarioAtual();


const listaPedidos = document.getElementById("lista-pedidos");
const mensagem = document.getElementById("mensagem-pedidos");

const nomesUnidades = {
  centro: "Unidade Centro",
  shopping: "Unidade Shopping",
  bairro: "Unidade Bairro"
};



function obterPedidos() {
  try {
    const pedidos = JSON.parse(
      localStorage.getItem("pedidos") || "[]"
    );

    return Array.isArray(pedidos) ? pedidos : [];
  } catch {
    return [];
  }
}

function salvarPedidos(pedidos) {
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function pedidosDoCliente() {
  return obterPedidos().filter(pedido =>
    pedido.cliente?.email === usuario?.email
  );
}

function criarElemento(tag, texto, classe = "") {
  const elemento = document.createElement(tag);
  elemento.textContent = texto;
  if (classe) elemento.className = classe;
  return elemento;
}

function cancelarPedido(id) {
  const pedidos = obterPedidos();

  const pedido = pedidos.find(p =>
    p.id === id && p.cliente?.email === usuario?.email
  );

  if (!pedido) {
    mensagem.textContent = "Pedido não encontrado.";
    return;
  }

  if (pedido.status !== "Pedido recebido") {
    mensagem.textContent =
      "Este pedido não pode mais ser cancelado.";
    return;
  }

  const confirmar = window.confirm(
    "Deseja cancelar este pedido?"
  );

  if (!confirmar) return;

  pedido.status = "Cancelado";
  pedido.dataCancelamento = new Date().toISOString();

  salvarPedidos(pedidos);

  

  mostrarPedidos();

  mensagem.textContent =
    "Pedido " + pedido.id + " cancelado.";

  const tituloPedido = Array.from(
    listaPedidos.querySelectorAll("h3")
  ).find(titulo =>
    titulo.textContent === "Pedido " + pedido.id
  );

  if (tituloPedido) {
    tituloPedido.setAttribute("tabindex", "-1");
    tituloPedido.focus();
  }

}


function mostrarPedidos() {
  listaPedidos.innerHTML = "";

  if (!usuario || usuario.perfil !== "cliente") return;


  document.getElementById("nome-cliente").textContent =
    "Cliente: " + usuario.nome;

  const pedidos = pedidosDoCliente().reverse();

  if (pedidos.length === 0) {
    listaPedidos.appendChild(
      criarElemento("p", "Você ainda não possui pedidos.")
    );
    return;
  }

  pedidos.forEach(function(pedido) {

    const card = document.createElement("article");
    card.className = "card-pedido";

    const titulo = criarElemento(
      "h3",
      "Pedido " + pedido.id
    );

    titulo.id = "titulo-pedido-" + String(pedido.id)
      .replace(/[^a-zA-Z0-9_-]/g, "-");

    card.setAttribute("aria-labelledby", titulo.id);
    card.appendChild(titulo);


    card.appendChild(
      criarElemento(
        "p",
        "Unidade: " +
        (nomesUnidades[pedido.unidade] || pedido.unidade)
      )
    );

    card.appendChild(
      criarElemento(
        "p",
        "Data: " + new Date(pedido.data)
          .toLocaleString("pt-BR")
      )
    );

    card.appendChild(
      criarElemento(
        "p",
        "Total: " + formatarMoeda(pedido.total)
      )
    );

    const status = criarElemento(
      "p",
      "Status: " + pedido.status,
      "status-pedido-atual"
    );

    card.appendChild(status);

    const itens = document.createElement("ul");

    pedido.itens.forEach(function(item) {
      itens.appendChild(
        criarElemento(
          "li",
          item.quantidade + "x " + item.nome
        )
      );
    });

    card.appendChild(itens);

    if (pedido.status === "Pedido recebido") {
      const botaoCancelar = document.createElement("button");
      botaoCancelar.type = "button";
      botaoCancelar.className = "botao-cancelar";

      botaoCancelar.textContent = "Cancelar pedido";
      botaoCancelar.setAttribute(
        "aria-label",
        "Cancelar pedido " + pedido.id
      );

      botaoCancelar.addEventListener("click", function() {

        cancelarPedido(pedido.id);
      });

      card.appendChild(botaoCancelar);
    }


    listaPedidos.appendChild(card);
  });
}



if (exigirPerfil("cliente")) {
  mostrarPedidos();
}

