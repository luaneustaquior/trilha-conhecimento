-- =====================
-- USUARIO DEMO
-- =====================
INSERT OR IGNORE INTO usuarios (
    id,
    nome,
    xp_total
)
VALUES (
    1,
    'Usuario Demo',
    0
);
-- =====================
-- AREAS
-- =====================
INSERT OR IGNORE INTO areas (id, nome_area, descricao) VALUES
(1, 'Frontend', 'Interfaces e experiencia visual'),
(2, 'Backend', 'Regras de negocio e APIs'),
(3, 'Banco de Dados', 'Modelagem e consultas'),
(4, 'DevOps', 'Infraestrutura e deploy'),
(5, 'Mobile', 'Aplicacoes mobile'),
(6, 'Data Science', 'Dados e analise'),
(7, 'UI/UX', 'Design e experiencia do usuario');
-- =====================
-- SUB AREAS
-- =====================
INSERT OR IGNORE INTO subareas (
    id,
    area_id,
    nome_subarea
)
VALUES
(1, 1, 'HTML'),
(2, 1, 'CSS'),
(3, 1, 'JavaScript'),
(4, 1, 'React'),

(5, 2, 'PHP'),
(6, 2, 'Laravel'),
(7, 2, 'Node.js'),
(8, 2, 'APIs REST'),

(9, 3, 'MySQL'),
(10, 3, 'PostgreSQL'),
(11, 3, 'SQLite'),
(12, 3, 'MongoDB');