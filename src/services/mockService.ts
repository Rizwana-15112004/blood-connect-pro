
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
    request_date?: string; // Alias for legacy code compatibility
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
    { id: '1', blood_group: 'A+', units_available: 45, last_updated: new Date().toISOString() },
    { id: '2', blood_group: 'A-', units_available: 12, last_updated: new Date().toISOString() },
    { id: '3', blood_group: 'B+', units_available: 58, last_updated: new Date().toISOString() },
    { id: '4', blood_group: 'B-', units_available: 8, last_updated: new Date().toISOString() },
    { id: '5', blood_group: 'AB+', units_available: 22, last_updated: new Date().toISOString() },
    { id: '6', blood_group: 'AB-', units_available: 5, last_updated: new Date().toISOString() },
    { id: '7', blood_group: 'O+', units_available: 65, last_updated: new Date().toISOString() },
    { id: '8', blood_group: 'O-', units_available: 18, last_updated: new Date().toISOString() },
];

const MOCK_DONORS: Donor[] = [
    // Recent Donors (Registered this week/month) - For "Recently Registered" list
    { id: 'd1', full_name: 'Aarav Patel', email: 'aarav.p@example.com', role: 'donor', phone: '+91 98765 00001', date_of_birth: '1995-06-15', gender: 'male', blood_group: 'O+', weight: 75, is_eligible: true, total_donations: 0, last_donation_date: null, registered_at: subDays(new Date(), 1).toISOString(), city: 'Mumbai', state: 'Maharashtra' },
    { id: 'd2', full_name: 'Diya Sharma', email: 'diya.s@example.com', role: 'donor', phone: '+91 98765 00002', date_of_birth: '1998-02-20', gender: 'female', blood_group: 'A-', weight: 55, is_eligible: true, total_donations: 0, last_donation_date: null, registered_at: subDays(new Date(), 2).toISOString(), city: 'Pune', state: 'Maharashtra' },
    { id: 'd3', full_name: 'Ishaan Gupta', email: 'ishaan.g@example.com', role: 'donor', phone: '+91 98765 00003', date_of_birth: '1992-11-10', gender: 'male', blood_group: 'B+', weight: 80, is_eligible: true, total_donations: 5, last_donation_date: subMonths(new Date(), 4).toISOString(), registered_at: subDays(new Date(), 5).toISOString(), city: 'Delhi', state: 'Delhi' },
    { id: 'd4', full_name: 'Ananya Singh', email: 'ananya.singh@example.com', role: 'donor', phone: '+91 98765 00004', date_of_birth: '2000-01-05', gender: 'female', blood_group: 'AB+', weight: 60, is_eligible: true, total_donations: 1, last_donation_date: subMonths(new Date(), 1).toISOString(), registered_at: subDays(new Date(), 7).toISOString(), city: 'Bangalore', state: 'Karnataka' },
    { id: 'd5', full_name: 'Vihaan Reddy', email: 'vihaan.r@example.com', role: 'donor', phone: '+91 98765 00005', date_of_birth: '1990-08-30', gender: 'male', blood_group: 'O-', weight: 72, is_eligible: true, total_donations: 12, last_donation_date: subDays(new Date(), 45).toISOString(), registered_at: subDays(new Date(), 10).toISOString(), city: 'Hyderabad', state: 'Telangana' },

    // Established Donors
    { id: '1', full_name: 'Rahul Sharma', email: 'rahul.sharma@example.com', role: 'donor', phone: '+91 98765 43210', date_of_birth: '1990-05-15', gender: 'male', blood_group: 'O+', weight: 72, is_eligible: true, total_donations: 8, last_donation_date: subMonths(new Date(), 2).toISOString(), registered_at: subMonths(new Date(), 24).toISOString(), city: 'Mumbai', state: 'Maharashtra' },
    { id: '2', full_name: 'Priya Patel', email: 'priya.patel@example.com', role: 'donor', phone: '+91 98765 12345', date_of_birth: '1995-08-22', gender: 'female', blood_group: 'A+', weight: 60, is_eligible: true, total_donations: 3, last_donation_date: subMonths(new Date(), 5).toISOString(), registered_at: subMonths(new Date(), 10).toISOString(), city: 'Ahmedabad', state: 'Gujarat' },
    { id: '3', full_name: 'Amit Kumar', email: 'amit.kumar@example.com', role: 'donor', phone: '+91 91234 56789', date_of_birth: '1988-12-10', gender: 'male', blood_group: 'B+', weight: 78, is_eligible: false, total_donations: 12, last_donation_date: subDays(new Date(), 20).toISOString(), registered_at: subMonths(new Date(), 36).toISOString(), city: 'Delhi', state: 'Delhi' },
    { id: '4', full_name: 'Sneha Reddy', email: 'sneha.reddy@example.com', role: 'donor', phone: '+91 99887 76655', date_of_birth: '1998-03-03', gender: 'female', blood_group: 'AB-', weight: 55, is_eligible: true, total_donations: 1, last_donation_date: subMonths(new Date(), 8).toISOString(), registered_at: subMonths(new Date(), 9).toISOString(), city: 'Hyderabad', state: 'Telangana' },
    { id: '5', full_name: 'Vikram Singh', email: 'vikram.singh@example.com', role: 'donor', phone: '+91 88776 65544', date_of_birth: '1992-07-19', gender: 'male', blood_group: 'O-', weight: 85, is_eligible: true, total_donations: 6, last_donation_date: subMonths(new Date(), 4).toISOString(), registered_at: subMonths(new Date(), 18).toISOString(), city: 'Jaipur', state: 'Rajasthan' },
    { id: '6', full_name: 'Anjali Gupta', email: 'anjali.gupta@example.com', role: 'donor', phone: '+91 77665 54433', date_of_birth: '1996-11-28', gender: 'female', blood_group: 'A-', weight: 58, is_eligible: true, total_donations: 2, last_donation_date: subMonths(new Date(), 6).toISOString(), registered_at: subMonths(new Date(), 12).toISOString(), city: 'Lucknow', state: 'Uttar Pradesh' },
    { id: '7', full_name: 'Rohan Mehta', email: 'rohan.mehta@example.com', role: 'donor', phone: '+91 99887 77665', date_of_birth: '1985-04-12', gender: 'male', blood_group: 'AB+', weight: 80, is_eligible: true, total_donations: 15, last_donation_date: subMonths(new Date(), 1).toISOString(), registered_at: subMonths(new Date(), 48).toISOString(), city: 'Pune', state: 'Maharashtra' },
    { id: '8', full_name: 'Sita Verma', email: 'sita.verma@example.com', role: 'donor', phone: '+91 88776 66554', date_of_birth: '1993-09-30', gender: 'female', blood_group: 'O+', weight: 62, is_eligible: true, total_donations: 4, last_donation_date: subMonths(new Date(), 5).toISOString(), registered_at: subMonths(new Date(), 24).toISOString(), city: 'Nagpur', state: 'Maharashtra' },
    { id: '9', full_name: 'Arjun Das', email: 'arjun.das@example.com', role: 'donor', phone: '+91 77665 55443', date_of_birth: '1991-02-14', gender: 'male', blood_group: 'B-', weight: 75, is_eligible: true, total_donations: 9, last_donation_date: subMonths(new Date(), 2).toISOString(), registered_at: subMonths(new Date(), 30).toISOString(), city: 'Kolkata', state: 'West Bengal' },
    { id: '10', full_name: 'Nisha Singh', email: 'nisha.singh@example.com', role: 'donor', phone: '+91 66554 44332', date_of_birth: '1997-06-25', gender: 'female', blood_group: 'A+', weight: 56, is_eligible: false, total_donations: 1, last_donation_date: subMonths(new Date(), 1).toISOString(), registered_at: subMonths(new Date(), 6).toISOString(), city: 'Patna', state: 'Bihar' },
    { id: '11', full_name: 'Karan Malhotra', email: 'karan.malhotra@example.com', role: 'donor', phone: '+91 99880 01122', date_of_birth: '1989-12-05', gender: 'male', blood_group: 'O-', weight: 82, is_eligible: true, total_donations: 7, last_donation_date: subMonths(new Date(), 3).toISOString(), registered_at: subMonths(new Date(), 36).toISOString(), city: 'Chandigarh', state: 'Punjab' },
];

