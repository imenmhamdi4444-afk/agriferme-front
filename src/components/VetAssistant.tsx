import React, { useState, useRef, useEffect } from 'react';
import { sendChat } from '../api/ollama';
import { MessageCircle, Send, Stethoscope, AlertTriangle } from 'lucide-react';

interface Props {
  onRequestRdv: () => void;
}

const VetAssistant: React.FC<Props> = ({ onRequestRdv }) => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'Décris les symptômes de ton animal (fièvre, diarrhée, boiterie, perte d\'appétit...) et je t\'aiderai à identifier la maladie !' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const reply = await sendChat(input);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erreur de connexion au service IA. Vérifie que le backend est lancé.' }]);
    } finally {
      setLoading(false);
    }
  };

  const c = {
    container: {
      width: '100%',
      border: '1.5px solid #bdc3c7',
      borderRadius: 8,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: '#fafafa',
    },
    header: {
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '10px 14px',
      fontWeight: 600,
      fontSize: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    chatArea: {
      height: 240,
      overflowY: 'auto' as const,
      padding: 12,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 8,
    },
    msgUser: {
      alignSelf: 'flex-end' as const,
      backgroundColor: '#3498db',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '12px 12px 4px 12px',
      fontSize: 13,
      maxWidth: '80%',
    },
    msgAssistant: {
      alignSelf: 'flex-start' as const,
      backgroundColor: 'white',
      color: '#2c3e50',
      padding: '8px 12px',
      borderRadius: '12px 12px 12px 4px',
      fontSize: 13,
      maxWidth: '100%',
      border: '1px solid #ecf0f1',
      lineHeight: 1.5,
      whiteSpace: 'pre-wrap' as const,
    },
    inputRow: {
      display: 'flex',
      padding: 8,
      gap: 6,
      borderTop: '1px solid #ecf0f1',
      backgroundColor: 'white',
    },
    input: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: 6,
      border: '1.5px solid #bdc3c7',
      fontSize: 13,
      outline: 'none',
    },
    sendBtn: {
      backgroundColor: '#27ae60',
      color: 'white',
      border: 'none',
      borderRadius: 6,
      padding: '8px 12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 13,
      fontWeight: 600,
    },
    rdvBtn: {
      marginTop: 8,
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      borderRadius: 6,
      padding: '8px 14px',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'center',
    },
  };

  return (
    <div style={c.container}>
      <div style={c.header}>
        <Stethoscope size={18} /> Vétérinaire IA - Diagnostic & Conseils
      </div>
      <div style={c.chatArea}>
        {messages.map((m, i) => (
          <div key={i} style={m.role === 'user' ? c.msgUser : c.msgAssistant}>
            {m.content.split('\n').map((line, j) => (
              <div key={j}>{line || '\u00A0'}</div>
            ))}
          </div>
        ))}
        {loading && (
          <div style={{ ...c.msgAssistant, fontStyle: 'italic', color: '#95a5a6' }}>
            Analyse en cours...
          </div>
        )}
        <div ref={chatEnd} />
      </div>
      <div style={c.inputRow}>
        <input
          style={c.input}
          placeholder="Décris les symptômes..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button style={c.sendBtn} onClick={handleSend} disabled={loading}>
          <Send size={14} /> Envoyer
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 8px 8px 8px' }}>
        <button style={c.rdvBtn} onClick={onRequestRdv}>
          <AlertTriangle size={13} /> Prendre RDV vétérinaire
        </button>
      </div>
    </div>
  );
};

export default VetAssistant;
