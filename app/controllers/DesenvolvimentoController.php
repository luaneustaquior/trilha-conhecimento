<?php

class DesenvolvimentoController
{
    public function index()
    {
        $view =
            __DIR__
            . '/../views/desenvolvimento/index.php';

        require __DIR__
            . '/../views/layouts/main.php';
    }
}