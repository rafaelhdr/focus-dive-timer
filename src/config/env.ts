
// Environment variables with default fallbacks
export const API_DOMAIN = import.meta.env.VITE_API_DOMAIN || 'api-focusdive.rafaelhdr.com.br';
export const API_URL = import.meta.env.VITE_API_URL || `https://${API_DOMAIN}`;

console.log('API configuration:', {
  API_DOMAIN,
  API_URL,
});
