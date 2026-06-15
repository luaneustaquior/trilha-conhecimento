<?php

require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../models/Trilha.php';

class EntradaController
{
    public function index()
    {
        $usuario = Usuario::getDemo();
        $trilhaModel = new Trilha();
        $classe = $trilhaModel->getClasseAtual();
        $skills = $trilhaModel->listarSkills();

        $view =
            __DIR__
            . '/../views/entrada/index.php';

        require __DIR__
            . '/../views/layouts/main.php';
    }
}
