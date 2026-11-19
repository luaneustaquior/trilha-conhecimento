# Trilha do Conhecimento

Aplicação web local para organização da jornada de aprendizado por **áreas**, **subáreas**, **trilhas de estudo** e **níveis**, com acompanhamento de progresso, histórico de atividades, questões de revisão e mecânicas de gamificação (XP, Skills e Classes).

---

## 1. Objetivo e Proposta

O **Trilha do Conhecimento** foi projetado para transformar o estudo autodidata em uma jornada estruturada e mensurável. Em vez de manter anotações soltas, a pessoa estudante organiza seus temas em trilhas divididas por etapas (*níveis*), acompanha o percentual de avanço em cada trilha e evolui seu perfil conforme pratica e conclui conteúdos.

A aplicação roda localmente com persistência em **SQLite** e não depende de serviços externos para funcionar.

---

## 2. Principais Funcionalidades Implementadas

- **Início (`/`, `/entrada`):**
  - Destaque para a trilha em andamento principal, com barra de progresso calculada pelos níveis concluídos e atalho direto (`Continuar`).
  - Lista de até 5 trilhas em progresso com percentual individual.
  - Atalho para avaliação rápida de conhecimentos (`Iniciar Quiz`).
  - Painel **Sua Árvore de Conhecimento** com XP acumulado, contagem de níveis concluídos, principais áreas ativas, emblema da Classe atual, Skills liberadas e diagrama vetorial (SVG) conectado às rotas do sistema.
- **Gestão de Trilha (`/desenvolvimento`):**
  - Visualização em acordeão hierárquico expandindo os níveis de cada trilha.
  - Filtro ao vivo por status (`Todas`, `Em andamento`, `Concluída`, `Pausada`) e busca textual por nome, categoria, área ou descrição.
  - Criação rápida de novos níveis e marcação/reabertura ou exclusão de níveis diretamente na lista.
  - Exibição de **Histórico de Atividades** e **Estatísticas** calculadas diretamente do banco de dados.
- **Criação e Edição de Trilhas (`/criar`, `/trilhas/:id/editar`):**
  - Formulário com autocompletar (`<datalist>`) das subáreas cadastradas, seleção de status e validações no servidor.
  - Criação automática de subárea vinculada à área `Geral` quando uma categoria nova é informada, e remoção automática de subáreas customizadas órfãs quando deixam de ser referenciadas.
- **Detalhe e Níveis da Trilha (`/trilhas/:id`):**
  - Gerenciamento completo dos níveis ordenados da trilha, barra de progresso, descrição e ações de conclusão/remoção.
- **Questões / Quiz (`/quiz`):**
  - Avaliação interativa com 6 questões técnicas pré-cadastradas (Frontend, Backend, Banco de Dados e Data Science), feedback explicativo imediato e recompensa de XP em caso de acerto.
- **MyPlayer (`/myplayer`):**
  - Edição do nome e sobrenome do perfil local em modal (`<dialog>`).
  - Exibição das Skills liberadas e botão `Acrescentar trilha` para registrar uma nova iteração da mesma Skill.
  - Gerenciamento de trilhas com alerta preventivo de confirmação quando a exclusão puder revogar uma Skill ou rebaixar a Classe atual.
- **Áreas de Conhecimento (`/areas`):**
  - Catálogo em ordem alfabética de todas as áreas e suas respectivas subáreas com contagem de trilhas associadas.
- **Alternância de Tema (Claro / Escuro):**
  - Botão na barra superior que alterna entre tema escuro (padrão) e tema claro, salvando a preferência no navegador (`localStorage`).

---

## 3. Tecnologias Utilizadas

| Camada | Tecnologia | Uso no projeto |
| :--- | :--- | :--- |
| Runtime | **Node.js** (ES Modules) | Execução do servidor, módulo nativo `node:sqlite` e suíte `node:test` |
| Servidor Web | **Express.js** (`^4.21.2`) | Roteamento HTTP, middlewares e arquivos estáticos |
| Templates (SSR) | **EJS** (`^3.1.10`) | Renderização HTML no servidor com layouts parciais compartilhados |
| Banco de Dados | **SQLite** (`node:sqlite` / `DatabaseSync`) | Persistência relacional local em arquivo único |
| Frontend | **HTML5, CSS3 e JavaScript** | Interface responsiva com variáveis de tema e interações sem framework cliente |

---

## 4. Requisitos para Execução

