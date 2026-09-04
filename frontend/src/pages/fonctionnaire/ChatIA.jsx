import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { ArrowLeft, Send, Bot, User, MessageSquarePlus } from "lucide-react";
import "../../styles/dashboard.css"; // For common styles like btn, card, etc.

export default function ChatIA() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    chargerConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      chargerMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chargerConversations = async () => {
    try {
      const { data } = await api.get("/conversations");
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id_conversation);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations", error);
    }
  };

  const chargerMessages = async (id) => {
    try {
      const { data } = await api.get(`/conversations/${id}/messages`);
      setMessages(data);
    } catch (error) {
      console.error("Erreur lors du chargement des messages", error);
    }
  };

  const creerNouvelleConversation = async () => {
    try {
      const { data } = await api.post("/conversations");
      setConversations([data, ...conversations]);
      setActiveConversationId(data.id_conversation);
    } catch (error) {
      console.error("Erreur lors de la création de la conversation", error);
    }
  };

  const envoyerMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    const messageText = newMessage;
    setNewMessage("");

    // Ajouter le message optimiste
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="dashboard" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="dashboard-header" style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => navigate("/fonctionnaire")} style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ margin: 0 }}>Assistant IA pour vos démarches</h1>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", padding: "1.5rem", gap: "1.5rem" }}>
        
        {/* Barre latérale des conversations */}
        <div className="card" style={{ width: "300px", display: "flex", flexDirection: "column", padding: "1rem" }}>
          <button 
            className="btn btn-primary" 
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}
            onClick={creerNouvelleConversation}
          >
            <MessageSquarePlus size={18} /> Nouvelle discussion
          </button>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {conversations.map(conv => (
              <div 
                key={conv.id_conversation}
                onClick={() => setActiveConversationId(conv.id_conversation)}
                style={{
                  padding: "0.75rem", 
                  borderRadius: "6px", 
                  cursor: "pointer",
                  background: activeConversationId === conv.id_conversation ? "#1e2761" : "#f3f4f6",
                  color: activeConversationId === conv.id_conversation ? "#fff" : "#374151"
                }}
              >
                Conversation du {new Date(conv.date_debut || conv.created_at).toLocaleDateString("fr-FR")}
              </div>
            ))}
            {conversations.length === 0 && (
              <p style={{ color: "#6b7280", textAlign: "center", marginTop: "1rem" }}>Aucune conversation.</p>
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0" }}>
          {activeConversationId ? (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {messages.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#6b7280" }}>
                    <Bot size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                    <h3 style={{ marginBottom: "0.5rem", color: "#374151" }}>Comment puis-je vous aider ?</h3>
                    <p style={{ marginBottom: "2rem" }}>Posez-moi vos questions sur les démarches administratives.</p>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", maxWidth: "600px" }}>
                      {[
                        "Comment faire une demande de congé ?",
                        "Quels sont les documents requis pour l'avancement ?",
                        "Je veux faire une réclamation concernant ma solde.",
                        "Comment récupérer mon bon de caisse ?"
                      ].map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setNewMessage(suggestion)}
                          style={{
                            background: "#fff",
                            border: "1px solid #d1d5db",
                            padding: "0.75rem 1rem",
                            borderRadius: "20px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            color: "#4b5563",
                            transition: "all 0.2s"
                          }}
                          onMouseOver={(e) => { e.target.style.borderColor = "#1e2761"; e.target.style.color = "#1e2761"; }}
                          onMouseOut={(e) => { e.target.style.borderColor = "#d1d5db"; e.target.style.color = "#4b5563"; }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isUser = msg.expediteur === "utilisateur";
                    return (
                      <div key={msg.id_message || index} style={{
                        display: "flex", 
                        gap: "1rem", 
                        alignSelf: isUser ? "flex-end" : "flex-start",
                        flexDirection: isUser ? "row-reverse" : "row",
                        maxWidth: "80%"
                      }}>
                        <div style={{ 
                          width: "36px", height: "36px", borderRadius: "50%", 
                          background: isUser ? "#1e2761" : "#e5e7eb", 
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: isUser ? "#fff" : "#374151",
                          flexShrink: 0
                        }}>
                          {isUser ? <User size={20} /> : <Bot size={20} />}
                        </div>
                        <div style={{
                          background: isUser ? "#1e2761" : "#f3f4f6",
                          color: isUser ? "#fff" : "#1f2937",
                          padding: "1rem",
                          borderRadius: "12px",
                          borderTopRightRadius: isUser ? "0" : "12px",
                          borderTopLeftRadius: !isUser ? "0" : "12px",
                        }}>
                          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.contenu}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                {loading && (
                  <div style={{ display: "flex", gap: "1rem", alignSelf: "flex-start", maxWidth: "80%" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}>
                      <Bot size={20} />
                    </div>
                    <div style={{ background: "#f3f4f6", padding: "1rem", borderRadius: "12px", borderTopLeftRadius: "0", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "8px", height: "8px", background: "#9ca3af", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "-0.32s" }}></span>
                      <span style={{ width: "8px", height: "8px", background: "#9ca3af", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "-0.16s" }}></span>
                      <span style={{ width: "8px", height: "8px", background: "#9ca3af", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both" }}></span>
                      <style>{`
                        @keyframes bounce {
                          0%, 80%, 100% { transform: scale(0); }
                          40% { transform: scale(1); }
                        }
                      `}</style>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: "1rem", borderTop: "1px solid #e5e7eb", background: "#f9fafb", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }}>
                <form onSubmit={envoyerMessage} style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message ici..."
                    style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid #d1d5db" }}
                    disabled={loading}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={!newMessage.trim() || loading}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#6b7280" }}>
              <Bot size={64} style={{ marginBottom: "1rem", opacity: 0.5 }} />
              <h2>Bienvenue dans l'assistant IA</h2>
              <p>Sélectionnez une conversation ou commencez-en une nouvelle.</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: "1rem" }}
                onClick={creerNouvelleConversation}
              >
                Commencer une discussion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}