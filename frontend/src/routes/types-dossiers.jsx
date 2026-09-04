export default function TypesDossiers() {
    const types = [
      {
        id: 1,
        nom: "Administratif",
        description: "Tous les documents administratifs",
      },
      {
        id: 2,
        nom: "Finance",
        description: "Gestion du budget et comptabilité",
      },
      {
        id: 3,
        nom: "Ressources Humaines",
        description: "Gestion des employés et RH",
      },
      {
        id: 4,
        nom: "Technique",
        description: "Support et maintenance technique",
      },
    ];
  
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">📂 Types de dossiers</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map((type) => (
            <div
              key={type.id}
              className="bg-white p-4 rounded-xl shadow border hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">{type.nom}</h2>
              <p className="text-gray-500 text-sm mt-2">
                {type.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }