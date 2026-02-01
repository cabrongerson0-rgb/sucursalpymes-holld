<?php

/**
 * Panel Handler - Maneja acciones del panel
 */

['container' => $container] = require_once __DIR__ . '/../src/bootstrap.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true) ?? [];

$controller = $container->get('actionController');
$controller->saveAction($data);
