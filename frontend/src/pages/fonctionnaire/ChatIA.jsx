import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { ArrowLeft, Send, Bot, User, MessageSquarePlus, Sparkles, Trash2, Menu } from "lucide-react";

export default function ChatIA() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOuvert, setSidebarOuvert] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function chargerMessages(id) {
    try {
      const { data } = await api.get(`/conversations/${id}/messages`);
      setMessages(data);
    } catch (error) {
      console.error("Erreur lors du chargement des messages", error);
    }
  }

  async function chargerConversations() {
    try {
      const { data } = await api.get("/conversations");
      setConversations(data);
      if (data.length > 0) {
        setActiveConversationId((prev) => prev ?? data[0].id_conversation);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations", error);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState survient après await (asynchrone), pas de rendu en cascade
    chargerConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- setState survient après await (asynchrone)
      chargerMessages(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const creerNouvelleConversation = async () => {
    try {
      const { data } = await api.post("/conversations");
      setConversations([data, ...conversations]);
      setActiveConversationId(data.id_conversation);
      setSidebarOuvert(false);
    } catch (error) {
      console.error("Erreur lors de la création de la conversation", error);
    }
  };

  const supprimerConversation = async (id, e) => {
    e.stopPropagation(); // empêche de sélectionner la conversation en cliquant sur la poubelle

    const confirmation = window.confirm("Voulez-vous vraiment supprimer cette conversation ?");
    if (!confirmation) return;

    try {
      await api.delete(`/conversations/${id}`);

      const nouvellesConversations = conversations.filter(
        (conv) => conv.id_conversation !== id
      );
      setConversations(nouvellesConversations);

      // Si la conversation supprimée était active, on bascule sur une autre (ou aucune)
      if (activeConversationId === id) {
        if (nouvellesConversations.length > 0) {
          setActiveConversationId(nouvellesConversations[0].id_conversation);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la conversation", error);
      alert("Impossible de supprimer la conversation. Veuillez réessayer.");
    }
  };

  const envoyerMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    const messageText = newMessage;
    setNewMessage("");

    const optimisticUserMessage = {
      id_message: Date.now(),
      contenu: messageText,
      expediteur: "utilisateur",
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);
    setLoading(true);

    try {
      const { data } = await api.post(`/conversations/${activeConversationId}/messages`, {
        contenu: messageText,
      });
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message", error);
      const errorMessage = {
        id_message: Date.now() + 1,
        contenu: "Désolé, impossible de joindre le serveur. Veuillez vérifier votre connexion ou réessayer plus tard.",
        expediteur: "ia",
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    {
      categorie: "SOLDE",
      questions: [
        "Comment récupérer mon bon de caisse ?",
        "Pièces pour le mandatement de solde ?",
        "Je veux faire une réclamation concernant ma solde.",
      ],
    },
    {
      categorie: "PENSION",
      questions: [
        "Pièces pour la réversion orphelin ?",
        "Pièces pour un changement d'assignation ?",
        "Pièces pour la rectification nom, prénom, CIN ?",
        "Pièces pour la révision ordre nationale ?",
        "Pièces pour le remandatement ?",
        "Pièces pour la révision d'indice ?",
        "Pièces pour la révision MPE ?",
        "Pièces pour la révision de pourcentage ?",
        "Pièces pour la révision de bonification ?",
      ],
    },
    {
      categorie: "VISER LES ACTES ADMINISTRATIFS - AGENT CONTRACTUEL (VISA)",
      questions: [
        "Pièces pour un renouvellement de contrat (Agent EFA) ?",
        "Pièces à fournir pour un avenant ?",
        "Pièces pour l'intégration ?",
        "Pièces pour la majoration de salaire (Agent ELD) ?",
      ],
    },
    {
      categorie: "VISER LES ACTES ADMINISTRATIFS - AGENT FONCTIONNAIRE (VISA)",
      questions: [
        "Pièces pour un avancement de classe ?",
        "Pièces pour un avancement d'échelon ?",
        "Pièces pour un reclassement indiciaire ?",
        "Pièces pour une majoration d'indice (catégorie VIII) ?",
        "Pièces pour la bonification RSM ?",
        "Pièces pour la bonification DELF-DALF ?",
        "Pièces pour l'indemnité d'installation de retraite ?",
        "Pièces pour la titularisation ?",
        "Pièces pour l'indemnité compensatrice de congé non pris ?",
      ],
    },
    {
      categorie: "VISER LES ACTES ADMINISTRATIFS - CAS PARTICULIER (VISA)",
      questions: [
        "Que faut-il fournir en cas de décès d'un agent ?",
      ],
    },
  ];

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-40 flex-shrink-0">
        <div className="max-w-full mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/fonctionnaire")}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={() => setSidebarOuvert(true)}
              className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
              title="Liste des conversations"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">Assistant IA</h1>
                <p className="text-xs text-gray-500">Aide pour vos démarches</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Conversations */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-transform duration-300 shadow-2xl md:shadow-none ${
            sidebarOuvert ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <div className="p-3 border-b border-gray-100">
            <button
              onClick={creerNouvelleConversation}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
            >
              <MessageSquarePlus size={18} />
              Nouvelle discussion
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <MessageSquarePlus size={32} className="mb-2 opacity-40" />
                <p className="text-sm text-center">Aucune conversation.<br />Commencez-en une nouvelle !</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id_conversation}
                  onClick={() => {
                    setActiveConversationId(conv.id_conversation);
                    setSidebarOuvert(false);
                  }}
                  className={`group w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    activeConversationId === conv.id_conversation
                      ? 'bg-violet-50 text-violet-700 font-semibold border border-violet-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activeConversationId === conv.id_conversation ? 'bg-violet-500' : 'bg-gray-300'
                    }`} />
                    <span className="truncate">
                      Conv. du {new Date(conv.date_debut || conv.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <button
                    onClick={(e) => supprimerConversation(conv.id_conversation, e)}
                    title="Supprimer cette conversation"
                    className={`flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600 ${
                      activeConversationId === conv.id_conversation ? 'text-violet-400' : 'text-gray-400'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Backdrop mobile */}
        {sidebarOuvert && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOuvert(false)}
          />
        )}

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-gray-50">
          {activeConversationId ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-purple-500/25 animate-float">
                      <Bot size={36} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Comment puis-je vous aider ?
                    </h3>
                    <p className="text-gray-500 mb-8 max-w-md">
                      Posez-moi vos questions sur les démarches administratives et je vous guiderai pas à pas.
                    </p>

                    <div className="max-w-2xl w-full space-y-4">
                      {suggestions.map((groupe) => (
                        <div key={groupe.categorie} className="text-left">
                          <p className="text-xs font-bold uppercase tracking-wide text-violet-500 mb-2">
                            {groupe.categorie}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {groupe.questions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setNewMessage(suggestion);
                                  inputRef.current?.focus();
                                }}
                                className="text-left px-3 py-2 bg-white rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all shadow-sm hover:shadow-md"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isUser = msg.expediteur === "utilisateur";
                    return (
                      <div
                        key={msg.id_message || index}
                        className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                          isUser
                            ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600'
                        }`}>
                          {isUser ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`px-4 py-3 rounded-2xl max-w-lg shadow-sm ${
                          isUser
                            ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap m-0">{msg.contenu}</p>
                        </div>
                      </div>
                    );
                  })
                )}

                {loading && (
                  <div className="flex gap-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm flex-shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex gap-1.5 items-center h-5">
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '-0.32s' }} />
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '-0.16s' }} />
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 bg-white px-4 sm:px-6 py-4">
                <form onSubmit={envoyerMessage} className="flex gap-3 max-w-3xl mx-auto">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message ici..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:bg-white transition-all"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || loading}
                    className="w-11 h-11 flex items-center justify-center bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-xl shadow-purple-500/25 animate-float">
                <Bot size={44} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Bienvenue dans l'assistant IA
              </h2>
              <p className="text-gray-500 mb-8 max-w-md">
                Sélectionnez une conversation existante ou commencez-en une nouvelle pour obtenir de l'aide.
              </p>
              <button
                onClick={creerNouvelleConversation}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <MessageSquarePlus size={20} />
                Commencer une discussion
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
