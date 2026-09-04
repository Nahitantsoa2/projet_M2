<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UtilisateurController extends Controller
{
    // GET /api/admin/utilisateurs
    public function index()
    {
        return Utilisateur::with('service')->orderBy('nom')->get();
    }

    // POST /api/admin/utilisateurs
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'        => 'required|string|max:100',
            'prenom'     => 'required|string|max:100',
            'email'      => 'required|email|unique:utilisateur,email',
            'password'   => 'required|string|min:8',
            'role'       => 'required|in:fonctionnaire,chef_service,administrateur',
            'id_service' => 'required|exists:service,id_service',
        ]);

        $utilisateur = Utilisateur::create([
            'nom'          => $data['nom'],
            'prenom'       => $data['prenom'],
            'email'        => $data['email'],
            'mot_de_passe' => Hash::make($data['password']),
            'role'         => $data['role'],
            'id_service'   => $data['id_service'],
        ]);

        return response()->json($utilisateur, 201);
    }

    // GET /api/admin/utilisateurs/{id}
    public function show($id)
    {
        return Utilisateur::with('service')->findOrFail($id);
    }

    // PUT/PATCH /api/admin/utilisateurs/{id}
    public function update(Request $request, $id)
    {
        $utilisateur = Utilisateur::findOrFail($id);

        $data = $request->validate([
            'nom'        => 'sometimes|string|max:100',
            'prenom'     => 'sometimes|string|max:100',
            'email'      => 'sometimes|email|unique:utilisateur,email,' . $id . ',id_utilisateur',
            'role'       => 'sometimes|in:fonctionnaire,chef_service,administrateur',
            'id_service' => 'sometimes|exists:service,id_service',
        ]);

        $utilisateur->update($data);

        return response()->json($utilisateur);
    }

    // DELETE /api/admin/utilisateurs/{id}
    public function destroy($id)
    {
        Utilisateur::findOrFail($id)->delete();

        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}
