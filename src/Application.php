<?php

declare(strict_types=1);

namespace App;

use App\Config\Config;
use App\Services\LoggerService;
use Exception;

/**
 * Application Bootstrap
 * Inicializa la aplicación con todas sus dependencias
 */
final class Application
{
    private Config $config;
    private LoggerService $logger;
    private static ?self $instance = null;

    private function __construct()
    {
        $this->config = Config::getInstance();
        $this->logger = LoggerService::getInstance();
        $this->initialize();
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function initialize(): void
    {
        // Error reporting based on environment
        if ($this->config->get('app.debug')) {
            error_reporting(E_ALL);
            ini_set('display_errors', '1');
        } else {
            error_reporting(0);
            ini_set('display_errors', '0');
        }

        // Set error handler
        set_error_handler([$this, 'handleError']);
        set_exception_handler([$this, 'handleException']);
        register_shutdown_function([$this, 'handleShutdown']);

        // Session configuration
        $this->configureSession();

        // Security headers
        $this->setSecurityHeaders();
    }

    private function configureSession(): void
    {
        $sessionPath = $this->config->get('session.path');
        $basePath = dirname(__DIR__, 2);
        $fullPath = $basePath . '/' . $sessionPath;

        if (!is_dir($fullPath)) {
            mkdir($fullPath, 0755, true);
        }

        ini_set('session.save_path', $fullPath);
        ini_set('session.gc_maxlifetime', (string)$this->config->get('session.lifetime'));
        ini_set('session.cookie_httponly', '1');
        ini_set('session.use_strict_mode', '1');

        session_name($this->config->get('session.name'));
    }

    private function setSecurityHeaders(): void
    {
        header('X-Frame-Options: DENY');
        header('X-Content-Type-Options: nosniff');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
    }

    public function handleError(int $errno, string $errstr, string $errfile, int $errline): bool
    {
        $this->logger->error("PHP Error [$errno]: $errstr", [
            'file' => $errfile,
            'line' => $errline,
        ]);

        return true;
    }

    public function handleException(\Throwable $exception): void
    {
        $this->logger->critical('Uncaught Exception: ' . $exception->getMessage(), [
            'exception' => get_class($exception),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
        ]);

        if ($this->config->get('app.debug')) {
            echo '<pre>';
            echo "Exception: " . $exception->getMessage() . "\n";
            echo "File: " . $exception->getFile() . ":" . $exception->getLine() . "\n";
            echo $exception->getTraceAsString();
            echo '</pre>';
        } else {
            http_response_code(500);
            echo 'Internal Server Error';
        }

        exit(1);
    }

    public function handleShutdown(): void
    {
        $error = error_get_last();
        if ($error !== null && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
            $this->logger->critical('Fatal Error: ' . $error['message'], [
                'file' => $error['file'],
                'line' => $error['line'],
            ]);
        }
    }

    public function getConfig(): Config
    {
        return $this->config;
    }

    public function getLogger(): LoggerService
    {
        return $this->logger;
    }
}
