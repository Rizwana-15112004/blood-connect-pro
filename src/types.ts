export interface Donor {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    state: string;
    city: string;
    blood_group: string;
    last_donation_date: string | null;
    total_donations: number;
    is_available: boolean;
    has_chronic_disease: boolean;
    is_on_medication: boolean;
    is_pregnant: boolean;
    registered_at: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    weight: number;
    hemoglobin_level?: number;
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    is_eligible?: boolean;
}
