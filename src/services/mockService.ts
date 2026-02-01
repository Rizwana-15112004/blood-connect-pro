
import { subDays, subMonths, format } from 'date-fns';

// ----------------------------------------------------------------------
// TYPES (Mirrors Backend Models)
// ----------------------------------------------------------------------

export interface Donor {
    id: string;
    full_name: string;
    email: string;
    role: 'admin' | 'donor'; // Added role
    phone: string | null;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    blood_group: string;
    weight: number;
    is_eligible: boolean;
    total_donations: number;
    last_donation_date: string | null;
    registered_at: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
}

export interface Donation {
    id: string;
    donor_id: string;
    donation_date: string;
    units_donated: number;
    blood_group: string;
    donation_center: string | null;
    collected_by: string | null;
    is_verified?: boolean; // Added
    donors?: { full_name: string; };
}

export interface InventoryItem {
    id: string;
    blood_group: string;
    units_available: number;
    last_updated: string;
}

export interface BloodRequest {
    id: string;
    requester_id: string;
    patient_name: string;
    blood_group: string;
    units: number;
    reason: string;
    location: string;
    city?: string;
    hospital?: string;
    contact_number?: string;
    urgency?: string;
    additional_notes?: string;
    status: 'pending' | 'approved' | 'rejected' | 'APPROVED' | 'REJECTED' | 'PENDING';
    assigned_donor_id: string | null;
    created_at: string;
}

export interface User {
    id: string;
    email: string;
    role: 'admin' | 'donor';
}

// ----------------------------------------------------------------------
// MOCK DATA (Initial State)
// ----------------------------------------------------------------------

const MOCK_INVENTORY: InventoryItem[] = [
    { id: '1', blood_group: 'A+', units_available: 50, last_updated: new Date().toISOString() },
    { id: '2', blood_group: 'A-', units_available: 20, last_updated: new Date().toISOString() },
    { id: '3', blood_group: 'B+', units_available: 65, last_updated: new Date().toISOString() },
    { id: '4', blood_group: 'B-', units_available: 15, last_updated: new Date().toISOString() },
    { id: '5', blood_group: 'AB+', units_available: 30, last_updated: new Date().toISOString() },
    { id: '6', blood_group: 'AB-', units_available: 10, last_updated: new Date().toISOString() },
    { id: '7', blood_group: 'O+', units_available: 80, last_updated: new Date().toISOString() },
    { id: '8', blood_group: 'O-', units_available: 25, last_updated: new Date().toISOString() },
];

const MOCK_DONORS: Donor[] = [
    {
        id: '1',
        full_name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        role: 'donor',
        phone: '+91 98765 43210',
        date_of_birth: '1990-05-15',
        gender: 'male',
        blood_group: 'O+',
        weight: 72,
        is_eligible: true,
        total_donations: 8,
        last_donation_date: subMonths(new Date(), 2).toISOString(),
        registered_at: subMonths(new Date(), 24).toISOString(),
        city: 'Mumbai',
        state: 'Maharashtra',
    },
    {
        id: '2',
        full_name: 'Priya Patel',
        email: 'priya.patel@example.com',
        role: 'donor',
        phone: '+91 98765 12345',
        date_of_birth: '1995-08-22',
        gender: 'female',
        blood_group: 'A+',
        weight: 60,
        is_eligible: true,
        total_donations: 3,
        last_donation_date: subMonths(new Date(), 5).toISOString(),
        registered_at: subMonths(new Date(), 10).toISOString(),
        city: 'Ahmedabad',
        state: 'Gujarat',
    },
    {
        id: '3',
        full_name: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        role: 'donor',
        phone: '+91 91234 56789',
        date_of_birth: '1988-12-10',
        gender: 'male',
        blood_group: 'B+',
        weight: 78,
        is_eligible: false,
        total_donations: 12,
        last_donation_date: subDays(new Date(), 20).toISOString(),
        registered_at: subMonths(new Date(), 36).toISOString(),
        city: 'Delhi',
        state: 'Delhi',
    },
    {
        id: '4',
        full_name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        role: 'donor',
        phone: '+91 99887 76655',
        date_of_birth: '1998-03-03',
        gender: 'female',
        blood_group: 'AB-',
        weight: 55,
        is_eligible: true,
        total_donations: 1,
        last_donation_date: subMonths(new Date(), 8).toISOString(),
        registered_at: subMonths(new Date(), 9).toISOString(),
        city: 'Hyderabad',
        state: 'Telangana',
    },
    {
        id: '5',
        full_name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        role: 'donor',
        phone: '+91 88776 65544',
        date_of_birth: '1992-07-19',
        gender: 'male',
        blood_group: 'O-',
        weight: 85,
        is_eligible: true,
        total_donations: 6,
        last_donation_date: subMonths(new Date(), 4).toISOString(),
        registered_at: subMonths(new Date(), 18).toISOString(),
        city: 'Jaipur',
        state: 'Rajasthan',
    },
    {
        id: '6',
        full_name: 'Anjali Gupta',
        email: 'anjali.gupta@example.com',
        role: 'donor',
        phone: '+91 77665 54433',
        date_of_birth: '1996-11-28',
        gender: 'female',
        blood_group: 'A-',
        weight: 58,
        is_eligible: true,
        total_donations: 2,
        last_donation_date: subMonths(new Date(), 6).toISOString(),
        registered_at: subMonths(new Date(), 12).toISOString(),
        city: 'Lucknow',
        state: 'Uttar Pradesh',
    }
];

