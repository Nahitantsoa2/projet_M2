export default function ListeDossiers() {
    const dossiers = [
      { id: 1, titre: "Dossier Administratif", description: "Documents admin", statut: "Ouvert" },
      { id: 2, titre: "Dossier Finance", description: "Budget", statut: "En cours" },
    ];
  
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Liste des dossiers</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {dossiers.map((dossier) => (
            <div key={dossier.id} className="p-4 bg-white shadow rounded">
              <h2 className="font-semibold">{dossier.titre}</h2>
              <p className="text-gray-500">{dossier.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }