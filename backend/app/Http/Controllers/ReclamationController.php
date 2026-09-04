<?php

namespace App\Http\Controllers;

use App\Models\Reclamation;
use Illuminate\Http\Request;

class ReclamationController extends Controller
{
    // POST /api/reclamations — le fonctionnaire dépose une réclamation
    public function store(Request $request)
    {
        $data = $request->validate([
            'objet'       => 'required|string|max:200',
            'description' => 'required|string',
            'id_demande'  => 'nullable|exists:demande,id_demande',
        ]);

        $reclamation = Reclamation::create([
            'objet'            => $data['objet'],
            'description'      => $data['description'],
            'id_demande'       => $data['id_demande'] ?? null,
            'id_fonctionnaire' => $request->user()->id_utilisateur,
            'statut'           => 'ouverte',
        ]);

        return response()->json($reclamation, 201);
    }

    // GET /api/reclamations/mes-reclamations — lecture seule pour le fonctionnaire
    public function mesReclamations(Request $request)
    {
        return Reclamation::where('id_fonctionnaire', $request->user()->id_utilisateur)
            ->with('demande')
            ->orderByDesc('date_creation')
            ->get();
    }

    // GET /api/chef/reclamations — accès EXCLUSIF au chef de service de son service
    public function reclamationsRecues(Request $request)
    {
        return Reclamation::whereHas('fonctionnaire', function ($q) use ($request) {
                $q->where('id_service', $request->user()->id_service);
            })
            ->with(['fonctionnaire', 'demande'])
            ->orderBy('date_creation')
            ->get();
    }

    // PATCH /api/chef/reclamations/{id}/repondre
    public function repondre(Request $request, $id)
    {
        $data = $request->validate([
            'reponse' => 'required|string',
            'statut'  => 'required|in:repondue,cloturee',
        ]);

        $reclamation = Reclamation::findOrFail($id);

        $reclamation->update([
            'reponse'          => $data['reponse'],
            'statut'           => $data['statut'],
            'date_reponse'     => now(),
            'id_chef_traitant' => $request->user()->id_utilisateur,
        ]);

        NotificationController::creerPour(
            $reclamation->id_fonctionnaire,
            "Votre réclamation \"{$reclamation->objet}\" a reçu une réponse."
        );

        return response()->json($reclamation);
    }
}
