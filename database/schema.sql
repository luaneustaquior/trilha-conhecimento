PRAGMA foreign_keys = ON;

-- =====================
-- USUARIOS
-- =====================
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    sobrenome TEXT,
    xp_total INTEGER DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- AREAS
-- =====================
CREATE TABLE IF NOT EXISTS areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_area TEXT NOT NULL UNIQUE,
    descricao TEXT
);

-- =====================
-- SUBAREAS
-- =====================
CREATE TABLE IF NOT EXISTS subareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id INTEGER NOT NULL,
    nome_subarea TEXT NOT NULL,

    FOREIGN KEY (area_id)
        REFERENCES areas(id)
        ON DELETE CASCADE
);

-- =====================
-- TRILHAS
-- =====================
CREATE TABLE IF NOT EXISTS trilhas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    usuario_id INTEGER NOT NULL,
    subarea_id INTEGER NOT NULL,

    nome TEXT NOT NULL,
    descricao TEXT,
    status TEXT DEFAULT 'Em andamento',

    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE,

    FOREIGN KEY (subarea_id)
        REFERENCES subareas(id)
        ON DELETE CASCADE
);

-- =====================
-- NIVEIS
-- =====================
CREATE TABLE IF NOT EXISTS niveis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    trilha_id INTEGER NOT NULL,

    nome TEXT NOT NULL,
    ordem INTEGER NOT NULL,

    FOREIGN KEY (trilha_id)
        REFERENCES trilhas(id)
        ON DELETE CASCADE
);

-- =====================
-- INDICES
-- =====================

CREATE INDEX IF NOT EXISTS idx_subareas_area
ON subareas(area_id);

CREATE INDEX IF NOT EXISTS idx_trilhas_usuario
ON trilhas(usuario_id);

CREATE INDEX IF NOT EXISTS idx_trilhas_subarea
ON trilhas(subarea_id);

CREATE INDEX IF NOT EXISTS idx_niveis_trilha
ON niveis(trilha_id);

