
const REGRAS_FIDELIDADE = {
  pontosPorReal: 1,
  custoRecompensa: 100,
  descontoRecompensa: 10
};

function lerPedidosFidelidade() {
  try {
    const pedidos = JSON.parse(
      localStorage.getItem("pedidos") || "[]"
    );

    return Array.isArray(pedidos) ? pedidos : [];
  } catch {
    return [];
  }
}

function calcularSaldoPontos(email) {
  if (!email) return 0;

  const pedidos = lerPedidosFidelidade();

  let pontosGanhos = 0;
  let pontosUtilizados = 0;

  pedidos.forEach(function(pedido) {
    if (pedido.cliente?.email !== email) return;

    // Pedidos cancelados não geram pontos nem
    // consomem recompensas.
    if (pedido.status === "Cancelado") return;

    if (pedido.pagamento !== "aprovado") return;

    const pontosPedido = Number.isFinite(
      Number(pedido.pontosGanhos)
    )
      ? Number(pedido.pontosGanhos)
      : Math.floor(Number(pedido.total) || 0);

    pontosGanhos += Math.max(0, pontosPedido);

    pontosUtilizados += Math.max(
      0,
      Number(pedido.pontosUtilizados) || 0
    );
  });

  return pontosGanhos - pontosUtilizados;
}

function calcularPontosCompra(valorPago) {
  return Math.max(
    0,
    Math.floor((valorPago + 0.000001) *
      REGRAS_FIDELIDADE.pontosPorReal)
  );
}

function podeUsarRecompensa(email, subtotal) {
  return (
    calcularSaldoPontos(email) >=
      REGRAS_FIDELIDADE.custoRecompensa &&
    subtotal >= REGRAS_FIDELIDADE.descontoRecompensa
  );
}
