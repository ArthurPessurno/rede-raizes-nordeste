


const usuarioAdmin = obterUsuarioAtual();

if (!usuarioAdmin || !usuarioEhAdmin()) {
  window.location.replace("login.html");

  throw new Error(
    "Acesso administrativo não autorizado nesta demonstração."
  );
}


const mensagemAdmin = document.getElementById("mensagem-admin");


document.getElementById("sair-admin").addEventListener(
  "click",
  function() {
    sairDaConta();
  }
);



const unidadesAdmin = ["centro", "shopping", "bairro"];

const nomesUnidadesAdmin = {
  centro: "Centro",
  shopping: "Shopping",
  bairro: "Bairro"
};

const estadosPedido = [
  "Pedido recebido",
  "Em preparação",
  "Pronto para retirada",
  "Retirado"
];

function informar(texto) {
  mensagemAdmin.textContent = texto;
}

function moeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function elemento(tag, texto) {
  const el = document.createElement(tag);
  el.textContent = texto;
  return el;
}

function lerPedidos() {
  try {
    const pedidos = JSON.parse(
      localStorage.getItem("pedidos") || "[]"
    );
    return Array.isArray(pedidos) ? pedidos : [];
  } catch {
    return [];
  }
}

function salvarPedidosAdmin(pedidos) {
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

// ===== PRODUTOS =====

const formProduto = document.getElementById("form-produto");
const listaProdutosAdmin = document.getElementById(
  "lista-produtos-admin"
);

function limparFormularioProduto() {
  formProduto.reset();
  document.getElementById("produto-id").value = "";

  unidadesAdmin.forEach(unidade => {
    document.getElementById(
      "disponivel-" + unidade
    ).checked = true;
  });
}

function editarProduto(id) {
  const produto = obterProdutos().find(p => p.id === id);
  if (!produto) return;

  document.getElementById("produto-id").value = produto.id;
  document.getElementById("produto-nome").value = produto.nome;
  document.getElementById("produto-descricao").value =
    produto.descricao;
  document.getElementById("produto-categoria").value =
    produto.categoria;

  unidadesAdmin.forEach(unidade => {
    document.getElementById(
      "preco-" + unidade
    ).value = produto.precos[unidade];

    document.getElementById(
      "disponivel-" + unidade
    ).checked = produto.disponivel[unidade];
  });


  const campoNome = document.getElementById("produto-nome");

  campoNome.focus();

}

function excluirProduto(id) {
  if (!confirm("Deseja excluir este produto do catálogo?")) {
    return;
  }

  const produtos = obterProdutos().filter(p => p.id !== id);

  salvarProdutos(produtos);
  mostrarProdutosAdmin();
  informar("Produto excluído do catálogo.");
}

function mostrarProdutosAdmin() {
  listaProdutosAdmin.innerHTML = "";

  obterProdutos().forEach(produto => {
    const card = document.createElement("article");
    card.className = "item-admin";

    card.appendChild(elemento("h4", produto.nome));
    card.appendChild(elemento("p", produto.categoria));

    unidadesAdmin.forEach(unidade => {
      const disponivel = produto.disponivel[unidade]
        ? "Disponível"
        : "Indisponível";

      card.appendChild(elemento(
        "p",
        nomesUnidadesAdmin[unidade] + ": " +
        moeda(produto.precos[unidade]) +
        " — " + disponivel
      ));
    });


    const editar = elemento("button", "Editar");
    editar.type = "button";
    editar.setAttribute(
      "aria-label",
      "Editar produto " + produto.nome
    );
    editar.onclick = () => editarProduto(produto.id);

    const excluir = elemento("button", "Excluir");
    excluir.type = "button";
    excluir.className = "botao-cancelar";
    excluir.setAttribute(
      "aria-label",
      "Excluir produto " + produto.nome
    );
    excluir.onclick = () => excluirProduto(produto.id);


    const acoes = document.createElement("div");
    acoes.className = "acoes-admin";
    acoes.append(editar, excluir);

    card.append(acoes);
    listaProdutosAdmin.appendChild(card);
  });
}

formProduto.addEventListener("submit", function(evento) {
  evento.preventDefault();

  const produtos = obterProdutos();
  const idAtual = document.getElementById("produto-id").value;

  const precos = {};
  const disponivel = {};

  unidadesAdmin.forEach(unidade => {
    precos[unidade] = Number(
      document.getElementById("preco-" + unidade).value
    );

    disponivel[unidade] = document.getElementById(
      "disponivel-" + unidade
    ).checked;
  });

  if (Object.values(precos).some(p => !Number.isFinite(p) || p <= 0)) {
    informar("Informe preços válidos e maiores que zero.");
    return;
  }

  const produto = {
    id: idAtual ? Number(idAtual) : Date.now(),
    nome: document.getElementById("produto-nome").value.trim(),
    descricao: document.getElementById(
      "produto-descricao"
    ).value.trim(),
    categoria: document.getElementById(
      "produto-categoria"
    ).value.trim(),
    precos,
    disponivel
  };

  const indice = produtos.findIndex(p => p.id === produto.id);

  if (indice >= 0) {
    produtos[indice] = produto;
  } else {
    produtos.push(produto);
  }

  salvarProdutos(produtos);
  limparFormularioProduto();
  mostrarProdutosAdmin();
  informar("Produto salvo com sucesso.");
});

document.getElementById("limpar-produto").addEventListener(
  "click",
  limparFormularioProduto
);

// ===== PEDIDOS =====

function avancarPedidoAdmin(id) {
  const pedidos = lerPedidos();
  const pedido = pedidos.find(p => p.id === id);

  if (!pedido) return;

  const indice = estadosPedido.indexOf(pedido.status);

  if (indice < 0 || indice >= estadosPedido.length - 1) {
    informar("Esse pedido não pode avançar.");
    return;
  }

  pedido.status = estadosPedido[indice + 1];


  salvarPedidosAdmin(pedidos);
  mostrarPedidosAdmin();

  informar(
    "Pedido " + pedido.id +
    " atualizado para: " + pedido.status
  );

  const lista = document.getElementById(
    "lista-pedidos-admin"
  );

  const botoes = lista.querySelectorAll("button");

  const botaoAtualizado = Array.from(botoes).find(
    botao => botao.getAttribute("aria-label") ===
      "Avançar status do pedido " + pedido.id
  );

  if (botaoAtualizado) {
    botaoAtualizado.focus();
  } else {
    const titulo = document.querySelector(
      "#pedidos-admin h2"
    );

    titulo.setAttribute("tabindex", "-1");
    titulo.focus();
  }

}

function mostrarPedidosAdmin() {
  const lista = document.getElementById("lista-pedidos-admin");
  lista.innerHTML = "";

  const pedidos = lerPedidos().reverse();

  if (pedidos.length === 0) {
    lista.textContent = "Nenhum pedido registrado.";
    return;
  }

  pedidos.forEach(pedido => {
    const card = document.createElement("article");
    card.className = "item-admin";

    card.appendChild(elemento("h4", pedido.id));
    card.appendChild(elemento(
      "p",
      "Cliente: " + (pedido.cliente?.nome || "Não informado")
    ));
    card.appendChild(elemento(
      "p",
      "Unidade: " +
      (nomesUnidadesAdmin[pedido.unidade] || pedido.unidade)
    ));
    card.appendChild(elemento(
      "p",
      "Total: " + moeda(pedido.total)
    ));
    card.appendChild(elemento(
      "p",
      "Status: " + pedido.status
    ));

    if (estadosPedido.includes(pedido.status) &&
        pedido.status !== "Retirado") {
 
      const botao = elemento("button", "Avançar status");
      botao.type = "button";

      botao.setAttribute(
        "aria-label",
        "Avançar status do pedido " + pedido.id
      );

      botao.onclick = () => avancarPedidoAdmin(pedido.id);

      card.appendChild(botao);

    }

    lista.appendChild(card);
  });
}

// ===== PROMOÇÕES =====

function obterPromocoes() {
  try {
    const promocoes = JSON.parse(
      localStorage.getItem("promocoes") || "[]"
    );
    return Array.isArray(promocoes) ? promocoes : [];
  } catch {
    return [];
  }
}

function mostrarPromocoes() {
  const lista = document.getElementById("lista-promocoes-admin");
  lista.innerHTML = "";

  obterPromocoes().forEach(promocao => {
    const card = document.createElement("article");
    card.className = "item-admin";

    card.appendChild(elemento("h4", promocao.nome));
    card.appendChild(elemento("p", promocao.descricao));
    card.appendChild(elemento(
      "p",
      "Unidade: " + nomesUnidadesAdmin[promocao.unidade]
    ));
    card.appendChild(elemento(
      "p",
      promocao.ativa ? "Ativa" : "Inativa"
    ));

    const botao = elemento(
      "button",
      promocao.ativa ? "Desativar" : "Ativar"
    );


    botao.type = "button";

    botao.setAttribute(
      "aria-label",
      (promocao.ativa ? "Desativar" : "Ativar") +
      " promoção " + promocao.nome
    );

    botao.dataset.promocaoId = String(promocao.id);

    botao.onclick = function() {
      const promocoes = obterPromocoes();
      const atual = promocoes.find(
        p => p.id === promocao.id
      );

      if (!atual) return;

      atual.ativa = !atual.ativa;

      localStorage.setItem(
        "promocoes",
        JSON.stringify(promocoes)
      );

      mostrarPromocoes();

      informar(
        "Promoção " + atual.nome +
        (atual.ativa ? " ativada." : " desativada.")
      );

      const lista = document.getElementById(
        "lista-promocoes-admin"
      );

      const botaoAtualizado = Array.from(
        lista.querySelectorAll("button")
      ).find(
        item => item.dataset.promocaoId ===
          String(promocao.id)
      );

      if (botaoAtualizado) {
        botaoAtualizado.focus();
      }
    };


    card.appendChild(botao);
    lista.appendChild(card);
  });
}

document.getElementById("form-promocao").addEventListener(
  "submit",
  function(evento) {
    evento.preventDefault();

    const promocoes = obterPromocoes();

    promocoes.push({
      id: Date.now(),
      nome: document.getElementById(
        "promocao-nome"
      ).value.trim(),
      descricao: document.getElementById(
        "promocao-descricao"
      ).value.trim(),
      unidade: document.getElementById(
        "promocao-unidade"
      ).value,
      ativa: true
    });

    localStorage.setItem(
      "promocoes",
      JSON.stringify(promocoes)
    );

    this.reset();
    mostrarPromocoes();
    informar("Promoção cadastrada.");
  }
);

// ===== RELATÓRIOS =====

function mostrarRelatorios() {
  const pedidos = lerPedidos();

  const aprovados = pedidos.filter(p =>
    p.pagamento === "aprovado" &&
    p.status !== "Cancelado"
  );

  const faturamento = aprovados.reduce(
    (soma, p) => soma + Number(p.total || 0),
    0
  );

  const ticketMedio = aprovados.length
    ? faturamento / aprovados.length
    : 0;

  const indicadores = document.getElementById(
    "indicadores-admin"
  );

  indicadores.innerHTML = "";

  [
    ["Pedidos válidos", aprovados.length],
    ["Faturamento simulado", moeda(faturamento)],
    ["Ticket médio", moeda(ticketMedio)],
    ["Pedidos cancelados", pedidos.filter(
      p => p.status === "Cancelado"
    ).length]
  ].forEach(([titulo, valor]) => {
    const card = document.createElement("div");
    card.className = "indicador-admin";
    card.appendChild(elemento("p", titulo));
    card.appendChild(elemento("strong", String(valor)));
    indicadores.appendChild(card);
  });

  const quantidades = {};

  aprovados.forEach(pedido => {
    pedido.itens.forEach(item => {
      quantidades[item.nome] =
        (quantidades[item.nome] || 0) +
        Number(item.quantidade);
    });
  });

  const ranking = document.getElementById("ranking-produtos");
  ranking.innerHTML = "";

  Object.entries(quantidades)
    .sort((a, b) => b[1] - a[1])
    .forEach(([nome, quantidade]) => {
      ranking.appendChild(elemento(
        "p",
        nome + " — " + quantidade + " unidades"
      ));
    });

  const vendas = document.getElementById("vendas-unidade");
  vendas.innerHTML = "";

  unidadesAdmin.forEach(unidade => {
    const total = aprovados
      .filter(p => p.unidade === unidade)
      .reduce((soma, p) => soma + Number(p.total || 0), 0);

    vendas.appendChild(elemento(
      "p",
      nomesUnidadesAdmin[unidade] + ": " + moeda(total)
    ));
  });
}

// ===== INICIALIZAÇÃO =====

mostrarProdutosAdmin();
mostrarPedidosAdmin();
mostrarPromocoes();
mostrarRelatorios();
