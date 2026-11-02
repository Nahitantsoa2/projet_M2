import { describe, expect, it } from "vitest";
import { filtrerAgents, grouperParLocalite } from "./informations";

const AGENTS = [
  { id_information: 1, matricule: "509688", nom: "RANDRIANANDRASANA", prenom: "Tsaravita", localite: "304" },
  { id_information: 2, matricule: "509669", nom: "ANDRIAMAMINIAINA", prenom: "D. N.", localite: "306" },
  { id_information: 3, matricule: "509671", nom: "SOLOFOSON", prenom: "Andriniaina", localite: "308" },
  { id_information: 4, matricule: "509672", nom: "RANDRIAMALAZAVOLA", prenom: "Samüelson", localite: "324" },
];

describe("filtrerAgents", () => {
  it("retourne la liste complète quand la recherche est vide", () => {
    expect(filtrerAgents(AGENTS, "")).toHaveLength(4);
    expect(filtrerAgents(AGENTS, "   ")).toHaveLength(4);
  });

  it("filtre par matricule (matricule inclus dans la recherche)", () => {
    expect(filtrerAgents(AGENTS, "50966").map((a) => a.matricule)).toEqual(["509669"]);
  });

  it("filtre par nom", () => {
    expect(filtrerAgents(AGENTS, "solofoson").map((a) => a.nom)).toEqual(["SOLOFOSON"]);
  });

  it("filtre par prénom", () => {
    expect(filtrerAgents(AGENTS, "andriniaina").map((a) => a.nom)).toEqual(["SOLOFOSON"]);
  });

  it("filtre par localité", () => {
    expect(filtrerAgents(AGENTS, "324").map((a) => a.matricule)).toEqual(["509672"]);
  });

  it("ignore la casse et les espaces autour", () => {
    expect(filtrerAgents(AGENTS, "  RANDRIAMALAZAVOLA  ")).toHaveLength(1);
  });

  it("retourne un tableau vide quand rien ne correspond", () => {
    expect(filtrerAgents(AGENTS, "zzz")).toEqual([]);
  });

  it("tolère un prénom absent (null / undefined)", () => {
    const agents = [{ id_information: 9, matricule: "1", nom: "TEST", prenom: null, localite: "304" }];
    expect(filtrerAgents(agents, "test")).toHaveLength(1);
    expect(filtrerAgents(agents, "inexistant")).toEqual([]);
  });
});

describe("grouperParLocalite", () => {
  it("regroupe les agents par localité", () => {
    const groupes = grouperParLocalite(AGENTS);
    expect(groupes).toHaveLength(4);
    expect(groupes.every((g) => g.agents.length === 1)).toBe(true);
  });

  it("trie les groupes par code de localité", () => {
    expect(grouperParLocalite(AGENTS).map((g) => g.code)).toEqual(["304", "306", "308", "324"]);
  });

  it("regroupe plusieurs agents de la même localité", () => {
    const agents = [
      { localite: "304", nom: "A" },
      { localite: "304", nom: "B" },
      { localite: "306", nom: "C" },
    ];
    const groupes = grouperParLocalite(agents);
    expect(groupes[0]).toMatchObject({ code: "304" });
    expect(groupes[0].agents).toHaveLength(2);
    expect(groupes[1].agents).toHaveLength(1);
  });

  it("retourne un tableau vide pour une liste vide", () => {
    expect(grouperParLocalite([])).toEqual([]);
  });
});
