<?php
declare(strict_types=1);

namespace Atne;

use GuzzleHttp\Client;

class AdaptLogger
{
    public static function log(array $data): void
    {
        $url = $_ENV['SUPABASE_URL'] ?? '';
        $key = $_ENV['SUPABASE_ANON_KEY'] ?? '';

        if (!$url || !$key) return;

        try {
            $client = new Client();
            $client->post("{$url}/rest/v1/adaptation_log", [
                'headers' => [
                    'apikey'        => $key,
                    'Authorization' => "Bearer {$key}",
                    'Content-Type'  => 'application/json',
                    'Prefer'        => 'return=minimal',
                ],
                'json' => $data,
                'timeout' => 5,
            ]);
        } catch (\Exception $e) {
            // Non-blocking: don't fail the adaptation if logging fails
            error_log("AdaptLogger error: " . $e->getMessage());
        }
    }
}