- **Node.js `>= 22.5.0`** (testado em `v22.23.2`), necessário por utilizar o módulo nativo `node:sqlite` (`DatabaseSync`).
- **npm** (incluído com o Node.js) para instalação das dependências (`express` e `ejs`).
- Acesso a uma porta TCP local (padrão `3000`).

---

## 5. Estrutura de Pastas e Arquitetura

A aplicação adota uma arquitetura em camadas inspirada no padrão **MVC** (Model-View-Controller), separando inicialização do servidor, configuração do Express, acesso ao banco, modelos de domínio, validações e templates:

```text
trilha-conhecimento/
├── server.js                 # Ponto de entrada HTTP: inicia o SQLite e sobe o servidor
├── package.json              # Scripts npm e dependências (express, ejs)
├── .env.example              # Exemplo de variável de ambiente (PORT=3000)
├── metadata.json             # Nome e descrição da aplicação
├── database/
│   ├── schema.sql            # Definição das tabelas e índices relacionais
│   ├── seed.sql              # Dados iniciais (usuário demo, 7 áreas e 12 subáreas)
│   └── database.sqlite       # Arquivo SQLite gerado em execução (ignorado no Git)
├── src/
│   ├── app.js                # Fábrica da aplicação Express (createApp): estáticos, ?url= e 404
│   ├── db/
│   │   └── database.js       # Conexão SQLite, PRAGMA foreign_keys, migrações e seed demo
│   ├── models/
│   │   ├── Usuario.js        # Perfil local de demonstração e atualização de XP
│   │   ├── Area.js           # Consulta de áreas e subáreas
│   │   ├── Trilha.js         # CRUD de trilhas/níveis, Skills, Classes, estatísticas e histórico
│   │   └── Quiz.js           # Perguntas fixas de avaliação e cálculo de acerto/XP
│   ├── routes/
│   │   └── web.js            # Rotas GET/POST e orquestração entre modelos, validação e views
│   └── utils/
│       └── validation.js     # Regras de validação e limites de entrada no servidor
├── views/
│   ├── layouts/              # header.ejs, navbar.ejs, footer.ejs
│   ├── entrada/              # Tela Início
│   ├── desenvolvimento/      # Tela Gestão de Trilha
│   ├── criar/                # Formulário de criação de trilha
│   ├── trilhas/              # Detalhe/níveis (show.ejs) e edição (edit.ejs)
│   ├── quiz/                 # Tela de Questões
│   ├── myplayer/             # Perfil do jogador e gestão de Skills/Trilhas
│   ├── areas/                # Catálogo de áreas e subáreas
│   └── errors/               # Página 404
├── public/
│   └── assets/
│       ├── css/style.css     # Estilos e variáveis dos temas escuro e claro
│       └── js/app.js         # Troca de tema, acordeão, filtros, modal e confirmações
└── tests/
    └── app.test.js           # Testes unitários e de integração HTTP com SQLite :memory:
```

> **Decisão arquitetural:** separar `server.js` (que abre a porta TCP) de `src/app.js` (que exporta `createApp(db)`) permite que os testes automatizados instanciem a aplicação inteira conectada a um banco SQLite em memória (`:memory:`), sem alterar o banco local em disco.

---

## 6. Instalação

1. Clone ou acesse o diretório do projeto no terminal:
   ```bash
   cd trilha-conhecimento
   ```
2. Verifique se o Node.js instalado atende ao requisito mínimo (`>= 22.5.0`):
   ```bash
   node -v
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```

---

## 7. Como Iniciar e Encerrar a Aplicação

Para iniciar o servidor localmente:

```bash
npm run dev
```

Ou utilizando o script de início padrão:

```bash
npm start
```

### Acesso e rede

Conforme configurado em `server.js`, o servidor escuta no endereço `0.0.0.0` e na porta `3000` (ou na porta definida pela variável `PORT`):

- Acesso local no navegador: `http://localhost:3000` (ou `http://127.0.0.1:3000`)

> **Atenção:** o bind em `0.0.0.0` também aceita conexões na rede local caso o firewall do sistema permita. Como a aplicação atual não possui autenticação nem controle de acesso, recomenda-se utilizá-la apenas em ambiente local ou rede confiável.

### Como encerrar

No terminal onde o processo está rodando, pressione:

```text
Ctrl + C
```

---

## 8. Configurações e Variáveis de Ambiente

O arquivo `.env.example` documenta a porta padrão:

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `PORT` | `3000` | Porta TCP na qual o servidor Express será iniciado (`server.js`). |
| `DB_PATH` | `database/database.sqlite` | Caminho opcional para o arquivo do banco SQLite (`src/db/database.js`). |

