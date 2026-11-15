
const formAuth = document.getElementById("form-auth");
const tituloAuth = document.getElementById("titulo-auth");
const campoNome = document.getElementById("campo-nome");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const botaoAuth = document.getElementById("botao-auth");
const alternarAuth = document.getElementById("alternar-auth");

const mensagemAuth = document.getElementById("mensagem-auth");

const campoPrivacidade = document.getElementById(
  "campo-privacidade"
);

const confirmarPrivacidade = document.getElementById(
  "confirmar-privacidade"
);


const perfilCliente = document.getElementById("perfil-cliente");
const perfilAdmin = document.getElementById("perfil-admin");
const dicaAdmin = document.getElementById("dica-admin");

let modoCadastro = false;
let tipoPerfil = "cliente";


const contasDemo = [
  {
    nome: "Cliente Demonstração",
    email: "cliente@demo.local",
    senha: "demo123",
    perfil: "cliente"
  },
  {
    nome: "Administrador Demonstração",
    email: "admin@demo.local",
    senha: "admin123",
    perfil: "admin"
  }
];

// Cadastro local apenas para demonstração acadêmica.
// Não armazenamos a senha dos novos clientes.
function obterClientesCadastrados() {
  try {
    const dados = JSON.parse(
      localStorage.getItem("clientesCadastrados") || "[]"
    );

    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarClientesCadastrados(clientes) {
  localStorage.setItem(
    "clientesCadastrados",
    JSON.stringify(clientes)
  );
}


function atualizarTela() {
  const administrador = tipoPerfil === "admin";

  if (administrador) {
    modoCadastro = false;
  }


  campoNome.hidden = !modoCadastro;
  nomeInput.required = modoCadastro;

  campoPrivacidade.hidden = !modoCadastro;
  confirmarPrivacidade.required = modoCadastro;

  if (!modoCadastro) {
    confirmarPrivacidade.checked = false;
  }


  tituloAuth.textContent = administrador
    ? "Entrar como Administrador"
    : modoCadastro
      ? "Criar conta"
      : "Entrar como Cliente";

  botaoAuth.textContent = modoCadastro
    ? "Cadastrar"
    : "Entrar";

  alternarAuth.hidden = administrador;
  dicaAdmin.hidden = !administrador;

  alternarAuth.textContent = modoCadastro
    ? "Já tenho conta — Entrar"
    : "Não tenho conta — Cadastrar";

  perfilCliente.classList.toggle(
    "perfil-ativo",
    !administrador
  );


  perfilAdmin.classList.toggle(
    "perfil-ativo",
    administrador
  );

  perfilCliente.setAttribute(
    "aria-pressed",
    String(!administrador)
  );

  perfilAdmin.setAttribute(
    "aria-pressed",
    String(administrador)
  );


  senhaInput.autocomplete = modoCadastro
    ? "new-password"
    : "current-password";


  mensagemAuth.textContent = "";
  limparErrosAuth();
}


perfilCliente.addEventListener("click", function() {
  tipoPerfil = "cliente";
  modoCadastro = false;
  formAuth.reset();
  atualizarTela();
});

perfilAdmin.addEventListener("click", function() {
  tipoPerfil = "admin";
  modoCadastro = false;
  formAuth.reset();
  atualizarTela();
});


alternarAuth.addEventListener("click", function() {
  if (tipoPerfil === "admin") return;

  modoCadastro = !modoCadastro;
  formAuth.reset();
  atualizarTela();

  if (modoCadastro) {
    nomeInput.focus();
  } else {
    emailInput.focus();
  }
});


function limparErrosAuth() {
  [nomeInput, emailInput, senhaInput, confirmarPrivacidade]
    .forEach(function(campo) {
      campo.removeAttribute("aria-invalid");
      campo.removeAttribute("aria-describedby");
    });

  senhaInput.setAttribute(
    "aria-describedby",
    "ajuda-senha"
  );
}

function mostrarErroAuth(mensagem, campo = null) {
  mensagemAuth.textContent = mensagem;

  if (campo) {
    campo.setAttribute("aria-invalid", "true");

    const descricaoAnterior =
      campo.getAttribute("aria-describedby");

    const descricoes = new Set(
      (descricaoAnterior || "").split(/\s+/).filter(Boolean)
    );

    descricoes.add("mensagem-auth");

    campo.setAttribute(
      "aria-describedby",
      [...descricoes].join(" ")
    );

    campo.focus();
  }
}

function concluirLogin(conta) {
  sessionStorage.setItem(
    "usuarioLogado",
    JSON.stringify({
      nome: conta.nome,
      email: conta.email,
      perfil: conta.perfil
    })
  );

  if (conta.perfil === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "carrinho.html";
  }
}


formAuth.addEventListener("submit", function(evento) {
  evento.preventDefault();

  limparErrosAuth();
  mensagemAuth.textContent = "";

  const nome = nomeInput.value.trim();

  const email = emailInput.value.trim().toLowerCase();
  const senha = senhaInput.value;


  if (senha.length < 6) {
    mostrarErroAuth(
      "A senha deve ter pelo menos 6 caracteres.",
      senhaInput
    );
    return;
  }



  if (modoCadastro) {

    if (!nome) {
      mostrarErroAuth("Informe seu nome.", nomeInput);
      return;
    }



    if (!confirmarPrivacidade.checked) {
      mostrarErroAuth(
        "Leia e confirme a ciência do Aviso de Privacidade.",
        confirmarPrivacidade
      );
      return;
    }



   
const clientesCadastrados = obterClientesCadastrados();

const emailExistente =
  contasDemo.some(conta => conta.email === email) ||
  clientesCadastrados.some(conta => conta.email === email);


if (emailExistente) {
  mostrarErroAuth(
    "Este e-mail já está cadastrado.",
    emailInput
  );
  return;
}



    

const novaConta = {
  nome,
  email,
  perfil: "cliente",
  privacidade: {
    avisoLido: true,
    dataConfirmacao: new Date().toISOString()
  }
};


// Cadastro demonstrativo sem armazenamento de senha.
// A senha digitada não é persistida.
clientesCadastrados.push(novaConta);
salvarClientesCadastrados(clientesCadastrados);

concluirLogin(novaConta);
return;

  }

  
let conta = contasDemo.find(function(usuario) {
  return (
    usuario.email === email &&
    usuario.senha === senha &&
    usuario.perfil === tipoPerfil
  );
});

if (!conta && tipoPerfil === "cliente") {
  const clientesCadastrados = obterClientesCadastrados();

  const clienteLocal = clientesCadastrados.find(
    usuario => usuario.email === email
  );

  if (clienteLocal) {
    mensagemAuth.textContent =
      "Seu cadastro está salvo neste navegador, mas " +
      "o login por senha de contas novas exige um servidor. " +
      "Para testar novamente, utilize a conta Cliente Demonstração.";
    return;
  }
}


if (!conta) {
  mostrarErroAuth(
    "E-mail, senha ou perfil incorreto.",
    emailInput
  );
  return;
}


concluirLogin(conta);

});

atualizarTela();
