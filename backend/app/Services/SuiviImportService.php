<?php

namespace App\Services;

use App\Models\SuiviDossier;
use PhpOffice\PhpSpreadsheet\IOFactory;

class SuiviImportService
{
<<<<<<< HEAD
    public const COLONNES = [
=======
    public const COLONNES_CIBLES = [
        'localite',
        'chap',
        'im',
        'cmv',
    ];

    public const COLONNES_LEGACY = [
>>>>>>> origin/main
        'date_reception',
        'ref_be',
        'ref_dossier',
        'im',
        'nom_prenom',
        'ministere',
        'motif_instance',
        'detail_motif_instance',
        'date_leve_motif',
        'info_leve_motif',
        'sort_traitement',
        'motif_rejet',
        'detail_motif_rejet',
        'ref_operation',
        'traitement_augure',
        'date_traitement',
        'type_dossier',
        'nature_dossier',
        'detail_nature_dossier',
        'info_levee_motif',
        'date_leve_motif_2',
        'etat_dossier',
        'motif_rejet_2',
        'user',
    ];

    /**
     * Importe un fichier Excel/CSV/TSV dans la table suivi_dossier.
<<<<<<< HEAD
     * Ajoute uniquement les lignes nouvelles (jamais de doublon).
=======
     * Prend en charge les champs : Localiter / Localité, chap, im, cmv.
     * Ajoute uniquement les lignes nouvelles (sans doublons).
>>>>>>> origin/main
     *
     * @return array{ajoutes:int, ignores:int, invalides:int, total:int, nouveaux:array<int, SuiviDossier>}
     */
    public function importer(string $chemin): array
    {
        $lecteur = IOFactory::createReaderForFile($chemin);
        $lecteur->setReadDataOnly(true);
        $classeur = $lecteur->load($chemin);

        $feuille = $classeur->getActiveSheet();
        $lignes = $feuille->toArray(null, true, true, true);

<<<<<<< HEAD
=======
        if (empty($lignes)) {
            return [
                'ajoutes' => 0,
                'ignores' => 0,
                'invalides' => 0,
                'total' => SuiviDossier::count(),
                'nouveaux' => [],
            ];
        }

>>>>>>> origin/main
        $ajoutes = 0;
        $ignores = 0;
        $invalides = 0;
        $nouveaux = [];
<<<<<<< HEAD
        $premiere = true;

        foreach ($lignes as $key => $ligne) {
            if ($premiere) {
                $premiere = false;

                continue;
            }

            $valeurs = [];
            foreach (array_keys(self::COLONNES) as $i) {
                $col = chr(65 + $i);
                $valeurs[] = $this->formaterCellule($ligne[$col] ?? null);
            }

            if (empty(implode('', $valeurs))) {
                continue;
            }

            $donnees = array_combine(self::COLONNES, $valeurs);

            if (! isset($donnees['im']) || trim($donnees['im']) === '') {
                $invalides++;

                continue;
            }

            $donnees['empreinte'] = SuiviDossier::empreinte($valeurs);

            if (SuiviDossier::where('empreinte', $donnees['empreinte'])->exists()) {
                $ignores++;

=======

        // 1. Détection de la structure des colonnes via la première ligne d'en-tête
        $premiereLigneIndex = array_key_first($lignes);
        $premiereLigne = $lignes[$premiereLigneIndex];

        $mappingColonnes = $this->detecterMappingColonnes($premiereLigne);

        // Si la première ligne était une en-tête reconnue, on commence l'import à la 2ème ligne
        $aEntete = $mappingColonnes['a_entete'];
        $map = $mappingColonnes['map']; // tableau associatif: ['A' => 'localite', 'B' => 'chap', ...]

        $premiere = true;
        foreach ($lignes as $index => $ligne) {
            if ($premiere && $aEntete) {
                $premiere = false;
                continue;
            }
            $premiere = false;

            $donnees = [];
            $chaineConcatenee = '';

            foreach ($map as $colLettre => $champ) {
                $val = $this->formaterCellule($ligne[$colLettre] ?? null);
                $donnees[$champ] = $val;
                $chaineConcatenee .= $val;
            }

            // Ignorer les lignes complètement vides
            if (empty(trim($chaineConcatenee))) {
                continue;
            }

            // L'IM (matricule) est obligatoire
            if (! isset($donnees['im']) || trim((string)$donnees['im']) === '') {
                $invalides++;
                continue;
            }

            // Empreinte unique pour éviter les doublons
            $donnees['empreinte'] = SuiviDossier::empreinte([
                $donnees['localite'] ?? '',
                $donnees['chap'] ?? '',
                $donnees['im'] ?? '',
                $donnees['cmv'] ?? '',
                $donnees['ref_dossier'] ?? '',
            ]);

            if (SuiviDossier::where('empreinte', $donnees['empreinte'])->exists()) {
                $ignores++;
>>>>>>> origin/main
                continue;
            }

            $nouveaux[] = SuiviDossier::create($donnees);
            $ajoutes++;
        }

        return [
            'ajoutes' => $ajoutes,
            'ignores' => $ignores,
            'invalides' => $invalides,
            'total' => SuiviDossier::count(),
            'nouveaux' => $nouveaux,
        ];
    }

<<<<<<< HEAD
=======
    /**
     * Détecte intelligemment les colonnes d'après les en-têtes ou par position par défaut.
     */
    private function detecterMappingColonnes(array $premiereLigne): array
    {
        $map = [];
        $reconnu = 0;

        foreach ($premiereLigne as $col => $val) {
            $nom = mb_strtolower(trim((string)$val));

            if (str_contains($nom, 'localit') || str_contains($nom, 'lieu') || str_contains($nom, 'region')) {
                $map[$col] = 'localite';
                $reconnu++;
            } elseif (str_contains($nom, 'chap') || str_contains($nom, 'chapitre')) {
                $map[$col] = 'chap';
                $reconnu++;
            } elseif ($nom === 'im' || str_contains($nom, 'matricule') || str_contains($nom, 'immatr')) {
                $map[$col] = 'im';
                $reconnu++;
            } elseif ($nom === 'cmv' || $nom === 'cm' || str_contains($nom, 'mouvement') || str_contains($nom, 'mvt')) {
                $map[$col] = 'cmv';
                $reconnu++;
            }
        }

        // Si au moins 2 colonnes cibles sont reconnues par leurs noms dans l'en-tête
        if ($reconnu >= 2) {
            return [
                'a_entete' => true,
                'map' => $map,
            ];
        }

        // Sinon, si le fichier a 20+ colonnes, vérifier si c'est l'ancien format legacy
        $totalColonnes = count(array_filter($premiereLigne, fn($v) => $v !== null && trim((string)$v) !== ''));
        if ($totalColonnes > 10) {
            $legacyMap = [];
            foreach (array_keys(self::COLONNES_LEGACY) as $i) {
                $colLettre = chr(65 + $i);
                $legacyMap[$colLettre] = self::COLONNES_LEGACY[$i];
            }
            return [
                'a_entete' => true,
                'map' => $legacyMap,
            ];
        }

        // Format par défaut pour 4 colonnes : A: localite, B: chap, C: im, D: cmv
        $colonnesParDefaut = ['A' => 'localite', 'B' => 'chap', 'C' => 'im', 'D' => 'cmv'];

        // Vérifier si la première ligne ressemble à des données (ex: IM numérique dans la colonne C)
        $estEntete = false;
        foreach (['A', 'B', 'C', 'D'] as $col) {
            $v = mb_strtolower(trim((string)($premiereLigne[$col] ?? '')));
            if (str_contains($v, 'local') || str_contains($v, 'chap') || str_contains($v, 'im') || str_contains($v, 'cmv')) {
                $estEntete = true;
                break;
            }
        }

        return [
            'a_entete' => $estEntete,
            'map' => $colonnesParDefaut,
        ];
    }

>>>>>>> origin/main
    private function formaterCellule(mixed $valeur): string
    {
        if ($valeur === null) {
            return '';
        }

        if ($valeur instanceof \DateTimeInterface) {
            return $valeur->format('d/m/Y');
        }

        return trim((string) $valeur);
    }
}
