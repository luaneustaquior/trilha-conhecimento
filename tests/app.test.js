import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createDatabase } from '../src/db/database.js';
import { createApp } from '../src/app.js';
import { UsuarioModel } from '../src/models/Usuario.js';
import { AreaModel } from '../src/models/Area.js';
import { TrilhaModel, XP_POR_TRILHA, XP_POR_NIVEL } from '../src/models/Trilha.js';
import { validateTrilhaInput, validateUsuarioInput, validateNivelInput } from '../src/utils/validation.js';

function startTestServer() {
  const db = createDatabase(':memory:');
  const app = createApp(db);
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        db,
        server,
        baseUrl: `http://127.0.0.1:${port}`
      });
    });
  });
}

test('Database seeds initial user, areas, and subareas with foreign keys enabled', () => {
  const db = createDatabase(':memory:');
  const fk = db.prepare('PRAGMA foreign_keys').get();
  assert.equal(fk.foreign_keys, 1);

  const usuario = UsuarioModel.getDemo(db);
  assert.equal(usuario.nome, 'Usuario Demo');
  assert.equal(usuario.xp_total, 0);

  const areas = AreaModel.getAllWithSubareas(db);
  assert.equal(areas.length, 7);
  const frontend = areas.find((a) => a.nome_area === 'Frontend');
  assert.ok(frontend);
  assert.equal(frontend.subareas.length, 4);
  db.close();
});

test('Input validation rejects empty, oversized, and invalid status payloads', () => {
  assert.equal(validateTrilhaInput({ nome: '   ' }).valid, false);
  assert.equal(validateTrilhaInput({ nome: 'a'.repeat(121) }).valid, false);
  assert.equal(validateTrilhaInput({ nome: 'Ok', categoria: 'c'.repeat(81) }).valid, false);
  assert.equal(validateTrilhaInput({ nome: 'Ok', descricao: 'd'.repeat(1001) }).valid, false);
  assert.equal(validateTrilhaInput({ nome: 'Ok', status: 'Invalido' }).valid, false);
  assert.equal(validateTrilhaInput({ nome: 'Node', categoria: 'Node.js', status: 'Concluída' }).valid, true);

  assert.equal(validateUsuarioInput({ nome: '' }).valid, false);
  assert.equal(validateUsuarioInput({ nome: 'Luan', sobrenome: 'Eustaquio' }).valid, true);

  assert.equal(validateNivelInput({ nome: '  ' }).valid, false);
  assert.equal(validateNivelInput({ nome: 'Etapa 1' }).valid, true);
});

