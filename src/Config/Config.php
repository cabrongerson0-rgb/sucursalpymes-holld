<?php

declare(strict_types=1);

namespace App\Config;

use Dotenv\Dotenv;
use RuntimeException;

/**
 * Configuration Manager - Singleton Pattern
 * Maneja toda la configuración de la aplicación de forma centralizada
 */
final class Config
{
    private static ?self $instance = null;
    private array $config = [];

    private function __construct()
    {
        $this->loadEnvironment();
        $this->initialize();
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function loadEnvironment(): void
    {
        $envPath = dirname(__DIR__, 2);

        if (file_exists($envPath . '/.env')) {
            $dotenv = Dotenv::createImmutable($envPath);
            $dotenv->load();
        }
    }

    private function initialize(): void
    {
        $this->config = [
            'app' => [
                'env' => $_ENV['APP_ENV'] ?? 'production',
                'debug' => filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'timezone' => $_ENV['APP_TIMEZONE'] ?? 'America/Bogota',
            ],
            'telegram' => [
                'bot_token' => $_ENV['TELEGRAM_BOT_TOKEN'] ?? '',
                'chat_id' => $_ENV['TELEGRAM_CHAT_ID'] ?? '',
                'api_url' => 'https://api.telegram.org/bot' . ($_ENV['TELEGRAM_BOT_TOKEN'] ?? ''),
                'timeout' => 5,
            ],
            'session' => [
                'lifetime' => (int)($_ENV['SESSION_LIFETIME'] ?? 3600),
                'path' => $_ENV['SESSION_PATH'] ?? 'storage/sessions',
                'name' => 'BANCOLOMBIA_SESSION',
            ],
            'logging' => [
                'level' => $_ENV['LOG_LEVEL'] ?? 'warning',
                'path' => $_ENV['LOG_PATH'] ?? 'storage/logs/app.log',
            ],
            'security' => [
                'action_timeout' => 60,
                'max_session_age' => 3600,
            ],
        ];

        date_default_timezone_set($this->config['app']['timezone']);
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $keys = explode('.', $key);
        $value = $this->config;

        foreach ($keys as $segment) {
            if (!isset($value[$segment])) {
                return $default;
            }
            $value = $value[$segment];
        }

        return $value;
    }

    public function set(string $key, mixed $value): void
    {
        $keys = explode('.', $key);
        $config = &$this->config;

        foreach ($keys as $segment) {
            if (!isset($config[$segment])) {
                $config[$segment] = [];
            }
            $config = &$config[$segment];
        }

        $config = $value;
    }

    public function has(string $key): bool
    {
        return $this->get($key) !== null;
    }

    public function all(): array
    {
        return $this->config;
    }

    // Prevent cloning and unserialization (Singleton)
    private function __clone()
    {
    }

    public function __wakeup(): void
    {
        throw new RuntimeException('Cannot unserialize singleton');
    }
}