const MOCK_DONATIONS: Donation[] = [
    {
        id: '101',
        donor_id: '1',
        donation_date: subMonths(new Date(), 2).toISOString(),
        units_donated: 1,
        blood_group: 'O+',
        donation_center: 'Mumbai City Hospital',
        collected_by: 'Dr. A. Rao',
        is_verified: true,
        donors: { full_name: 'Rahul Sharma' }
    },
    {
        id: '102',
        donor_id: '3',
        donation_date: subDays(new Date(), 20).toISOString(),
        units_donated: 1,
        blood_group: 'B+',
        donation_center: 'Delhi Red Cross',
        collected_by: 'Nurse Sumita',
        is_verified: true,
        donors: { full_name: 'Amit Kumar' }
    },
    {
        id: '103',
        donor_id: '2',
        donation_date: subDays(new Date(), 5).toISOString(),
        units_donated: 1,
        blood_group: 'A+',
        donation_center: 'Civil Hospital Ahmedabad',
        collected_by: 'Dr. P. Shah',
        is_verified: false, // Pending verification
        donors: { full_name: 'Priya Patel' }
    }
];

const MOCK_REQUESTS: BloodRequest[] = [
    {
        id: 'req101',
        requester_id: 'guest',
        patient_name: 'Suresh Raina',
        blood_group: 'B+',
        units: 2,
        reason: 'Emergency Surgery',
        location: 'Apollo Hospital',
        city: 'Chennai',
        hospital: 'Apollo Hospital',
        contact_number: '+91 98765 98765',
        urgency: 'critical',
        additional_notes: 'Urgent requirement for cardiac surgery.',
        status: 'pending',
        assigned_donor_id: null,
        created_at: subDays(new Date(), 1).toISOString()
    },
    {
        id: 'req102',
        requester_id: 'guest',
        patient_name: 'Meena Kumari',
        blood_group: 'O-',
        units: 1,
        reason: 'Accident Case',
        location: 'Max Hospital',
        city: 'Delhi',
        hospital: 'Max Hospital',
        contact_number: '+91 87654 32109',
        urgency: 'high',
        additional_notes: 'Patient in ICU.',
        status: 'approved',
        assigned_donor_id: '5',
        created_at: subDays(new Date(), 3).toISOString()
    }
];


// ----------------------------------------------------------------------
// MOCK SERVICE (Simulation Logic)
// ----------------------------------------------------------------------

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-Memory Storage (Resets on refresh, or upgrade to localStorage if persistence across refresh is needed for verify)
// We'll use localStorage to simulate persistence over sessions for the user

const loadStore = <T>(key: string, defaultData: T): T => {
    try {
        // Clear old mock data if needed or version it. For now, simple read.
        // Actually, let's keep it memory-only for simplicity unless user refreshes. 
        // GitHub Pages refresh loops might be annoying. Let's use memory for now to avoid complexity.
        return defaultData;
    } catch { return defaultData; }
};

let inventoryStore = [...MOCK_INVENTORY];
let donorsStore = [...MOCK_DONORS];
let donationsStore = [...MOCK_DONATIONS];
let requestsStore = [...MOCK_REQUESTS];

