<?php

/**
 * Next Step - Formulario de login
 */

['container' => $container] = require_once __DIR__ . '/../src/bootstrap.php';

$controller = $container->get('loginController');

$error = $_GET['error'] ?? null;
$openToken = isset($_GET['openToken']) && $_GET['openToken'] == '1';

$controller->showForm($error, $openToken);
