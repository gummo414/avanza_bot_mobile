// API-konfiguration
// Byt ut BASE_URL om du deployar backend på annan adress.
export const BASE_URL = 'https://avanzabot-production.up.railway.app';

export const API = {
  login:    `${BASE_URL}/api/auth/login`,
  overview: `${BASE_URL}/api/portfolio/overview`,
  benchmark:`${BASE_URL}/api/portfolio/benchmark`,
  chart:    `${BASE_URL}/api/portfolio/chart`,
  trades:   `${BASE_URL}/api/trades`,
};
