<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use Slim\Psr7\Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// Load .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

$app = AppFactory::create();
$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

// ── Static files ─────────────────────────────────────────
$app->get('/', function (Request $request, Response $response) {
    $html = file_get_contents(__DIR__ . '/index.html');
    $response->getBody()->write($html);
    return $response->withHeader('Content-Type', 'text/html; charset=utf-8');
});

$app->get('/css/styles.css', function (Request $request, Response $response) {
    $css = file_get_contents(__DIR__ . '/css/styles.css');
    $response->getBody()->write($css);
    return $response->withHeader('Content-Type', 'text/css; charset=utf-8');
});

$app->get('/js/app.js', function (Request $request, Response $response) {
    $js = file_get_contents(__DIR__ . '/js/app.js');
    $response->getBody()->write($js);
    return $response->withHeader('Content-Type', 'application/javascript; charset=utf-8');
});

// ── API Routes ───────────────────────────────────────────
$app->get('/api/health', function (Request $request, Response $response) {
    $openaiOk = false;
    $dbOk = false;

    // Test OpenAI
    try {
        $client = new GuzzleHttp\Client();
        $r = $client->get('https://api.openai.com/v1/models', [
            'headers' => ['Authorization' => 'Bearer ' . ($_ENV['OPENAI_API_KEY'] ?? '')],
            'timeout' => 5,
        ]);
        $openaiOk = $r->getStatusCode() === 200;
    } catch (\Exception $e) {}

    // Test Supabase
    try {
        $client = new GuzzleHttp\Client();
        $r = $client->get(($_ENV['SUPABASE_URL'] ?? '') . '/rest/v1/', [
            'headers' => [
                'apikey' => $_ENV['SUPABASE_ANON_KEY'] ?? '',
                'Authorization' => 'Bearer ' . ($_ENV['SUPABASE_ANON_KEY'] ?? ''),
            ],
            'timeout' => 5,
        ]);
        $dbOk = $r->getStatusCode() === 200;
    } catch (\Exception $e) {}

    $payload = json_encode([
        'ok' => $openaiOk && $dbOk,
        'openai' => $openaiOk,
        'database' => $dbOk,
    ]);
    $response->getBody()->write($payload);
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/propose', function (Request $request, Response $response) {
    $body = $request->getParsedBody();
    $chars = $body['caracteristiques'] ?? [];
    $context = $body['context'] ?? [];

    $result = \Atne\ProposalEngine::propose($chars, $context);

    $response->getBody()->write(json_encode($result));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/adapt', function (Request $request, Response $response) {
    $body = $request->getParsedBody();
    $text = $body['text'] ?? '';
    $chars = $body['caracteristiques'] ?? ($body['profile']['caracteristiques'] ?? []);
    $context = $body['context'] ?? [];
    $params = $body['params'] ?? [];

    $startMs = (int)(microtime(true) * 1000);

    // Build system prompt
    $systemPrompt = \Atne\PromptBuilder::build($chars, $params, $context);

    // Call OpenAI
    $llmResult = \Atne\OpenAIClient::call($systemPrompt, $text);

    $durationMs = (int)(microtime(true) * 1000) - $startMs;

    // Log to Supabase
    \Atne\AdaptLogger::log([
        'text_original' => $text,
        'chars_json' => json_encode($chars),
        'context_json' => json_encode($context),
        'params_json' => json_encode($params),
        'text_adapted' => $llmResult['text'],
        'tokens_input' => $llmResult['usage']['input_tokens'] ?? 0,
        'tokens_output' => $llmResult['usage']['output_tokens'] ?? 0,
        'model' => $_ENV['OPENAI_MODEL'] ?? 'gpt-4.1-mini',
        'duration_ms' => $durationMs,
        'ip_address' => $request->getServerParams()['REMOTE_ADDR'] ?? '',
    ]);

    $payload = json_encode([
        'adapted' => $llmResult['text'],
        'tokens_used' => $llmResult['usage'],
    ]);
    $response->getBody()->write($payload);
    return $response->withHeader('Content-Type', 'application/json');
});

$app->run();
