<?php

/**
 * Check Action - Verifica acciones pendientes
 */

['container' => $container] = require_once __DIR__ . '/../src/bootstrap.php';

$sessionService = $container->get('session');
$sessionService->start();

$controller = $container->get('actionController');
$controller->checkAction($sessionService->getId());
