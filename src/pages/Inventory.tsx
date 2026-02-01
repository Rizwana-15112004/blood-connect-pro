import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BloodGroupBadge } from '@/components/donor/BloodGroupBadge';
import { Progress } from '@/components/ui/progress';
import { mockService, InventoryItem } from '@/services/mockService';
// import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
// interface InventoryItem ... (Imported from mockData)

const CRITICAL_THRESHOLD = 10;
const LOW_THRESHOLD = 30;
const OPTIMAL_THRESHOLD = 100;

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await mockService.getInventory();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalUnits = inventory.reduce((sum, item) => sum + Number(item.units_available), 0);
  const criticalCount = inventory.filter(i => Number(i.units_available) <= CRITICAL_THRESHOLD).length;
  const lowCount = inventory.filter(i =>
    Number(i.units_available) > CRITICAL_THRESHOLD && Number(i.units_available) <= LOW_THRESHOLD
  ).length;

  const getStockStatus = (units: number) => {
    if (units <= CRITICAL_THRESHOLD) return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' };
    if (units <= LOW_THRESHOLD) return { label: 'Low', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (units <= OPTIMAL_THRESHOLD) return { label: 'Adequate', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { label: 'Optimal', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getProgressColor = (units: number) => {
    if (units <= CRITICAL_THRESHOLD) return 'bg-red-500';
    if (units <= LOW_THRESHOLD) return 'bg-yellow-500';
    if (units <= OPTIMAL_THRESHOLD) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Blood Inventory</h1>
          <p className="mt-1 text-muted-foreground">
            Real-time blood stock levels across all blood groups
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Units"
            value={totalUnits}
            subtitle="All blood groups"
            icon={<Droplets className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Blood Groups"
            value={inventory.length}
            subtitle="Types available"
            icon={<Droplets className="h-6 w-6" />}
          />
          <StatCard
            title="Critical Stock"
            value={criticalCount}
            subtitle="Need urgent donation"
            icon={<AlertCircle className="h-6 w-6" />}
            variant="warning"
          />
          <StatCard
            title="Low Stock"
            value={lowCount}
            subtitle="Below optimal level"
            icon={<TrendingDown className="h-6 w-6" />}
          />
        </div>

        {/* Inventory Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
            ))
          ) : (
            inventory.map((item, index) => {
              const units = Number(item.units_available);
              const status = getStockStatus(units);
              const progressPercent = Math.min((units / OPTIMAL_THRESHOLD) * 100, 100);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg',
                    units <= CRITICAL_THRESHOLD && 'border-red-300 bg-red-50/50'
                  )}
                >
                  {units <= CRITICAL_THRESHOLD && (
                    <div className="absolute right-2 top-2">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <BloodGroupBadge bloodGroup={item.blood_group} size="lg" />
                    <div className="flex-1">
                      <p className="text-3xl font-bold text-foreground">{units}</p>
                      <p className="text-sm text-muted-foreground">Units Available</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Stock Level</span>
                      <span className={cn('font-medium', status.color)}>{status.label}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', getProgressColor(units))}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optimal: {OPTIMAL_THRESHOLD}+ units
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="mb-4 font-semibold text-foreground">Stock Level Guide</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-red-500" />
              <span className="text-sm">Critical (0-{CRITICAL_THRESHOLD} units)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-yellow-500" />
              <span className="text-sm">Low ({CRITICAL_THRESHOLD + 1}-{LOW_THRESHOLD} units)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-blue-500" />
              <span className="text-sm">Adequate ({LOW_THRESHOLD + 1}-{OPTIMAL_THRESHOLD} units)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500" />
              <span className="text-sm">Optimal ({OPTIMAL_THRESHOLD}+ units)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
