export default function Archives() {
    const archives = [
      { id: 1, titre: "Ancien dossier RH", date: "2024-01-10" },
      { id: 2, titre: "Rapport financier 2023", date: "2023-12-20" },
      { id: 3, titre: "Projet terminé", date: "2023-11-05" },
    ];
  
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">🗄️ Archives</h1>
  
        <div className="grid gap-4">
          {archives.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded shadow border"
            >
              <h2 className="font-semibold">{item.titre}</h2>
              <p className="text-sm text-gray-500">
                Date : {item.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }