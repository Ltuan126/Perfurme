// API Base URL configuration
// In development (npm start), the proxy in package.json handles /api routes
// In production (GitHub Pages), we need the full Render backend URL
const API_BASE_URL =
    process.env.NODE_ENV === 'production'
        ? 'https://perfume-api-84pd.onrender.com'
        : '';

export default API_BASE_URL;
