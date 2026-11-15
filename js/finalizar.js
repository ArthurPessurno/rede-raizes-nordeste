
const usuarioSalvo = sessionStorage.getItem("usuarioLogado");
const unidade = localStorage.getItem("unidadeSelecionada");

const nomesUnidades = {
  centro: "Unidade Centro",
  shopping: "Unidade Shopping",
  bairro: "Unidade Bairro"
};

const resumoProdutos = document.getElementById("resumo-produtos");
const valorFinal = document.getElementById("valor-final");
const formPagamento = document.getElementById("form-pagamento");
const mensagemPagamento = document.getElementById("mensagem-pagamento");
const areaPagamento = document.getElementById("area-pagamento");
const confirmacaoPedido = document.getElementById("confirmacao-pedido");

let usuario = null;
let carrinho = [];
let total = 0;

let pagamentoConcluido = false;
let descontoAplicado = 0;

const checkboxRecompensa = document.getElementById(
  "usar-recompensa"
);

const saldoCheckout = document.getElementById(
  "saldo-checkout"
);

const avisoRecompensa = document.getElementById(
  "aviso-recompensa"
);

const detalhesDesconto = document.getElementById(
  "detalhes-desconto"
);


function mostrarErroPagamento(mensagem, campo = null) {
  mensagemPagamento.className = "mensagem-erro";
  mensagemPagamento.textContent = mensagem;

  if (campo) {
    campo.setAttribute("aria-invalid", "true");
    campo.setAttribute(
      "aria-describedby",
      "mensagem-pagamento"
    );
    campo.focus();
  }
}

