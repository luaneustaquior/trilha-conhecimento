<?php

$router->get(
    '/',
    'EntradaController@index'
);

$router->get(
    '/desenvolvimento',
    'DesenvolvimentoController@index'
);

$router->get(
    '/criar',
    'CriarController@index'
);

$router->get(
    '/myplayer',
    'MyPlayerController@index'
);