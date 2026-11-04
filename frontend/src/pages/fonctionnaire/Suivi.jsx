import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { FolderOpen } from "lucide-react";
import SuiviContenu from "./SuiviContenu";

export default function SuiviDossiers() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <AppHeader
        icon={<FolderOpen size={20} />}
        iconClass="from-blue-600 to-cyan-500 shadow-blue-500/20"
        title="Suivi des dossiers"
        subtitle="Consultez l'état d'avancement de vos dossiers"
        onBack={() => navigate("/fonctionnaire")}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SuiviContenu />
      </main>
    </div>
  );
}
