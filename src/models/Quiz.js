import { registrarHistorico } from '../db/database.js';
import { UsuarioModel } from './Usuario.js';

export const XP_POR_QUIZ = 15;

const QUESTION_BANK = [
  {
    id: 1,
    area: 'Frontend',
    pergunta: 'Qual propriedade CSS define um layout bidimensional de linhas e colunas?',
    opcoes: ['display: grid', 'display: inline', 'float: left', 'position: relative'],
    correta: 0,
    explicacao: 'CSS Grid (display: grid) organiza elementos simultaneamente em linhas e colunas.'
  },
  {
    id: 2,
    area: 'Backend',
    pergunta: 'No Express.js, qual método registra uma rota que responde exclusivamente a requisições POST?',
    opcoes: ['app.use()', 'app.post()', 'app.send()', 'app.render()'],
    correta: 1,
    explicacao: 'app.post(caminho, handler) trata requisições HTTP POST enviadas por formulários ou APIs.'
  },
  {
    id: 3,
    area: 'Banco de Dados',
    pergunta: 'No SQLite, qual instrução ativa a verificação de integridade referencial de chaves estrangeiras?',
    opcoes: ['PRAGMA foreign_keys = ON;', 'ENABLE KEYS;', 'SET STRICT = 1;', 'ALTER TABLE CHECK;'],
    correta: 0,
    explicacao: 'O SQLite exige PRAGMA foreign_keys = ON em cada conexão para aplicar FOREIGN KEY e ON DELETE CASCADE.'
  },
  {
    id: 4,
    area: 'Backend',
    pergunta: 'Por que devemos usar consultas preparadas (prepared statements) ao gravar dados no banco?',
    opcoes: [
      'Para aumentar o tamanho do arquivo SQLite',
      'Para prevenir ataques de SQL Injection separando código SQL dos parâmetros',
      'Para desativar índices automaticamente',
      'Para ignorar erros de sintaxe'
    ],
    correta: 1,
    explicacao: 'Consultas preparadas tratam os valores como parâmetros seguros, impedindo SQL Injection.'
  },
  {
    id: 5,
    area: 'Frontend',
    pergunta: 'Qual atributo HTML5 garante o carregamento seguro e acessível de texto alternativo em imagens?',
    opcoes: ['title', 'alt', 'srcset', 'data-label'],
    correta: 1,
    explicacao: 'O atributo alt descreve a imagem para leitores de tela e é exibido caso a imagem falhe ao carregar.'
  },
  {
    id: 6,
    area: 'Data Science',
    pergunta: 'Em aprendizado de máquina supervisionado, qual é o papel do conjunto de validação/teste?',
    opcoes: [
      'Aumentar o número de colunas da tabela',
      'Avaliar a capacidade de generalização do modelo em dados não vistos',
      'Apagar registros duplicados no HTML',
      'Substituir o banco relacional'
    ],
    correta: 1,
    explicacao: 'O conjunto de teste mede o desempenho real do modelo fora dos dados usados no treinamento.'
  }
];

export const QuizModel = {
  getAllQuestions() {
    return QUESTION_BANK;
  },

  getQuestionByIndex(index = 0) {
    const idx = Math.abs(Number(index) || 0) % QUESTION_BANK.length;
    return {
      ...QUESTION_BANK[idx],
      index: idx,
      total: QUESTION_BANK.length
    };
  },

  avaliarResposta(db, questionId, respostaIndex) {
    const q = QUESTION_BANK.find((item) => item.id === Number(questionId));
    if (!q) return null;

    const escolhida = Number(respostaIndex);
    const acertou = escolhida === q.correta;

    if (acertou) {
      UsuarioModel.adicionarXp(db, XP_POR_QUIZ);
      registrarHistorico(db, 'quiz', `Quiz (${q.area}) respondido corretamente`, XP_POR_QUIZ);
    }

    return {
      question: q,
      escolhida,
      acertou,
      xpGanho: acertou ? XP_POR_QUIZ : 0
    };
  }
};
