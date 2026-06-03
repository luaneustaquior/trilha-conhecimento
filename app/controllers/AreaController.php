<?php

require_once __DIR__ . '/../models/Area.php';

class AreaController
{
    public function index()
    {
        $areaModel = new Area();

        $areas = $areaModel->getAll();

        require_once __DIR__ . '/../views/areas/index.php';
    }
}