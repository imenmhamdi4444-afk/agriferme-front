const API_URL: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8081/api';
export default API_URL;

export const getAuthHeaders = (): HeadersInit => {
  const user = localStorage.getItem('user');
  if (user) {
    const parsed = JSON.parse(user);
    if (parsed.token) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${parsed.token}`
      };
    }
  }
  return { 'Content-Type': 'application/json' };
};