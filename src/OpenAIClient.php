<?php
declare(strict_types=1);

namespace Atne;

use GuzzleHttp\Client;

class OpenAIClient
{
    public static function call(string $systemPrompt, string $userText): array
    {
        $client = new Client();
        $model = $_ENV['OPENAI_MODEL'] ?? 'gpt-4.1-mini';

        $response = $client->post('https://api.openai.com/v1/responses', [
            'headers' => [
                'Authorization' => 'Bearer ' . ($_ENV['OPENAI_API_KEY'] ?? ''),
                'Content-Type'  => 'application/json',
            ],
            'json' => [
                'model' => $model,
                'input' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => "TEXT ORIGINAL A ADAPTAR:\n\n" . $userText],
                ],
            ],
            'timeout' => 120,
        ]);

        $data = json_decode($response->getBody()->getContents(), true);

        // Extract text from Responses API format
        $text = '';
        foreach (($data['output'] ?? []) as $item) {
            if (($item['type'] ?? '') === 'message') {
                foreach (($item['content'] ?? []) as $c) {
                    if (($c['type'] ?? '') === 'output_text') {
                        $text .= $c['text'] ?? '';
                    }
                }
            }
        }

        return [
            'text'  => $text,
            'usage' => $data['usage'] ?? [],
        ];
    }
}
