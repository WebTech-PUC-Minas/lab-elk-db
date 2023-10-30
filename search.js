#!/usr/bin/env node
const { Client } = require('elasticsearch');
const readline = require('readline');

// Crie uma instância do cliente Elasticsearch
const client = new Client({ node: 'http://localhost:9200' });

// Configure a interface de linha de comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Defina a função de pesquisa
async function pesquisarDocumentos() {
  rl.question('Digite sua consulta de pesquisa: ', async (consulta) => {
    try {
      const resposta = await client.search({
        index: 'paginas-web', // Nome do índice onde os documentos estão armazenados
        body: {
          query: {
            match: {
              conteudo: consulta, // Campo de pesquisa (no exemplo, procuramos no campo "conteudo")
            },
          },
        },
      });

      console.log('Resultados da pesquisa:', resposta.hits.hits);
    } catch (erro) {
      console.error('Erro na pesquisa:', erro);
    } finally {
      rl.close();
    }
  });
}

// Execute a função de pesquisa
// pesquisarDocumentos();


// Defina a função de pesquisa
async function pesquisarCurso() {
  rl.question('Digite sua consulta de pesquisa: ', async (consulta) => {
    try {
      const resposta = await client.search({
        index: 'curso', // Nome do índice onde os documentos estão armazenados
        body: {
          query: {
            nested: {
              path: 'disciplinas',
              query: {
                match: {
                  'disciplinas.ementa': consulta, 
                }
              }
            }
          }
        }
      });

      console.log('Resultados da pesquisa:', resposta.hits.hits);
    } catch (erro) {
      console.error('Erro na pesquisa:', erro);
    } finally {
      rl.close();
    }
  });
}

 pesquisarCurso()

// Defina a função de pesquisa
async function pesquisarDisciplina() {
  rl.question('Digite sua consulta de pesquisa: ', async (consulta) => {
    try {
      const resposta = await client.search({
        index: 'curso', // Nome do índice onde os documentos estão armazenados
        body: {
          query: {
            nested: {
              path: 'disciplinas',
              query: {
                match: {
                  'disciplinas.ementa': consulta, 
                }
              }, 
              inner_hits: {}
            }
          }
        }
      });

      console.log('Resultados da pesquisa:', resposta.hits.hits);
    } catch (erro) {
      console.error('Erro na pesquisa:', erro);
    } finally {
      rl.close();
    }
  });
}

// pesquisarDisciplina()


async function pesquisarDisciplinas() {
  rl.question('Digite sua consulta de pesquisa: ', async (consulta) => {
    try {
      const resposta = await client.search({
        index: 'curso', // Nome do índice onde os documentos estão armazenados
        body: {
          query: {
            bool: {
              must: [
                {
                  match: {
                    curso: consulta
                  }
                },
                {
                  nested: {
                    path: 'disciplinas',
                    query: {
                      match_all: {}
                    }
                  }
                }
              ]
            }          
          }
        }
      });

      console.log('Resultados da pesquisa:', resposta.hits.hits);
    } catch (erro) {
      console.error('Erro na pesquisa:', erro);
    } finally {
      rl.close();
    }
  });
}

// pesquisarDisciplinas()