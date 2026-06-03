<?php

require_once __DIR__ . '/../models/Usuario.php';

class EntradaController
{
    public function index()
    {
        $usuario = Usuario::getDemo();

        $view =
            __DIR__
            . '/../views/entrada/index.php';

        require __DIR__
            . '/../views/layouts/main.php';
    }
}