import API_URL from './config';
import { LoginResponse } from '../types';

export const login = async (email: string, motDePasse: string): Promise<LoginResponse> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: motDePasse }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erreur de connexion');
  }

  const data = await res.json();

  // Use the real JWT token from the server
  const loginResponse: LoginResponse = {
    token: data.token,
    type: 'Bearer',
    id: data.id,
    email: data.email,
    nomComplet: data.nomComplet || data.nom_complet,
    role: data.role,
    statut: data.statut,
  };

  localStorage.setItem('uid', String(loginResponse.id));
  localStorage.setItem('user', JSON.stringify(loginResponse));
  localStorage.setItem('token', data.token);

  return loginResponse;
};