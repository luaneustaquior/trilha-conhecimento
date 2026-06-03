<?php

class Router
{
    public function dispatch()
    {
        $url = $_GET['url'] ?? '';

        switch ($url) {

            case 'areas':

                require_once '../app/controllers/AreaController.php';

                $controller = new AreaController();

                $controller->index();

                break;

            default:

                echo "<h1>Página inicial</h1>";

                break;
        }
    }
}