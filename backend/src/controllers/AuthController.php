<?php

namespace App\Controllers;

use App\Models\User;
use Firebase\JWT\JWT;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController
{
    public function login(Request $request, Response $response)
    {
        $data = $request->getParsedBody();

        if (!isset($data['username']) || !isset($data['password'])) {
            $response->getBody()->write(json_encode(['error' => 'Username and password required']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $user = User::where('username', $data['username'])->first();

        if (!$user || !password_verify($data['password'], $user->password)) {
            $response->getBody()->write(json_encode(['error' => 'Invalid credentials']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $payload = [
            'id' => $user->id,
            'username' => $user->username,
            'role' => $user->role,
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24) // 24 hours
        ];

        $token = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

        $response->getBody()->write(json_encode([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role
            ]
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }
}
