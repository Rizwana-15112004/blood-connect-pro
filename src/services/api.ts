
import { mockService } from './mockService';

// Environment Detection
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isMockMode = !isLocal; // If on GitHub Pages (or any other host), force Mock Mode

// Helper to get CSRF token (only for Real Backend)
const getCSRFToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

// Real Backend Fetcher
const fetchWithCSRF = async (url: string, options: RequestInit = {}) => {
    if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
        let csrftoken = getCSRFToken();
        if (!csrftoken) {
            try { await fetch('/api/csrf/'); csrftoken = getCSRFToken(); } catch (e) { }
        }
        const headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken || '',
            ...options.headers,
        };
        options.headers = headers as HeadersInit;
    }
    options.credentials = 'same-origin';
    const res = await fetch(url, options);

    // Safe JSON parse
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned non-JSON response (${res.status})`);
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
};

// --- API INTERFACE ---

export const api = {
    // Auth
    login: async (email: string, password: string) => {
        if (isMockMode) return mockService.login(email, password);
        return fetchWithCSRF('/api/login/', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    register: async (email: string, password: string, isEligible: boolean) => {
        if (isMockMode) return mockService.register(email, password, isEligible);
        return fetchWithCSRF('/api/register/', {
            method: 'POST',
            body: JSON.stringify({ email, password, isEligible })
        });
    },

    logout: async () => {
        if (isMockMode) return { success: true };
        try {
            await fetchWithCSRF('/api/logout/', { method: 'POST' });
            return { success: true };
        } catch { return { success: true }; }
    },

    checkAuth: async () => {
        if (isMockMode) {
            // In mock mode, we don't persist session in this simplified version unless we use localStorage.
            // But for now, returning null (logged out) on refresh is acceptable for a "Preview".
            // Or verify with "admin" if we want to fake persistence.
            return null;
        }
        return fetchWithCSRF('/api/user/').catch(() => null);
    },

    // Blood Requests
    getRequests: async () => {
        if (isMockMode) return mockService.getRequests();
        return fetchWithCSRF('/api/all-requests/');
    },

    createRequest: async (data: any) => {
        if (isMockMode) return mockService.createRequest(data);
        return fetchWithCSRF('/api/request-blood/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    allocateDonor: async (requestId: string, donorId: string | null, status: string) => {
        if (isMockMode) return mockService.allocateDonor(requestId, donorId, status);
        return fetchWithCSRF('/api/allocate-donor/', {
            method: 'POST',
            body: JSON.stringify({ requestId, donorId, status })
        });
    },

    // Donations
    getUnverifiedDonations: async () => {
        if (isMockMode) return mockService.getUnverifiedDonations();
        return fetchWithCSRF('/api/admin/donations/pending/');
    },

    verifyDonation: async (donationId: string, action: 'approve' | 'reject') => {
        if (isMockMode) return mockService.verifyDonation(donationId, action);
        return fetchWithCSRF('/api/admin/donations/verify/', {
            method: 'POST',
            body: JSON.stringify({ donationId, action })
        });
    },

    logDonation: async (data: any, userId: string = '') => {
        if (isMockMode) return mockService.logDonation(data, userId);
        return fetchWithCSRF('/api/donate/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    getMyDonations: async (userId: string = '') => {
        if (isMockMode) return mockService.getMyDonations(userId);
        return fetchWithCSRF('/api/my-donations/');
    },

    // Stats
    getDashboardStats: async () => {
        if (isMockMode) return mockService.getStats();
        return fetchWithCSRF('/api/admin/stats/');
    },

    // Profile
    updateEligibility: async (userId: string = '', data: any) => {
        if (isMockMode) return mockService.updateEligibility(userId, data);
        return fetchWithCSRF('/api/update-eligibility/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    isMockMode
};
