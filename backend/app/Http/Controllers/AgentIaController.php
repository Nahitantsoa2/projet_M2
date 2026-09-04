<?php

namespace App\Http\Controllers;

use App\Models\AgentIa;
use Illuminate\Http\Request;

class AgentIaController extends Controller
{
    // GET /api/admin/agents
    public function index()
    {
        return AgentIa::withCount('messages')->get();
    }

    // PATCH /api/admin/agents/{id}
    public function update(Request $request, $id)
    {
        $agent = AgentIa::findOrFail($id);

        $data = $request->validate([
            'nom_agent'   => 'sometimes|string|max:100',
            'description' => 'sometimes|string',
        ]);

        $agent->update($data);

        return response()->json($agent);
    }
}
