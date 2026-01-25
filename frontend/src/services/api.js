import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================================================
// LEGACY SERVICES (backward compatibility)
// ============================================================================

export const scanService = {
    startScan: (target, type = 'quick') => api.post('/scans/', { target_url: target, scan_type: type }),
    getScans: () => api.get('/scans/'),
    getScanDetails: (id) => api.get(`/scans/${id}`),
    getReport: (id) => api.get(`/reports/${id}`),
};

export const networkService = {
    getAssets: (status = null) => api.get('/network/assets', { params: { status } }),
    getNewDevices: () => api.get('/network/assets/new'),
    getActivity: (limit = 20) => api.get('/network/activity', { params: { limit } }),
};

// ============================================================================
// PENTESTERFLOW SERVICES
// ============================================================================

export const targetService = {
    // Create a new target
    create: (data) => api.post('/targets/', data),

    // List all targets
    list: (params = {}) => api.get('/targets/', { params }),

    // Get target details
    get: (id) => api.get(`/targets/${id}`),

    // Update target
    update: (id, data) => api.patch(`/targets/${id}`, data),

    // Discovery
    discover: (domain) => api.post('/targets/discover', null, { params: { domain } }),

    // Delete target
    delete: (id) => api.delete(`/targets/${id}`),
};

export const pentesterService = {
    // Start an AI-powered scan (full PentesterFlow workflow)
    startAIScan: (targetId, config = {}) => api.post('/scans/ai', {
        target_id: targetId,
        scan_type: 'full',
        configuration: config
    }),

    // Start AI scan with URL directly
    startAIScanByUrl: (url, config = {}) => api.post('/scans/ai', {
        target_url: url,
        scan_type: 'full',
        configuration: config
    }),

    // Get scan with agent logs
    getScanWithLogs: (scanId) => api.get(`/scans/${scanId}`),

    // Get agent logs only
    getAgentLogs: (scanId) => api.get(`/scans/${scanId}/logs`),

    // Stop a running scan
    stopScan: (scanId) => api.post(`/scans/${scanId}/stop`),
};

export const vulnerabilityService = {
    // List vulnerabilities with filters
    list: (params = {}) => api.get('/vulnerabilities/', { params }),

    // Get vulnerability details
    get: (id) => api.get(`/vulnerabilities/${id}`),

    // Update vulnerability status
    update: (id, data) => api.patch(`/vulnerabilities/${id}`, data),

    // Update Workflow (Ticket, Assignee, Status)
    updateWorkflow: (id, { ticket_id, assigned_to, status }) => api.patch(`/vulnerabilities/${id}/workflow`, null, {
        params: { ticket_id, assigned_to, status }
    }),

    // Get proof of concept
    getPoc: (id) => api.get(`/vulnerabilities/${id}/poc`),

    // Re-validate with AI
    revalidate: (id) => api.post(`/vulnerabilities/${id}/revalidate`),

    // Mark as false positive
    markFalsePositive: (id) => api.patch(`/vulnerabilities/${id}`, { status: 'false_positive' }),

    // Mark as fixed
    markFixed: (id) => api.patch(`/vulnerabilities/${id}`, { status: 'fixed' }),
};

export default api;
