<?php

/**
 * Process - Procesa el formulario de documento
 * Este archivo es llamado por el formulario de index.php
 */

['container' => $container] = require_once __DIR__ . '/../src/bootstrap.php';

$controller = $container->get('documentController');
$controller->processForm($_POST);
