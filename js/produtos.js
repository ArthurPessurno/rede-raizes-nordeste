
const PRODUTOS_INICIAIS = [
  {
    id: 1,
    nome: "Baião de Dois",
    descricao: "Arroz, feijão, queijo coalho e temperos nordestinos.",
    categoria: "Pratos principais",
    precos: {
      centro: 29.90,
      shopping: 34.90,
      bairro: 27.90
    },
    disponivel: {
      centro: true,
      shopping: true,
      bairro: true
    }
  },
  {
    id: 2,
    nome: "Carne de Sol com Macaxeira",
    descricao: "Carne de sol acompanhada de macaxeira e manteiga.",
    categoria: "Pratos principais",
    precos: {
      centro: 42.90,
      shopping: 47.90,
      bairro: 39.90
    },
    disponivel: {
      centro: true,
      shopping: true,
      bairro: false
    }
  },
  {
    id: 3,
    nome: "Cuscuz Nordestino",
    descricao: "Cuscuz de milho acompanhado de ovos e queijo.",
    categoria: "Café e lanches",
    precos: {
      centro: 18.90,
      shopping: 21.90,
      bairro: 16.90
    },
    disponivel: {
      centro: true,
      shopping: false,
      bairro: true
    }
  },
  {
    id: 4,
    nome: "Tapioca de Frango",
    descricao: "Tapioca recheada com frango desfiado e queijo.",
    categoria: "Café e lanches",
    precos: {
      centro: 19.90,
      shopping: 23.90,
      bairro: 18.90
    },
    disponivel: {
      centro: true,
      shopping: true,
      bairro: true
    }
  },
  {
    id: 5,
    nome: "Cartola Nordestina",
    descricao: "Banana, queijo, canela e açúcar.",
    categoria: "Sobremesas",
    precos: {
      centro: 15.90,
      shopping: 18.90,
      bairro: 14.90
    },
    disponivel: {
      centro: true,
      shopping: true,
      bairro: true
    }
  }
];

function obterProdutos() {
  const salvos = localStorage.getItem("produtos");

  if (salvos !== null) {
    try {
      const produtos = JSON.parse(salvos);
      if (Array.isArray(produtos)) return produtos;
    } catch {
      // Recupera o catálogo inicial se os dados forem inválidos.
    }
  }

  salvarProdutos(PRODUTOS_INICIAIS);
  return PRODUTOS_INICIAIS;
}

function salvarProdutos(produtos) {
  localStorage.setItem(
    "produtos",
    JSON.stringify(produtos)
  );
}
