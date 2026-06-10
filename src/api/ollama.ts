import API_URL, { getAuthHeaders } from './config';

export const sendChat = async (message: string): Promise<string> => {
  const res = await fetch(`${API_URL}/ai/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });

  if (!res.ok) throw new Error('Erreur de connexion');

  const data = await res.json();
  return data.reply || 'Pas de réponse';
};
