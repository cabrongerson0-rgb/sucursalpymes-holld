<?php

declare(strict_types=1);

/**
 * Bootstrap file - Inicializa la aplicación
 * Debe ser incluido en cada punto de entrada
 */

require_once __DIR__ . '/../vendor/autoload.php';

use App\Application;
use App\Container;

// Inicializar aplicación
$app = Application::getInstance();

// Obtener contenedor de dependencias
$container = Container::getInstance();

// Retornar para uso en puntos de entrada
return [
    'app' => $app,
    'container' => $container,
];
