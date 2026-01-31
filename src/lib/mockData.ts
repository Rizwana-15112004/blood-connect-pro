import { subDays, subMonths, format } from 'date-fns';

// Interfaces
export interface Donor {
    id: string;
    full_name: string;
    email: string;
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
    hemoglobin_level?: number | null;
    blood_pressure_systolic?: number | null;
    blood_pressure_diastolic?: number | null;
    has_chronic_disease?: boolean;
    is_on_medication?: boolean;
    is_pregnant?: boolean;
}

export interface Donation {
    id: string;
    donor_id: string;
    donation_date: string;
    units_donated: number;
    blood_group: string;
    donation_center: string | null;
    collected_by: string | null;
    donors?: {
        full_name: string;
    };
}

export interface InventoryItem {
    id: string;
    blood_group: string;
    units_available: number;
    last_updated: string;
}

// Mock Data
export const MOCK_INVENTORY: InventoryItem[] = [
    { id: '1', blood_group: 'A+', units_available: 45, last_updated: new Date().toISOString() },
    { id: '2', blood_group: 'A-', units_available: 15, last_updated: new Date().toISOString() },
    { id: '3', blood_group: 'B+', units_available: 95, last_updated: new Date().toISOString() },
    { id: '4', blood_group: 'B-', units_available: 8, last_updated: new Date().toISOString() },
    { id: '5', blood_group: 'AB+', units_available: 25, last_updated: new Date().toISOString() },
    { id: '6', blood_group: 'AB-', units_available: 5, last_updated: new Date().toISOString() },
    { id: '7', blood_group: 'O+', units_available: 120, last_updated: new Date().toISOString() },
    { id: '8', blood_group: 'O-', units_available: 4, last_updated: new Date().toISOString() },
];

