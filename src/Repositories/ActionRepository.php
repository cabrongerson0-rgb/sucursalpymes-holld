<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Action;
use App\Services\LoggerService;

/**
 * Action Repository - Gestiona las acciones de Telegram
 */
final class ActionRepository
{
    private string $sessionPath;
    private LoggerService $logger;

    public function __construct(string $sessionPath, LoggerService $logger)
    {
        $this->sessionPath = rtrim($sessionPath, '/');
        $this->logger = $logger;
    }

    /**
     * Guarda una acción para una sesión
     */
    public function save(string $sessionId, Action $action): bool
    {
        $file = $this->getActionFile($sessionId);
        $data = json_encode($action->toArray());

        if (file_put_contents($file, $data, LOCK_EX) === false) {
            $this->logger->error('Failed to save action', [
                'session_id' => $sessionId,
                'action' => $action->getAction(),
            ]);
            return false;
        }

        $this->logger->debug('Action saved', [
            'session_id' => $sessionId,
            'action' => $action->getAction(),
        ]);

        return true;
    }

    /**
     * Obtiene y elimina una acción para una sesión
     */
    public function popAction(string $sessionId, int $maxAge = 60): ?Action
    {
        $file = $this->getActionFile($sessionId);

        if (!file_exists($file)) {
            return null;
        }

        $data = @file_get_contents($file);
        if (!$data) {
            return null;
        }

        $actionData = json_decode($data, true);
        if (!$actionData) {
            return null;
        }

        $action = Action::fromArray($actionData);

        if ($action->isExpired($maxAge)) {
            @unlink($file);
            $this->logger->debug('Action expired', [
                'session_id' => $sessionId,
                'action' => $action->getAction(),
            ]);
            return null;
        }

        @unlink($file);
        return $action;
    }

    /**
     * Verifica si hay una acción pendiente
     */
    public function hasAction(string $sessionId): bool
    {
        return file_exists($this->getActionFile($sessionId));
    }

    /**
     * Limpia acciones antiguas
     */
    public function cleanup(int $maxAge = 3600): int
    {
        $files = glob($this->sessionPath . '/action_*');
        $deleted = 0;

        if (!$files) {
            return 0;
        }

        foreach ($files as $file) {
            if (filemtime($file) < (time() - $maxAge)) {
                if (@unlink($file)) {
                    $deleted++;
                }
            }
        }

        if ($deleted > 0) {
            $this->logger->info("Action cleanup: $deleted actions deleted");
        }

        return $deleted;
    }

    private function getActionFile(string $sessionId): string
    {
        return $this->sessionPath . '/action_' . $sessionId;
    }
}
