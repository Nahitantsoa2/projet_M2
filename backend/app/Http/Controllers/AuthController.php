<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // POST /api/register — auto-inscription, réservée au rôle fonctionnaire
    public function register(Request $request)
    {
        $data = $request->validate([
            'nom'      => 'required|string|max:100',
            'prenom'   => 'required|string|max:100',
            'email'    => 'required|email|unique:utilisateur,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Le formulaire ne demande plus le service : on assigne automatiquement
        // le premier service existant (ou on en crée un par défaut s'il n'y en a aucun).
        // L'administrateur pourra réaffecter l'utilisateur au bon service plus tard.
        $service = Service::first() ?? Service::create([
            'nom_service' => 'Non affecté',
            'description' => 'Service par défaut assigné à l\'inscription',
        ]);

        $utilisateur = Utilisateur::create([
            'nom'          => $data['nom'],
            'prenom'       => $data['prenom'],
            'email'        => $data['email'],
            'mot_de_passe' => Hash::make($data['password']),
            // Le rôle est toujours "fonctionnaire" ici — jamais transmis par le
            // formulaire, pour empêcher quiconque de s'auto-attribuer un rôle
            // chef_service ou administrateur via cette route publique.
            'role'         => 'fonctionnaire',
            'id_service'   => $service->id_service,
        ]);

        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        return response()->json([
            'utilisateur' => $utilisateur->load('service'),
            'token'       => $token,
        ], 201);
    }

    // POST /api/login
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->mot_de_passe)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'utilisateur' => $user->load('service'),
            'token'       => $token,
        ]);
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    // GET /api/moi
    public function moi(Request $request)
    {
        return response()->json($request->user()->load('service'));
    }
}