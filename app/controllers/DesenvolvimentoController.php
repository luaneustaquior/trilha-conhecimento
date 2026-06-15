<?php

require_once __DIR__ . '/../models/Trilha.php';

class DesenvolvimentoController
{
    public function index()
    {
        $trilhaModel = new Trilha();
        $trilhas = $trilhaModel->listarTodas();

        $view =
            __DIR__
            . '/../views/desenvolvimento/index.php';

        require __DIR__
            . '/../views/layouts/main.php';
    }
}
