<?php

require_once __DIR__ . '/../core/Database.php';

class Trilha
{
    private $db;
    private $idTypes = [];

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function criar($nome, $categoria, $descricao)
    {
        $usuarioId = $this->garantirUsuarioDemo();
        $subareaId = $this->garantirSubarea($categoria);

        $campos = [
            'usuario_id',
            'subarea_id',
            'nome',
            'descricao'
        ];

        $params = [
            ':usuario_id' => $usuarioId,
            ':subarea_id' => $subareaId,
            ':nome' => $nome,
            ':descricao' => $descricao
        ];

        if ($this->usaIdTexto('trilhas')) {
            array_unshift($campos, 'id');
            $params[':id'] = $this->novoId('trilha');
        }

        $placeholders = array_map(function ($campo) {
            return ':' . $campo;
        }, $campos);

        $sql = "
            INSERT INTO trilhas (
                " . implode(', ', $campos) . "
            ) VALUES (
                " . implode(', ', $placeholders) . "
            )
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute($params);
    }

    public function listarTodas()
    {
        $sql = "
            SELECT
                trilhas.*,
                subareas.nome_subarea AS categoria
            FROM trilhas
            INNER JOIN subareas
                ON subareas.id = trilhas.subarea_id
            ORDER BY trilhas.criado_em DESC, trilhas.id DESC
        ";

        $stmt = $this->db->query($sql);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function listarSkills()
    {
        $sql = "
            SELECT
                nome,
                COUNT(*) AS total
            FROM trilhas
            GROUP BY nome
            HAVING COUNT(*) >= 3
            ORDER BY nome
        ";

        $stmt = $this->db->query($sql);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getClasseAtual()
    {
        $maiorTotal = $this->getMaiorTotalPorNome();

        if ($maiorTotal >= 9) {
            return [
                'nome' => 'Mestre',
                'total' => $maiorTotal,
                'proxima' => null,
                'faltam' => 0
            ];
        }

        if ($maiorTotal >= 6) {
            return [
                'nome' => 'Sabio',
                'total' => $maiorTotal,
                'proxima' => 'Mestre',
                'faltam' => 9 - $maiorTotal
            ];
        }

        if ($maiorTotal >= 3) {
            return [
                'nome' => 'Estudioso',
                'total' => $maiorTotal,
                'proxima' => 'Sabio',
                'faltam' => 6 - $maiorTotal
            ];
        }

        return [
            'nome' => 'Aprendiz',
            'total' => $maiorTotal,
            'proxima' => 'Estudioso',
            'faltam' => 3 - $maiorTotal
        ];
    }

    public function excluir($id)
    {
        $stmt = $this->db->prepare("
            DELETE FROM trilhas
            WHERE id = :id
        ");

        $stmt->execute([
            ':id' => $id
        ]);
    }

    public function acrescentarPorSkill($nome)
    {
        $skill = $this->buscarSkillLiberada($nome);

        if (!$skill) {
            return false;
        }

        $this->criar(
            $skill['nome'],
            $skill['categoria'],
            'Trilha acrescentada pelo MyPlayer.'
        );

        return true;
    }

    private function garantirUsuarioDemo()
    {
        $stmt = $this->db->query("
            SELECT id
            FROM usuarios
            WHERE id IS NOT NULL
                AND id != ''
            LIMIT 1
        ");

        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario) {
            return $usuario['id'];
        }

        if ($this->usaIdTexto('usuarios')) {
            $stmt = $this->db->prepare("
                INSERT INTO usuarios (id, nome, xp_total)
                VALUES (:id, :nome, 0)
            ");

            $id = $this->novoId('usuario');

            $stmt->execute([
                ':id' => $id,
                ':nome' => 'Usuario Demo'
            ]);

            return $id;
        }

        $stmt = $this->db->prepare("
            INSERT INTO usuarios (nome, xp_total)
            VALUES (:nome, 0)
        ");

        $stmt->execute([
            ':nome' => 'Usuario Demo'
        ]);

        return $this->db->lastInsertId();
    }

    private function garantirSubarea($categoria)
    {
        $categoria = trim($categoria);

        if ($categoria === '') {
            $categoria = 'Geral';
        }

        $stmt = $this->db->prepare("
            SELECT id
            FROM subareas
            WHERE nome_subarea = :categoria
            LIMIT 1
        ");

        $stmt->execute([
            ':categoria' => $categoria
        ]);

        $subarea = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($subarea) {
            return $subarea['id'];
        }

        $areaId = $this->garantirAreaGeral();

        if ($this->usaIdTexto('subareas')) {
            $id = $this->novoId('subarea');

            $stmt = $this->db->prepare("
                INSERT INTO subareas (id, area_id, nome_subarea)
                VALUES (:id, :area_id, :categoria)
            ");

            $stmt->execute([
                ':id' => $id,
                ':area_id' => $areaId,
                ':categoria' => $categoria
            ]);

            return $id;
        }

        $stmt = $this->db->prepare("
            INSERT INTO subareas (area_id, nome_subarea)
            VALUES (:area_id, :categoria)
        ");

        $stmt->execute([
            ':area_id' => $areaId,
            ':categoria' => $categoria
        ]);

        return $this->db->lastInsertId();
    }

    private function garantirAreaGeral()
    {
        $stmt = $this->db->prepare("
            SELECT id
            FROM areas
            WHERE nome_area = :nome
                AND id IS NOT NULL
                AND id != ''
            LIMIT 1
        ");

        $stmt->execute([
            ':nome' => 'Geral'
        ]);

        $area = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($area) {
            return $area['id'];
        }

        if ($this->usaIdTexto('areas')) {
            $id = $this->novoId('area');

            $stmt = $this->db->prepare("
                UPDATE areas
                SET id = :id
                WHERE nome_area = :nome
                    AND (
                        id IS NULL
                        OR id = ''
                    )
            ");

            $stmt->execute([
                ':id' => $id,
                ':nome' => 'Geral'
            ]);

            if ($stmt->rowCount() > 0) {
                return $id;
            }

            $stmt = $this->db->prepare("
                INSERT INTO areas (id, nome_area, descricao)
                VALUES (:id, :nome, :descricao)
            ");

            $stmt->execute([
                ':id' => $id,
                ':nome' => 'Geral',
                ':descricao' => 'Trilhas cadastradas sem area especifica'
            ]);

            return $id;
        }

        $stmt = $this->db->prepare("
            INSERT INTO areas (nome_area, descricao)
            VALUES (:nome, :descricao)
        ");

        $stmt->execute([
            ':nome' => 'Geral',
            ':descricao' => 'Trilhas cadastradas sem area especifica'
        ]);

        return $this->db->lastInsertId();
    }

    private function buscarSkillLiberada($nome)
    {
        $stmt = $this->db->prepare("
            SELECT
                trilhas.nome,
                subareas.nome_subarea AS categoria,
                COUNT(*) AS total
            FROM trilhas
            INNER JOIN subareas
                ON subareas.id = trilhas.subarea_id
            WHERE trilhas.nome = :nome
            GROUP BY trilhas.nome, subareas.nome_subarea
            HAVING COUNT(*) >= 3
            ORDER BY total DESC
            LIMIT 1
        ");

        $stmt->execute([
            ':nome' => $nome
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getMaiorTotalPorNome()
    {
        $stmt = $this->db->query("
            SELECT COUNT(*) AS total
            FROM trilhas
            GROUP BY nome
            ORDER BY total DESC
            LIMIT 1
        ");

        $linha = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$linha) {
            return 0;
        }

        return (int) $linha['total'];
    }

    private function usaIdTexto($tabela)
    {
        if (isset($this->idTypes[$tabela])) {
            return $this->idTypes[$tabela] === 'TEXT';
        }

        $stmt = $this->db->query("PRAGMA table_info($tabela)");

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $coluna) {
            if ($coluna['name'] === 'id') {
                $this->idTypes[$tabela] = strtoupper($coluna['type']);

                return $this->idTypes[$tabela] === 'TEXT';
            }
        }

        $this->idTypes[$tabela] = '';

        return false;
    }

    private function novoId($prefixo)
    {
        return $prefixo . '-' . bin2hex(random_bytes(8));
    }
}
