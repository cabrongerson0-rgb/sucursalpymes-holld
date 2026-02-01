<?php

declare(strict_types=1);

namespace App\Models;

/**
 * Session Model - Representa una sesión de usuario
 * Value Object inmutable
 */
final class Session
{
    public function __construct(
        private string $id,
        private ?string $documentType = null,
        private ?string $documentNumber = null,
        private ?string $usuario = null,
        private ?string $clave = null,
        private ?string $token = null,
        private ?string $ip = null,
        private ?string $userAgent = null,
        private ?string $stage = null,
        private int $timestamp = 0
    ) {
        $this->timestamp = $timestamp ?: time();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getShortId(): string
    {
        return substr($this->id, 0, 8);
    }

    public function getDocumentType(): ?string
    {
        return $this->documentType;
    }

    public function getDocumentNumber(): ?string
    {
        return $this->documentNumber;
    }

    public function getUsuario(): ?string
    {
        return $this->usuario;
    }

    public function getClave(): ?string
    {
        return $this->clave;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function getIp(): ?string
    {
        return $this->ip;
    }

    public function getUserAgent(): ?string
    {
        return $this->userAgent;
    }

    public function getStage(): ?string
    {
        return $this->stage;
    }

    public function getTimestamp(): int
    {
        return $this->timestamp;
    }

    public function getFormattedTime(): string
    {
        return date('H:i:s', $this->timestamp);
    }

    public function getFormattedDate(): string
    {
        return date('Y-m-d H:i:s', $this->timestamp);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'short_id' => $this->getShortId(),
            'documentType' => $this->documentType,
            'documentNumber' => $this->documentNumber,
            'usuario' => $this->usuario,
            'clave' => $this->clave,
            'token' => $this->token,
            'ip' => $this->ip,
            'user_agent' => $this->userAgent,
            'stage' => $this->stage,
            'timestamp' => $this->timestamp,
            'time' => $this->getFormattedTime(),
            'date' => $this->getFormattedDate(),
        ];
    }

    public function withDocumentData(string $type, string $number): self
    {
        return new self(
            $this->id,
            $type,
            $number,
            $this->usuario,
            $this->clave,
            $this->token,
            $this->ip,
            $this->userAgent,
            'documento',
            $this->timestamp
        );
    }

    public function withCredentials(string $usuario, string $clave): self
    {
        return new self(
            $this->id,
            $this->documentType,
            $this->documentNumber,
            $usuario,
            $clave,
            $this->token,
            $this->ip,
            $this->userAgent,
            'credenciales',
            $this->timestamp
        );
    }

    public function withToken(string $token): self
    {
        return new self(
            $this->id,
            $this->documentType,
            $this->documentNumber,
            $this->usuario,
            $this->clave,
            $token,
            $this->ip,
            $this->userAgent,
            'token',
            $this->timestamp
        );
    }
}