test('Trilha CRUD, XP, Skills, Classes, Niveis, and Cascade Delete work accurately', () => {
  const db = createDatabase(':memory:');

  // Initial class
  assert.equal(TrilhaModel.getClasseAtual(db).nome, 'Aprendiz');
  assert.equal(TrilhaModel.listarSkills(db).length, 0);

  // Create 3 trilhas with same name -> unlocks Skill & Estudioso class
  const t1 = TrilhaModel.criar(db, { nome: 'SQLite', categoria: 'SQLite', descricao: 'Basico' });
  const t2 = TrilhaModel.criar(db, { nome: 'SQLite', categoria: 'SQLite', descricao: 'Indices' });
  const t3 = TrilhaModel.criar(db, { nome: 'SQLite', categoria: 'CategoriaCustom', descricao: 'Triggers' });

  let usuario = UsuarioModel.getDemo(db);
  assert.equal(usuario.xp_total, 3 * XP_POR_TRILHA);

  const skills = TrilhaModel.listarSkills(db);
  assert.equal(skills.length, 1);
  assert.equal(skills[0].nome, 'SQLite');
  assert.equal(skills[0].total, 3);
  assert.equal(TrilhaModel.getClasseAtual(db).nome, 'Estudioso');

  // Edit trilha
  const updated = TrilhaModel.atualizar(db, t2.id, {
    nome: 'SQLite',
    categoria: 'SQLite',
    descricao: 'Indices e joins',
    status: 'Concluída'
  });
  assert.equal(updated.status, 'Concluída');
  assert.equal(updated.descricao, 'Indices e joins');

  // Add and toggle niveis on t1
  const n1 = TrilhaModel.adicionarNivel(db, t1.id, 'Modelagem');
  const n2 = TrilhaModel.adicionarNivel(db, t1.id, 'Consultas');
  assert.equal(n1.ordem, 1);
  assert.equal(n2.ordem, 2);

  TrilhaModel.alternarNivel(db, t1.id, n1.id);
  usuario = UsuarioModel.getDemo(db);
  assert.equal(usuario.xp_total, 3 * XP_POR_TRILHA + XP_POR_NIVEL);

  // acrescentarPorSkill creates 4th trilha
  assert.equal(TrilhaModel.acrescentarPorSkill(db, 'SQLite'), true);
  assert.equal(TrilhaModel.acrescentarPorSkill(db, 'NaoExiste'), false);

  // Statistics & History check
  const stats = TrilhaModel.getEstatisticas(db);
  assert.equal(stats.total_trilhas, 4);
  assert.equal(stats.concluidas, 1);
  assert.equal(stats.niveis_concluidos, 1);
  assert.ok(TrilhaModel.getHistorico(db).length >= 5);

  // Delete t1 -> ON DELETE CASCADE removes n1, n2 and deducts XP
  TrilhaModel.excluir(db, t1.id);
  const niveisRestantes = db.prepare('SELECT * FROM niveis WHERE trilha_id = ?').all(t1.id);
  assert.equal(niveisRestantes.length, 0);

  // Delete t3 (which used CategoriaCustom) -> orphan custom subarea is cleaned up
  TrilhaModel.excluir(db, t3.id);
  const customSub = db.prepare("SELECT * FROM subareas WHERE nome_subarea = 'CategoriaCustom'").get();
  assert.equal(customSub, undefined);

  // Skill should be revoked now (only 2 left)
  assert.equal(TrilhaModel.listarSkills(db).length, 0);
  assert.equal(TrilhaModel.getClasseAtual(db).nome, 'Aprendiz');

  db.close();
});

