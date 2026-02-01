<?php

declare(strict_types=1);

namespace App\Validators;

use App\Exceptions\ValidationException;

/**
 * Document Validator - Valida documentos
 */
final class DocumentValidator
{
    private const VALID_TYPES = ['NIT', 'CC', 'CE', 'PA', 'IEPN', 'IEPJ', 'FID', 'CD'];

    public function validate(string $type, string $number): array
    {
        $errors = [];

        if (empty($type)) {
            $errors['documentType'] = 'El tipo de documento es requerido';
        } elseif (!in_array($type, self::VALID_TYPES, true)) {
            $errors['documentType'] = 'El tipo de documento no es válido';
        }

        if (empty($number)) {
            $errors['documentNumber'] = 'El número de documento es requerido';
        } elseif (!$this->isValidNumber($number)) {
            $errors['documentNumber'] = 'El número de documento no es válido';
        }

        return $errors;
    }

    public function validateOrFail(string $type, string $number): void
    {
        $errors = $this->validate($type, $number);

        if (!empty($errors)) {
            throw new ValidationException($errors);
        }
    }

    private function isValidNumber(string $number): bool
    {
        // Permitir solo números y guiones
        return preg_match('/^[0-9\-]+$/', $number) === 1 && strlen($number) >= 6;
    }

    public static function getValidTypes(): array
    {
        return self::VALID_TYPES;
    }
}
