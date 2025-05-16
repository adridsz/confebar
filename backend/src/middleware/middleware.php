<?php

use Slim\Middleware\ContentLengthMiddleware;

// Parse JSON, form data and xml
$app->addBodyParsingMiddleware();

// Add Content-Length header
$app->add(new ContentLengthMiddleware());

// Add CORS middleware
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// Add JWT authentication middleware
require __DIR__ . '/auth.php';
