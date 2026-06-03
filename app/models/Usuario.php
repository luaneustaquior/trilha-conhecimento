<?php

require_once __DIR__ . '/../core/Database.php';

class Usuario
{
    public static function getDemo()
    {
        $db = Database::connect();

        $sql = "
            SELECT *
            FROM usuarios
            LIMIT 1
        ";

        $stmt = $db->query($sql);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}