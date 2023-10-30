const { Client } = require('elasticsearch');
const dados = require('./dados/ementario.json');

// Crie uma instância do cliente Elasticsearch
const client = new Client({ node: 'http://localhost:9200' });


// Indexe o documento
async function indexarDocumento(documento) {
  try {
    const resposta = await client.index({
      index: 'curso', // Nome do índice onde você deseja armazenar os documentos
      body: documento,
    });

    console.log('Curso indexado com sucesso:', resposta);
  } catch (erro) {
    console.error('Erro ao indexar documento:', erro);
  }
}

// percorre o array de cursos e indexa cada um
dados.cursos.forEach((curso) => {
  indexarDocumento(curso);
});

// Execute a função de indexação
indexarDocumento();
