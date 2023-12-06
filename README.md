# Elasticsearch Lab

Esse repositório define um ambiente ELK (elasticsearch | logstash | kibana) para indexação de conteúdo a partir de banco de dados postgresql. 

Para esse laboratório, foi utilizada a versão 7.14.0 dos componentes ELK.

## Tecnologias utilizadas
Linguagens, Frameworks e Bibliotecas utilizadas na construção desse projeto.
<div style="display: flex; gap: 10px;">
  <img title="Elasticsearch" width="50px" src="https://static-00.iconduck.com/assets.00/elasticsearch-icon-1839x2048-s0i8mk51.png">
  <img title="Kibana" width="50px" src="https://cdn.iconscout.com/icon/free/png-256/free-elastic-1-283281.png">
  <img title="Postgresql" width="50px" src="https://camo.githubusercontent.com/521b6af10b5409bdfefae1b331c084f5a9daa28290f347e4861fb17e817028f7/68747470733a2f2f63646e2e6a7364656c6976722e6e65742f67682f64657669636f6e732f64657669636f6e2f69636f6e732f706f737467726573716c2f706f737467726573716c2d706c61696e2e737667">
  <img title="Docker" width="50px" src="https://camo.githubusercontent.com/3a23c2fcae3dbe2c3439808a27604c29ed76147ccb6310260cef073e4ea45751/68747470733a2f2f63646e2d69636f6e732d706e672e666c617469636f6e2e636f6d2f3531322f3931392f3931393835332e706e67">
  <img title="JavaScript" width="50px" src="https://camo.githubusercontent.com/528e232c728b497080cbf31d2a7e797caa81e402ff81643f79b2c2c395a29f17/68747470733a2f2f63646e2e6a7364656c6976722e6e65742f67682f64657669636f6e732f64657669636f6e2f69636f6e732f6a6176617363726970742f6a6176617363726970742d706c61696e2e737667">
</div>

## Sumário

