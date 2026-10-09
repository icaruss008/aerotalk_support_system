import axios from 'axios';

let configuredUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Bulletproof the URL: Strip trailing slashes and ensure it ends with /api
configuredUrl = configuredUrl.replace(/\/$/, '');
if (!configuredUrl.startsWith('http')) {
  configuredUrl = 'https://' + configuredUrl;
}
if (!configuredUrl.endsWith('/api')) {
  configuredUrl += '/api';
}

const api = axios.create({
  baseURL: configuredUrl,
});

export default api;
