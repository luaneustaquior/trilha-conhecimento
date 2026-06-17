# Trilha do Conhecimento

O **Trilha do Conhecimento** e um projeto PHP em fase inicial, criado para organizar uma jornada de aprendizado por areas, subareas, trilhas e niveis. A ideia atual do sistema e funcionar como um painel simples onde um usuario demo pode visualizar seu progresso, consultar secoes do aplicativo e futuramente criar trilhas de estudo.

No estado atual, o projeto ja possui uma estrutura MVC simples, roteamento manual, conexao com banco SQLite e algumas telas base renderizadas em PHP puro. A interface ainda esta em HTML basico, sem estilos aplicados, e parte das funcionalidades planejadas ainda aparece como conteudo estatico ou formulario sem processamento.

## Estado Atual

- Aplicacao PHP sem framework.
- Estrutura organizada em `app`, `public`, `config`, `database` e `routes`.
- Front controller em `public/index.php`.
- Router proprio em `app/core/Router.php`, usando o parametro `?url=`.
- Banco SQLite em `database/database.sqlite`.
- Scripts SQL para schema e dados iniciais em `database/schema.sql` e `database/seed.sql`.
- Layout base separado em `header.php`, `navbar.php`, `main.php` e `footer.php`.
- Views principais para entrada, desenvolvimento, criar trilha, MyPlayer e areas.

## Funcionalidades Disponiveis

### Entrada

Rota:

```text
?url=entrada
```

Exibe dados do primeiro usuario encontrado no banco, usando o model `Usuario`. Hoje a tela mostra nome, XP, titulo fixo e data de criacao.

### Desenvolvimento

Rota:

```text
?url=desenvolvimento
```

Tela inicial para acompanhamento de trilhas, historico e estatisticas. No momento, os dados exibidos sao mensagens estaticas indicando que ainda nao ha trilhas, historico ou estatisticas cadastradas.

### Criar Trilha

Rota:

```text
?url=criar
```

Exibe um formulario visual para criacao de trilha, com campos de nome, categoria e descricao. Atualmente o formulario ainda nao possui acao de salvamento implementada.

### MyPlayer

Rota:

```text
?url=myplayer
```

Tela de perfil com titulo, lista de skills e area de projetos. Os dados exibidos atualmente sao estaticos.

### Areas

Rota:

```text
?url=areas
```

Lista as areas cadastradas no banco SQLite atraves do model `Area`. Esta rota existe no `Router`, mas ainda nao aparece no menu principal da navbar.

## Estrutura do Projeto

```text
trilha-conhecimento/
+-- app/
|   +-- controllers/
|   +-- core/
|   +-- models/
|   +-- views/
+-- config/
+-- database/
+-- public/
|   +-- assents/
+-- routes/
```

## Banco de Dados

O projeto usa SQLite. A conexao esta centralizada em:

```text
app/core/Database.php
```

O arquivo de banco esperado pela aplicacao e:

```text
database/database.sqlite
```

O schema atual possui tabelas para:

- `usuarios`
- `areas`
- `subareas`
- `trilhas`
- `niveis`

Tambem existem indices para consultas envolvendo subareas, trilhas e niveis.

## Como Rodar Localmente

Este projeto esta preparado para rodar em um ambiente PHP local, como o Laragon.

1. Coloque o projeto dentro da pasta de sites do Laragon.
2. Aponte o servidor para a pasta `public`.
3. Acesse a aplicacao pelo navegador.
4. Use as rotas pelo parametro `url`, por exemplo:

```text
http://localhost/trilha-conhecimento/public/?url=entrada
http://localhost/trilha-conhecimento/public/?url=desenvolvimento
http://localhost/trilha-conhecimento/public/?url=criar
http://localhost/trilha-conhecimento/public/?url=myplayer
http://localhost/trilha-conhecimento/public/?url=areas
```

Dependendo da configuracao do Laragon, a URL pode variar. O ponto importante e que o arquivo de entrada da aplicacao e `public/index.php`.

## Observacoes Tecnicas

- O arquivo `routes/web.php` define rotas no formato `/rota`, mas atualmente nao e carregado pelo `public/index.php`.
- O roteamento que esta funcionando hoje fica em `app/core/Router.php`.
- A pasta de assets esta nomeada como `public/assents`.
- O arquivo CSS existe em `public/assents/css/style.css`, mas ainda esta vazio.
- O arquivo JavaScript existe em `public/assents/js/app.js`, mas ainda esta vazio.
- O arquivo `config/config.php` existe, mas atualmente nao possui configuracoes.

## Proximos Passos Possiveis

- Conectar o formulario de criacao de trilha ao banco.
- Listar trilhas reais na tela de desenvolvimento.
- Exibir subareas relacionadas a cada area.
- Adicionar a rota de areas no menu principal.
- Carregar o CSS e o JavaScript no layout.
- Criar estilos para a interface.
- Padronizar o sistema de rotas usando apenas um fluxo.
