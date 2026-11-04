import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FileText, MessageSquare, ClipboardList, Info } from "lucide-react";
import AppHeader from "../../components/AppHeader";
import SuiviContenu from "./SuiviContenu";
import "../../styles/dashboard.css";

export default function DashboardFonctionnaire() {
  const { utilisateur } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <AppHeader
        icon={<FileText size={22} />}
        iconClass="from-blue-600 to-blue-500 shadow-blue-500/20"
        title={`Bonjour, ${utilisateur?.prenom ?? ""}`}
        titleClass="text-lg sm:text-xl"
        subtitle={
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            Fonctionnaire
          </span>
        }
        extra={
          <>
            <button
              onClick={() => navigate("/fonctionnaire/nouvelle-demande")}
              className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 sm:px-4 py-2 rounded-xl transition-all font-semibold text-sm border border-blue-200"
            >
              <ClipboardList size={18} />
              <span className="hidden sm:inline">Nouvelle demande</span>
            </button>
            <button
              onClick={() => navigate("/fonctionnaire/informations")}
              className="flex items-center gap-2 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 px-2.5 sm:px-4 py-2 rounded-xl transition-all font-semibold text-sm border border-cyan-200"
            >
              <Info size={18} />
              <span className="hidden sm:inline">Informations</span>
            </button>
            <button
              onClick={() => navigate("/fonctionnaire/reclamations")}
              className="flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50 px-2.5 sm:px-4 py-2 rounded-xl transition-all font-semibold text-sm border border-gray-200"
            >
              <MessageSquare size={18} />
              <span className="hidden sm:inline">Messages</span>
            </button>
            <button
              onClick={() => navigate("/fonctionnaire/chat-ia")}
              className="flex items-center gap-2 bg-violet-50 text-violet-700 hover:bg-violet-100 px-2.5 sm:px-4 py-2 rounded-xl transition-all font-semibold text-sm border border-violet-200"
            >
              <MessageSquare size={18} />
              <span className="hidden sm:inline">Discuter avec l'IA</span>
            </button>
          </>
        }
      />

      {/* Main Content : interface de suivi des dossiers */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SuiviContenu />
      </main>
    </div>
  );
}
