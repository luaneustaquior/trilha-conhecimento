import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

export function createDatabase(
  dbPath = process.env.DB_PATH || path.join(ROOT_DIR, 'database', 'database.sqlite'),
  options = {}
) {
  const { seedDemoTrilhas = false } = options;

  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');

  const schemaSql = fs.readFileSync(path.join(ROOT_DIR, 'database', 'schema.sql'), 'utf-8');
  db.exec(schemaSql);

  // Safe migrations for existing/extended columns & activity history
  ensureColumn(db, 'usuarios', 'sobrenome', 'TEXT');
  ensureColumn(db, 'niveis', 'concluido', 'INTEGER DEFAULT 0');

  db.exec(`
    CREATE TABLE IF NOT EXISTS historico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      xp_delta INTEGER DEFAULT 0,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed initial data if tables are empty
  const userCount = db.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total;
  const areaCount = db.prepare('SELECT COUNT(*) AS total FROM areas').get().total;

  if (userCount === 0 || areaCount === 0) {
    const seedSql = fs.readFileSync(path.join(ROOT_DIR, 'database', 'seed.sql'), 'utf-8');
    db.exec(seedSql);
  }

  if (seedDemoTrilhas) {
    const trilhaCount = db.prepare('SELECT COUNT(*) AS total FROM trilhas').get().total;
    const histCount = db.prepare('SELECT COUNT(*) AS total FROM historico').get().total;
    if (trilhaCount === 0 && histCount === 0) {
      seedPrototypeDemo(db);
    }
  }

  return db;
}

function seedPrototypeDemo(db) {
  const user = db.prepare('SELECT id FROM usuarios ORDER BY id ASC LIMIT 1').get();
  if (!user) return;

  const findSub = db.prepare('SELECT id FROM subareas WHERE LOWER(nome_subarea) = LOWER(?) LIMIT 1');
  const getSubId = (name, areaName) => {
    const found = findSub.get(name);
    if (found) return found.id;
    let area = db.prepare('SELECT id FROM areas WHERE LOWER(nome_area) = LOWER(?) LIMIT 1').get(areaName);
    if (!area) {
      const resA = db.prepare('INSERT INTO areas (nome_area, descricao) VALUES (?, ?)').run(areaName, 'Área de estudo');
      area = { id: Number(resA.lastInsertRowid) };
    }
    const resS = db.prepare('INSERT INTO subareas (area_id, nome_subarea) VALUES (?, ?)').run(area.id, name);
    return Number(resS.lastInsertRowid);
  };

  const insertTrilha = db.prepare(`
    INSERT INTO trilhas (usuario_id, subarea_id, nome, descricao, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertNivel = db.prepare(`
    INSERT INTO niveis (trilha_id, nome, ordem, concluido)
    VALUES (?, ?, ?, ?)
  `);

  const t1 = Number(insertTrilha.run(
    user.id,
    getSubId('Python & IA', 'Data Science'),
    'Dominando Inteligência Artificial',
    'Aprofunde seus conhecimentos em IA, modelos de aprendizado de máquina e redes neurais.',
    'Em andamento'
  ).lastInsertRowid);
  insertNivel.run(t1, 'Introdução à Inteligência Artificial', 1, 1);
  insertNivel.run(t1, 'Aprendizado de Máquina (ML)', 2, 1);
  insertNivel.run(t1, 'Fundamentos de Redes Neurais', 3, 0);

  const t2 = Number(insertTrilha.run(
    user.id,
    getSubId('React', 'Frontend'),
    'Interfaces Web Modernas',
    'Componentização, responsividade, acessibilidade e gestão de estado.',
    'Em andamento'
  ).lastInsertRowid);
  insertNivel.run(t2, 'HTML Semântico e CSS Grid', 1, 1);
  insertNivel.run(t2, 'JavaScript Assíncrono', 2, 1);
  insertNivel.run(t2, 'Hooks e Arquitetura React', 3, 0);
  insertNivel.run(t2, 'Testes de Interface', 4, 0);

  const t3 = Number(insertTrilha.run(
    user.id,
    getSubId('Node.js', 'Backend'),
    'Arquitetura Backend com Node.js',
    'Construção de servidores Express, rotas REST e persistência SQLite.',
    'Em andamento'
  ).lastInsertRowid);
  insertNivel.run(t3, 'Fundamentos do Express', 1, 1);
  insertNivel.run(t3, 'Validação e Middlewares', 2, 0);

  const t4 = Number(insertTrilha.run(
    user.id,
    getSubId('SQLite', 'Banco de Dados'),
    'Modelagem Relacional SQLite',
    'Chaves estrangeiras, índices e consultas preparadas.',
    'Concluída'
  ).lastInsertRowid);
  insertNivel.run(t4, 'Normalização e Schema SQL', 1, 1);
  insertNivel.run(t4, 'Índices e Integridade Referencial', 2, 1);

  // Sync XP for seeded trilhas (4 * 50) + concluded levels (7 * 20) = 340 XP
  db.prepare('UPDATE usuarios SET xp_total = 340 WHERE id = ?').run(user.id);
  registrarHistorico(db, 'criacao', 'Trilhas iniciais carregadas para começar sua jornada', 340);
}

function ensureColumn(db, table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some((col) => col.name === column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}

export function registrarHistorico(db, tipo, descricao, xpDelta = 0) {
  db.prepare(`
    INSERT INTO historico (tipo, descricao, xp_delta)
    VALUES (?, ?, ?)
  `).run(tipo, descricao, xpDelta);
}