* [Configuração](#configuração)
    * [Logstash](#logstash)
    * [Kibana](#kibana)
    * [Elasticsearch](#elasticsearch)
    * [Variáveis de ambiente](#variáveis-de-ambiente)
    * [Docker](#docker)
* [Contato](#contato)
* [License](#license)

## Configuração

As orientações a seguir descrevem a configuração do ambiente e os passos para execução.

## Logstash

Para configuração do logstash, foram criados os arquivos que são apresentados abaixo e mantidos na pasta ./logstash

* `./logstash/config/pipelines.yml` - define os jobs a serem realizados
* `./logstash/pipelines` - contém os arquivos de configuração para cada um dos jobs
* `./logstash/pgdriver` - mantem uma cópia do driver jdbc para o postgresql

## Kibana

Para configuração do kibana, foi criado o arquivo ./kibana/kibana.yml com o conteúdo apresentado a seguir.

```properties
server.host: "0.0.0.0"
elasticsearch.hosts: ["http://elasticsearch:9200"]
```

## Elasticsearch - Query DSL (Domain Specific Language)

https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html


### Filter

Num contexto de filtro, uma cláusula de consulta responde à pergunta "Este documento corresponde a esta cláusula de consulta?" A resposta é um simples sim ou não.

**POST=>http://localhost:9200/_search**

**Mandar**

``` JSON
{
  "query": {
    "bool": {
      "filter": [
        {
          "range": { // distância
            "atualizado_em": {
              "gte": "2021-12-24", // inicio
              "lte": "2021-12-30" // fim
            }
          }
        },
        {
          "term": {
            "dsc_titulo_curso": "qualidade"
          }
        }
      ]
    }
  }
}

```

**Resposta**

``` JSON
{
	"took": 2,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 1,
			"relation": "eq"
		},
		"max_score": 0.0,
		"hits": [
			{
				"_index": "cursos",
				"_id": "41",
				"_score": 0.0,
				"_ignored": [
					"dsc_publico_alvo.keyword",
					"dsc_texto_disciplinas.keyword",
					"dsc_texto_divulgacao.keyword",
					"dsc_justificativa.keyword",
					"dsc_metodologia.keyword",
					"dsc_objetivos.keyword"
				],
				"_source": {
					"dsc_titulo_curso": "Engenharia de Qualidade e Teste de Software ",
					"dsc_publico_alvo": "{...}",
					"@version": "1",
					"ind_modalidade": 3,
					"id_projeto": 70,
					"criado_em": "2021-12-24T17:53:11.165Z",
					"ativo": true
				}
			}
		]
	}
}

```

### Query compostas

Bool Query combina consultas com operadores lógicos AND, OR e NOT. Permite criar consultas mais complexas combinando múltiplas condições.

| Tipo |	Descrição |
|------|-------------|
| must | A cláusula (consulta) deverá constar nos documentos correspondentes e contribuirá para a pontuação. |
| filter | A cláusula (consulta) deve aparecer nos documentos correspondentes. No entanto, ao contrário do que deve ser, a pontuação da consulta será ignorada. As cláusulas de filtro são executadas no contexto de filtro, o que significa que a pontuação é ignorada e as cláusulas são consideradas para armazenamento em cache. |
| should | A cláusula (consulta) deve aparecer no documento correspondente. |
| must_not | A cláusula (consulta) não deve constar nos documentos correspondentes. As cláusulas são executadas no contexto do filtro, o que significa que a pontuação é ignorada e as cláusulas são consideradas para armazenamento em cache. Como a pontuação é ignorada, é retornada uma pontuação 0 para todos os documentos. |

**POST=>http://localhost:9200/cursos/_search**

**Mandar**

``` JSON
{
  "query": {
    "bool": {
      "must": [
        {
          "range": {
            "atualizado_em": {
              "gte": "2021-12-24",
              "lte": "2021-12-30"
            }
          }
        },
        {
          "term": {
            "dsc_titulo_curso": "qualidade"
          }
        }
      ]
    }
  }
}
```

**Resposta**

``` JSON
{
	"took": 7,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 1,
			"relation": "eq"
		},
		"max_score": 3.4766543,
		"hits": [
			{
				"_index": "cursos",
				"_id": "41",
				"_score": 3.4766543, // score
				"_ignored": [
					"dsc_publico_alvo.keyword",
					"dsc_texto_disciplinas.keyword",
					"dsc_texto_divulgacao.keyword",
					"dsc_justificativa.keyword",
					"dsc_metodologia.keyword",
					"dsc_objetivos.keyword"
				],
				"_source": {
					"dsc_titulo_curso": "Engenharia de Qualidade e Teste de Software ",
					"dsc_publico_alvo": "{...}",
					"publicado": true,
					"atualizado_em": "2021-12-24T17:53:11.165Z",
					"url_site": "https://www.pucminas.br/Pos-Graduacao/IEC/Cursos/Paginas/Engenharia%20de%20Qualidade%20e%20Teste%20de%20Software_Pos%20Online_Especializacao%20e%20Master.aspx?pageID=4585&moda=5&modaTipo=2&polo=40&curso=1634&situ=1",
					"id_oferta": 212,
					"dsc_justificativa": "{...}",
					"@version": "1",
					"ind_modalidade": 3,
					"id_projeto": 70,
					"criado_em": "2021-12-24T17:53:11.165Z",
					"ativo": true
				}
			}
		]
	}
}
```

### Full text queries

Mas as consultas de texto completo são muito poderosas e possuem algumas outras variações, incluindo `match_phrase`, `match_phrase_prefix`,
`multi_match`, `common_terms`, `query_string` e `simple_query_string`.

Observe como limitamos as propriedades do _source do documento para retornar apenas o campo de título. As outras variações do termo
consultas de nível incluem `terms`, `range`, `exists`, `prefix`, `wildcard`, `regexp`, `fuzzy`, `type` e `ids`.

**POST=>http://localhost:9200/perfis/_search**

**Mandar**

``` JSON
{
	"_source":["dsc_titulo"],
	"query":{
		"wildcard":{
			"dsc_responsabilidades":"mine*"
		}
	}
}
```

**Resposta**

``` JSON
{
	"took": 3,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 2,
			"relation": "eq"
		},
		"max_score": 1.0,
		"hits": [
			{
				"_index": "perfis",
				"_id": "4",
				"_score": 1.0,
				"_source": {
					"dsc_titulo": "Engenheiro de Machine Learning"
				}
			},
			{
				"_index": "perfis",
				"_id": "1",
				"_score": 1.0,
				"_ignored": [
					"dsc_descricao.keyword",
					"dsc_responsabilidades.keyword"
				],
				"_source": {
					"dsc_titulo": "Cientista de Dados"
				}
			}
		]
	}
}
```

### Geo queries

O Elasticsearch oferece suporte a dois tipos de dados geográficos: campos geo_point, que suportam pares lat/lon, e campos geo_shape, que suportam pontos, linhas, círculos, polígonos, multipolígonos, etc.

### Shape queries

O Elasticsearch oferece suporte a dois tipos de dados cartesianos: campos de pontos, que suportam pares x/y, e campos de forma, que suportam pontos, linhas, círculos, polígonos, multipolígonos, etc.

### Joining queries

`nested query`

Os documentos podem conter campos do tipo aninhados. Esses campos são usados para indexar arrays de objetos, onde cada objeto pode ser consultado (com a consulta aninhada) como um documento independente.

`has_child and has_parent queries`

Um relacionamento de campo de junção pode existir entre documentos em um único índice. A consulta has_child retorna documentos pai cujos documentos filho correspondem à consulta especificada, enquanto a consulta has_parent retorna documentos filho cujo documento pai corresponde à consulta especificada.

`parent id query`

Retorna documentos filho associados a um documento pai específico. Você pode usar um mapeamento de campo de junção para criar relacionamentos pai-filho entre documentos no mesmo índice.

### Match all

index: cursos, disciplinas e perfis.

**POST=>http://localhost:9200/{index}/_search**

``` JSON
{
	"query":{
		"match_all":{
		}
	}
}
```

**POST=>http://localhost:9200/_search**

``` JSON
{
	"field":"value" // todos os campos e valores do índice
}
```

### Span queries

As consultas span são consultas posicionais de baixo nível que fornecem controle especializado sobre a ordem e a proximidade dos termos especificados. Normalmente são usados para implementar consultas muito específicas sobre documentos legais ou patentes.

Só é permitido definir boost em uma consulta de extensão externa. Consultas de intervalo composto, como span_near, usam apenas a lista de intervalos correspondentes de consultas de intervalo interno para encontrar seus próprios intervalos, que eles usam para produzir uma pontuação. As pontuações nunca são calculadas em consultas de intervalo interno, e é por isso que os reforços não são permitidos: eles apenas influenciam a forma como as pontuações são calculadas, não os intervalos.

### Specialized queries

Este grupo contém consultas que não se enquadram nos outros grupos: `distance_feature query`, `more_like_this query`, `percolate query`, `rank_feature query`, `script query`, `script_score query`, `wrapper query`, `pinned query`, `rule query`.

#### Percolate Query

O campo _percolator_document_slot indica qual documento correspondeu a esta consulta. Útil ao filtrar vários documentos simultaneamente.

### Term-lvel queries

Você pode usar consultas em nível de termo para localizar documentos com base em valores precisos em dados estruturados. Exemplos de dados estruturados incluem intervalos de datas, endereços IP, preços ou IDs de produtos.

Ao contrário das consultas de texto completo, as consultas em nível de termo não analisam os termos de pesquisa. Em vez disso, as consultas em nível de termo correspondem aos termos exatos armazenados em um campo.

Tipos de term-level queries: `exists query`, `fuzzy query`, `ids query`, `prefix query`, `range query`, `regexp query`, `term query`, `terms query`, `terms_set query`, `wildcard query`

#### Fuzzy Query

A Consulta Difusa é útil quando você deseja encontrar termos ortograficamente semelhantes, mas não idênticos, ao seu termo de pesquisa.

Retorna documentos que contêm termos semelhantes ao termo de pesquisa, conforme medido por uma distância de edição de Levenshtein.

Uma distância de edição é o número de alterações de um caractere necessárias para transformar um termo em outro. Essas mudanças podem incluir:

Mudando um caractere (caixa → faixa)
Removendo um caractere (gato → ato)
Inserindo um caractere (doente → doeente)
Transpondo dois personagens adjacentes (comida → comdia)

Para encontrar termos semelhantes, a consulta difusa cria um conjunto de todas as variações ou expansões possíveis do termo de pesquisa dentro de uma distância de edição especificada. A consulta então retorna correspondências exatas para cada expansão.

**Require**

**POST=>http://localhost:9200/disciplinas/_search**

Example: redes => reds

``` JSON
{
  "query": {
    "fuzzy": {
      "dsc_nome_disciplina": {
        "value": "reds",
        "fuzziness": 2
      }
    }
  }
}
```

**Response**

``` JSON
{
	"took": 8,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 8,
			"relation": "eq"
		},
		"max_score": 2.748603,
		"hits": [
			{
				"_index": "disciplinas",
				"_id": "58",
				"_score": 2.748603,
				"_source": {
					"dsc_ementa": "Taxonomia de redes neurais. Redes neurais recorrentes, convolutivas, e redes de memória dinâmica. Aplicações e modelagem de problemas.",
					"dsc_sigla": "RNA",
					"dsc_nome_disciplina": "REDES NEURAIS E APRENDIZAGEM PROFUNDA ", // possui nome redes
					"@version": "1",
					"num_carga_horaria_to": null,
					"@timestamp": "2023-11-22T17:25:00.847Z",
					"atualizado_em": "2023-10-06T01:34:42.625Z",
					"id_disciplina": 58,
					"criado_em": "2021-12-24T17:53:41.755Z",
					"id_grupo_disciplina": 7,
					"num_carga_horaria": 24,
					"dsc_grupo_disciplina": "INTELIGÊNCIA ARTIFICIAL"
				}
			}
		]
	}
}
```

### Text expansion

A consulta de text expansion usa um modelo de processamento de linguagem natural para converter o texto da consulta em uma lista de pares de peso de token que são então usados em uma consulta em um vetor esparso ou campo de recursos de classificação.

https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-text-expansion-query.html

Tutorial: semantic search with ELSER

https://www.elastic.co/guide/en/elasticsearch/reference/8.11/semantic-search-elser.html

ELSER – Elastic Learned Sparse EncodeR

https://www.elastic.co/guide/en/machine-learning/8.11/ml-nlp-elser.html

ELSER é um modelo fora de domínio, o que significa que não requer ajuste fino em seus próprios dados, tornando-o adaptável para vários casos de uso prontos para uso.


## Variáveis de ambiente

As variáveis de ambiente são mantidas em um arquivo `.env` que deve ter a seguinte estrutura

```properties
JDBC_CONNECTION_STRING=jdbc:postgresql://[SERVER_NAME]:[PORT]/[DATABASE]
JDBC_USER=[USER]
JDBC_PASSWORD=[PASSWORD]
```

No arquivo `.env` devem ser substituídas as constantes para `[SERVER_NAME]`, `[PORT]`, `[DATABASE]`, `[USER]` e `[PASSWORD]`.

## Docker

O ambiente docker foi definido por meio de um arquivo de configuração docker-compose.yml, com as configurações dos três ambientes ELK:

```yaml
version: '3.7'
services:

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.14.0
    ports:
      - "9200:9200"
      - "9300:9300"
    environment:
      discovery.type: "single-node"
      ES_JAVA_OPTS: "-Xms2g -Xmx2g"
      xpack.monitoring.enabled: "true"
    volumes:
      - ./esdata:/usr/share/elasticsearch/data
    networks:
      - elastic

  logstash:
    image: logstash:7.14.0
    environment:
      discovery.seed_hosts: logstash
      LS_JAVA_OPTS: "-Xms512m -Xmx512m"
      JDBC_CONNECTION_STRING: "${JDBC_CONNECTION_STRING}"
      JDBC_USER: "${JDBC_USER}"
      JDBC_PASSWORD: "${JDBC_PASSWORD}"
    volumes:
      - ./logstash/pipeline/logstash-pg-cursos.config:/usr/share/logstash/pipeline/logstash-pg-cursos.config
      - ./logstash/pipeline/logstash-pg-perfis.config:/usr/share/logstash/pipeline/logstash-pg-perfis.config
      - ./logstash/pipeline/logstash-pg-disciplinas.config:/usr/share/logstash/pipeline/logstash-pg-disciplinas.config
      - ./logstash/config/pipelines.yml:/usr/share/logstash/config/pipelines.yml
      - ./logstash/pgdriver/postgresql-42.2.27.jre7.jar:/usr/share/logstash/pgdriver/postgresql-42.2.27.jre7.jar
    ports:
      - "5000:5000/tcp"
      - "5000:5000/udp"
      - "5044:5044"
      - "9600:9600"
    depends_on:
      - elasticsearch
    networks:
      - elastic
    command: logstash


  kibana:
    image: docker.elastic.co/kibana/kibana:7.14.0
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_URL: http://elasticsearch:9200
    volumes:
      - ./kibana/kibana.yml:/usr/share/kibana/config/kibana.yml
    depends_on:
      - elasticsearch
    networks:
      - elastic

networks:
  elastic:
    driver: bridge

volumes:
  esdata:
    driver: local
  logstash:
    driver: local
```



Após a configuração do ambiente, basta executar

```bash
% docker compose up -d
```

Ao criar o ambiente completo, estarão visíveis os seguintes containers:

```bash
% docker ps -a
CONTAINER ID   IMAGE                                                  COMMAND                  CREATED          STATUS                      PORTS                                                                                            NAMES
354803f653ad   logstash:7.14.0                                        "/usr/local/bin/dock…"   10 minutes ago   Up 10 minutes               0.0.0.0:5000->5000/tcp, 0.0.0.0:5044->5044/tcp, 0.0.0.0:9600->9600/tcp, 0.0.0.0:5000->5000/udp   siteelk-logstash-1
3e4697a9f683   docker.elastic.co/kibana/kibana:7.14.0                 "/bin/tini -- /usr/l…"   13 minutes ago   Up 13 minutes               0.0.0.0:5601->5601/tcp                                                                           siteelk-kibana-1
bea2528224d2   docker.elastic.co/elasticsearch/elasticsearch:7.14.0   "/bin/tini -- /usr/l…"   13 minutes ago   Up 13 minutes               0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp                                                   siteelk-elasticsearch-1
```

Para finalizar e remover os containers, basta executar

```bash
% docker compose down
```

## Contato
- Rommel Carneiro - [rommelcarneiro@gmail.com](mailto:rommelcarneiro@gmail.com)

   GitHub: [https://github.com/rommelcarneiro](https://github.com/rommelcarneiro)


- Jhonata Dias - [engjhonatadias@gmail.com](mailto:engjhonatadias@gmail.com).

   GitHub: [https://github.com/jhonstudentx](https://github.com/jhonstudentx)


- Kimberly Spencer - [kimberlylizsl@gmail.com](mailto:kimberlylizsl@gmail.com).

    GitHub: [github.com/kspencerl](https://github.com/kspencerl)


## License

Esse repositório foi criado pelo [WebTech PUC Minas](https://github.com/webtech-pucminas), um grupo voltado para a criação de aplicações, ferramentas e conteúdo para interessados em  soluções para a plataforma Web.
