<?php

require_once __DIR__ . '/../core/database.php';

class Area
{
    private $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function getAll()
    {
        $sql = "SELECT * FROM areas ORDER BY nome_area";

        $stmt = $this->db->query($sql);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}