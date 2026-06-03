<?php

class MyPlayerController
{
    public function index()
    {
        $view =
            __DIR__
            . '/../views/myplayer/index.php';

        require __DIR__
            . '/../views/layouts/main.php';
    }
}