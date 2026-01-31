import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Droplets, Heart, Calendar, Activity } from 'lucide-react';
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
      // Use Mock Service
      const profileData = await mockService.getProfile(user?.email);
      setProfile(profileData);

      if (profileData) {
        // Fetch monthly donations from Mock Service
        const donationsData = await mockService.getDonations();
        const userDonations = donationsData.filter(d => d.donor_id === profileData.id);

        const monthlyData: Record<string, number> = {};
        userDonations.forEach(d => {
          const monthKey = format(new Date(d.donation_date), 'MMM yyyy');
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(d.units_donated);
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
            <div className="mt-4">
              <Link to="/eligibility">
                <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                  <Activity className="h-4 w-4" />
                  Check Eligibility
                </Button>
              </Link>
            </div>
          </div>
          <BloodGroupBadge bloodGroup={profile.blood_group} size="lg" />
        </motion.div>

        {/* Certificate Section */}
        {profile.total_donations > 0 && (
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
