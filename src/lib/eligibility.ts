// WHO Blood Donation Eligibility Criteria
// Based on World Health Organization guidelines for blood donation

export interface DonorHealthData {
  dateOfBirth: Date;
  weight: number; // in kg
  gender: 'male' | 'female' | 'other';
  hemoglobinLevel?: number; // g/dL
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  hasChronicDisease: boolean;
  chronicDiseaseDetails?: string;
  lastMajorSurgeryDate?: Date;
  isOnMedication: boolean;
  medicationDetails?: string;
  isPregnant: boolean;
  lastTattooDate?: Date;
  lastDonationDate?: Date;
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  nextEligibleDate?: Date;
  healthScore: number; // 0-100
  category: 'eligible' | 'temporarily_ineligible' | 'permanently_ineligible' | 'needs_review';
}

// WHO Recommended Criteria
const WHO_CRITERIA = {
  minAge: 18,
  maxAge: 65,
  minWeight: 50, // kg
  minHemoglobinMale: 13.0, // g/dL
  minHemoglobinFemale: 12.5, // g/dL
  minBloodPressureSystolic: 100,
  maxBloodPressureSystolic: 180,
  minBloodPressureDiastolic: 60,
  maxBloodPressureDiastolic: 100,
  donationIntervalDays: 56, // 8 weeks minimum between donations
  postSurgeryWaitMonths: 12, // 1 year after major surgery
  postTattooWaitMonths: 12, // 1 year after tattoo
  postPregnancyWaitMonths: 6, // 6 months after pregnancy
};

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  return age;
}

export function calculateNextEligibleDate(lastDonationDate: Date): Date {
  const nextDate = new Date(lastDonationDate);
  nextDate.setDate(nextDate.getDate() + WHO_CRITERIA.donationIntervalDays);
  return nextDate;
}

