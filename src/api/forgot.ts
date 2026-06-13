import API_URL from './config';

export const requestResetCode = async (email: string) => {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return { data: await res.json(), status: res.status };
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  });
  return { data: await res.json(), status: res.status };
};