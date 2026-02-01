import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Droplets, Activity, TrendingUp, Heart, Calendar as CalendarIcon, Mail } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BloodGroupDonutChart } from '@/components/dashboard/BloodGroupDonutChart';
import { NewDonorsDonutChart } from '@/components/dashboard/NewDonorsDonutChart';
import { SixMonthDonationChart, generate6MonthData } from '@/components/dashboard/SixMonthDonationChart';
import { RecentDonorsList } from '@/components/dashboard/RecentDonorsList';
import { UrgentBloodAlert } from '@/components/dashboard/UrgentBloodAlert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { mockService } from '@/services/mockService';
// import { supabase } from '@/integrations/supabase/client';
import { subDays, subMonths, startOfWeek, startOfMonth, format } from 'date-fns';
import { BloodRequestSection } from '@/components/dashboard/BloodRequestSection';
import AdminDashboard from './AdminDashboard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DonationCertificate } from '@/components/donor/DonationCertificate';
import { Donation } from '@/services/mockService';

interface DashboardStats {
  totalDonors: number;
  totalDonations: number;
  totalUnits: number;
  eligibleDonors: number;
  thisWeekDonors: number;
  thisMonthDonors: number;
  lastMonthDonors: number;
}

interface BloodInventoryItem {
  blood_group: string;
  units_available: number;
}

interface RecentDonor {
  id: string;
  fullName: string;
  bloodGroup: string;
  registeredAt: string;
}

