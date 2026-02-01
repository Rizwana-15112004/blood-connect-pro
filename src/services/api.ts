
import { mockService } from './mockService';

// Environment Detection
// Allow localhost, 127.0.0.1, and common local network IP patterns
const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.endsWith('.gitpod.io') ||
    window.location.hostname.endsWith('.github.dev');

// Force Mock Mode ONLY on production static hosting (like GitHub Pages)
const isMockMode = window.location.hostname.includes('github.io') || window.location.hostname.includes('netlify.app');

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
        if (isMockMode) return mockService.logout();
        try {
            await fetchWithCSRF('/api/logout/', { method: 'POST' });
            return { success: true };
        } catch { return { success: true }; }
    },

    checkAuth: async () => {
        if (isMockMode) {
            return mockService.checkAuth();
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

    getInventory: async () => {
        if (isMockMode) return mockService.getInventory();
        return fetchWithCSRF('/api/get-inventory/');
    },

    getDonors: async () => {
        if (isMockMode) return mockService.getDonors();
        return fetchWithCSRF('/api/admin/donors/');
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
