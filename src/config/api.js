// API Base URL configuration
// In development (npm start), the proxy in package.json handles /api routes
// In production (e.g. Vercel), we use the full backend URL
const API_BASE_URL =
    process.env.NODE_ENV === 'production'
        ? (process.env.REACT_APP_API_BASE_URL || 'https://perfume-api-84pd.onrender.com')
        : '';

export default API_BASE_URL;
