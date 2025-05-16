<?php

namespace App\Controllers;

use App\Models\Table;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class TableController
{
    public function getAll(Request $request, Response $response)
    {
        $tables = Table::all();

        // Agregar información de si la mesa está ocupada
        $tables->map(function ($table) {
            $table->occupied = $table->isOccupied();
            return $table;
        });

        $response->getBody()->write(json_encode($tables));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getOne(Request $request, Response $response, array $args)
    {
        $table = Table::find($args['id']);

        if (!$table) {
            $response->getBody()->write(json_encode(['error' => 'Table not found']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $table->occupied = $table->isOccupied();
        $currentOrder = $table->getCurrentOrder();

        if ($currentOrder) {
            $table->current_order = $currentOrder->load('items.product');
        }

        $response->getBody()->write(json_encode($table));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
