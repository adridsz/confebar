<?php

namespace App\Controllers;

use App\Models\User;
use App\Models\Order;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AdminController
{
    public function getProfits(Request $request, Response $response)
    {
        // Obtener parámetros opcionales de consulta
        $params = $request->getQueryParams();
        $startDate = $params['start_date'] ?? null;
        $endDate = $params['end_date'] ?? null;

        $query = Order::where('status', 'paid');

        if ($startDate) {
            $query->where('created_at', '>=', $startDate . ' 00:00:00');
        }

        if ($endDate) {
            $query->where('created_at', '<=', $endDate . ' 23:59:59');
        }

        $orders = $query->get();
        $totalProfits = $orders->sum('total');
        $orderCount = $orders->count();

        $result = [
            'total_profits' => $totalProfits,
            'order_count' => $orderCount,
            'average_order_value' => $orderCount > 0 ? ($totalProfits / $orderCount) : 0,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ];

        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getUsers(Request $request, Response $response)
    {
        $users = User::all();
        $response->getBody()->write(json_encode($users));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function createUser(Request $request, Response $response)
    {
        $data = $request->getParsedBody();

        if (!isset($data['username']) || !isset($data['password']) || !isset($data['role'])) {
            $response->getBody()->write(json_encode(['error' => 'Missing required fields']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Verificar que el rol sea válido
        if (!in_array($data['role'], ['dueño', 'gerente', 'camarero'])) {
            $response->getBody()->write(json_encode(['error' => 'Invalid role']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Verificar que el nombre de usuario no exista
        $existingUser = User::where('username', $data['username'])->first();
        if ($existingUser) {
            $response->getBody()->write(json_encode(['error' => 'Username already exists']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $user = new User([
            'username' => $data['username'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'role' => $data['role']
        ]);

        $user->save();

        $response->getBody()->write(json_encode([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function updateUser(Request $request, Response $response, array $args)
    {
        $data = $request->getParsedBody();
        $user = User::find($args['id']);

        if (!$user) {
            $response->getBody()->write(json_encode(['error' => 'User not found']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // No permitir cambiar el usuario del dueño original (admin)
        if ($user->username === 'admin' && isset($data['role']) && $data['role'] !== 'dueño') {
            $response->getBody()->write(json_encode(['error' => 'Cannot change the role of the main owner']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if (isset($data['role'])) {
            if (!in_array($data['role'], ['dueño', 'gerente', 'camarero'])) {
                $response->getBody()->write(json_encode(['error' => 'Invalid role']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
            $user->role = $data['role'];
        }

        if (isset($data['password'])) {
            $user->password = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $user->save();

        $response->getBody()->write(json_encode([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role
            ]
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function deleteUser(Request $request, Response $response, array $args)
    {
        $user = User::find($args['id']);

        if (!$user) {
            $response->getBody()->write(json_encode(['error' => 'User not found']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // No permitir eliminar al dueño original (admin)
        if ($user->username === 'admin') {
            $response->getBody()->write(json_encode(['error' => 'Cannot delete the main owner account']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $user->delete();

        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
