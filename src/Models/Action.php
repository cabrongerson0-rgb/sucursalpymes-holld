<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Action Model - Representa una acción de Telegram
 */
final class Action
{
    public function __construct(
        private string $action,
        private int $timestamp
    ) {
    }

    public function getAction(): string
    {
        return $this->action;
    }

    public function getTimestamp(): int
    {
        return $this->timestamp;
    }

    public function isExpired(int $maxAge = 60): bool
    {
        return (time() - $this->timestamp) > $maxAge;
    }

    public function toArray(): array
    {
        return [
            'action' => $this->action,
            'timestamp' => $this->timestamp,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['action'] ?? '',
            $data['timestamp'] ?? time()
        );
    }
}
