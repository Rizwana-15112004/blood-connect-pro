import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Calculator, Heart, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EligibilityCard } from '@/components/donor/EligibilityCard';
import {
  checkEligibility,
  calculateAge,
  DonorHealthData,
  EligibilityResult
} from '@/lib/eligibility';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Eligibility() {
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    weight: '',
    hemoglobinLevel: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    hasChronicDisease: false,
    isOnMedication: false,
    isPregnant: false,
    lastDonationDate: '',
    lastMajorSurgeryDate: '',
    lastTattooDate: '',
  });

  const [result, setResult] = useState<EligibilityResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dateOfBirth || !formData.gender || !formData.weight) {
      return;
    }

    const healthData: DonorHealthData = {
      dateOfBirth: new Date(formData.dateOfBirth),
      gender: formData.gender as 'male' | 'female' | 'other',
      weight: parseFloat(formData.weight),
      hemoglobinLevel: formData.hemoglobinLevel ? parseFloat(formData.hemoglobinLevel) : undefined,
      bloodPressureSystolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : undefined,
      hasChronicDisease: formData.hasChronicDisease,
      isOnMedication: formData.isOnMedication,
      isPregnant: formData.isPregnant,
      lastDonationDate: formData.lastDonationDate ? new Date(formData.lastDonationDate) : undefined,
      lastMajorSurgeryDate: formData.lastMajorSurgeryDate ? new Date(formData.lastMajorSurgeryDate) : undefined,
      lastTattooDate: formData.lastTattooDate ? new Date(formData.lastTattooDate) : undefined,
    };

    const eligibilityResult = checkEligibility(healthData);
    setResult(eligibilityResult);

    if (user) {
      // Save local storage flag so Dashboard knows check was run
      localStorage.setItem(`eligibility_checked_${user.id}`, 'true');

      // Save to backend (mockService or API)
      try {
        api.updateEligibility('', {
          isEligible: eligibilityResult.isEligible,
          lastDonationDate: formData.lastDonationDate
        }).then(res => {
          // Toast for feedback
          if (eligibilityResult.isEligible) {
            toast({
              title: "You are Eligible!",
              description: "Your status has been updated. You can now donate blood.",
              className: "bg-green-600 text-white"
            });
          } else {
            toast({
              title: "Not Eligible",
              description: "Based on the criteria, you are currently not eligible to donate.",
              variant: "destructive"
            });
          }
        });
      } catch (e) { console.error("Failed to update profile", e); }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Eligibility Check</h1>
          <p className="mt-1 text-muted-foreground">
            Check blood donation eligibility based on WHO guidelines
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="form-section-title">Basic Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="30"
                      max="200"
                      placeholder="e.g., 65"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Health Metrics */}
              <div className="form-section">
                <h3 className="form-section-title">Health Metrics (Optional)</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                    <Input
                      id="hemoglobin"
                      type="number"
                      step="0.1"
                      min="5"
                      max="20"
                      placeholder="e.g., 14.5"
                      value={formData.hemoglobinLevel}
                      onChange={(e) => setFormData({ ...formData, hemoglobinLevel: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bpSystolic">BP Systolic (mmHg)</Label>
                    <Input
                      id="bpSystolic"
                      type="number"
                      min="80"
                      max="200"
                      placeholder="e.g., 120"
                      value={formData.bloodPressureSystolic}
                      onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bpDiastolic">BP Diastolic (mmHg)</Label>
                    <Input
                      id="bpDiastolic"
                      type="number"
                      min="50"
                      max="130"
                      placeholder="e.g., 80"
                      value={formData.bloodPressureDiastolic}
                      onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="form-section">
                <h3 className="form-section-title">Medical History</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="chronic"
                      checked={formData.hasChronicDisease}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hasChronicDisease: checked as boolean })
                      }
                    />
                    <Label htmlFor="chronic" className="cursor-pointer">
                      Has chronic disease (diabetes, hypertension, etc.)
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="medication"
                      checked={formData.isOnMedication}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isOnMedication: checked as boolean })
                      }
                    />
                    <Label htmlFor="medication" className="cursor-pointer">
                      Currently on medication
                    </Label>
                  </div>
                  {formData.gender === 'female' && (
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="pregnant"
                        checked={formData.isPregnant}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isPregnant: checked as boolean })
                        }
                      />
                      <Label htmlFor="pregnant" className="cursor-pointer">
                        Currently pregnant
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="form-section">
                <h3 className="form-section-title">Important Dates (Optional)</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="lastDonation">Last Donation</Label>
                    <Input
                      id="lastDonation"
                      type="date"
                      value={formData.lastDonationDate}
                      onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastSurgery">Last Major Surgery</Label>
                    <Input
                      id="lastSurgery"
                      type="date"
                      value={formData.lastMajorSurgeryDate}
                      onChange={(e) => setFormData({ ...formData, lastMajorSurgeryDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastTattoo">Last Tattoo</Label>
                    <Input
                      id="lastTattoo"
                      type="date"
                      value={formData.lastTattooDate}
                      onChange={(e) => setFormData({ ...formData, lastTattooDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" size="lg">
                <Calculator className="h-5 w-5" />
                Check Eligibility
              </Button>
            </form>
          </motion.div>

          {/* Result */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {result ? (
              <EligibilityCard
                eligibility={result}
                lastDonationDate={formData.lastDonationDate ? new Date(formData.lastDonationDate) : undefined}
                age={formData.dateOfBirth ? calculateAge(new Date(formData.dateOfBirth)) : undefined}
                weight={formData.weight ? parseFloat(formData.weight) : undefined}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border bg-muted/30 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Ready to Check Eligibility
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill out the form and click "Check Eligibility" to see if you can donate blood.
                </p>
              </div>
            )}

            {/* WHO Guidelines Card */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <Heart className="h-5 w-5 text-primary" />
                WHO Blood Donation Criteria
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  Age between 18-65 years
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  Minimum weight of 50 kg
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  Hemoglobin: ≥13.0 g/dL (male), ≥12.5 g/dL (female)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  Blood pressure: 100-180/60-100 mmHg
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  8 weeks (56 days) gap between donations
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                  12 months wait after surgery or tattoo
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
