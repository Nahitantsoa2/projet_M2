export default function Utilisateurs() {
    const utilisateurs = [
      {
        id: 1,
        nom: "Rakoto",
        email: "rakoto@gmail.com",
        role: "Admin",
      },
      {
        id: 2,
        nom: "Rabe",
        email: "rabe@gmail.com",
        role: "Utilisateur",
      },
      {
        id: 3,
        nom: "Rasoa",
        email: "rasoa@gmail.com",
        role: "Éditeur",
      },
      {
        id: 4,
        nom: "Hery",
        email: "hery@gmail.com",
        role: "Utilisateur",
      },
    ];
  
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">👤 Utilisateurs</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {utilisateurs.map((user) => (
            <div
              key={user.id}
              className="bg-white p-4 rounded-xl shadow border hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">
                {user.nom}
              </h2>
  
              <p className="text-gray-500 text-sm mt-1">
                📧 {user.email}
              </p>
  
              <span
                className={`inline-block mt-3 px-3 py-1 text-xs rounded-full
                ${
                  user.role === "Admin"
                    ? "bg-red-100 text-red-700"
                    : user.role === "Éditeur"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }