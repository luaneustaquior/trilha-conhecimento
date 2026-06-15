<?php

class Database
{
    private static $connection = null;

    public static function connect()
    {
        if (self::$connection === null) {

            $databasePath = __DIR__ . '/../../database/database.sqlite';

            try {

                self::$connection = new PDO("sqlite:$databasePath");

                self::$connection->setAttribute(
                    PDO::ATTR_ERRMODE,
                    PDO::ERRMODE_EXCEPTION
                );

                self::$connection->exec('PRAGMA foreign_keys = ON');

            } catch (PDOException $e) {

                die("Erro na conexão: " . $e->getMessage());
            }
        }

        return self::$connection;
    }
}
