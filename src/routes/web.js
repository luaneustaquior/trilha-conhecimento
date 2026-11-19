import express from 'express';
import { UsuarioModel } from '../models/Usuario.js';
import { AreaModel } from '../models/Area.js';
import { TrilhaModel } from '../models/Trilha.js';
import { QuizModel } from '../models/Quiz.js';
import {
  VALID_STATUSES,
  validateTrilhaInput,
  validateUsuarioInput,
  validateNivelInput
} from '../utils/validation.js';

function getSafeRedirect(target, fallback) {
  if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')) {
    return target;
  }
  return fallback;
}

export function createWebRouter(db) {
  const router = express.Router();

  // 1. Início / Entrada (Dashboard principal no formato dos protótipos)
  router.get(['/', '/entrada'], (req, res) => {
    const usuario = UsuarioModel.getDemo(db);
    const classe = TrilhaModel.getClasseAtual(db);
    const skills = TrilhaModel.listarSkills(db);
    const todasTrilhas = TrilhaModel.listarTodas(db);
    const stats = TrilhaModel.getEstatisticas(db);
    const areas = AreaModel.getAllWithSubareas(db);

    const trilhaDestaque =
      todasTrilhas.find((t) => t.status === 'Em andamento') || todasTrilhas[0] || null;
    const trilhasEmProgresso = todasTrilhas.slice(0, 5);

    res.render('entrada/index', {
      pageTitle: 'Início',
      usuario,
      classe,
      skills,
      trilhaDestaque,
      trilhasEmProgresso,
      stats,
      areas
    });
  });

  // 2. Gestão de Trilha / Desenvolvimento
  router.get('/desenvolvimento', (req, res) => {
    const trilhas = TrilhaModel.listarTodas(db);
    const stats = TrilhaModel.getEstatisticas(db);
    const historico = TrilhaModel.getHistorico(db, 15);
    const usuario = UsuarioModel.getDemo(db);

    res.render('desenvolvimento/index', {
      pageTitle: 'Gestão de Trilha',
      trilhas,
      stats,
      historico,
      usuario
    });
  });

  // 3. Criar Trilha
  router.get('/criar', (req, res) => {
    const subareas = AreaModel.getAllSubareas(db);
    res.render('criar/index', {
      pageTitle: 'Criar Trilha',
      erro: null,
      dados: { nome: '', categoria: '', descricao: '', status: 'Em andamento' },
      subareas,
      statuses: VALID_STATUSES
    });
  });

  router.post('/criar', (req, res) => {
    const check = validateTrilhaInput(req.body);
    if (!check.valid) {
      const subareas = AreaModel.getAllSubareas(db);
      return res.status(400).render('criar/index', {
        pageTitle: 'Criar Trilha',
        erro: check.error,
        dados: check.data,
        subareas,
        statuses: VALID_STATUSES
      });
    }

    TrilhaModel.criar(db, check.data);
    res.redirect('/desenvolvimento');
  });

  // 4. Detalhe da Trilha & Gerenciamento de Níveis
  router.get('/trilhas/:id', (req, res) => {
    const trilha = TrilhaModel.buscarPorId(db, req.params.id);
    if (!trilha) {
      return res.status(404).render('errors/404', { pageTitle: 'Página não encontrada' });
    }

    res.render('trilhas/show', {
      pageTitle: trilha.nome,
      trilha,
      erro: null
    });
  });

  router.post('/trilhas/:id/niveis', (req, res) => {
    const trilha = TrilhaModel.buscarPorId(db, req.params.id);
    if (!trilha) {
      return res.status(404).render('errors/404', { pageTitle: 'Página não encontrada' });
    }

    const check = validateNivelInput(req.body);
    if (!check.valid) {
      return res.status(400).render('trilhas/show', {
        pageTitle: trilha.nome,
        trilha,
        erro: check.error
      });
    }

    TrilhaModel.adicionarNivel(db, trilha.id, check.data.nome);
    res.redirect(getSafeRedirect(req.body.redirect_to, `/trilhas/${trilha.id}`));
  });

  router.post('/trilhas/:id/niveis/:nivelId/alternar', (req, res) => {
    const trilha = TrilhaModel.buscarPorId(db, req.params.id);
    if (!trilha) {
      return res.status(404).render('errors/404', { pageTitle: 'Página não encontrada' });
    }

    TrilhaModel.alternarNivel(db, trilha.id, req.params.nivelId);
    res.redirect(getSafeRedirect(req.body.redirect_to, `/trilhas/${trilha.id}`));
  });

  router.post('/trilhas/:id/niveis/:nivelId/excluir', (req, res) => {
    const trilha = TrilhaModel.buscarPorId(db, req.params.id);
    if (!trilha) {
      return res.status(404).render('errors/404', { pageTitle: 'Página não encontrada' });
    }

    TrilhaModel.excluirNivel(db, trilha.id, req.params.nivelId);
    res.redirect(getSafeRedirect(req.body.redirect_to, `/trilhas/${trilha.id}`));
  });

  router.post('/trilhas/:id/excluir', (req, res) => {
    TrilhaModel.excluir(db, req.params.id);
    res.redirect(getSafeRedirect(req.body.redirect_to, '/desenvolvimento'));
  });

  // 5. Editar Trilha
  router.get('/trilhas/:id/editar', (req, res) => {
    const trilha = TrilhaModel.buscarPorId(db, req.params.id);
    if (!trilha) {
      return res.status(404).render('errors/404', { pageTitle: 'Página não encontrada' });
    }

    const subareas = AreaModel.getAllSubareas(db);
    res.render('trilhas/edit', {
      pageTitle: `Editar ${trilha.nome}`,
      erro: null,
      trilha,
      dados: {
        nome: trilha.nome,
        categoria: trilha.categoria,
        descricao: trilha.descricao || '',
        status: trilha.status
      },
      subareas,
      statuses: VALID_STATUSES
    });
  });

  router.post('/trilhas/:id/editar', (req, res) => {
    const trilha = TrilhaModel.buscarPorId(db, req.params.id);
    if (!trilha) {
      return res.status(404).render('errors/404', { pageTitle: 'Página não encontrada' });
    }

    const check = validateTrilhaInput(req.body);
    if (!check.valid) {
      const subareas = AreaModel.getAllSubareas(db);
      return res.status(400).render('trilhas/edit', {
        pageTitle: `Editar ${trilha.nome}`,
        erro: check.error,
        trilha,
        dados: check.data,
        subareas,
        statuses: VALID_STATUSES
      });
    }

    TrilhaModel.atualizar(db, trilha.id, check.data);
    res.redirect('/desenvolvimento');
  });

  // 6. Questões / Avaliar Conhecimento (Quiz funcional com XP)
  router.get('/quiz', (req, res) => {
    const qIndex = Number(req.query.q) || 0;
    const questao = QuizModel.getQuestionByIndex(qIndex);
    const usuario = UsuarioModel.getDemo(db);

    res.render('quiz/index', {
      pageTitle: 'Questões',
      questao,
      resultado: null,
      usuario
    });
  });

  router.post('/quiz', (req, res) => {
    const qIndex = Number(req.body.q_index) || 0;
    const questionId = Number(req.body.question_id);
    const resposta = req.body.resposta;

    const resultado = QuizModel.avaliarResposta(db, questionId, resposta);
    const questao = QuizModel.getQuestionByIndex(qIndex);
    const usuario = UsuarioModel.getDemo(db);

    res.render('quiz/index', {
      pageTitle: 'Questões',
      questao,
      resultado,
      usuario
    });
  });

  // 7. MyPlayer
  router.get('/myplayer', (req, res) => {
    res.render('myplayer/index', {
      pageTitle: 'MyPlayer',
      usuario: UsuarioModel.getDemo(db),
      trilhas: TrilhaModel.listarTodas(db),
      skills: TrilhaModel.listarSkills(db),
      classe: TrilhaModel.getClasseAtual(db),
      mensagem: null,
      erro: null
    });
  });

  router.post('/myplayer', (req, res) => {
    const acao = String(req.body.acao || '');

    if (acao === 'editar_usuario') {
      const check = validateUsuarioInput(req.body);
      if (!check.valid) {
        return res.status(400).render('myplayer/index', {
          pageTitle: 'MyPlayer',
          usuario: UsuarioModel.getDemo(db),
          trilhas: TrilhaModel.listarTodas(db),
          skills: TrilhaModel.listarSkills(db),
          classe: TrilhaModel.getClasseAtual(db),
          mensagem: null,
          erro: check.error
        });
      }

      UsuarioModel.atualizarDemo(db, check.data.nome, check.data.sobrenome);
      return res.redirect('/myplayer');
    }

    if (acao === 'excluir') {
      TrilhaModel.excluir(db, req.body.id);
      return res.redirect('/myplayer');
    }

    if (acao === 'acrescentar') {
      const acrescentou = TrilhaModel.acrescentarPorSkill(String(req.body.nome || '').trim());
      if (acrescentou) {
        return res.redirect('/myplayer');
      }
      return res.status(400).render('myplayer/index', {
        pageTitle: 'MyPlayer',
        usuario: UsuarioModel.getDemo(db),
        trilhas: TrilhaModel.listarTodas(db),
        skills: TrilhaModel.listarSkills(db),
        classe: TrilhaModel.getClasseAtual(db),
        mensagem: null,
        erro: 'Essa Skill ainda precisa de 3 trilhas com o mesmo nome.'
      });
    }

    res.redirect('/myplayer');
  });

  // 8. Areas & Subareas
  router.get('/areas', (req, res) => {
    const areas = AreaModel.getAllWithSubareas(db);
    res.render('areas/index', {
      pageTitle: 'Áreas',
      areas
    });
  });

  return router;
}
