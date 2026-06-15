<?php

require_once __DIR__ . '/../core/Database.php';

class Usuario
{
    private static $idType = null;

    public static function getDemo()
    {
        $db = Database::connect();
        self::garantirColunaSobrenome($db);

        $sql = "
            SELECT *
            FROM usuarios
            WHERE id IS NOT NULL
                AND id != ''
            LIMIT 1
        ";

        $stmt = $db->query($sql);

        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario) {
            return $usuario;
        }

        return self::criarDemo($db);
    }

    public static function atualizarDemo($nome, $sobrenome)
    {
        $db = Database::connect();
        self::garantirColunaSobrenome($db);

        $usuario = self::getDemo();

        $stmt = $db->prepare("
            UPDATE usuarios
            SET nome = :nome,
                sobrenome = :sobrenome
            WHERE id = :id
        ");

        $stmt->execute([
            ':nome' => $nome,
            ':sobrenome' => $sobrenome,
            ':id' => $usuario['id']
        ]);
    }

    private static function criarDemo($db)
    {
        if (self::usaIdTexto($db)) {
            $id = self::novoId();

            $stmt = $db->prepare("
                INSERT INTO usuarios (id, nome, sobrenome, xp_total)
                VALUES (:id, :nome, :sobrenome, 0)
            ");

            $stmt->execute([
                ':id' => $id,
                ':nome' => 'Usuario',
                ':sobrenome' => 'Demo'
            ]);

            return self::getDemo();
        }

        $stmt = $db->prepare("
            INSERT INTO usuarios (nome, sobrenome, xp_total)
            VALUES (:nome, :sobrenome, 0)
        ");

        $stmt->execute([
            ':nome' => 'Usuario',
            ':sobrenome' => 'Demo'
        ]);

        return self::getDemo();
    }

    private static function garantirColunaSobrenome($db)
    {
        $stmt = $db->query("PRAGMA table_info(usuarios)");

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $coluna) {
            if ($coluna['name'] === 'sobrenome') {
                return;
            }
        }

        $db->exec("ALTER TABLE usuarios ADD COLUMN sobrenome TEXT");
    }

    private static function usaIdTexto($db)
    {
        if (self::$idType !== null) {
            return self::$idType === 'TEXT';
        }

        $stmt = $db->query("PRAGMA table_info(usuarios)");

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $coluna) {
            if ($coluna['name'] === 'id') {
                self::$idType = strtoupper($coluna['type']);

                return self::$idType === 'TEXT';
            }
        }

        self::$idType = '';

        return false;
    }

    private static function novoId()
    {
        return 'usuario-' . bin2hex(random_bytes(8));
    }
}
