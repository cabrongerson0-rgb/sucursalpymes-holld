<?php

/**
 * Submit Token - Procesa el token
 */

['container' => $container] = require_once __DIR__ . '/../src/bootstrap.php';

$controller = $container->get('loginController');

$input = file_get_contents('php://input');
$data = json_decode($input, true) ?? [];

$controller->processToken($data);
