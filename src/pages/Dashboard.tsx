import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Droplets, Activity, TrendingUp, Heart, Calendar as CalendarIcon } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BloodGroupDonutChart } from '@/components/dashboard/BloodGroupDonutChart';
import { NewDonorsDonutChart } from '@/components/dashboard/NewDonorsDonutChart';
import { SixMonthDonationChart, generate6MonthData } from '@/components/dashboard/SixMonthDonationChart';
import { RecentDonorsList } from '@/components/dashboard/RecentDonorsList';
import { UrgentBloodAlert } from '@/components/dashboard/UrgentBloodAlert';
import { useAuth } from '@/hooks/useAuth';
import { mockService } from '@/lib/mockData';
// import { supabase } from '@/integrations/supabase/client';
import { subDays, subMonths, startOfWeek, startOfMonth, format } from 'date-fns';
import AdminDashboard from './AdminDashboard';

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

  useEffect(() => {
    fetchDashboardData();
    if (!isAdmin && user) {
      fetchPersonalStats();
    }
  }, [isAdmin, user]);

  const fetchDashboardData = async () => {
    try {
      const [dashboardStats, inventory, recent, donations] = await Promise.all([
        mockService.getDashboardStats(),
        mockService.getInventory(),
        mockService.getRecentDonors(),
        mockService.getDonations()
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

      // Process Monthly Donations
      const sixMonthData = generate6MonthData(donations);
      setMonthlyDonations(sixMonthData);

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  const fetchPersonalStats = async () => {
    const profile = await mockService.getProfile(user?.email);
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
        isEligible: profile.is_eligible
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
          <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {user?.email}
          </p>
        </motion.div>

        {/* Urgent Alerts (Admin Only) */}
        {isAdmin && <UrgentBloodAlert inventory={inventoryState} />}

        {/* Stat Cards - Personalized */}
        <div className="dashboard-grid">
          <StatCard
            title={isAdmin ? "Total Donations" : "My Total Donations"}
            value={isAdmin ? stats.totalDonations : personalStats.totalDonations}
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
            title="Next Eligible Date"
            value={personalStats.nextEligible
              ? format(new Date(personalStats.nextEligible), 'MMM d, yyyy')
              : 'Available Now'}
            subtitle={personalStats.isEligible ? 'You can donate!' : 'Wait for safety'}
            icon={<Activity className="h-6 w-6 text-emerald-500" />}
            variant={personalStats.isEligible ? 'success' : 'default'}
          />
          <StatCard
            title="Blood Status"
            value={personalStats.isEligible ? 'Eligible' : 'Waiting Period'}
            subtitle="Based on WHO criteria"
            icon={<Droplets className="h-6 w-6 text-purple-500" />}
            variant={personalStats.isEligible ? 'success' : 'warning'}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BloodGroupDonutChart
            data={bloodGroupChartData}
            title="Blood Group Distribution"
            subtitle="Current inventory by blood type"
          />
          <NewDonorsDonutChart
            totalDonors={stats.totalDonors}
            thisWeek={stats.thisWeekDonors}
            thisMonth={stats.thisMonthDonors}
            lastMonth={stats.lastMonthDonors}
          />
        </div>

        {/* 6-Month Chart and Recent Donors */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SixMonthDonationChart data={monthlyDonations} />
          </div>
          <RecentDonorsList donors={recentDonors} />
        </div>
      </div>
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
