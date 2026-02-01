<?php

declare(strict_types=1);

namespace App\Services;

use App\Config\Config;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\RotatingFileHandler;
use Monolog\Formatter\LineFormatter;
use Psr\Log\LoggerInterface;

/**
 * Logger Service - Wrapper for Monolog
 * Implementa PSR-3 LoggerInterface
 */
final class LoggerService implements LoggerInterface
{
    private static ?self $instance = null;
    private Logger $logger;
    private Config $config;

    private function __construct()
    {
        $this->config = Config::getInstance();
        $this->initializeLogger();
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function initializeLogger(): void
    {
        $this->logger = new Logger('app');

        $logPath = dirname(__DIR__, 2) . '/' . $this->config->get('logging.path');
        $logDir = dirname($logPath);

        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        // Rotating file handler (7 days)
        $handler = new RotatingFileHandler($logPath, 7, Logger::DEBUG);

        // Custom formatter
        $formatter = new LineFormatter(
            "[%datetime%] %channel%.%level_name%: %message% %context%\n",
            'Y-m-d H:i:s'
        );
        $handler->setFormatter($formatter);

        $this->logger->pushHandler($handler);
    }

    public function emergency($message, array $context = []): void
    {
        $this->logger->emergency($message, $context);
    }

    public function alert($message, array $context = []): void
    {
        $this->logger->alert($message, $context);
    }

    public function critical($message, array $context = []): void
    {
        $this->logger->critical($message, $context);
    }

    public function error($message, array $context = []): void
    {
        $this->logger->error($message, $context);
    }

    public function warning($message, array $context = []): void
    {
        $this->logger->warning($message, $context);
    }

    public function notice($message, array $context = []): void
    {
        $this->logger->notice($message, $context);
    }

    public function info($message, array $context = []): void
    {
        $this->logger->info($message, $context);
    }

    public function debug($message, array $context = []): void
    {
        $this->logger->debug($message, $context);
    }

    public function log($level, $message, array $context = []): void
    {
        $this->logger->log($level, $message, $context);
    }
}