Exemplo de execução com variáveis customizadas no Linux/macOS:

```bash
PORT=3000 DB_PATH=./database/database.sqlite npm start
```

---

## 9. Banco de Dados SQLite

A conexão é gerenciada em `src/db/database.js` com `node:sqlite` (`DatabaseSync`), utilizando exclusivamente consultas preparadas (`db.prepare(...).get/all/run(...)`) e ativando chaves estrangeiras em toda conexão com `PRAGMA foreign_keys = ON;`.

### Tabelas definidas em `database/schema.sql`

- **`usuarios`**: perfil do usuário (`id`, `nome`, `sobrenome`, `xp_total`, `criado_em`).
- **`areas`**: grandes áreas de conhecimento (`id`, `nome_area`, `descricao`).
- **`subareas`**: subáreas vinculadas a uma área via `area_id` (`ON DELETE CASCADE`).
- **`trilhas`**: trilhas associadas a `usuario_id` e `subarea_id` (`ON DELETE CASCADE`), com `nome`, `descricao`, `status` e `criado_em`.
- **`niveis`**: etapas ordenadas pertencentes a uma `trilha_id` (`ON DELETE CASCADE`), com `nome`, `ordem` e `concluido`.

### Migrações automáticas e dados iniciais em `src/db/database.js`

Na inicialização, o sistema executa automaticamente:

1. O DDL de `database/schema.sql` (criação de tabelas e índices).
2. Verificações via `PRAGMA table_info` para garantir as colunas `sobrenome` (em `usuarios`) e `concluido` (em `niveis`).
3. Criação da tabela **`historico`** (`id`, `tipo`, `descricao`, `xp_delta`, `criado_em`) caso ainda não exista.
4. Carga de `database/seed.sql` quando `usuarios` ou `areas` estiverem vazias (cria o `Usuario Demo`, 7 áreas e 12 subáreas iniciais).
5. Quando iniciado via `server.js` (`seedDemoTrilhas: true`) e tanto `trilhas` quanto `historico` estiverem vazios, são criadas 4 trilhas iniciais com níveis de demonstração (totalizando `340 XP`) para a interface abrir populada no primeiro acesso.

---

## 10. Regras de Gamificação: XP, Skills e Classes

Todas as regras abaixo são calculadas diretamente em `src/models/Trilha.js`, `src/models/Usuario.js` e `src/models/Quiz.js`:

### Pontuação de XP (`xp_total`)

| Ação | Variação de XP | Observação |
| :--- | :--- | :--- |
| Criar uma trilha | **+50 XP** | Também se aplica ao usar `Acrescentar trilha` via Skill |
| Concluir um nível | **+20 XP** | — |
| Reabrir ou remover um nível concluído | **-20 XP** | O total nunca fica abaixo de `0` |
| Excluir uma trilha | **-(50 + 20 × níveis concluídos)** | Remove o XP da trilha e dos níveis concluídos vinculados |
| Acertar uma questão no Quiz | **+15 XP** | Respostas incorretas somam `0 XP` |

### Skills

- Uma **Skill** é liberada automaticamente quando existem **3 ou mais trilhas cadastradas com o mesmo nome** (`HAVING COUNT(*) >= 3`).
- Na tela **MyPlayer**, cada Skill liberada oferece a ação `Acrescentar trilha`, que cria uma nova trilha com o mesmo nome utilizando a categoria mais frequente daquela Skill.
- Se trilhas forem excluídas e a contagem daquele nome cair para menos de 3, a Skill deixa de ser exibida.

### Classes

A Classe atual do jogador é definida pelo **maior número de trilhas registradas com o mesmo nome**:

| Quantidade máxima de trilhas com o mesmo nome | Classe atual | Próxima Classe |
| :--- | :--- | :--- |
| `0` a `2` | **Aprendiz** | `Estudioso` |
| `3` a `5` | **Estudioso** | `Sabio` |
| `6` a `8` | **Sabio** | `Mestre` |
| `9` ou mais | **Mestre** | — (patamar máximo) |

---

## 11. Principais Rotas da Aplicação

Além das rotas REST abaixo, a aplicação mantém suporte ao parâmetro de consulta `?url=<caminho>` (ex.: `/?url=entrada`, `/?url=trilhas/1/editar`).