export const MOCK_DONORS: Donor[] = [
    {
        id: '1',
        full_name: 'Laya',
        email: 'laya@gmail.com',
        phone: '+1 987 654 3210',
        date_of_birth: '1995-01-01',
        gender: 'female',
        blood_group: 'O+',
        weight: 65,
        is_eligible: true,
        total_donations: 5,
        last_donation_date: subMonths(new Date(), 3).toISOString(),
        registered_at: subMonths(new Date(), 12).toISOString(),
        city: 'San Francisco',
        state: 'CA',
    },
    {
        id: '2',
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1 234 567 8901',
        date_of_birth: '1995-05-15',
        gender: 'female',
        blood_group: 'A-',
        weight: 60,
        is_eligible: true,
        total_donations: 2,
        last_donation_date: subMonths(new Date(), 1).toISOString(),
        registered_at: subMonths(new Date(), 6).toISOString(),
        city: 'Los Angeles',
        state: 'CA',
    },
    {
        id: '3',
        full_name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1 234 567 8902',
        date_of_birth: '1988-08-20',
        gender: 'male',
        blood_group: 'AB+',
        weight: 85,
        is_eligible: false,
        total_donations: 8,
        last_donation_date: subDays(new Date(), 10).toISOString(),
        registered_at: subMonths(new Date(), 24).toISOString(),
        city: 'Chicago',
        state: 'IL',
    },
    {
        id: '4',
        full_name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+1 555 019 2834',
        date_of_birth: '1992-11-30',
        gender: 'female',
        blood_group: 'B+',
        weight: 55,
        is_eligible: true,
        total_donations: 3,
        last_donation_date: subMonths(new Date(), 4).toISOString(),
        registered_at: subMonths(new Date(), 8).toISOString(),
    },
    {
        id: '5',
        full_name: 'Robert Brown',
        email: 'robert@example.com',
        phone: '+1 555 938 4721',
        date_of_birth: '1985-03-25',
        gender: 'male',
        blood_group: 'O-',
        weight: 90,
        is_eligible: true,
        total_donations: 12,
        last_donation_date: subMonths(new Date(), 5).toISOString(),
        registered_at: subMonths(new Date(), 36).toISOString(),
    },
    {
        id: '6',
        full_name: 'Emily Davis',
        email: 'emily.d@example.com',
        phone: '+1 555 281 9374',
        date_of_birth: '1998-07-12',
        gender: 'female',
        blood_group: 'A+',
        weight: 58,
        is_eligible: true,
        total_donations: 1,
        last_donation_date: subMonths(new Date(), 2).toISOString(),
        registered_at: subMonths(new Date(), 3).toISOString(),
    },
    {
        id: '7',
        full_name: 'James Wilson',
        email: 'j.wilson@example.com',
        phone: '+1 555 832 7461',
        date_of_birth: '1991-09-08',
        gender: 'male',
        blood_group: 'B-',
        weight: 82,
        is_eligible: true,
        total_donations: 4,
        last_donation_date: subMonths(new Date(), 6).toISOString(),
        registered_at: subMonths(new Date(), 18).toISOString(),
    },
    {
        id: '8',
        full_name: 'Michael Chen',
        email: 'm.chen@example.com',
        phone: '+1 555 372 8192',
        date_of_birth: '1987-12-04',
        gender: 'male',
        blood_group: 'AB-',
        weight: 70,
        is_eligible: false,
        total_donations: 6,
        last_donation_date: subDays(new Date(), 25).toISOString(),
        registered_at: subMonths(new Date(), 20).toISOString(),
    },
    {
        id: '9',
        full_name: 'Jessica Taylor',
        email: 'jess.t@example.com',
        phone: '+1 555 482 9183',
        date_of_birth: '1994-02-18',
        gender: 'female',
        blood_group: 'O+',
        weight: 65,
        is_eligible: true,
        total_donations: 3,
        last_donation_date: subMonths(new Date(), 4).toISOString(),
        registered_at: subMonths(new Date(), 10).toISOString(),
    },
    {
        id: '10',
        full_name: 'David Miller',
        email: 'david.m@example.com',
        phone: '+1 555 921 8374',
        date_of_birth: '1993-06-30',
        gender: 'male',
        blood_group: 'A+',
        weight: 78,
        is_eligible: true,
        total_donations: 2,
        last_donation_date: subMonths(new Date(), 5).toISOString(),
        registered_at: subMonths(new Date(), 7).toISOString(),
    },
    {
        id: '11',
        full_name: 'Sophie Anderson',
        email: 'sophie.a@example.com',
        phone: '+1 555 736 2819',
        date_of_birth: '1996-10-22',
        gender: 'female',
        blood_group: 'O-',
        weight: 54,
        is_eligible: true,
        total_donations: 5,
        last_donation_date: subMonths(new Date(), 3).toISOString(),
        registered_at: subMonths(new Date(), 15).toISOString(),
    },
    {
        id: '12',
        full_name: 'Daniel Thomas',
        email: 'daniel.t@example.com',
        phone: '+1 555 192 8374',
        date_of_birth: '1989-04-14',
        gender: 'male',
        blood_group: 'B+',
        weight: 88,
        is_eligible: false,
        total_donations: 9,
        last_donation_date: subDays(new Date(), 5).toISOString(),
        registered_at: subMonths(new Date(), 30).toISOString(),
    },
    {
        id: '13',
        full_name: 'Lisa Martinez',
        email: 'lisa.m@example.com',
        phone: '+1 555 837 4621',
        date_of_birth: '1997-08-09',
        gender: 'female',
        blood_group: 'A-',
        weight: 62,
        is_eligible: true,
        total_donations: 2,
        last_donation_date: subMonths(new Date(), 3).toISOString(),
        registered_at: subMonths(new Date(), 9).toISOString(),
    },
    {
        id: '14',
        full_name: 'Ryan White',
        email: 'ryan.w@example.com',
        phone: '+1 555 291 8374',
        date_of_birth: '1991-01-28',
        gender: 'male',
        blood_group: 'AB+',
        weight: 76,
        is_eligible: true,
        total_donations: 4,
        last_donation_date: subMonths(new Date(), 4).toISOString(),
        registered_at: subMonths(new Date(), 14).toISOString(),
    },
    {
        id: '15',
        full_name: 'Emma Harris',
        email: 'emma.h@example.com',
        phone: '+1 555 928 3746',
        date_of_birth: '1994-11-15',
        gender: 'female',
        blood_group: 'O+',
        weight: 59,
        is_eligible: true,
        total_donations: 3,
        last_donation_date: subMonths(new Date(), 2).toISOString(),
        registered_at: subMonths(new Date(), 11).toISOString(),
    }
];

export const MOCK_DONATIONS: Donation[] = [
    {
        id: '1',
        donor_id: '1',
        donation_date: subMonths(new Date(), 3).toISOString(),
        units_donated: 1,
        blood_group: 'O+',
        donation_center: 'City Hospital',
        collected_by: 'Nurse Alice',
        donors: { full_name: 'Laya' }
    },
    {
        id: '2',
        donor_id: '2',
        donation_date: subMonths(new Date(), 1).toISOString(),
        units_donated: 1,
        blood_group: 'A-',
        donation_center: 'Community Blood Bank',
        collected_by: 'Dr. Bob',
        donors: { full_name: 'Jane Smith' }
    },
    {
        id: '3',
        donor_id: '3',
        donation_date: subDays(new Date(), 10).toISOString(),
        units_donated: 1,
        blood_group: 'AB+',
        donation_center: 'Red Cross Center',
        collected_by: 'Nurse Carol',
        donors: { full_name: 'Mike Johnson' }
    },
    {
        id: '4',
        donor_id: '4',
        donation_date: subMonths(new Date(), 4).toISOString(),
        units_donated: 1,
        blood_group: 'B+',
        donation_center: 'City Hospital',
        collected_by: 'Dr. Dave',
        donors: { full_name: 'Sarah Wilson' }
    },
    {
        id: '5',
        donor_id: '5',
        donation_date: subMonths(new Date(), 5).toISOString(),
        units_donated: 2, // Double red cell
        blood_group: 'O-',
        donation_center: 'Mobile Unit 1',
        collected_by: 'Nurse Eve',
        donors: { full_name: 'Robert Brown' }
    },
    {
        id: '6',
        donor_id: '1',
        donation_date: subMonths(new Date(), 7).toISOString(),
        units_donated: 1,
        blood_group: 'O+',
        donation_center: 'City Hospital',
        collected_by: 'Nurse Alice',
        donors: { full_name: 'Laya' }
    },
];