function limparErrosPagamento() {
  const campos = [
    document.getElementById("forma-pagamento"),
    document.getElementById("resultado-simulacao")
  ];

  campos.forEach(function(campo) {
    campo.removeAttribute("aria-invalid");
    campo.removeAttribute("aria-describedby");
  });

  mensagemPagamento.className = "";
  mensagemPagamento.textContent = "";
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// Verifica se existe um usuário autenticado.
if (!usuarioSalvo) {
  window.location.replace("login.html");
} else if (!nomesUnidades[unidade]) {
  window.location.replace("index.html");
} else {
  usuario = JSON.parse(usuarioSalvo);

  carrinho = JSON.parse(
    localStorage.getItem("carrinho") || "[]"
  ).filter(item => item.unidade === unidade);

  if (carrinho.length === 0) {
    window.location.replace("carrinho.html");
  } else {
    
if (exigirPerfil("cliente")) {
  iniciarFinalizacao();
}

  }
}


function iniciarFinalizacao() {
  const validacao = validarCarrinhoAtual();

  if (!validacao.valido) {
    alert(validacao.mensagem);
    window.location.replace("carrinho.html");
    return;
  }

  document.getElementById("cliente-pedido").textContent =
    "Cliente: " + usuario.nome;


  document.getElementById("unidade-pedido").textContent =
    "Unidade: " + nomesUnidades[unidade];

  resumoProdutos.innerHTML = "";
  total = 0;

  carrinho.forEach(function(item) {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;

    const linha = document.createElement("div");
    linha.className = "linha-resumo";

    const nome = document.createElement("span");
    nome.textContent =
      item.quantidade + "x " + item.nome;

    const valor = document.createElement("strong");
    valor.textContent = formatarMoeda(subtotal);

    linha.append(nome, valor);
    resumoProdutos.appendChild(linha);
  });

  
atualizarRecompensa();

}

function atualizarRecompensa() {
  const saldo = calcularSaldoPontos(usuario.email);

  saldoCheckout.textContent =
    "Seu saldo: " + saldo + " pontos.";

  const disponivel = podeUsarRecompensa(
    usuario.email,
    total
  );

  checkboxRecompensa.disabled = !disponivel;

  if (!disponivel) {
    checkboxRecompensa.checked = false;
  }

  descontoAplicado =
    checkboxRecompensa.checked && disponivel
      ? REGRAS_FIDELIDADE.descontoRecompensa
      : 0;

  const totalComDesconto = Math.max(
    0,
    total - descontoAplicado
  );

  valorFinal.textContent = formatarMoeda(
    totalComDesconto
  );

  detalhesDesconto.textContent = descontoAplicado > 0
    ? " (desconto de " +
      formatarMoeda(descontoAplicado) + " aplicado)"
    : "";


  if (!disponivel) {
    avisoRecompensa.textContent =
      "Acumule 100 pontos para liberar o desconto.";
  } else if (checkboxRecompensa.checked) {
    avisoRecompensa.textContent =
      "Desconto aplicado. Total atualizado: " +
      formatarMoeda(totalComDesconto) + ".";
  } else {
    avisoRecompensa.textContent =
      "Você pode utilizar sua recompensa nesta compra. " +
      "Total: " + formatarMoeda(totalComDesconto) + ".";
  }

}

checkboxRecompensa.addEventListener(
  "change",
  atualizarRecompensa
);

function validarCarrinhoAtual() {
  const produtosAtuais = obterProdutos();

  const carrinhoSalvo = JSON.parse(
    localStorage.getItem("carrinho") || "[]"
  ).filter(item => item.unidade === unidade);

  if (carrinhoSalvo.length === 0) {
    return {
      valido: false,
      mensagem: "Seu carrinho está vazio."
    };
  }

  if (carrinhoSalvo.length !== carrinho.length) {
    return {
      valido: false,
      mensagem: "Seu carrinho foi alterado. Revise os itens."
    };
  }

  for (const item of carrinhoSalvo) {
    const produto = produtosAtuais.find(
      p => p.id === item.id
    );

    if (!produto || !produto.disponivel?.[unidade]) {
      return {
        valido: false,
        mensagem:
          "O produto " + item.nome +
          " não está mais disponível."
      };
    }

    const precoAtual = Number(produto.precos?.[unidade]);

    if (!Number.isFinite(precoAtual) ||
        precoAtual <= 0 ||
        Math.round(precoAtual * 100) !==
        Math.round(Number(item.preco) * 100)) {
      return {
        valido: false,
        mensagem:
          "O preço de " + item.nome +
          " foi alterado. Revise seu carrinho."
      };
    }
  }

  // Confere se os itens continuam iguais aos
  // apresentados quando a finalização foi aberta.
  const itensIguais = carrinho.every(item => {
    const atual = carrinhoSalvo.find(
      p => p.id === item.id
    );

    return atual &&
      Number(atual.quantidade) === Number(item.quantidade) &&
      Math.round(Number(atual.preco) * 100) ===
      Math.round(Number(item.preco) * 100);
  });

  if (!itensIguais) {
    return {
      valido: false,
      mensagem: "Os itens do carrinho foram alterados."
    };
  }

  return {
    valido: true,
    mensagem: ""
  };
}

function gerarNumeroPedido() {
  return "RN-" + Date.now() + "-" +
    Math.floor(Math.random() * 1000);
}


formPagamento.addEventListener("submit", function(evento) {
  evento.preventDefault();

  if (pagamentoConcluido) return;

  limparErrosPagamento();


  if (!usuarioEhCliente()) {
    alert("Entre com uma conta de cliente para pagar.");
    window.location.replace("login.html");
    return;
  }

  const validacao = validarCarrinhoAtual();

  if (!validacao.valido) {
    alert(
      validacao.mensagem +
      "\nVocê será direcionado ao carrinho."
    );

    window.location.replace("carrinho.html");
    return;
  }

  const forma = document.getElementById("forma-pagamento").value;

  const resultado = document.getElementById("resultado-simulacao").value;


  if (!forma || !resultado) {
    const campoInvalido = !forma
      ? document.getElementById("forma-pagamento")
      : document.getElementById("resultado-simulacao");

    mostrarErroPagamento(
      "Escolha a forma de pagamento e o resultado da simulação.",
      campoInvalido
    );
    return;
  }



  if (resultado === "recusado") {
    mostrarErroPagamento(
      "Pagamento recusado. Você pode tentar novamente.",
      document.getElementById("resultado-simulacao")
    );
    return;
  }


  
// Confere novamente o saldo antes da aprovação.
if (checkboxRecompensa.checked &&
    !podeUsarRecompensa(usuario.email, total)) {

  atualizarRecompensa();

  mostrarErroPagamento(
    "O desconto não está mais disponível. " +
    "Revise o total antes de tentar novamente."
  );

  checkboxRecompensa.focus();
  return;

}

pagamentoConcluido = true;

const pontosUtilizados = checkboxRecompensa.checked
  ? REGRAS_FIDELIDADE.custoRecompensa
  : 0;

const totalPago = Math.max(
  0,
  total - descontoAplicado
);


  const pedido = {
    id: gerarNumeroPedido(),
    cliente: {
      nome: usuario.nome,
      email: usuario.email
    },
    unidade: unidade,
    itens: carrinho,
    
subtotal: total,
desconto: descontoAplicado,
total: totalPago,
pontosGanhos: calcularPontosCompra(totalPago),
pontosUtilizados: pontosUtilizados,

    formaPagamento: forma,
    pagamento: "aprovado",
    status: "Pedido recebido",
    data: new Date().toISOString(),
    pontosCreditados: false
  };

  const pedidos = JSON.parse(
    localStorage.getItem("pedidos") || "[]"
  );

  pedidos.push(pedido);

  localStorage.setItem("pedidos", JSON.stringify(pedidos));

  // Limpa apenas os produtos da unidade atual.
  const outrosItens = JSON.parse(
    localStorage.getItem("carrinho") || "[]"
  ).filter(item => item.unidade !== unidade);

  localStorage.setItem("carrinho", JSON.stringify(outrosItens));

  areaPagamento.hidden = true;
  confirmacaoPedido.hidden = false;

  document.getElementById("numero-pedido").textContent =
    "Número do pedido: " + pedido.id;


  document.getElementById("status-pedido").textContent =
    "Status: " + pedido.status;

  mensagemPagamento.textContent = "";

  confirmacaoPedido.focus();
});

