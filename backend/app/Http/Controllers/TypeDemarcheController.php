<?php

namespace App\Http\Controllers;

use App\Models\TypeDemarche;
use Illuminate\Http\Request;

class TypeDemarcheController extends Controller
{
    // GET /api/types-demarche — liste utilisée pour peupler le formulaire manuel
    public function index()
    {
        return TypeDemarche::orderBy('libelle')->get();
    }

    // POST /api/admin/types-demarche — réservé à l'administrateur
    public function store(Request $request)
    {
        $data = $request->validate([
            'libelle'     => 'required|string|max:150',
            'description' => 'nullable|string',
            'id_service'  => 'required|exists:service,id_service',
        ]);

        return response()->json(TypeDemarche::create($data), 201);
    }
}