export const mockService = {

    // --- AUTH ---

    dbInit: () => {
        // Ensure admin always exists in memory
        console.log("Mock DB Initialized");
    },

    login: async (email: string, password: string) => {
        await delay(500);
        if (email === 'admin@bloodlife.com' && password === 'admin') {
            return {
                user: {
                    id: 'admin',
                    email: email,
                    role: 'admin',
                    isEligible: true,
                    bloodGroup: 'O-',
                }
            };
        }

        // Simple donor login match by email
        const donor = donorsStore.find(d => d.email === email);
        if (donor) {
            return {
                user: {
                    id: donor.id,
                    email: donor.email,
                    role: 'donor',
                    isEligible: donor.is_eligible,
                    bloodGroup: donor.blood_group,
                    phone: donor.phone,
                    city: donor.city
                }
            };
        }

        // Generic "Success" for any demo user if we want low friction? 
        // No, let's allow registration.

        throw new Error("Invalid credentials (try admin@bloodlife.com / admin)");
    },

    register: async (email: string, password: string, isEligible: boolean) => {
        await delay(800);
        if (donorsStore.find(d => d.email === email)) {
            throw new Error("User already exists");
        }

        const newDonor: Donor = {
            id: Math.random().toString(36).substr(2, 9),
            full_name: email.split('@')[0],
            email: email,
            role: 'donor',
            phone: '',
            date_of_birth: '',
            gender: 'other',
            blood_group: 'Unknown',
            weight: 0,
            is_eligible: isEligible,
            total_donations: 0,
            last_donation_date: null,
            registered_at: new Date().toISOString(),
            city: ''
        };
        donorsStore.push(newDonor);

        return {
            user: {
                id: newDonor.id,
                email: newDonor.email,
                role: 'donor',
                isEligible: isEligible
            }
        };
    },

    getUserProfile: async (email: string) => {
        await delay(300);
        if (email === 'admin@bloodlife.com') {
            return {
                id: 'admin',
                email: email,
                role: 'admin',
                isEligible: true
            };
        }
        const donor = donorsStore.find(d => d.email === email);
        return donor ? { ...donor, role: 'donor' } : null;
    },

    // --- DATA ---

    getRequests: async () => {
        await delay(400);
        return requestsStore.map(r => ({
            ...r,
            status: r.status.toLowerCase()
        })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },

    createRequest: async (data: any) => {
        await delay(500);
        const newReq: BloodRequest = {
            id: Math.random().toString(36).substr(2, 9),
            requester_id: 'guest',
            patient_name: data.patientName,
            blood_group: data.bloodGroup,
            units: 1,
            reason: data.additionalNotes || '',
            location: data.city || '',
            city: data.city,
            hospital: data.hospital,
            contact_number: data.contactNumber,
            urgency: data.urgency,
            additional_notes: data.additionalNotes,
            status: 'pending',
            assigned_donor_id: null,
            created_at: new Date().toISOString()
        };
        requestsStore.unshift(newReq);
        return newReq;
    },

    allocateDonor: async (requestId: string, donorId: string | null, status: string) => {
        await delay(400);
        const req = requestsStore.find(r => r.id === requestId);
        if (req) {
            req.status = status as any;
            if (donorId) req.assigned_donor_id = donorId;
        }
        return { success: true };
    },

    getUnverifiedDonations: async () => {
        await delay(300);
        return donationsStore.filter(d => !d.is_verified).map(d => ({
            id: d.id,
            donor_name: donorsStore.find(u => u.id === d.donor_id)?.full_name || 'Unknown',
            units: d.units_donated,
            blood_group: d.blood_group,
            center: d.donation_center,
            date: d.donation_date
        }));
    },

    verifyDonation: async (donationId: string, action: 'approve' | 'reject') => {
        await delay(400);
        const idx = donationsStore.findIndex(d => d.id === donationId);
        if (idx !== -1) {
            if (action === 'approve') {
                donationsStore[idx].is_verified = true;
                // Update inventory
                const item = inventoryStore.find(i => i.blood_group === donationsStore[idx].blood_group);
                if (item) item.units_available += donationsStore[idx].units_donated;
            } else {
                donationsStore.splice(idx, 1);
            }
        }
        return { success: true };
    },

    getStats: async () => {
        await delay(300);
        return {
            totalDonors: donorsStore.length,
            totalDonations: donationsStore.filter(d => d.is_verified).length,
            totalUnits: inventoryStore.reduce((a, b) => a + b.units_available, 0),
            eligibleDonors: donorsStore.filter(d => d.is_eligible).length,
            thisWeekDonors: 5,
            thisMonthDonors: 12,
            lastMonthDonors: 8
        };
    },

    logDonation: async (data: any, userId: string) => {
        await delay(500);
        const user = donorsStore.find(d => d.id === userId.toString()); // Try to find user
        // Simplify for demo
        const newDonation: Donation = {
            id: Math.random().toString(36).substr(2, 9),
            donor_id: userId,
            donation_date: new Date().toISOString(),
            units_donated: parseFloat(data.units || 1),
            blood_group: data.bloodGroup || 'O+',
            donation_center: data.center,
            collected_by: 'Staff',
            is_verified: false
        };
        donationsStore.unshift(newDonation);
        return { success: true, id: newDonation.id };
    },

    getMyDonations: async (userId: string) => {
        await delay(400);
        return donationsStore.filter(d => d.donor_id === userId).map(d => ({
            id: d.id,
            units: d.units_donated,
            blood_group: d.blood_group,
            center: d.donation_center,
            donation_date: d.donation_date,
            is_verified: d.is_verified
        }));
    },

    updateEligibility: async (userId: string, data: any) => {
        await delay(400);
        const donor = donorsStore.find(d => d.id === userId || d.email === userId);
        if (donor) {
            if (data.isEligible !== undefined) donor.is_eligible = data.isEligible;
            if (data.phone) donor.phone = data.phone;
            if (data.city) donor.city = data.city;
            if (data.bloodGroup) donor.blood_group = data.bloodGroup;
            return { success: true, isEligible: donor.is_eligible };
        }
        // Fallback for admin updates
        if (userId === 'admin') {
            return { success: true, isEligible: true };
        }
        return { success: true };
    },

    getDonors: async () => {
        await delay(500);
        return donorsStore;
    },

    // --- MISSING METHODS ADDED FOR CONSISTENCY ---

    getInventory: async () => {
        await delay(300);
        return inventoryStore;
    },

    getDashboardStats: async () => {
        // Re-use getStats logic
        return await mockService.getStats();
    },

    getProfile: async (email: string) => {
        return await mockService.getUserProfile(email);
    },

    addDonation: async (data: any) => {
        // Re-use logDonation logic but adapt args if needed
        // Dashboard calls: addDonation({ donor_id, ... })
        const user = donorsStore.find(d => d.id === data.donor_id);
        const newDonation: Donation = {
            id: Math.random().toString(36).substr(2, 9),
            donor_id: data.donor_id,
            donation_date: data.donation_date || new Date().toISOString(),
            units_donated: data.units_donated || 1,
            blood_group: data.blood_group || (user?.blood_group || 'O+'),
            donation_center: data.donation_center || 'Main Center',
            collected_by: data.collected_by || 'Staff',
            is_verified: false
        };
        donationsStore.unshift(newDonation);
        return { success: true };
    },

    getRecentDonors: async () => {
        await delay(300);
        return donorsStore
            .sort((a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime())
            .slice(0, 5)
            .map(d => ({
                id: d.id,
                fullName: d.full_name,
                bloodGroup: d.blood_group,
                registeredAt: d.registered_at
            }));
    },

    getDonations: async (userId?: string) => {
        await delay(400);
        let data = donationsStore;
        if (userId) {
            data = data.filter(d => d.donor_id === userId);
        }
        return data;
    },

    getUpcomingDonations: async () => {
        await delay(300);
        // Mock upcoming donations from random eligible donors
        const eligible = donorsStore.filter(d => d.is_eligible).slice(0, 3);
        return eligible.map((d, i) => ({
            id: `up-${i}`,
            date: format(new Date(Date.now() + (i + 1) * 86400000 * 3), 'yyyy-MM-dd'),
            location: d.city || 'City Hospital',
            donorName: d.full_name,
            bloodGroup: d.blood_group
        }));
    },

    addDonor: async (data: any) => {
        await delay(500);
        const newDonor: Donor = {
            id: Math.random().toString(36).substr(2, 9),
            ...data,
            role: 'donor',
            is_eligible: true,
            total_donations: 0,
            last_donation_date: null,
            registered_at: new Date().toISOString()
        };
        donorsStore.unshift(newDonor);
        return newDonor;
    }
};
