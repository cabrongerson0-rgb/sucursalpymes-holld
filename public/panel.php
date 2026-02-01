<?php

/**
 * Panel - Panel de control
 */

['container' => $container] = require_once __DIR__ . '/../src/bootstrap.php';

$controller = $container->get('panelController');
$controller->showPanel();