const MOCK_DONATIONS: Donation[] = [
    // Unverified / Pending (For Admin to Approve)
    { id: 'p1', donor_id: 'd1', donation_date: subDays(new Date(), 1).toISOString(), units_donated: 1, blood_group: 'O+', donation_center: 'City Hospital', collected_by: 'Staff', is_verified: false, donors: { full_name: 'Aarav Patel' } },
    { id: 'p2', donor_id: 'd3', donation_date: subDays(new Date(), 2).toISOString(), units_donated: 1, blood_group: 'B+', donation_center: 'Red Cross Camp', collected_by: 'Dr. Smith', is_verified: false, donors: { full_name: 'Ishaan Gupta' } },
    { id: 'p3', donor_id: '2', donation_date: subDays(new Date(), 3).toISOString(), units_donated: 1, blood_group: 'A+', donation_center: 'Community Center', collected_by: 'Nurse Joy', is_verified: false, donors: { full_name: 'Priya Patel' } },

    // Verified History
    { id: '101', donor_id: '1', donation_date: subMonths(new Date(), 2).toISOString(), units_donated: 1, blood_group: 'O+', donation_center: 'Mumbai City Hospital', collected_by: 'Dr. A. Rao', is_verified: true, donors: { full_name: 'Rahul Sharma' } },
    { id: '102', donor_id: '3', donation_date: subDays(new Date(), 20).toISOString(), units_donated: 1, blood_group: 'B+', donation_center: 'Delhi Red Cross', collected_by: 'Nurse Sumita', is_verified: true, donors: { full_name: 'Amit Kumar' } },
    { id: '103', donor_id: '7', donation_date: subMonths(new Date(), 1).toISOString(), units_donated: 1, blood_group: 'AB+', donation_center: 'Pune Blood Bank', collected_by: 'Staff', is_verified: true, donors: { full_name: 'Rohan Mehta' } },
    { id: '104', donor_id: '5', donation_date: subMonths(new Date(), 4).toISOString(), units_donated: 1, blood_group: 'O-', donation_center: 'Jaipur Hospital', collected_by: 'Dr. Singh', is_verified: true, donors: { full_name: 'Vikram Singh' } },
    { id: '105', donor_id: '1', donation_date: subMonths(new Date(), 8).toISOString(), units_donated: 1, blood_group: 'O+', donation_center: 'Mumbai Camp', collected_by: 'Dr. Rao', is_verified: true, donors: { full_name: 'Rahul Sharma' } },
];