| Método | Rota | Finalidade |
| :--- | :--- | :--- |
| `GET` | `/` ou `/entrada` | Tela **Início** com trilha em destaque, progresso e Árvore de Conhecimento |
| `GET` | `/desenvolvimento` | Tela **Gestão de Trilha** em árvore, filtros, histórico e estatísticas |
| `GET` / `POST` | `/criar` | Formulário e criação de nova trilha |
| `GET` | `/trilhas/:id` | Detalhe da trilha e gerenciamento de níveis |
| `GET` / `POST` | `/trilhas/:id/editar` | Formulário e atualização de trilha existente |
| `POST` | `/trilhas/:id/excluir` | Exclusão de trilha (com remoção em cascata dos níveis) |
| `POST` | `/trilhas/:id/niveis` | Adição de novo nível ordenado à trilha |
| `POST` | `/trilhas/:id/niveis/:nivelId/alternar` | Marca nível como concluído ou pendente |
| `POST` | `/trilhas/:id/niveis/:nivelId/excluir` | Remove um nível da trilha |
| `GET` / `POST` | `/quiz` | Exibição e avaliação das questões de conhecimento |
| `GET` / `POST` | `/myplayer` | Perfil do usuário, edição de nome/sobrenome, Skills e exclusão de trilhas |
| `GET` | `/areas` | Listagem das áreas e subáreas cadastradas |

---

## 12. Scripts Disponíveis e Testes Automatizados

Scripts definidos em `package.json`:

| Comando | Ação executada |
| :--- | :--- |
| `npm run dev` | Inicia o servidor com `node server.js` |
| `npm start` | Inicia o servidor com `node server.js` |
| `npm test` | Executa `node --test tests/*.test.js` |
| `npm run lint` | Executa verificação de sintaxe (`node --check`) em todos os arquivos JS do servidor, modelos, frontend e testes |
| `npm run build` | Executa o script de build configurado no projeto |

### O que a suíte de testes (`tests/app.test.js`) valida

Os testes utilizam SQLite em memória (`:memory:`) para não interferir no banco local:

1. Carga inicial de usuário demo, 7 áreas, subáreas e ativação de `PRAGMA foreign_keys = ON`.
2. Validação de entrada (`nome` obrigatório e limites de tamanho para trilhas, usuários e níveis; status permitidos: `Em andamento`, `Concluída`, `Pausada`).
3. Ciclo completo de trilhas, níveis, atualização, cálculo de XP, desbloqueio/revogação de Skills, progressão de Classe, estatísticas, histórico, limpeza de subárea órfã e exclusão em cascata (`ON DELETE CASCADE`).
4. Testes de integração HTTP nas rotas principais, formulários `POST`, dispatcher `?url=`, Quiz (`/quiz`), arquivos estáticos (`/assets/css/style.css`, `/assets/js/app.js`) e respostas `404`.
5. Carga opcional de demonstração (`seedDemoTrilhas: true`).

---

## 13. Limitações Conhecidas

- **Perfil único sem autenticação:** não há cadastro de contas, login, senha ou controle de sessão. Todas as operações usam o primeiro usuário da tabela `usuarios` (`Usuario Demo`).
- **Quiz estático em código:** as 6 perguntas exibidas em `/quiz` ficam definidas no array `QUESTION_BANK` em `src/models/Quiz.js`; ainda não existe tabela no SQLite nem interface para cadastrar novas questões.
- **Ausência de backup/restauração automática:** a persistência fica concentrada no arquivo local `database/database.sqlite`, sem ferramenta integrada de exportação ou restauração.
- **Dependência experimental de `node:sqlite`:** exige Node.js `>= 22.5.0` e exibe o aviso padrão de recurso experimental do Node.js no console ao iniciar.
- **Schema distribuído entre SQL e migração em código:** a tabela `historico` e as colunas `sobrenome` e `concluido` são garantidas via `src/db/database.js` durante a inicialização da aplicação, e não apenas pelo arquivo `database/schema.sql`.

---

## 14. Roadmap de Desenvolvimento

Próximas evoluções planejadas (ainda **não implementadas**):

- Consolidar todo o schema (`historico`, `sobrenome`, `concluido`) diretamente em `database/schema.sql` e padronizar migrações.
- Banco de questões persistido no SQLite, permitindo criar e vincular questões às áreas e trilhas.
- Biblioteca de prompts e anotações de estudo vinculadas aos níveis de cada trilha.
- Autenticação de usuários e suporte opcional a banco gerenciado em nuvem para futura hospedagem.
- Exportação de dados e portfólio de projetos no perfil MyPlayer.
