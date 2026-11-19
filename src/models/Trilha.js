import { registrarHistorico } from '../db/database.js';
import { UsuarioModel } from './Usuario.js';

export const XP_POR_TRILHA = 50;
export const XP_POR_NIVEL = 20;

export const TrilhaModel = {
  garantirAreaGeral(db) {
    const existing = db.prepare(`
      SELECT id FROM areas WHERE LOWER(nome_area) = LOWER('Geral') LIMIT 1
    `).get();

    if (existing) {
      return existing.id;
    }

    const result = db.prepare(`
      INSERT INTO areas (nome_area, descricao)
      VALUES (?, ?)
    `).run('Geral', 'Trilhas cadastradas sem area especifica');

    return Number(result.lastInsertRowid);
  },

  garantirSubarea(db, categoria) {
    const cat = (categoria || '').trim() || 'Geral';

    const existing = db.prepare(`
      SELECT id, nome_subarea
      FROM subareas
      WHERE LOWER(nome_subarea) = LOWER(?)
      LIMIT 1
    `).get(cat);

    if (existing) {
      return existing;
    }

    const areaGeralId = this.garantirAreaGeral(db);
    const result = db.prepare(`
      INSERT INTO subareas (area_id, nome_subarea)
      VALUES (?, ?)
    `).run(areaGeralId, cat);

    return {
      id: Number(result.lastInsertRowid),
      nome_subarea: cat
    };
  },

  criar(db, { nome, categoria, descricao, status = 'Em andamento' }) {
    const usuario = UsuarioModel.getDemo(db);
    const subarea = this.garantirSubarea(db, categoria);

    const result = db.prepare(`
      INSERT INTO trilhas (usuario_id, subarea_id, nome, descricao, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(usuario.id, subarea.id, nome, descricao, status);

    const id = Number(result.lastInsertRowid);
    UsuarioModel.adicionarXp(db, XP_POR_TRILHA);
    registrarHistorico(db, 'criacao', `Trilha "${nome}" (${subarea.nome_subarea}) criada`, XP_POR_TRILHA);

    return this.buscarPorId(db, id);
  },

  buscarPorId(db, id) {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) return null;

    const trilha = db.prepare(`
      SELECT
        t.*,
        s.nome_subarea AS categoria,
        a.nome_area AS area
      FROM trilhas t
      INNER JOIN subareas s ON s.id = t.subarea_id
      INNER JOIN areas a ON a.id = s.area_id
      WHERE t.id = ?
    `).get(numId);

    if (!trilha) return null;

    const niveis = this.listarNiveis(db, numId);
    const niveisTotal = niveis.length;
    const niveisConcluidos = niveis.filter((n) => Number(n.concluido) === 1).length;
    const progressoPercent = this.calcularProgresso(trilha.status, niveisTotal, niveisConcluidos);

    return {
      ...trilha,
      niveis,
      niveis_total: niveisTotal,
      niveis_concluidos: niveisConcluidos,
      progresso_percent: progressoPercent
    };
  },

  calcularProgresso(status, niveisTotal, niveisConcluidos) {
    if (niveisTotal > 0) {
      return Math.round((niveisConcluidos / niveisTotal) * 100);
    }
    return status === 'Concluída' ? 100 : 0;
  },

  atualizar(db, id, { nome, categoria, descricao, status }) {
    const existente = this.buscarPorId(db, id);
    if (!existente) return null;

    const subarea = this.garantirSubarea(db, categoria);
    db.prepare(`
      UPDATE trilhas
      SET subarea_id = ?, nome = ?, descricao = ?, status = ?
      WHERE id = ?
    `).run(subarea.id, nome, descricao, status, existente.id);

    this.limparSubareaOrfa(db, existente.subarea_id);
    registrarHistorico(db, 'edicao', `Trilha "${nome}" atualizada (${status})`, 0);

    return this.buscarPorId(db, existente.id);
  },

  excluir(db, id) {
    const existente = this.buscarPorId(db, id);
    if (!existente) return false;

    const concluidos = existente.niveis.filter((n) => Number(n.concluido) === 1).length;
    const xpRemover = -(XP_POR_TRILHA + concluidos * XP_POR_NIVEL);

    db.prepare('DELETE FROM trilhas WHERE id = ?').run(existente.id);
    this.limparSubareaOrfa(db, existente.subarea_id);

    UsuarioModel.adicionarXp(db, xpRemover);
    registrarHistorico(db, 'exclusao', `Trilha "${existente.nome}" excluída`, xpRemover);

    return true;
  },

  limparSubareaOrfa(db, subareaId) {
    const ref = db.prepare('SELECT COUNT(*) AS total FROM trilhas WHERE subarea_id = ?').get(subareaId);
    if (ref.total > 0) return;

    const sub = db.prepare(`
      SELECT s.id, a.nome_area
      FROM subareas s
      INNER JOIN areas a ON a.id = s.area_id
      WHERE s.id = ?
    `).get(subareaId);

    if (sub && sub.id > 12 && sub.nome_area === 'Geral') {
      db.prepare('DELETE FROM subareas WHERE id = ?').run(subareaId);
    }
  },

  listarTodas(db) {
    const trilhas = db.prepare(`
      SELECT
        t.*,
        s.nome_subarea AS categoria,
        a.nome_area AS area,
        COUNT(n.id) AS niveis_total,
        COALESCE(SUM(CASE WHEN n.concluido = 1 THEN 1 ELSE 0 END), 0) AS niveis_concluidos
      FROM trilhas t
      INNER JOIN subareas s ON s.id = t.subarea_id
      INNER JOIN areas a ON a.id = s.area_id
      LEFT JOIN niveis n ON n.trilha_id = t.id
      GROUP BY t.id
      ORDER BY t.criado_em DESC, t.id DESC
    `).all();

    const todosNiveis = db.prepare(`
      SELECT id, trilha_id, nome, ordem, concluido
      FROM niveis
      ORDER BY ordem ASC, id ASC
    `).all();

    const niveisPorTrilha = new Map();
    for (const n of todosNiveis) {
      if (!niveisPorTrilha.has(n.trilha_id)) {
        niveisPorTrilha.set(n.trilha_id, []);
      }
      niveisPorTrilha.get(n.trilha_id).push(n);
    }

    return trilhas.map((t) => {
      const niveisTotal = Number(t.niveis_total || 0);
      const niveisConcluidos = Number(t.niveis_concluidos || 0);
      return {
        ...t,
        niveis_total: niveisTotal,
        niveis_concluidos: niveisConcluidos,
        progresso_percent: this.calcularProgresso(t.status, niveisTotal, niveisConcluidos),
        niveis: niveisPorTrilha.get(t.id) || []
      };
    });
  },

  listarSkills(db) {
    return db.prepare(`
      SELECT
        nome,
        COUNT(*) AS total
      FROM trilhas
      GROUP BY nome
      HAVING COUNT(*) >= 3
      ORDER BY nome COLLATE NOCASE ASC
    `).all();
  },

  getClasseAtual(db) {
    const row = db.prepare(`
      SELECT COUNT(*) AS total
      FROM trilhas
      GROUP BY nome
      ORDER BY total DESC
      LIMIT 1
    `).get();

    const maiorTotal = row ? Number(row.total) : 0;

    if (maiorTotal >= 9) {
      return { nome: 'Mestre', total: maiorTotal, proxima: null, faltam: 0, progressoPercent: 100 };
    }
    if (maiorTotal >= 6) {
      return { nome: 'Sabio', total: maiorTotal, proxima: 'Mestre', faltam: 9 - maiorTotal, progressoPercent: Math.round((maiorTotal / 9) * 100) };
    }
    if (maiorTotal >= 3) {
      return { nome: 'Estudioso', total: maiorTotal, proxima: 'Sabio', faltam: 6 - maiorTotal, progressoPercent: Math.round((maiorTotal / 6) * 100) };
    }
    return { nome: 'Aprendiz', total: maiorTotal, proxima: 'Estudioso', faltam: 3 - maiorTotal, progressoPercent: Math.round((maiorTotal / 3) * 100) };
  },

  acrescentarPorSkill(db, nome) {
    const skillTotal = db.prepare(`
      SELECT COUNT(*) AS total
      FROM trilhas
      WHERE nome = ?
    `).get(nome);

    if (!skillTotal || Number(skillTotal.total) < 3) return false;

    const categoriaMaisUsada = db.prepare(`
      SELECT
        s.nome_subarea AS categoria,
        COUNT(*) AS total
      FROM trilhas t
      INNER JOIN subareas s ON s.id = t.subarea_id
      WHERE t.nome = ?
      GROUP BY s.nome_subarea
      ORDER BY total DESC
      LIMIT 1
    `).get(nome);

    this.criar(db, {
      nome,
      categoria: categoriaMaisUsada ? categoriaMaisUsada.categoria : 'Geral',
      descricao: 'Trilha acrescentada pelo MyPlayer.',
      status: 'Em andamento'
    });
    return true;
  },

  getEstatisticas(db) {
    const resumo = db.prepare(`
      SELECT
        COUNT(*) AS total_trilhas,
        COALESCE(SUM(CASE WHEN status = 'Em andamento' THEN 1 ELSE 0 END), 0) AS em_andamento,
        COALESCE(SUM(CASE WHEN status = 'Concluída' THEN 1 ELSE 0 END), 0) AS concluidas,
        COALESCE(SUM(CASE WHEN status = 'Pausada' THEN 1 ELSE 0 END), 0) AS pausadas,
        COUNT(DISTINCT subarea_id) AS categorias_ativas
      FROM trilhas
    `).get();

    const areasAtivasRow = db.prepare(`
      SELECT COUNT(DISTINCT s.area_id) AS areas_ativas
      FROM trilhas t
      INNER JOIN subareas s ON s.id = t.subarea_id
    `).get();

    const niveisResumo = db.prepare(`
      SELECT
        COUNT(*) AS total_niveis,
        COALESCE(SUM(CASE WHEN concluido = 1 THEN 1 ELSE 0 END), 0) AS niveis_concluidos
      FROM niveis
    `).get();

    const porCategoria = db.prepare(`
      SELECT
        s.nome_subarea AS categoria,
        COUNT(t.id) AS total
      FROM trilhas t
      INNER JOIN subareas s ON s.id = t.subarea_id
      GROUP BY s.id
      ORDER BY total DESC, categoria COLLATE NOCASE ASC
    `).all();

    return {
      total_trilhas: Number(resumo.total_trilhas || 0),
      em_andamento: Number(resumo.em_andamento || 0),
      concluidas: Number(resumo.concluidas || 0),
      pausadas: Number(resumo.pausadas || 0),
      categorias_ativas: Number(resumo.categorias_ativas || 0),
      areas_ativas: Number(areasAtivasRow.areas_ativas || 0),
      total_niveis: Number(niveisResumo.total_niveis || 0),
      niveis_concluidos: Number(niveisResumo.niveis_concluidos || 0),
      porCategoria
    };
  },

  getHistorico(db, limit = 15) {
    return db.prepare(`
      SELECT id, tipo, descricao, xp_delta, criado_em
      FROM historico
      ORDER BY id DESC
      LIMIT ?
    `).all(limit);
  },

  // Níveis CRUD
  listarNiveis(db, trilhaId) {
    return db.prepare(`
      SELECT id, trilha_id, nome, ordem, concluido
      FROM niveis
      WHERE trilha_id = ?
      ORDER BY ordem ASC, id ASC
    `).all(Number(trilhaId));
  },

  adicionarNivel(db, trilhaId, nome) {
    const trilha = db.prepare('SELECT id, nome FROM trilhas WHERE id = ?').get(Number(trilhaId));
    if (!trilha) return null;

    const maxRow = db.prepare('SELECT COALESCE(MAX(ordem), 0) AS max_ordem FROM niveis WHERE trilha_id = ?').get(trilha.id);
    const proximaOrdem = Number(maxRow.max_ordem) + 1;

    const result = db.prepare(`
      INSERT INTO niveis (trilha_id, nome, ordem, concluido)
      VALUES (?, ?, ?, 0)
    `).run(trilha.id, nome, proximaOrdem);

    registrarHistorico(db, 'nivel', `Nível "${nome}" adicionado em "${trilha.nome}"`, 0);

    return db.prepare('SELECT * FROM niveis WHERE id = ?').get(Number(result.lastInsertRowid));
  },

  alternarNivel(db, trilhaId, nivelId) {
    const nivel = db.prepare(`
      SELECT n.*, t.nome AS trilha_nome
      FROM niveis n
      INNER JOIN trilhas t ON t.id = n.trilha_id
      WHERE n.id = ? AND n.trilha_id = ?
    `).get(Number(nivelId), Number(trilhaId));

    if (!nivel) return null;

    const novoEstado = Number(nivel.concluido) === 1 ? 0 : 1;
    const xpDelta = novoEstado === 1 ? XP_POR_NIVEL : -XP_POR_NIVEL;

    db.prepare('UPDATE niveis SET concluido = ? WHERE id = ?').run(novoEstado, nivel.id);
    UsuarioModel.adicionarXp(db, xpDelta);
    registrarHistorico(
      db,
      'nivel',
      `Nível "${nivel.nome}" (${nivel.trilha_nome}) marcado como ${novoEstado === 1 ? 'concluído' : 'pendente'}`,
      xpDelta
    );

    return { ...nivel, concluido: novoEstado };
  },

  excluirNivel(db, trilhaId, nivelId) {
    const nivel = db.prepare(`
      SELECT n.*, t.nome AS trilha_nome
      FROM niveis n
      INNER JOIN trilhas t ON t.id = n.trilha_id
      WHERE n.id = ? AND n.trilha_id = ?
    `).get(Number(nivelId), Number(trilhaId));

    if (!nivel) return false;

    db.prepare('DELETE FROM niveis WHERE id = ?').run(nivel.id);
    if (Number(nivel.concluido) === 1) {
      UsuarioModel.adicionarXp(db, -XP_POR_NIVEL);
    }
    registrarHistorico(db, 'nivel', `Nível "${nivel.nome}" removido de "${nivel.trilha_nome}"`, Number(nivel.concluido) === 1 ? -XP_POR_NIVEL : 0);
    return true;
  }
};
