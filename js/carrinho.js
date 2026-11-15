
const unidade = localStorage.getItem("unidadeSelecionada");

const lista = document.getElementById("lista-itens-carrinho");

const totalElemento = document.getElementById("total-carrinho");
const botaoFinalizar = document.getElementById("finalizar-pedido");
const aviso = document.getElementById("aviso-carrinho");

const nomesUnidades = {
  centro: "Unidade Centro",
  shopping: "Unidade Shopping",
  bairro: "Unidade Bairro"
};

if (!nomesUnidades[unidade]) {
  window.location.href = "index.html";
}

document.getElementById("unidade-carrinho").textContent =
  nomesUnidades[unidade] || "";

 
function verificarProdutosCarrinho() {
  const unidade = localStorage.getItem(
    "unidadeSelecionada"
  );

  const produtosAtuais = obterProdutos();

  const carrinho = JSON.parse(
    localStorage.getItem("carrinho") || "[]"
  );

  let houveAlteracao = false;
  let existeIndisponivel = false;

  const carrinhoAtualizado = carrinho.map(item => {
    if (item.unidade !== unidade) {
      return item;
    }

    const produto = produtosAtuais.find(
      p => p.id === item.id
    );

    if (!produto || !produto.disponivel[unidade]) {
      existeIndisponivel = true;
      return {
        ...item,
        indisponivel: true
      };
    }

    const precoAtual = Number(
      produto.precos[unidade]
    );

    if (Number(item.preco) !== precoAtual) {
      houveAlteracao = true;
    }

    return {
      ...item,
      nome: produto.nome,
      preco: precoAtual,
      indisponivel: false
    };
  });

  localStorage.setItem(
    "carrinho",
    JSON.stringify(carrinhoAtualizado)
  );

  return {
    houveAlteracao,
    existeIndisponivel
  };
}
 
function obterCarrinho() {
  return JSON.parse(localStorage.getItem("carrinho") || "[]")
    .filter(item => item.unidade === unidade);
}


function salvarCarrinho(carrinho) {
  const todosItens = JSON.parse(
    localStorage.getItem("carrinho") || "[]"
  );

  const outrasUnidades = todosItens.filter(
    item => item.unidade !== unidade
  );

  localStorage.setItem(
    "carrinho",
    JSON.stringify([...outrasUnidades, ...carrinho])
  );
}


function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}


function alterarQuantidade(id, variacao, acao) {
  const carrinho = obterCarrinho();
  const item = carrinho.find(produto => produto.id === id);

  if (!item) return;

  const nomeProduto = item.nome;

  item.quantidade += variacao;

  const atualizado = carrinho.filter(
    produto => produto.quantidade > 0
  );

  salvarCarrinho(atualizado);
  mostrarCarrinho();

  const botaoAtualizado = Array.from(
    lista.querySelectorAll("button")
  ).find(botao =>
    botao.dataset.produtoId === String(id) &&
    botao.dataset.acao === acao
  );

  if (botaoAtualizado) {
    botaoAtualizado.focus();
  } else {
    botaoFinalizar.focus();
  }

  aviso.textContent =
    atualizado.some(produto => produto.id === id)
      ? "Quantidade de " + nomeProduto +
        " atualizada para " +
        atualizado.find(produto => produto.id === id).quantidade + "."
      : nomeProduto + " removido do carrinho.";
}



function removerProduto(id) {
  const carrinhoAtual = obterCarrinho();

  const produtoRemovido = carrinhoAtual.find(
    produto => produto.id === id
  );

  const carrinho = carrinhoAtual.filter(
    produto => produto.id !== id
  );

  salvarCarrinho(carrinho);
  mostrarCarrinho();

  aviso.textContent = produtoRemovido
    ? produtoRemovido.nome + " removido do carrinho."
    : "Produto removido do carrinho.";

  const primeiroBotao = lista.querySelector("button");

  if (primeiroBotao) {
    primeiroBotao.focus();

  } else {
    document.getElementById(
      "titulo-itens-carrinho"
    ).focus();
  }
}



