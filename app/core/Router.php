<?php

class Router
{
    public function dispatch()
    {
        $url = $_GET['url'] ?? 'entrada';

        switch ($url) {

            case 'entrada':

                require_once '../app/controllers/EntradaController.php';

                $controller = new EntradaController();

                $controller->index();

                break;

            case 'desenvolvimento':

                require_once '../app/controllers/DesenvolvimentoController.php';

                $controller = new DesenvolvimentoController();

                $controller->index();

                break;

            case 'criar':

                require_once '../app/controllers/CriarController.php';

                $controller = new CriarController();

                $controller->index();

                break;

            case 'myplayer':

                require_once '../app/controllers/MyPlayerController.php';

                $controller = new MyPlayerController();

                $controller->index();

                break;

            case 'areas':

                require_once '../app/controllers/AreaController.php';

                $controller = new AreaController();

                $controller->index();

                break;

            default:

                echo "<h1>Página não encontrada</h1>";

                break;
        }
    }
}