<?php

if (!defined('BASE_URL')) {
    $basePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');

    define('BASE_URL', ($basePath === '' ? '' : $basePath) . '/');
}

spl_autoload_register(function ($class) {

    $paths = [
        '../app/controllers/',
        '../app/models/',
        '../app/core/'
    ];

    foreach ($paths as $path) {

        $file = $path . $class . '.php';

        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

require_once '../app/core/Router.php';

$router = new Router();

$router->dispatch();