test('HTTP routes render views, handle forms, query dispatcher, assets, and 404s', async () => {
  const { db, server, baseUrl } = await startTestServer();

  try {
    // 1. Root & ?url= routes
    const resHome = await fetch(`${baseUrl}/`);
    assert.equal(resHome.status, 200);
    const htmlHome = await resHome.text();
    assert.match(htmlHome, /Sua Árvore de Conhecimento/);
    assert.match(htmlHome, /id="theme-toggle"/);
    assert.match(htmlHome, /\/assets\/css\/style\.css/);
    assert.match(htmlHome, /\/assets\/js\/app\.js/);

    const resLegacyAreas = await fetch(`${baseUrl}/?url=areas`);
    assert.equal(resLegacyAreas.status, 200);
    const htmlAreas = await resLegacyAreas.text();
    assert.match(htmlAreas, /Frontend/);
    assert.match(htmlAreas, /React/);

    // 2. Static assets & dual theme tokens
    const resCss = await fetch(`${baseUrl}/assets/css/style.css`);
    assert.equal(resCss.status, 200);
    const cssText = await resCss.text();
    assert.match(cssText, /\[data-theme="dark"\]/);
    assert.match(cssText, /\[data-theme="light"\]/);

    const resJs = await fetch(`${baseUrl}/assets/js/app.js`);
    assert.equal(resJs.status, 200);
    assert.match(await resJs.text(), /trilha-theme/);

    // 3. Create trilha POST -> redirect to /desenvolvimento
    const createRes = await fetch(`${baseUrl}/criar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        nome: 'Express Avançado',
        categoria: 'Node.js',
        status: 'Em andamento',
        descricao: 'Middlewares e testes'
      }),
      redirect: 'manual'
    });
    assert.equal(createRes.status, 302);
    assert.equal(createRes.headers.get('location'), '/desenvolvimento');

    // 4. Invalid POST returns 400 with error message
    const badCreate = await fetch(`${baseUrl}/criar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ nome: '' })
    });
    assert.equal(badCreate.status, 400);
    assert.match(await badCreate.text(), /Informe o nome da trilha/);

    // 5. Desenvolvimento (Gestão de Trilha) shows created trilha & stats
    const resDev = await fetch(`${baseUrl}/desenvolvimento`);
    assert.equal(resDev.status, 200);
    const htmlDev = await resDev.text();
    assert.match(htmlDev, /Gestão de Trilha/);
    assert.match(htmlDev, /Express Avançado/);
    assert.match(htmlDev, /50 XP/);

    // 6. Legacy ?url=trilhas/1 and ?url=trilhas/1/editar work
    const resDetail = await fetch(`${baseUrl}/?url=trilhas/1`);
    assert.equal(resDetail.status, 200);
    assert.match(await resDetail.text(), /Níveis da Trilha/);

    const resEdit = await fetch(`${baseUrl}/?url=trilhas/1/editar`);
    assert.equal(resEdit.status, 200);
    assert.match(await resEdit.text(), /Editar Trilha/);

    // 7. Add nivel and toggle it
    const addNivelRes = await fetch(`${baseUrl}/trilhas/1/niveis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ nome: 'Rotas Express' }),
      redirect: 'manual'
    });
    assert.equal(addNivelRes.status, 302);

    const toggleNivelRes = await fetch(`${baseUrl}/trilhas/1/niveis/1/alternar`, {
      method: 'POST',
      redirect: 'manual'
    });
    assert.equal(toggleNivelRes.status, 302);
    assert.equal(UsuarioModel.getDemo(db).xp_total, XP_POR_TRILHA + XP_POR_NIVEL);

    // 8. Quiz route & XP reward
    const resQuiz = await fetch(`${baseUrl}/quiz`);
    assert.equal(resQuiz.status, 200);
    assert.match(await resQuiz.text(), /Avaliar Conhecimento/);

    const postQuiz = await fetch(`${baseUrl}/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ question_id: '1', q_index: '0', resposta: '0' })
    });
    assert.equal(postQuiz.status, 200);
    assert.match(await postQuiz.text(), /Resposta correta/);
    assert.equal(UsuarioModel.getDemo(db).xp_total, XP_POR_TRILHA + XP_POR_NIVEL + 15);

    // 9. MyPlayer edit profile & delete trilha
    const editUserRes = await fetch(`${baseUrl}/myplayer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        acao: 'editar_usuario',
        nome: 'Luan',
        sobrenome: 'Eustaquio'
      }),
      redirect: 'manual'
    });
    assert.equal(editUserRes.status, 302);
    assert.equal(UsuarioModel.getDemo(db).nome, 'Luan');

    const delRes = await fetch(`${baseUrl}/myplayer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ acao: 'excluir', id: '1' }),
      redirect: 'manual'
    });
    assert.equal(delRes.status, 302);
    assert.equal(TrilhaModel.listarTodas(db).length, 0);

    // 10. Unknown route returns 404
    const res404 = await fetch(`${baseUrl}/?url=rota-inexistente`);
    assert.equal(res404.status, 404);
    assert.match(await res404.text(), /Página não encontrada/);
  } finally {
    server.close();
    db.close();
  }
});

test('seedDemoTrilhas seeds prototype starter trilhas and levels cleanly', () => {
  const db = createDatabase(':memory:', { seedDemoTrilhas: true });
  const trilhas = TrilhaModel.listarTodas(db);
  assert.equal(trilhas.length, 4);
  const ia = trilhas.find((t) => t.nome === 'Dominando Inteligência Artificial');
  assert.ok(ia);
  assert.equal(ia.niveis.length, 3);
  assert.equal(ia.progresso_percent, 67);
  db.close();
});
