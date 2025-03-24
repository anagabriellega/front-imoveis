const API_URL = 'https://api-rest-imoveis.onrender.com/api/imoveis';

const form = document.getElementById('imovel-form');
const listaImoveis = document.getElementById('lista-imoveis');
const alerta = document.getElementById('alerta');
const filtro = document.getElementById('filtro');

const titulo = document.getElementById('titulo');
const endereco = document.getElementById('endereco');
const descricao = document.getElementById('descricao');
const preco = document.getElementById('preco');
const id = document.getElementById('id');

let listaCompleta = [];

function mostrarAlerta(mensagem, tipo = 'sucesso') {
  alerta.innerText = mensagem;
  alerta.className = `alerta ${tipo}`;
  alerta.style.display = 'block';
  setTimeout(() => {
    alerta.style.display = 'none';
  }, 3000);
}

function limparCampos() {
  id.value = '';
  titulo.value = '';
  endereco.value = '';
  descricao.value = '';
  preco.value = '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!titulo.value || !endereco.value || !preco.value) {
    mostrarAlerta('Preencha os campos obrigatórios.', 'erro');
    return;
  }

  const imovel = {
    titulo: titulo.value,
    endereco: endereco.value,
    descricao: descricao.value,
    preco: parseFloat(preco.value),
  };

  try {
    if (id.value) {
      await fetch(`${API_URL}/${id.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imovel),
      });
      mostrarAlerta('Imóvel atualizado com sucesso!');
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imovel),
      });
      mostrarAlerta('Imóvel cadastrado com sucesso!');
    }

    limparCampos();
    carregarImoveis();
  } catch (error) {
    mostrarAlerta('Erro ao salvar o imóvel.', 'erro');
    console.error(error);
  }
});

async function carregarImoveis() {
  try {
    const res = await fetch(API_URL);
    const imoveis = await res.json();

    listaCompleta = imoveis;
    exibirImoveis(imoveis);
  } catch (error) {
    mostrarAlerta('Erro ao carregar imóveis.', 'erro');
    console.error(error);
  }
}

function exibirImoveis(imoveis) {
  listaImoveis.innerHTML = '';

  if (imoveis.length === 0) {
    listaImoveis.innerHTML = '<p>Nenhum imóvel encontrado.</p>';
    return;
  }

  imoveis.forEach((imovel) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <h3>${imovel.titulo}</h3>
      <p><strong>Endereço:</strong> ${imovel.endereco}</p>
      <p><strong>Descrição:</strong> ${imovel.descricao || '-'}</p>
      <p><strong>Preço:</strong> R$ ${imovel.preco.toFixed(2)}</p>
      <div class="acoes">
        <button class="editar"><i class="fas fa-edit"></i> Editar</button>
        <button class="excluir"><i class="fas fa-trash-alt"></i> Excluir</button>
      </div>
    `;

    card.querySelector('.editar').addEventListener('click', () => {
      id.value = imovel.id;
      titulo.value = imovel.titulo;
      endereco.value = imovel.endereco;
      descricao.value = imovel.descricao;
      preco.value = imovel.preco;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    card.querySelector('.excluir').addEventListener('click', async () => {
      if (confirm(`Deseja excluir "${imovel.titulo}"?`)) {
        try {
          await fetch(`${API_URL}/${imovel.id}`, {
            method: 'DELETE',
          });
          mostrarAlerta('Imóvel excluído com sucesso!');
          carregarImoveis();
        } catch (error) {
          mostrarAlerta('Erro ao excluir o imóvel.', 'erro');
          console.error(error);
        }
      }
    });

    listaImoveis.appendChild(card);
  });
}

filtro.addEventListener('input', () => {
  const termo = filtro.value.toLowerCase();
  const filtrados = listaCompleta.filter((imovel) =>
    imovel.titulo.toLowerCase().includes(termo) ||
    imovel.endereco.toLowerCase().includes(termo)
  );
  exibirImoveis(filtrados);
});

carregarImoveis();
