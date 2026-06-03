PRAGMA foreign_keys = ON;

-- =====================
-- USUARIOS
-- =====================
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    xp_total INTEGER DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- usuário seed padrão
INSERT INTO usuarios (
    id,
    nome,
    xp_total
)
VALUES (
    'user-demo-001',
    'Usuario Demo',
    0
);

-- =====================
-- AREAS
-- =====================
CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY,
    nome_area TEXT NOT NULL UNIQUE,
    descricao TEXT
);

-- =====================
-- SUBAREAS
-- =====================
CREATE TABLE IF NOT EXISTS subareas (
    id TEXT PRIMARY KEY,
    area_id TEXT NOT NULL,
    nome_subarea TEXT NOT NULL,

    FOREIGN KEY (area_id)
        REFERENCES areas(id)
        ON DELETE CASCADE
);

-- =====================
-- TRILHAS
-- =====================
CREATE TABLE IF NOT EXISTS trilhas (
    id TEXT PRIMARY KEY,

    usuario_id TEXT NOT NULL,
    subarea_id TEXT NOT NULL,

    nome TEXT NOT NULL,
    descricao TEXT,
    status TEXT DEFAULT 'Em andamento',

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id),

    FOREIGN KEY (subarea_id)
        REFERENCES subareas(id)
);

-- =====================
-- NIVEIS
-- =====================
CREATE TABLE IF NOT EXISTS niveis (
    id TEXT PRIMARY KEY,

    trilha_id TEXT NOT NULL,

    nome TEXT NOT NULL,
    ordem INTEGER NOT NULL,

    FOREIGN KEY (trilha_id)
        REFERENCES trilhas(id)
        ON DELETE CASCADE
);