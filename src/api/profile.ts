import API_URL, { getAuthHeaders } from './config';

export const getProfile = async () => {
  const res = await fetch(`${API_URL}/utilisateurs/me`, { headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};

export const updateProfile = async (data: { nomComplet: string; telephone: string }) => {
  const res = await fetch(`${API_URL}/utilisateurs/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return { data: await res.json(), status: res.status };
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const res = await fetch(`${API_URL}/utilisateurs/me/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return { data: await res.json(), status: res.status };
};

export const getNotifications = async () => {
  const res = await fetch(`${API_URL}/notifications`, { headers: getAuthHeaders() });
  return { data: await res.json(), status: res.status };
};