interface MonthlyDonation {
  month: string;
  units: number;
}

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [lastRecordedDonation, setLastRecordedDonation] = useState<Donation | null>(null);

  const handleSelfReportDonation = async () => {
    if (!window.confirm("Confirm that you donated blood today? This will update your records.")) return;

    try {
      const profile = await mockService.getProfile(user?.email || '') as any;
      if (profile) {
        const res = await mockService.addDonation({
          donor_id: profile.id,
          donation_date: new Date().toISOString(),
          units_donated: 1,
          blood_group: profile.blood_group,
          donation_center: 'Self Reported',
          collected_by: 'Self'
        });

        if (res.success && res.donation) {
          setLastRecordedDonation(res.donation);
          toast({
            title: "Donation Recorded",
            description: "Thank you! Your stats have been updated. You can now download your new certificate.",
          });
        }

        fetchDashboardData();
        fetchPersonalStats();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to record donation.",
        variant: "destructive"
      });
    }
  };

  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Donor Dashboard Logic
  const [personalStats, setPersonalStats] = useState({
    totalDonations: 0,
    lastDonation: null as string | null,
    nextEligible: null as string | null,
    isEligible: false
  });

  // Persist eligibility check
  const [hasCheckedEligibility, setHasCheckedEligibility] = useState(() => {
    if (!user) return false;
    return localStorage.getItem(`eligibility_checked_${user.id}`) === 'true';
  });

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`eligibility_checked_${user.id}`) === 'true';
      setHasCheckedEligibility(stored);
    }
  }, [user]);

  const handleCheckEligibility = () => {
    const confirmed = window.confirm("Do you want to run the eligibility check now?");
    if (confirmed) {
      setHasCheckedEligibility(true);
      if (user) {
        localStorage.setItem(`eligibility_checked_${user.id}`, 'true');
      }
    }
  };

  // Admin/General Stats Data
  const [stats, setStats] = useState<DashboardStats>({
    totalDonors: 0,
    totalDonations: 0,
    totalUnits: 0,
    eligibleDonors: 0,
    thisWeekDonors: 0,
    thisMonthDonors: 0,
    lastMonthDonors: 0
  });
  const [bloodGroupChartData, setBloodGroupChartData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [inventoryState, setInventoryState] = useState<BloodInventoryItem[]>([]);
  const [monthlyDonations, setMonthlyDonations] = useState<MonthlyDonation[]>([]);
  const [recentDonors, setRecentDonors] = useState<RecentDonor[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    if (!isAdmin && user) {
      fetchPersonalStats();
      fetchNotifications();
    }
  }, [isAdmin, user]);

  const fetchNotifications = async () => {
    const msgs = await mockService.getNotifications(String(user?.id));
    setNotifications(msgs);
  };

  const fetchDashboardData = async () => {
    try {
      // If we are a donor, we need our ID to filter donations.
      // useAuth user.id matches the mockData id (mostly).
      const donorId = (!isAdmin && user) ? String(user.id) : undefined;

      const [dashboardStats, inventory, recent, donations] = await Promise.all([
        mockService.getDashboardStats(),
        mockService.getInventory(),
        mockService.getRecentDonors(),
        // Pass donorId to filter donations if not admin
        mockService.getDonations(donorId)
      ]);

      setStats(dashboardStats);
      setRecentDonors(recent);
      setInventoryState(inventory);

      // Process Inventory for Chart
      const chartData = inventory.map(item => ({
        name: item.blood_group,
        value: item.units_available,
        color: getBloodGroupColor(item.blood_group)
      })).filter(item => item.value > 0);
      setBloodGroupChartData(chartData);

      // Process Monthly Donations (This will now be filtered for the donor)
      const sixMonthData = generate6MonthData(donations);
      setMonthlyDonations(sixMonthData);

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  const fetchPersonalStats = async () => {
    const profile = await mockService.getProfile(user?.email || '') as any;
    if (profile) {
      const lastDate = profile.last_donation_date ? new Date(profile.last_donation_date) : null;
      let nextDate = null;
      if (lastDate) {
        nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + 56); // 56 days rule
      }

      setPersonalStats({
        totalDonations: profile.total_donations,
        lastDonation: profile.last_donation_date,
        nextEligible: nextDate ? nextDate.toISOString() : new Date().toISOString(),
        isEligible: profile.is_eligible || profile.isEligible || false
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
            <span className="px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full border border-primary/20">
              Donor Portal
            </span>
          </div>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {user?.email}
          </p>
        </motion.div>

        {/* ... (Urgent Alerts) */}

        {/* Stat Cards - Personalized */}
        <div className="dashboard-grid">
          <StatCard
            title={isAdmin ? "Total Donations" : "My Total Donations"}
            value={isAdmin ? stats.totalDonations : (personalStats.totalDonations || 0)} // show 0 if undefined/null
            subtitle="Units donated"
            icon={<Heart className="h-6 w-6 text-red-500" />}
            variant="primary"
          />
          <StatCard
            title="Last Donation"
            value={personalStats.lastDonation
              ? format(new Date(personalStats.lastDonation), 'MMM d, yyyy')
              : 'None yet'}
            subtitle="Thank you!"
            icon={<CalendarIcon className="h-6 w-6 text-blue-500" />}
          />
          <StatCard
            title="Next Eligibility"
            value={(personalStats.nextEligible && new Date(personalStats.nextEligible) > new Date())
              ? format(new Date(personalStats.nextEligible), 'MMM d, yyyy')
              : 'Available Now'}
            subtitle={personalStats.isEligible ? 'You can donate!' : 'Wait for safety'}
            icon={<Activity className="h-6 w-6 text-emerald-500" />}
            variant={personalStats.isEligible ? 'success' : 'default'}
          />
          <StatCard
            title="Blood Status"
            value={hasCheckedEligibility ? (personalStats.isEligible ? 'Eligible' : 'Waiting Period') : 'Check Eligibility'}
            subtitle={hasCheckedEligibility ? 'Based on WHO criteria' : 'Check eligibility to proceed'}
            icon={<Droplets className="h-6 w-6 text-purple-500" />}
            variant={hasCheckedEligibility ? (personalStats.isEligible ? 'success' : 'warning') : 'warning'}
            description={
              <div className="flex flex-col gap-1 mt-1">
                {!hasCheckedEligibility && (
                  <Button
                    variant="link"
                    className="text-xs text-blue-600 hover:text-blue-800 underline font-medium mt-1 h-auto p-0"
                    onClick={() => navigate('/eligibility')}
                  >
                    Check Eligibility Now
                  </Button>
                )}
                {hasCheckedEligibility && personalStats.isEligible && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelfReportDonation}
                    className="w-full mt-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 h-8"
                  >
                    I Donated Today
                  </Button>
                )}
              </div>
            }
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BloodGroupDonutChart
            data={bloodGroupChartData}
            title="Blood Group Distribution"
            subtitle="Current inventory by blood type"
          />
          {/* Removed NewDonorsDonutChart for Donor View */}
          <div className="hidden lg:block"></div> {/* Spacer or just allow it to take full width if we adjust grid cols, but keeping grid-cols-2 for layout consistency or remove this div */}
        </div>

        {/* 6-Month Chart */}
        <div className="grid gap-6 lg:grid-cols-1"> {/* Changed to 1 col since we removed RecentDonorsList */}
          <div className="">
            <SixMonthDonationChart data={monthlyDonations} />
          </div>
          {/* Removed RecentDonorsList for Donor View */}
        </div>

        {/* Inbox / Notifications Section */}
        {!isAdmin && notifications.length > 0 && (
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Mail className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-bold">My Inbox & Alerts</h2>
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {notifications.filter(n => !n.read).length} New
              </span>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {notifications.map((notif: any) => (
                <div key={notif.id} className={`p-4 rounded-lg border ${notif.read ? 'bg-muted/30' : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-foreground">{notif.title}</h4>
                    <span className="text-xs text-muted-foreground">{format(new Date(notif.date), 'MMM d, h:mm a')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requests Section */}
        <BloodRequestSection userId={user?.id || ''} />
      </div>

      {/* Certificate Modal */}
      <Dialog
        open={!!lastRecordedDonation}
        onOpenChange={(open) => !open && setLastRecordedDonation(null)}
      >
        <DialogContent className="max-w-[850px] p-0 border-none bg-transparent">
          <DialogHeader className="sr-only">
            <DialogTitle>Donation Certificate</DialogTitle>
            <DialogDescription>Your official donor certificate</DialogDescription>
          </DialogHeader>
          {lastRecordedDonation && (
            <div className="flex justify-center p-4">
              <DonationCertificate donation={lastRecordedDonation} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function getBloodGroupColor(bloodGroup: string): string {
  const colors: Record<string, string> = {
    'A+': '#dc2626',
    'A-': '#ef4444',
    'B+': '#db2777',
    'B-': '#ec4899',
    'AB+': '#9333ea',
    'AB-': '#a855f7',
    'O+': '#2563eb',
    'O-': '#3b82f6',
  };
  return colors[bloodGroup] || '#888888';
}
