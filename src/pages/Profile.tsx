import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Droplets, Heart, Calendar, Activity, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { SixMonthDonationChart, generate6MonthData } from '@/components/dashboard/SixMonthDonationChart';
import { EligibilityCard } from '@/components/donor/EligibilityCard';
import { BloodGroupBadge } from '@/components/donor/BloodGroupBadge';
import { CertificateCard } from '@/components/donor/CertificateCard';
import { mockService, Donor } from '@/lib/mockData';
// import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { checkEligibility, DonorHealthData, getBloodGroupCompatibility } from '@/lib/eligibility';
import { format, subMonths } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

function DonationLogDialog({ onDonationSuccess, userBloodGroup }: { onDonationSuccess: () => void, userBloodGroup: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [units, setUnits] = useState('1');
  const [center, setCenter] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const getCookie = (name: string) => {
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

      const response = await fetch('/api/donate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || ''
        },
        body: JSON.stringify({ units, center, bloodGroup: userBloodGroup }),
        credentials: 'same-origin'
      });

      if (response.ok) {
        toast({
          title: "Donation Logged!",
          description: "Thank you for your donation. Your records have been updated.",
          className: "bg-green-600 text-white border-none"
        });
        onDonationSuccess();
        setIsOpen(false);
      } else {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Server Error: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Donation Log Error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Could not log donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200">
          <Plus className="h-4 w-4" />
          I Donated Today
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Your Donation</DialogTitle>
          <DialogDescription>
            Thank you for saving lives! Please enter the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="units">Units Donated</Label>
            <Input id="units" type="number" step="0.5" value={units} onChange={e => setUnits(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="center">Donation Center</Label>
            <Input id="center" placeholder="e.g. City Hospital" value={center} onChange={e => setCenter(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Confirm Donation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// interface DonorProfile ... (Removed, imported from mockData)

export default function Profile() {
  const [profile, setProfile] = useState<Donor | null>(null);
  const [monthlyDonations, setMonthlyDonations] = useState<{ month: string; units: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // 1. Fetch Real Donations
      const getCookie = (name: string) => { // Helper for potential future use or consistency
        return null; // GET requests don't strictly need it if we rely on session
      };

      const donationsRes = await fetch('/api/my-donations/', { credentials: 'same-origin' });
      let realDonations: any[] = [];
      if (donationsRes.ok) {
        realDonations = await donationsRes.json();
      }

      // Filter for verified only for "Official" stats, or show pending?
      // Requirement: Certificate only if approved.
      const verifiedDonations = realDonations.filter((d: any) => d.is_verified);

      // 2. Fetch Profile Details (Try Mock first, then Fallback)
      // Since we don't have a real Donor Profile API yet, we stick to Mock for "Base" info
      // But we OVERRIDE the stats with real data.
      let profileData = await mockService.getProfile(user?.email);

      if (!profileData && user) {
        // Fallback profile if not in mock data (e.g. new sign up)
        profileData = {
          id: user.id,
          full_name: user.email.split('@')[0], // Fallback name
          email: user.email,
          phone: '',
          state: '',
          city: '',
          blood_group: verifiedDonations.length > 0 ? verifiedDonations[0].blood_group : 'Unknown', // Infer or Unknown
          last_donation_date: '',
          total_donations: 0,
          is_available: true,
          has_chronic_disease: false,
          is_on_medication: false,
          is_pregnant: false,
          registered_at: new Date().toISOString(),
          date_of_birth: '',
          gender: 'other',
          weight: 0
        };
      }

      if (profileData) {
        // Use Real Stats
        const latestDonation = verifiedDonations.length > 0 ? verifiedDonations[0] : null; // Sorted by date desc in backend

        const updatedProfile = {
          ...profileData,
          total_donations: verifiedDonations.length, // Count verified only?
          last_donation_date: latestDonation ? latestDonation.donation_date : null,
          // blood_group: latestDonation ? latestDonation.blood_group : profileData.blood_group // Maybe update blood group if known?
        };

        setProfile(updatedProfile);

        // Chart Data
        const monthlyData: Record<string, number> = {};
        verifiedDonations.forEach((d: any) => {
          const monthKey = format(new Date(d.donation_date), 'MMM yyyy');
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(d.units);
        });

        const chartData = generate6MonthData(
          Object.entries(monthlyData).map(([month, units]) => ({ month, units }))
        );
        setMonthlyDonations(chartData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEligibilityResult = () => {
    if (!profile) return null;

    const healthData: DonorHealthData = {
      dateOfBirth: new Date(profile.date_of_birth),
      gender: profile.gender as 'male' | 'female' | 'other',
      weight: profile.weight,
      hemoglobinLevel: profile.hemoglobin_level ?? undefined,
      bloodPressureSystolic: profile.blood_pressure_systolic ?? undefined,
      bloodPressureDiastolic: profile.blood_pressure_diastolic ?? undefined,
      hasChronicDisease: profile.has_chronic_disease,
      isOnMedication: profile.is_on_medication,
      isPregnant: profile.is_pregnant,
      lastDonationDate: profile.last_donation_date ? new Date(profile.last_donation_date) : undefined,
    };

    return checkEligibility(healthData);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center text-center">
          <User className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Profile Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            Please complete your donor registration to access your profile.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const eligibility = getEligibilityResult();
  const compatibility = getBloodGroupCompatibility(profile.blood_group as any);

  if (isAdmin) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 rounded-2xl border bg-slate-900 text-white p-8 sm:flex-row sm:items-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 shadow-lg border-4 border-slate-700">
              <span className="text-3xl font-bold">SA</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">System Administrator</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-slate-300">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  admin@example.com
                </span>
                <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                  Super User
                </span>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Server Status</span>
                  <span className="text-green-600 font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Database</span>
                  <span className="text-green-600 font-bold">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Backup</span>
                  <span>2 hours ago</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Admin Privileges</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Manage all donor records</li>
                <li>• View and update inventory</li>
                <li>• Send urgent alerts</li>
                <li>• Export reports</li>
              </ul>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 rounded-2xl border bg-gradient-to-r from-primary/10 to-accent/10 p-8 sm:flex-row sm:items-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <span className="text-3xl font-bold">
              {profile.full_name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{profile.full_name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {profile.email}
              </span>
              {profile.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {profile.phone}
                </span>
              )}
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.city}, {profile.state}
                </span>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Link to="/eligibility">
                <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                  <Activity className="h-4 w-4" />
                  Check Eligibility
                </Button>
              </Link>
              <DonationLogDialog onDonationSuccess={fetchProfile} userBloodGroup={profile.blood_group} />
            </div>
          </div>
          <BloodGroupBadge bloodGroup={profile.blood_group} size="lg" />
        </motion.div>

        {/* Certificate Section */}
        {profile.total_donations > 0 && profile.last_donation_date && (
          <CertificateCard donor={profile} />
        )}

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Donations"
            value={profile.total_donations}
            subtitle="All-time contributions"
            icon={<Heart className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Lives Saved"
            value={profile.total_donations * 3}
            subtitle="Each unit saves 3 lives"
            icon={<Droplets className="h-6 w-6" />}
            variant="success"
          />
          <StatCard
            title="Last Donation"
            value={profile.last_donation_date
              ? format(new Date(profile.last_donation_date), 'MMM d, yyyy')
              : 'Never'
            }
            subtitle="Most recent donation"
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatCard
            title="Member Since"
            value={format(new Date(profile.registered_at), 'MMM yyyy')}
            subtitle="Registration date"
            icon={<User className="h-6 w-6" />}
          />
        </div>

        {/* Charts and Eligibility */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SixMonthDonationChart data={monthlyDonations} donorName={profile.full_name.split(' ')[0]} />
          {eligibility && (
            <EligibilityCard
              eligibility={eligibility}
              lastDonationDate={profile.last_donation_date ? new Date(profile.last_donation_date) : undefined}
            />
          )}
        </div>

        {/* Blood Compatibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Blood Compatibility ({profile.blood_group})
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">Can Donate To</p>
              <div className="flex flex-wrap gap-2">
                {compatibility.canDonateTo.map(bg => (
                  <BloodGroupBadge key={bg} bloodGroup={bg} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">Can Receive From</p>
              <div className="flex flex-wrap gap-2">
                {compatibility.canReceiveFrom.map(bg => (
                  <BloodGroupBadge key={bg} bloodGroup={bg} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
