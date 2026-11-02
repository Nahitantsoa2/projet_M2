import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { ClipboardList } from "lucide-react";
import NouvelleDemandeManuelle from "./NouvelleDemandeManuelle";

export default function NouvelleDemande() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        icon={<ClipboardList size={20} />}
        iconClass="from-blue-600 to-blue-500 shadow-blue-500/20"
        title="Nouvelle demande"
        subtitle="Remplissez le formulaire puis validez"
        onBack={() => navigate("/fonctionnaire")}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <NouvelleDemandeManuelle />
          </div>
        </div>
      </main>
    </div>
  );
}
