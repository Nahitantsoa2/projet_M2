<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\AgentIa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ConversationController extends Controller
{
    // GET /api/conversations — liste des conversations de l'utilisateur
    public function index(Request $request)
    {
        $conversations = Conversation::where('id_utilisateur', $request->user()->id_utilisateur)
            ->orderBy('date_debut', 'desc')
            ->get();
        return response()->json($conversations);
    }

    // POST /api/conversations — démarre une nouvelle conversation
    public function store(Request $request)
    {
        $conversation = Conversation::create([
            'id_utilisateur' => $request->user()->id_utilisateur,
        ]);

        return response()->json($conversation, 201);
    }

    // GET /api/conversations/{id}/messages
    public function messages(Request $request, $id)
    {
        $conversation = Conversation::where('id_utilisateur', $request->user()->id_utilisateur)
            ->findOrFail($id);

        return $conversation->messages()->with('agent')->get();
    }

    // POST /api/conversations/{id}/messages — envoie un message et obtient la réponse de l'agent IA
    public function envoyerMessage(Request $request, $id)
    {
        $data = $request->validate([
            'contenu' => 'required|string',
        ]);

        $conversation = Conversation::where('id_utilisateur', $request->user()->id_utilisateur)
            ->findOrFail($id);

        // 1. Enregistrer le message de l'utilisateur
        Message::create([
            'contenu'         => $data['contenu'],
            'expediteur'      => 'utilisateur',
            'id_conversation' => $conversation->id_conversation,
        ]);

        // 2. Appeler l'agent d'assistance (LLM)
        $reponseIa = $this->appellerAgentAssistance($data['contenu']);

        $agentAssistance = AgentIa::where('type_agent', 'assistance')->first();

        // 3. Enregistrer la réponse de l'agent
        $messageAgent = Message::create([
            'contenu'         => $reponseIa,
            'expediteur'      => 'agent_ia',
            'id_conversation' => $conversation->id_conversation,
            'id_agent'        => $agentAssistance?->id_agent,
        ]);

        return response()->json($messageAgent->load('agent'));
    }

    // Appel au LLM (à adapter selon le fournisseur : Anthropic, OpenAI...)
    private function appellerAgentAssistance(string $question): string
    {
        $promptBase = "Tu es un agent d'assistance pour les démarches administratives des fonctionnaires. Réponds de façon claire et concise. Voici les informations sur les pièces à fournir pour les différentes démarches :\n\n";
        
        $piecesFile = resource_path('prompts/pieces_a_fournir.txt');
        if (file_exists($piecesFile)) {
            $promptBase .= file_get_contents($piecesFile);
        }

        try {
            $apiKey = config('services.anthropic.key');
            if (empty($apiKey) || $apiKey === 'votre_cle_api_ici') {
                $piecesFile = resource_path('prompts/pieces_a_fournir.txt');
                $simulatedAnswer = "Ceci est une réponse simulée car la clé API Anthropic n'est pas configurée. Pour obtenir de vraies réponses, ajoutez votre clé dans le fichier .env (ANTHROPIC_API_KEY). \n\n" . $question;
                
                if (file_exists($piecesFile)) {
                    $content = file_get_contents($piecesFile);
                    
                    if (stripos($question, 'réversion orphelin') !== false || stripos($question, 'reversion orphelin') !== false) {
                        return "Ceci est une réponse simulée car la clé API Anthropic n'est pas configurée. Pour obtenir de vraies réponses, ajoutez votre clé dans le fichier .env (ANTHROPIC_API_KEY).\n\nVoici les pièces à fournir pour une pension de réversion orphelin (CDMVT 07) :\n- Acte de décès de l'auteur de droit (Original ou copie certifiée - 2 ex)\n- Certificat de non séparation de corps (Original ou copie certifiée - 2 ex)\n- Certificat de non divorce (Original ou copie certifiée - 2 ex)\n- Certificat de non remariage du (ou des) conjoint(s) survivant(s) (Original ou copie certifiée - 2 ex)\n- Fiche familiale d'état civil (Original - 2 ex)\n- Certificat de scolarité ou de vie des orphelins mineurs (Original - 2 ex)\n- Relevé de compte bancaire (1 ex)";
                    } elseif (stripos($question, 'assignation') !== false || stripos($question, 'fanovana toerana') !== false) {
                        return "Ceci est une réponse simulée car la clé API Anthropic n'est pas configurée. Pour obtenir de vraies réponses, ajoutez votre clé dans le fichier .env (ANTHROPIC_API_KEY).\n\nVoici les documents nécessaires pour un changement d'assignation (Trésor ou Perception) (CDMVT 18) :\n- Acte de changement de domicile ou d'assignation (2 ex)\n- Arrêté de concession de pension (1 ex)\n- Certificat de vie (1 ex)\n- Attestation de résidence (1 ex)";
                    } elseif (stripos($question, 'rectification de nom') !== false || stripos($question, 'CIN') !== false || stripos($question, 'fanitsiana anarana') !== false) {
                        return "Ceci est une réponse simulée car la clé API Anthropic n'est pas configurée. Pour obtenir de vraies réponses, ajoutez votre clé dans le fichier .env (ANTHROPIC_API_KEY).\n\nVoici les documents nécessaires pour une demande de rectification de nom, prénom ou CIN sur une pension (CDMVT 18) :\n- Acte ou décision de rectification (Original - 2 ex)\n- Fiche d'état civil (Original - 1 ex)\n- Copie de la CIN (1 ex)\n- Arrêté de concession de pension (1 ex)";
                    } elseif (stripos($question, 'bonification') !== false) {
                        return "Ceci est une réponse simulée car la clé API Anthropic n'est pas configurée. Pour obtenir de vraies réponses, ajoutez votre clé dans le fichier .env (ANTHROPIC_API_KEY).\n\nVoici les pièces requises pour une révision de bonification (CDMVT 14) :\n- Demande manuscrite (1 ex)\n- Arrêté de concession de pension (2 ex)\n- Pièces justificatives de la bonification (Original ou copie certifiée - 2 ex)";
                    } elseif ((stripos($question, 'nomination') !== false && stripos($question, 'CDMVT 02') !== false) || stripos($question, 'fanendrena') !== false || stripos($question, 'nomination') !== false) {
                        return "Ceci est une réponse simulée car la clé API Anthropic n'est pas configurée. Pour obtenir de vraies réponses, ajoutez votre clé dans le fichier .env (ANTHROPIC_API_KEY).\n\nVoici les pièces à fournir pour une nomination de fonctionnaire (CDMVT 02) :\n- Acte de nomination (3 ex)\n- Certificat de prise de service (2 ex)\n- Attestation de première prise de service (2 ex)\n- Certificat administratif de non-paiement (1 ex)";
                    } elseif ((stripos($question, 'titularisation') !== false && stripos($question, 'CDMVT 11') !== false) || stripos($question, 'titularisation') !== false) {
                        return "Ceci est une réponse simulée car la clé API Anthropic n'est pas configurée. Pour obtenir de vraies réponses, ajoutez votre clé dans le fichier .env (ANTHROPIC_API_KEY).\n\nVoici les documents nécessaires pour le mandatement d'une titularisation (CDMVT 11) :\n- Acte de titularisation (3 ex)\n- Certificat de prise de service (2 ex)\n- Bulletin de solde récent (1 ex)\n- Certificat administratif de non-paiement (1 ex)";
                    } elseif (stripos($question, 'avancement') !== false || stripos($question, 'CDMVT 13') !== false || stripos($question, 'fisondrotana kilasy') !== false || stripos($question, 'échelon') !== false || stripos($question, 'echelon') !== false) {
                        return "Ceci est une réponse simulée car la clé API Anthropic n'est pas configurée. Pour obtenir de vraies réponses, ajoutez votre clé dans le fichier .env (ANTHROPIC_API_KEY).\n\nQue faut-il préparer pour un avancement de classe ou d'échelon (CDMVT 13) :\n- Acte d'avancement (3 ex)\n- Certificat de prise de service (2 ex)\n- Bulletin de solde récent (1 ex)\n- Certificat administratif de non-paiement (1 ex)";
                    } elseif ((stripos($question, 'majoration') !== false && stripos($question, 'ELD') !== false) || stripos($question, 'ELD') !== false || stripos($question, 'fampiakarana karama') !== false) {
                        return "Ceci est une réponse simulée car la clé API Anthropic n'est pas configurée. Pour obtenir de vraies réponses, ajoutez votre clé dans le fichier .env (ANTHROPIC_API_KEY).\n\nVoici les pièces fournir pour la majoration de salaire d'un ELD (CDMVT 16) :\n- Acte de majoration (3 ex)\n- Certificat de prise de service (2 ex)\n- Bulletin de solde récent (1 ex)\n- Contrat d'engagement (1 ex)\n- Certificat administratif de non-paiement (1 ex)";
                    } elseif (stripos($question, 'congé') !== false || stripos($question, 'conge') !== false) {
                        return "Ceci est une réponse simulée car la clé API Anthropic n'est pas configurée. Pour obtenir de vraies réponses, ajoutez votre clé dans le fichier .env (ANTHROPIC_API_KEY).\n\nVoici les pièces à fournir pour une indemnité compensatrice de congé non pris (CDMVT 19) :\n- Acte formaté (2 ex)\n- Décision (3 ex)\n- Arrêté d'admission à la retraite (3 ex)\n- Certificat administratif pour mandatement (1 ex)\n- Bulletin de solde ou avis de crédit (1 ex)";
                    }
                }
                
                return $simulatedAnswer;
            }

            $response = Http::withoutVerifying()->withHeaders([
                'x-api-key'         => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model'      => 'claude-3-5-sonnet-20240620',
                'max_tokens' => 500,
                'system'     => $promptBase,
                'messages'   => [
                    ['role' => 'user', 'content' => $question],
                ],
            ]);

            if ($response->failed()) {
                return "Je suis désolé, je n'ai pas pu vous répondre car mon accès à l'IA a rencontré une erreur (peut-être que la clé API est invalide). \n\nVoici ce que vous avez demandé : " . $question;
            }

            return $response->json('content.0.text') ?? "Je n'ai pas pu générer de réponse.";
        } catch (\Exception $e) {
            return "Désolé, une erreur est survenue lors de la communication avec l'IA. Veuillez réessayer ou contacter votre service.";
        }
    }
}
