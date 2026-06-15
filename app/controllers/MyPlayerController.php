<?php

require_once __DIR__ . '/../models/Trilha.php';
require_once __DIR__ . '/../models/Usuario.php';

class MyPlayerController
{
    public function index()
    {
        $trilhaModel = new Trilha();
        $usuario = Usuario::getDemo();
        $mensagem = null;

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $acao = $_POST['acao'] ?? '';

            if ($acao === 'editar_usuario') {
                $nome = trim($_POST['nome'] ?? '');
                $sobrenome = trim($_POST['sobrenome'] ?? '');

                if ($nome === '') {
                    $mensagem = 'Informe o nome do usuario.';
                } else {
                    Usuario::atualizarDemo($nome, $sobrenome);

                    header('Location: ' . BASE_URL . '?url=myplayer');
                    exit;
                }
            }

            if ($acao === 'excluir') {
                $trilhaModel->excluir($_POST['id'] ?? '');

                header('Location: ' . BASE_URL . '?url=myplayer');
                exit;
            }

            if ($acao === 'acrescentar') {
                $acrescentou = $trilhaModel->acrescentarPorSkill(
                    $_POST['nome'] ?? ''
                );

                if ($acrescentou) {
                    header('Location: ' . BASE_URL . '?url=myplayer');
                    exit;
                }

                $mensagem = 'Essa Skill ainda precisa de 3 trilhas com o mesmo nome.';
            }
        }

        $usuario = Usuario::getDemo();
        $trilhas = $trilhaModel->listarTodas();
        $skills = $trilhaModel->listarSkills();
        $classe = $trilhaModel->getClasseAtual();

        $view =
            __DIR__
            . '/../views/myplayer/index.php';

        require __DIR__
            . '/../views/layouts/main.php';
    }
}
