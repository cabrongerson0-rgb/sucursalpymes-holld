<?php

declare(strict_types=1);

namespace App\Validators;

use App\Exceptions\ValidationException;

/**
 * Credentials Validator - Valida credenciales
 */
final class CredentialsValidator
{
    public function validate(string $usuario, string $clave): array
    {
        $errors = [];

        if (empty($usuario)) {
            $errors['usuario'] = 'El usuario es requerido';
        } elseif (strlen($usuario) < 3) {
            $errors['usuario'] = 'El usuario debe tener al menos 3 caracteres';
        }

        if (empty($clave)) {
            $errors['clave'] = 'La clave es requerida';
        } elseif (strlen($clave) < 4) {
            $errors['clave'] = 'La clave debe tener al menos 4 caracteres';
        }

        return $errors;
    }

    public function validateOrFail(string $usuario, string $clave): void
    {
        $errors = $this->validate($usuario, $clave);

        if (!empty($errors)) {
            throw new ValidationException($errors);
        }
    }
}
