
const unidadeSelecionada = localStorage.getItem(
  "unidadeSelecionada"
);

const nomesUnidades = {
  centro: "Unidade Centro",
  shopping: "Unidade Shopping",
  bairro: "Unidade Bairro"
};


const listaProdutos = document.getElementById("lista-produtos");
const textoUnidade = document.getElementById("unidade-atual");
const mensagemCardapio = document.getElementById(
  "mensagem-cardapio"
);

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function adicionarAoCarrinho(produto, preco) {
  const unidade = localStorage.getItem(
    "unidadeSelecionada"
  );

  let carrinho = JSON.parse(
    localStorage.getItem("carrinho") || "[]"
  );

  carrinho = carrinho.filter(
    item => item.unidade === unidade
  );

  const itemExistente = carrinho.find(
    item => item.id === produto.id
  );

  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: preco,
      quantidade: 1,
      unidade: unidade
    });
  }

  localStorage.setItem(
    "carrinho",
    JSON.stringify(carrinho)
  );


  mensagemCardapio.textContent =
    produto.nome + " adicionado ao carrinho!";

}

function obterPromocoesAtivas(unidade) {
  try {
    const dados = JSON.parse(
      localStorage.getItem("promocoes") || "[]"
    );

    if (!Array.isArray(dados)) return [];

    return dados.filter(promocao =>
      promocao.ativa === true &&
      promocao.unidade === unidade
    );
  } catch {
    return [];
  }
}

function mostrarPromocoesCardapio() {
  const secao = document.getElementById(
    "secao-promocoes"
  );

  const lista = document.getElementById(
    "lista-promocoes"
  );

  if (!secao || !lista) return;

  const promocoes = obterPromocoesAtivas(
    unidadeSelecionada
  );

  lista.innerHTML = "";

  if (promocoes.length === 0) {
    secao.hidden = true;
    return;
  }

  secao.hidden = false;

  promocoes.forEach(function(promocao) {
    const card = document.createElement("article");
    card.className = "card-promocao";

    const titulo = document.createElement("h3");
    titulo.textContent = promocao.nome;

    const descricao = document.createElement("p");
    descricao.textContent = promocao.descricao;

    card.append(titulo, descricao);
    lista.appendChild(card);
  });
}

function mostrarCardapio() {
  if (!nomesUnidades[unidadeSelecionada]) {
    window.location.replace("index.html");
    return;
  }

  textoUnidade.textContent =
    "Você está comprando na " +
    nomesUnidades[unidadeSelecionada];

  listaProdutos.innerHTML = "";

  const produtos = obterProdutos();

  if (produtos.length === 0) {
    listaProdutos.textContent =
      "Nenhum produto cadastrado.";
    return;
  }

  produtos.forEach(function(produto) {
    const disponivel = Boolean(
      produto.disponivel[unidadeSelecionada]
    );

    const preco = Number(
      produto.precos[unidadeSelecionada]
    );

    const card = document.createElement("article");
    card.className = "card-produto";

    const categoria = document.createElement("span");
    categoria.className = "categoria-produto";
    categoria.textContent = produto.categoria;

    const titulo = document.createElement("h3");
    titulo.textContent = produto.nome;

    const descricao = document.createElement("p");
    descricao.textContent = produto.descricao;

    const valor = document.createElement("strong");
    valor.className = "preco-produto";
    valor.textContent = formatarPreco(preco);

    const botao = document.createElement("button");
    botao.type = "button";

    botao.textContent = disponivel
      ? "Adicionar ao carrinho"
      : "Indisponível";

    botao.setAttribute(
      "aria-label",
      disponivel
        ? "Adicionar " + produto.nome + " ao carrinho"
        : produto.nome + " indisponível nesta unidade"
    );

    botao.disabled = !disponivel;


    if (disponivel) {
      botao.addEventListener("click", function() {
        adicionarAoCarrinho(produto, preco);
      });
    }


    card.append(
      categoria,
      titulo,
      descricao,
      valor
    );

    if (!disponivel) {
      const aviso = document.createElement("p");
      aviso.className = "aviso-indisponivel";
      aviso.textContent =
        "Produto indisponível nesta unidade.";

      card.appendChild(aviso);
    }

    card.appendChild(botao);


    listaProdutos.appendChild(card);
  });
}

const linkLogin = document.getElementById("link-login");
const botaoSair = document.getElementById("botao-sair");

function atualizarSessao() {
  const usuario = sessionStorage.getItem(
    "usuarioLogado"
  );

  if (linkLogin) linkLogin.hidden = Boolean(usuario);
  if (botaoSair) botaoSair.hidden = !usuario;
}

if (botaoSair) {
  botaoSair.addEventListener("click", function() {
    sessionStorage.removeItem("usuarioLogado");
    atualizarSessao();
  });
}


mostrarCardapio();
mostrarPromocoesCardapio();
atualizarSessao();

