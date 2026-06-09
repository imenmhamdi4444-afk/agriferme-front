declare const __API_URL__: string;
const API_URL: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8081/api';
export default API_URL;