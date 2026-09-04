export default function Activity() {
    return (
      <div className="bg-white rounded-xl shadow p-6">
  
        <h3 className="font-bold text-lg">
          Activité récente
        </h3>
  
        <ul className="mt-4 space-y-3">
  
          <li>
            Nouvel utilisateur inscrit
          </li>
  
          <li>
            Nouvelle commande validée
          </li>
  
          <li>
            Paiement reçu
          </li>
  
        </ul>
  
      </div>
    );
  }