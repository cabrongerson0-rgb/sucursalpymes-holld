<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\SessionRepository;
use App\Services\LoggerService;

/**
 * Panel Controller - Maneja el panel de control
 */
final class PanelController
{
    public function __construct(
        private SessionRepository $sessionRepository,
        private LoggerService $logger
    ) {
    }

    /**
     * Muestra el panel de control con sesiones activas
     */
    public function showPanel(): void
    {
        $activeSessions = $this->sessionRepository->getActiveSessions(3600);

        $this->logger->debug('Panel accessed', [
            'active_sessions' => count($activeSessions),
        ]);

        require_once __DIR__ . '/../../templates/panel.php';
    }
}
