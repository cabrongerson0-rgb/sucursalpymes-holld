<?php

/**
 * Verify Login - Procesa credenciales
 */

['container' => $container] = require_once __DIR__ . '/../src/bootstrap.php';

$controller = $container->get('loginController');
$controller->processForm($_POST);
