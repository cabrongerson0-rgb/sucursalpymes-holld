<?php

declare(strict_types=1);

namespace App\Services;

use App\Config\Config;

/**
 * Session Service - Gestión centralizada de sesiones
 * Implementa el patrón Repository para sesiones
 */
final class SessionService
{
    private Config $config;
    private LoggerService $logger;
    private bool $started = false;

    public function __construct(Config $config, LoggerService $logger)
    {
        $this->config = $config;
        $this->logger = $logger;
    }

    public function start(): void
    {
        if ($this->started || session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        session_start();
        $this->started = true;
        $this->logger->debug('Session started', ['session_id' => session_id()]);
    }

    public function destroy(): void
    {
        if (!$this->started) {
            return;
        }

        session_destroy();
        $this->started = false;
        $this->logger->debug('Session destroyed');
    }

    public function regenerate(): void
    {
        $oldId = session_id();
        session_regenerate_id(true);
        $this->logger->debug('Session regenerated', [
            'old_id' => $oldId,
            'new_id' => session_id(),
        ]);
    }

    public function set(string $key, mixed $value): void
    {
        $_SESSION[$key] = $value;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $_SESSION[$key] ?? $default;
    }

    public function has(string $key): bool
    {
        return isset($_SESSION[$key]);
    }

    public function remove(string $key): void
    {
        unset($_SESSION[$key]);
    }

    public function all(): array
    {
        return $_SESSION;
    }

    public function clear(): void
    {
        $_SESSION = [];
    }

    public function getId(): string
    {
        return session_id();
    }

    public function flash(string $key, mixed $value): void
    {
        $_SESSION['_flash'][$key] = $value;
    }

    public function getFlash(string $key, mixed $default = null): mixed
    {
        $value = $_SESSION['_flash'][$key] ?? $default;
        unset($_SESSION['_flash'][$key]);
        return $value;
    }

    public function hasFlash(string $key): bool
    {
        return isset($_SESSION['_flash'][$key]);
    }
}
