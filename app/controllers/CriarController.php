<?php

class CriarController
{
    public function index()
    {
        $view =
            __DIR__
            . '/../views/criar/index.php';

        require __DIR__
            . '/../views/layouts/main.php';
    }
}