const MOCK_REQUESTS: BloodRequest[] = [
    // Pending Requests (For Admin to Allocate)
    { id: 'req1', requester_id: 'guest', patient_name: 'Suresh Raina', blood_group: 'B+', units: 2, reason: 'Emergency Surgery', location: 'Apollo Hospital', city: 'Chennai', hospital: 'Apollo Hospital', contact_number: '+91 98765 98765', urgency: 'critical', additional_notes: 'Urgent cardiac surgery.', status: 'pending', assigned_donor_id: null, created_at: subDays(new Date(), 0).toISOString() },
    { id: 'req2', requester_id: 'guest', patient_name: 'Anita Desai', blood_group: 'A-', units: 1, reason: 'Low Hemoglobin', location: 'Fortis Hospital', city: 'Bangalore', hospital: 'Fortis', contact_number: '+91 88888 77777', urgency: 'high', additional_notes: 'Needed within 24 hours.', status: 'pending', assigned_donor_id: null, created_at: subDays(new Date(), 1).toISOString() },
    { id: 'req3', requester_id: 'guest', patient_name: 'Raj Malhotra', blood_group: 'O-', units: 3, reason: 'Road Accident', location: 'Max Super Speciality', city: 'Delhi', hospital: 'Max Hospital', contact_number: '+91 77777 66666', urgency: 'critical', additional_notes: 'Patient in ICU.', status: 'pending', assigned_donor_id: null, created_at: subDays(new Date(), 1).toISOString() },

    // History (Approved/Rejected)
    { id: 'req4', requester_id: 'guest', patient_name: 'Meena Kumari', blood_group: 'O-', units: 1, reason: 'Accident Case', location: 'Max Hospital', city: 'Delhi', hospital: 'Max Hospital', contact_number: '+91 87654 32109', urgency: 'high', additional_notes: 'Resolved.', status: 'approved', assigned_donor_id: '5', created_at: subDays(new Date(), 3).toISOString() },
    { id: 'req5', requester_id: 'guest', patient_name: 'Kabir Khan', blood_group: 'AB-', units: 1, reason: 'Dengue', location: 'City Care', city: 'Mumbai', hospital: 'City Care', contact_number: '+91 66666 55555', urgency: 'medium', additional_notes: '', status: 'rejected', assigned_donor_id: null, created_at: subDays(new Date(), 5).toISOString() },
];


