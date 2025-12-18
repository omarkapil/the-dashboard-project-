import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const scanService = {
    startScan: (target, type = 'quick') => api.post('/scans/', { target, scan_type: type }),
    getScans: () => api.get('/scans/'),
    getScanDetails: (id) => api.get(`/scans/${id}`),
    getReport: (id) => api.get(`/reports/${id}`),
};

export const networkService = {
    getAssets: (status = null) => api.get('/network/assets', { params: { status } }),
    getNewDevices: () => api.get('/network/assets/new'),
    getActivity: (limit = 20) => api.get('/network/activity', { params: { limit } }),
};

export default api;