function mostrarCarrinho() {
  const carrinho = obterCarrinho();

  lista.innerHTML = "";
  aviso.textContent = "";

  if (carrinho.length === 0) {
    lista.textContent = "Seu carrinho está vazio.";
    totalElemento.textContent = formatarMoeda(0);
    botaoFinalizar.disabled = true;
    return;
  }

  let total = 0;

  carrinho.forEach(function(item) {
    total += item.preco * item.quantidade;

    const card = document.createElement("article");
    card.className = "item-carrinho";

    const titulo = document.createElement("h3");
    titulo.textContent = item.nome;

    const preco = document.createElement("p");
    preco.textContent = formatarMoeda(item.preco);

    const quantidade = document.createElement("p");
    quantidade.textContent = "Quantidade: " + item.quantidade;

    const controles = document.createElement("div");
    controles.className = "controles-carrinho";


    const diminuir = document.createElement("button");
    diminuir.type = "button";
    diminuir.textContent = "−";
    diminuir.setAttribute(
      "aria-label",
      "Diminuir quantidade de " + item.nome
    );
    diminuir.onclick = () =>
      alterarQuantidade(item.id, -1, "diminuir");

    const aumentar = document.createElement("button");
    aumentar.type = "button";
    aumentar.textContent = "+";
    aumentar.setAttribute(
      "aria-label",
      "Aumentar quantidade de " + item.nome
    );
    aumentar.onclick = () =>
      alterarQuantidade(item.id, 1, "aumentar");

    const remover = document.createElement("button");
    remover.type = "button";
    remover.textContent = "Remover";
    remover.setAttribute(
      "aria-label",
      "Remover " + item.nome + " do carrinho"
    );
    remover.onclick = () => removerProduto(item.id);


  
    diminuir.dataset.produtoId = String(item.id);
    diminuir.dataset.acao = "diminuir";

    aumentar.dataset.produtoId = String(item.id);
    aumentar.dataset.acao = "aumentar";

    remover.dataset.produtoId = String(item.id);
    remover.dataset.acao = "remover";

    controles.append(diminuir, aumentar, remover);

    card.append(titulo, preco, quantidade, controles);
    lista.appendChild(card);
  });

  totalElemento.textContent = formatarMoeda(total);
  botaoFinalizar.disabled = false;
}



botaoFinalizar.addEventListener("click", function() {
  const usuario = sessionStorage.getItem("usuarioLogado");

  
if (!usuarioEhCliente()) {
  alert("Entre com uma conta de cliente para finalizar pedidos.");
  window.location.href = "login.html";
  return;
}


  const carrinho = obterCarrinho();

  if (carrinho.length === 0) {
    aviso.textContent =
      "Adicione produtos antes de finalizar.";
    return;
  }

  // Cliente autenticado: abre o pagamento.
  
const verificacao = verificarProdutosCarrinho();

if (verificacao.existeIndisponivel) {
  alert(
    "Existem produtos indisponíveis no carrinho. " +
    "Remova-os antes de continuar."
  );
  mostrarCarrinho();
  return;
}

if (verificacao.houveAlteracao) {
  alert(
    "Os preços foram atualizados. " +
    "Confira o novo total antes de finalizar."
  );
  mostrarCarrinho();
  return;
}

window.location.href = "finalizar.html";

});




const verificacaoCarrinho = verificarProdutosCarrinho();

mostrarCarrinho();

if (verificacaoCarrinho.houveAlteracao) {
  alert(
    "Um ou mais produtos tiveram seus preços atualizados. " +
    "Confira os valores antes de finalizar."
  );
}

if (verificacaoCarrinho.existeIndisponivel) {
  alert(
    "Seu carrinho contém produtos indisponíveis. " +
    "Remova esses itens antes de finalizar."
  );
}