// ----------------------------------------------------------------------
// MOCK SERVICE (Simulation Logic)
// ----------------------------------------------------------------------

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-Memory Storage
const SESSION_KEY = 'blood_connect_pro_session';
const DATA_KEY = 'blood_connect_pro_data';

// Hydrate state from localStorage if exists
const savedData = localStorage.getItem(DATA_KEY);
let inventoryStore = savedData ? JSON.parse(savedData).inventory : [...MOCK_INVENTORY];
let donorsStore = savedData ? JSON.parse(savedData).donors : [...MOCK_DONORS];
let donationsStore = savedData ? JSON.parse(savedData).donations : [...MOCK_DONATIONS];
let requestsStore = savedData ? JSON.parse(savedData).requests : [...MOCK_REQUESTS];
let notificationsStore = savedData ? JSON.parse(savedData).notifications : [];

const saveToLocalStorage = () => {
    localStorage.setItem(DATA_KEY, JSON.stringify({
        inventory: inventoryStore,
        donors: donorsStore,
        donations: donationsStore,
        requests: requestsStore,
        notifications: notificationsStore
    }));
};

export const mockService = {
    // --- AUTH ---

    dbInit: () => {
        console.log("Mock DB Initialized with Persistence");
    },

    checkAuth: async () => {
        await delay(300);
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            const userData = JSON.parse(session);
            // Verify user still exists
            const user = donorsStore.find(d => d.id === userData.id || d.email === userData.email);
            if (user || userData.role === 'admin') return userData;
        }
        return null;
    },

    login: async (email: string, password: string) => {
        await delay(500);
        let userSession: any = null;

        if (email === 'admin@bloodlife.com' && password === 'admin') {
            userSession = {
                id: 'admin',
                email: email,
                role: 'admin',
                isEligible: true,
                bloodGroup: 'O-',
            };
        } else {
            const donor = donorsStore.find(d => d.email === email);
            if (donor) {
                userSession = {
                    id: donor.id,
                    email: donor.email,
                    role: 'donor',
                    isEligible: donor.is_eligible,
                    bloodGroup: donor.blood_group,
                    phone: donor.phone,
                    city: donor.city
                };
            }
        }

        if (userSession) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
            return { user: userSession };
        }

        throw new Error("Invalid credentials (try admin@bloodlife.com / admin)");
    },

    logout: async () => {
        localStorage.removeItem(SESSION_KEY);
        return { success: true };
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
            date_of_birth: '2000-01-01',
            gender: 'other',
            blood_group: 'O+',
            weight: 70,
            is_eligible: isEligible,
            total_donations: 0,
            last_donation_date: null,
            registered_at: new Date().toISOString(),
            city: ''
        };
        donorsStore.push(newDonor);
        saveToLocalStorage();

        const userSession = {
            id: newDonor.id,
            email: newDonor.email,
            role: 'donor',
            isEligible: isEligible,
            bloodGroup: newDonor.blood_group
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));

        return { user: userSession };
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
        saveToLocalStorage();
        return newReq;
    },

    allocateDonor: async (requestId: string, donorId: string | null, status: string) => {
        await delay(400);
        const req = requestsStore.find(r => r.id === requestId);
        if (req) {
            req.status = status as any;
            if (donorId) req.assigned_donor_id = donorId;
            saveToLocalStorage();
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
            const donation = donationsStore[idx];

            if (action === 'approve') {
                donation.is_verified = true;
                // Update inventory
                const item = inventoryStore.find(i => i.blood_group === donation.blood_group);
                if (item) item.units_available += donation.units_donated;

                // Notify User
                notificationsStore.unshift({
                    id: Math.random().toString(36).substr(2, 9),
                    userId: donation.donor_id,
                    title: 'Donation Verified',
                    message: `Thank you! Your donation of ${donation.units_donated} unit(s) of ${donation.blood_group} on ${format(new Date(donation.donation_date), 'MMM d, yyyy')} has been verified by the center.`,
                    date: new Date().toISOString(),
                    read: false,
                    type: 'system'
                });

            } else {
                donationsStore.splice(idx, 1);
                // Notify User of Rejection
                notificationsStore.unshift({
                    id: Math.random().toString(36).substr(2, 9),
                    userId: donation.donor_id,
                    title: 'Donation Record Rejected',
                    message: `Your reported donation on ${format(new Date(donation.donation_date), 'MMM d, yyyy')} could not be verified and has been removed. Please contact us if this is an error.`,
                    date: new Date().toISOString(),
                    read: false,
                    type: 'system'
                });
            }
            saveToLocalStorage();
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
        const donor = donorsStore.find(d => d.id === userId.toString()); // Try to find user
        const newDonation: Donation = {
            id: Math.random().toString(36).substr(2, 9),
            donor_id: userId,
            donation_date: new Date().toISOString(),
            units_donated: parseFloat(data.units || 1),
            blood_group: data.bloodGroup || 'O+',
            donation_center: data.center,
            collected_by: 'Staff',
            is_verified: true, // Self-logged is verified for demo
            donors: { full_name: donor?.full_name || 'Donor' }
        };
        donationsStore.unshift(newDonation);

        // Update donor stats
        if (donor) {
            donor.total_donations += 1;
            donor.last_donation_date = newDonation.donation_date;
        }

        saveToLocalStorage();
        return { success: true, id: newDonation.id, donation: newDonation };
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
            saveToLocalStorage();
            return { success: true, isEligible: donor.is_eligible };
        }
        // Fallback for admin updates
        if (userId === 'admin') {
            return { success: true, isEligible: true };
        }
        return { success: true };
    },

    // --- NOTIFICATIONS & MESSAGING ---

    getNotifications: async (userId: string) => {
        await delay(300);
        return notificationsStore.filter(n => n.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    markNotificationRead: async (id: string) => {
        const notif = notificationsStore.find(n => n.id === id);
        if (notif) notif.read = true;
        return { success: true };
    },

    // --- UPDATED REQUEST LOGIC ---

    getDonors: async () => {
        await delay(500);
        return donorsStore;
    },

    // Alias for compatibility
    addRequest: async (data: any) => {
        return mockService.createRequest(data);
    },

    updateRequestStatus: async (requestId: string, status: 'approved' | 'rejected', donorId?: string) => {
        await delay(500);
        const req = requestsStore.find(r => r.id === requestId);
        if (req) {
            req.status = status;
            if (donorId) {
                req.assigned_donor_id = donorId;

                // Trigger "Email" Notification to Requester
                const donor = donorsStore.find(d => d.id === donorId);
                const message = `Good news! We have found a matching donor for your request (Patient: ${req.patient_name}).

Donor Details:
Name: ${donor?.full_name}
Blood Group: ${donor?.blood_group}
Contact: ${donor?.phone}
Location: ${donor?.city}

Please contact them immediately.`;

                notificationsStore.unshift({
                    id: Math.random().toString(36).substr(2, 9),
                    userId: req.requester_id,
                    title: 'Donor Assigned - Action Required',
                    message: message,
                    date: new Date().toISOString(),
                    read: false,
                    type: 'email'
                });
            } else if (status === 'rejected') {
                notificationsStore.unshift({
                    id: Math.random().toString(36).substr(2, 9),
                    userId: req.requester_id,
                    title: 'Update on your Blood Request',
                    message: `We regret to inform you that your request for ${req.patient_name} could not be fulfilled at this time. Please try other sources or contact support.`,
                    date: new Date().toISOString(),
                    read: false,
                    type: 'email'
                });
            }
        }
        return { success: true };
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
        await delay(500);
        // Find donor to update stats
        const donor = donorsStore.find(d => d.id === data.donor_id || d.email === data.donor_id);
        const newDonation: Donation = {
            id: Math.random().toString(36).substr(2, 9),
            donor_id: donor?.id || data.donor_id,
            donation_date: data.donation_date || new Date().toISOString(),
            units_donated: data.units_donated || 1,
            blood_group: data.blood_group || (donor?.blood_group || 'O+'),
            donation_center: data.donation_center || 'Main Center',
            collected_by: data.collected_by || 'Staff',
            is_verified: true, // Self reported or admin added should be verified for certificate
            donors: { full_name: donor?.full_name || 'Donor' }
        };
        donationsStore.unshift(newDonation);

        // UPDATE DONOR STATS
        if (donor) {
            donor.total_donations += 1;
            donor.last_donation_date = newDonation.donation_date;
        }

        saveToLocalStorage();
        return { success: true, donation: newDonation };
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
        return data.sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime());
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
        saveToLocalStorage();
        return newDonor;
    }
};
