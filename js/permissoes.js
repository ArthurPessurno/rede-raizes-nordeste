

function obterUsuarioAtual() {
  try {
    const dados = sessionStorage.getItem("usuarioLogado");

    if (!dados) return null;

    const usuario = JSON.parse(dados);

    if (
      !usuario ||
      typeof usuario !== "object" ||
      Array.isArray(usuario) ||
      typeof usuario.nome !== "string" ||
      !usuario.nome.trim() ||
      typeof usuario.email !== "string" ||
      !usuario.email.trim() ||
      !["cliente", "admin"].includes(usuario.perfil)
    ) {
      return null;
    }

    return usuario;
  } catch {
    return null;
  }
}


function usuarioEhCliente() {
  const usuario = obterUsuarioAtual();
  return usuario !== null && usuario.perfil === "cliente";
}

function usuarioEhAdmin() {
  const usuario = obterUsuarioAtual();
  return usuario !== null && usuario.perfil === "admin";
}

function exigirPerfil(perfil) {
  const usuario = obterUsuarioAtual();

  if (!usuario || usuario.perfil !== perfil) {
    window.location.replace("login.html");
    return false;
  }

  return true;
}

function sairDaConta() {
  sessionStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}
