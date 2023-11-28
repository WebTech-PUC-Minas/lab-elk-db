# Elasticsearch Lab

Esse repositório define um ambiente ELK (eliasticsearch | logstash | kibana) para indexação de conteúdo a partir de banco de dados postgresql. 

Para esse laboratório, foi utilizada a versão 7.14.0 dos componentes ELK.

## Tecnologias utilizadas
Linguagens, Frameworks e Bibliotecas utilizadas na construção desse projeto.
<div style="display: flex; gap: 10px;">
  <img title="Elasticsearch" width="50px" src="https://plugins.jetbrains.com/files/14512/431322/icon/pluginIcon.png">
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
    * [Configuração de Ambiente](#configuração-de-ambiente)
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

## Elasticsearch

- ### queries
  - texto


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

Esse repositório foi criado pelo [WebTech PUC Minas](https://github.com/webtech-pucminas), um grupo voltado para a criação de aplicações, ferramentas e conteúdo para interessados em criar soluções praa a plataforma Web.
