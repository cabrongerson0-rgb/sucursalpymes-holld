<?php

/**
 * Webhook - Recibe callbacks de Telegram
 */

['container' => $container] = require_once __DIR__ . '/../src/bootstrap.php';

$input = file_get_contents('php://input');
$update = json_decode($input, true) ?? [];

$controller = $container->get('webhookController');
$controller->handleCallback($update);
