// Helpers « métier » pour la liste des agents (page Informations).
// Fonctions pures, sans dépendance React ni réseau : faciles à tester.

/**
 * Normalise une valeur en texte comparable (minuscules, sans espaces autour).
 * @param {unknown} valeur
 * @returns {string}
 */
function normaliser(valeur) {
  return String(valeur ?? "").trim().toLowerCase();
}

/**
 * Filtre une liste d'agents selon une recherche libre.
 * La recherche porte sur le matricule (IM), le nom, le prénom et la localité.
 *
 * @param {Array<{matricule:string, nom:string, prenom?:string, localite:string}>} agents
 * @param {string} recherche
 * @returns {Array} les agents correspondants (liste d'origine si recherche vide)
 */
export function filtrerAgents(agents, recherche) {
  const terme = normaliser(recherche);
  if (!terme) return agents;

  return agents.filter((agent) =>
    [agent.matricule, agent.nom, agent.prenom, agent.localite].some((champ) =>
      normaliser(champ).includes(terme)
    )
  );
}

/**
 * Regroupe les agents par localité et trie les groupes par code de localité.
 *
 * @param {Array<{localite:string}>} agents
 * @returns {Array<{code:string, agents:Array}>}
 */
export function grouperParLocalite(agents) {
  const groupes = new Map();

  agents.forEach((agent) => {
    const code = agent.localite;
    if (!groupes.has(code)) groupes.set(code, []);
    groupes.get(code).push(agent);
  });

  return [...groupes.entries()]
    .map(([code, membres]) => ({ code, agents: membres }))
    .sort((a, b) => normaliser(a.code).localeCompare(normaliser(b.code)));
}