export function getDaysSinceLastDonation(lastDonationDate: Date): number {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastDonationDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function checkEligibility(data: DonorHealthData): EligibilityResult {
  const reasons: string[] = [];
  let healthScore = 100;
  let category: EligibilityResult['category'] = 'eligible';
  let nextEligibleDate: Date | undefined;

  // Age check
  const age = calculateAge(data.dateOfBirth);
  if (age < WHO_CRITERIA.minAge) {
    reasons.push(`Must be at least ${WHO_CRITERIA.minAge} years old (current age: ${age})`);
    healthScore -= 100;
    category = 'permanently_ineligible';
  } else if (age > WHO_CRITERIA.maxAge) {
    reasons.push(`Age exceeds maximum limit of ${WHO_CRITERIA.maxAge} years (current age: ${age})`);
    healthScore -= 30;
    category = 'needs_review';
  }

  // Weight check
  if (data.weight < WHO_CRITERIA.minWeight) {
    reasons.push(`Minimum weight required: ${WHO_CRITERIA.minWeight} kg (current: ${data.weight} kg)`);
    healthScore -= 25;
    category = 'temporarily_ineligible';
  }

  // Hemoglobin check
  if (data.hemoglobinLevel) {
    const minHemoglobin = data.gender === 'male' ? WHO_CRITERIA.minHemoglobinMale : WHO_CRITERIA.minHemoglobinFemale;
    if (data.hemoglobinLevel < minHemoglobin) {
      reasons.push(`Hemoglobin level below ${minHemoglobin} g/dL (current: ${data.hemoglobinLevel} g/dL)`);
      healthScore -= 20;
      category = 'temporarily_ineligible';
    }
  }

  // Blood pressure check
  if (data.bloodPressureSystolic && data.bloodPressureDiastolic) {
    if (data.bloodPressureSystolic < WHO_CRITERIA.minBloodPressureSystolic || 
        data.bloodPressureSystolic > WHO_CRITERIA.maxBloodPressureSystolic) {
      reasons.push(`Systolic BP out of range (${WHO_CRITERIA.minBloodPressureSystolic}-${WHO_CRITERIA.maxBloodPressureSystolic} mmHg)`);
      healthScore -= 15;
      category = 'temporarily_ineligible';
    }
    if (data.bloodPressureDiastolic < WHO_CRITERIA.minBloodPressureDiastolic || 
        data.bloodPressureDiastolic > WHO_CRITERIA.maxBloodPressureDiastolic) {
      reasons.push(`Diastolic BP out of range (${WHO_CRITERIA.minBloodPressureDiastolic}-${WHO_CRITERIA.maxBloodPressureDiastolic} mmHg)`);
      healthScore -= 15;
      category = 'temporarily_ineligible';
    }
  }

  // Chronic disease check
  if (data.hasChronicDisease) {
    reasons.push('Has chronic disease - requires medical review');
    healthScore -= 30;
    category = 'needs_review';
  }

  // Pregnancy check
  if (data.isPregnant) {
    reasons.push('Currently pregnant - cannot donate');
    healthScore -= 50;
    category = 'temporarily_ineligible';
  }

  // Post-surgery check
  if (data.lastMajorSurgeryDate) {
    const monthsSinceSurgery = Math.floor(
      (new Date().getTime() - data.lastMajorSurgeryDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    if (monthsSinceSurgery < WHO_CRITERIA.postSurgeryWaitMonths) {
      const waitMonths = WHO_CRITERIA.postSurgeryWaitMonths - monthsSinceSurgery;
      reasons.push(`Must wait ${waitMonths} more month(s) after major surgery`);
      healthScore -= 20;
      category = 'temporarily_ineligible';
    }
  }

  // Post-tattoo check
  if (data.lastTattooDate) {
    const monthsSinceTattoo = Math.floor(
      (new Date().getTime() - data.lastTattooDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    if (monthsSinceTattoo < WHO_CRITERIA.postTattooWaitMonths) {
      const waitMonths = WHO_CRITERIA.postTattooWaitMonths - monthsSinceTattoo;
      reasons.push(`Must wait ${waitMonths} more month(s) after getting tattoo`);
      healthScore -= 15;
      category = 'temporarily_ineligible';
    }
  }

  // Medication check
  if (data.isOnMedication) {
    reasons.push('Currently on medication - requires medical review');
    healthScore -= 10;
    if (category === 'eligible') category = 'needs_review';
  }

  // Last donation check
  if (data.lastDonationDate) {
    const daysSinceLastDonation = getDaysSinceLastDonation(data.lastDonationDate);
    if (daysSinceLastDonation < WHO_CRITERIA.donationIntervalDays) {
      const waitDays = WHO_CRITERIA.donationIntervalDays - daysSinceLastDonation;
      reasons.push(`Must wait ${waitDays} more day(s) since last donation`);
      healthScore -= 10;
      category = 'temporarily_ineligible';
      nextEligibleDate = calculateNextEligibleDate(data.lastDonationDate);
    } else {
      nextEligibleDate = new Date(); // Eligible today
    }
  }

  // Ensure health score is within bounds
  healthScore = Math.max(0, Math.min(100, healthScore));

  // Update category based on final assessment
  if (reasons.length === 0) {
    category = 'eligible';
  }

  return {
    isEligible: category === 'eligible',
    reasons,
    nextEligibleDate,
    healthScore,
    category,
  };
}

export function formatEligibilityCategory(category: EligibilityResult['category']): string {
  switch (category) {
    case 'eligible':
      return 'Eligible to Donate';
    case 'temporarily_ineligible':
      return 'Temporarily Ineligible';
    case 'permanently_ineligible':
      return 'Permanently Ineligible';
    case 'needs_review':
      return 'Requires Medical Review';
    default:
      return 'Unknown';
  }
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = typeof BLOOD_GROUPS[number];

export function getBloodGroupCompatibility(bloodGroup: BloodGroup): {
  canDonateTo: BloodGroup[];
  canReceiveFrom: BloodGroup[];
} {
  const compatibility: Record<BloodGroup, { canDonateTo: BloodGroup[]; canReceiveFrom: BloodGroup[] }> = {
    'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['A+', 'A-', 'O+', 'O-'] },
    'A-': { canDonateTo: ['A+', 'A-', 'AB+', 'AB-'], canReceiveFrom: ['A-', 'O-'] },
    'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['B+', 'B-', 'O+', 'O-'] },
    'B-': { canDonateTo: ['B+', 'B-', 'AB+', 'AB-'], canReceiveFrom: ['B-', 'O-'] },
    'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    'AB-': { canDonateTo: ['AB+', 'AB-'], canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'] },
    'O+': { canDonateTo: ['A+', 'B+', 'AB+', 'O+'], canReceiveFrom: ['O+', 'O-'] },
    'O-': { canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canReceiveFrom: ['O-'] },
  };
  
  return compatibility[bloodGroup];
}
