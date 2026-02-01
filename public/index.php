<?php

/**
 * Index - Formulario de documento
 */

['container' => $container] = require_once __DIR__ . '/../src/bootstrap.php';

$controller = $container->get('documentController');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $controller->processForm($_POST);
} else {
    $error = $_GET['error'] ?? null;
    $controller->showForm($error);
}