// Helper Functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mutable Data Storage (In-Memory for Demo Session)
let inventoryStore = [...MOCK_INVENTORY];
let donorsStore = [...MOCK_DONORS];
let donationsStore = [...MOCK_DONATIONS];

export const mockService = {
    getInventory: async () => {
        await delay(300);
        return inventoryStore;
    },

    getDonors: async () => {
        await delay(500);
        return donorsStore;
    },

    getDonations: async () => {
        await delay(600);
        // Sort by date desc
        return [...donationsStore].sort((a, b) => new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime());
    },

    getProfile: async (email?: string) => {
        await delay(400);
        if (email === 'admin@example.com') {
            return {
                id: 'admin',
                full_name: 'System Administrator',
                email: 'admin@example.com',
                phone: '+1 800 555 0199',
                date_of_birth: '1980-01-01',
                gender: 'other',
                blood_group: 'O-', // Universal donor for admin ;)
                weight: 70,
                is_eligible: true,
                total_donations: 99,
                last_donation_date: new Date().toISOString(),
                registered_at: '2020-01-01',
                city: 'Admin City',
                state: 'HQ',
            } as Donor;
        }
        return donorsStore.find(d => d.email === email) || donorsStore[0];
    },

    getDashboardStats: async () => {
        await delay(400);
        return {
            totalDonors: donorsStore.length,
            totalDonations: donationsStore.length,
            totalUnits: inventoryStore.reduce((a, b) => a + b.units_available, 0),
            eligibleDonors: donorsStore.filter(d => d.is_eligible).length,
            thisWeekDonors: 1, // Static for demo
            thisMonthDonors: 2,
            lastMonthDonors: 3
        };
    },

    getRecentDonors: async () => {
        await delay(300);
        return donorsStore.slice(0, 5).map(d => ({
            id: d.id,
            fullName: d.full_name,
            bloodGroup: d.blood_group,
            registeredAt: d.registered_at
        }));
    },

    getUpcomingDonations: async () => {
        await delay(400);
        // Generate some future donations for the calendar
        const futureDonations = [
            { id: 'f1', date: new Date(Date.now() + 86400000 * 2).toISOString(), location: 'Central Hospital', donorName: 'Laya', bloodGroup: 'O+' },
            { id: 'f2', date: new Date(Date.now() + 86400000 * 5).toISOString(), location: 'Community Center', donorName: 'Jane Smith', bloodGroup: 'A-' },
            { id: 'f3', date: new Date(Date.now() + 86400000 * 10).toISOString(), location: 'Mobile Camp', donorName: 'Mike Johnson', bloodGroup: 'AB+' },
            { id: 'f4', date: new Date(Date.now() + 86400000 * 15).toISOString(), location: 'City Clinic', donorName: 'Sarah Wilson', bloodGroup: 'B+' }
        ];
        return futureDonations;
    },

    // Mutation to add donation and update inventory/charts dynamically
    addDonation: async (donation: Omit<Donation, 'id' | 'donors'>) => {
        await delay(500);
        const newDonation: Donation = {
            ...donation,
            id: Math.random().toString(36).substr(2, 9),
            donors: {
                full_name: donorsStore.find(d => d.id === donation.donor_id)?.full_name || 'Unknown Donor'
            }
        };

        // 1. Add to donations
        donationsStore.unshift(newDonation);

        // 2. Update Inventory
        const inventoryItem = inventoryStore.find(i => i.blood_group === donation.blood_group);
        if (inventoryItem) {
            inventoryItem.units_available += donation.units_donated;
            inventoryItem.last_updated = new Date().toISOString();
        }

        // 3. Update Donor Stats
        const donor = donorsStore.find(d => d.id === donation.donor_id);
        if (donor) {
            donor.total_donations += 1;
            donor.last_donation_date = donation.donation_date;
            // Simple rule: NOT eligible immediately after donation
            donor.is_eligible = false;
        }

        return newDonation;
    }
};
