import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Droplets, Activity, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BloodGroupDonutChart } from '@/components/dashboard/BloodGroupDonutChart';
import { NewDonorsDonutChart } from '@/components/dashboard/NewDonorsDonutChart';
import { RecentDonorsList } from '@/components/dashboard/RecentDonorsList';
import { UrgentBloodAlert } from '@/components/dashboard/UrgentBloodAlert';
import { mockService, InventoryItem } from '@/lib/mockData';
import { AdminRequestManager } from '@/components/dashboard/AdminRequestManager';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDonors: 0,
        totalDonations: 0,
        totalUnits: 0,
        eligibleDonors: 0,
        thisWeekDonors: 0,
        thisMonthDonors: 0,
        lastMonthDonors: 0,
    });
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [recentDonors, setRecentDonors] = useState<any[]>([]);
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const dashboardStats = await mockService.getDashboardStats();
            const inventoryData = await mockService.getInventory();
            const recentDonorsData = await mockService.getRecentDonors();
            const requests = await mockService.getRequests();

            setStats(dashboardStats);
            setInventory(inventoryData);
            setRecentDonors(recentDonorsData);
            setPendingRequestsCount(requests.filter(r => r.status === 'pending').length);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Transform Inventory for Chart
    const bloodGroupData = inventory.map(item => ({
        name: item.blood_group,
        value: item.units_available,
        color: getBloodGroupColor(item.blood_group)
    }));

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <DashboardLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                        <p className="mt-1 text-muted-foreground">
                            Overview of blood inventory, donors, and donation activities.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

                {/* Urgent Alerts */}
                <UrgentBloodAlert inventory={inventory} />

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Donors"
                        value={stats.totalDonors}
                        icon={<Users className="h-5 w-5 text-blue-600" />}
                        trend={{ value: 12, label: 'vs last month' }}
                        className="bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900"
                    />
                    <StatCard
                        title="Total Units Available"
                        value={stats.totalUnits}
                        icon={<Droplets className="h-5 w-5 text-red-600" />}
                        trend={{ value: 5, label: 'vs last week' }}
                        className="bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900"
                    />
                    <StatCard
                        title="New Requests"
                        value={pendingRequestsCount}
                        icon={<Activity className="h-5 w-5 text-emerald-600" />}
                        description="Pending approval"
                        className="bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900"
                    />
                    <StatCard
                        title="Total Donations"
                        value={stats.totalDonations}
                        icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                        trend={{ value: 8, label: 'vs last month' }}
                        className="bg-purple-50/50 dark:bg-purple-950/10 border-purple-100 dark:border-purple-900"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Blood Group Donut Chart */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <BloodGroupDonutChart
                            data={bloodGroupData}
                            title="Blood Inventory Status"
                            subtitle="Distribution of available blood units by group"
                        />
                    </div>

                    {/* New Donors Donut Chart */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <NewDonorsDonutChart
                            totalDonors={stats.totalDonors}
                            thisWeek={stats.thisWeekDonors}
                            thisMonth={stats.thisMonthDonors}
                            lastMonth={stats.lastMonthDonors}
                        />
                    </div>
                </div>

                {/* Recent Donors List */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">Recently Registered Donors</h3>
                        <button className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                            View All Donors <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </div>
                    <RecentDonorsList donors={recentDonors} />
                </div>

                {/* Blood Requests Management */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <AdminRequestManager />
                </div>
            </motion.div>
        </DashboardLayout>
    );
}

function getBloodGroupColor(group: string): string {
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
    return colors[group] || '#888';
}
