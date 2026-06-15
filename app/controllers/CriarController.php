<?php

require_once __DIR__ . '/../models/Trilha.php';

class CriarController
{
    public function index()
    {
        $erro = null;
        $dados = [
            'nome' => '',
            'categoria' => '',
            'descricao' => ''
        ];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $dados = [
                'nome' => trim($_POST['nome'] ?? ''),
                'categoria' => trim($_POST['categoria'] ?? ''),
                'descricao' => trim($_POST['descricao'] ?? '')
            ];

            if ($dados['nome'] === '') {
                $erro = 'Informe o nome da trilha.';
            } else {
                $trilhaModel = new Trilha();

                $trilhaModel->criar(
                    $dados['nome'],
                    $dados['categoria'],
                    $dados['descricao']
                );

                header('Location: ' . BASE_URL . '?url=desenvolvimento');
                exit;
            }
        }

        $view =
            __DIR__
            . '/../views/criar/index.php';

        require __DIR__
            . '/../views/layouts/main.php';
    }
}
