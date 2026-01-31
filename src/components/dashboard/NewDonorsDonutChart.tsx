import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface DonorRegistration {
  period: string;
  count: number;
  color: string;
}

interface NewDonorsDonutChartProps {
  totalDonors: number;
  thisWeek: number;
  thisMonth: number;
  lastMonth: number;
}

export function NewDonorsDonutChart({ totalDonors, thisWeek, thisMonth, lastMonth }: NewDonorsDonutChartProps) {
  const olderDonors = totalDonors - thisWeek - thisMonth - lastMonth;

  const data: DonorRegistration[] = [
    { period: 'This Week', count: thisWeek, color: '#dc2626' },
    { period: 'This Month', count: thisMonth, color: '#f97316' },
    { period: 'Last Month', count: lastMonth, color: '#eab308' },
    { period: 'Older', count: Math.max(0, olderDonors), color: '#94a3b8' },
  ].filter(item => item.count > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <p className="font-semibold text-foreground">{item.period}</p>
          <p className="text-sm text-muted-foreground">
            {item.count} donors ({((item.count / totalDonors) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="chart-container"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">New Registrations</h3>
        <p className="text-sm text-muted-foreground">Donor registration timeline</p>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="count"
              animationBegin={0}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{thisWeek}</p>
          <p className="text-xs text-muted-foreground">This Week</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{totalDonors}</p>
          <p className="text-xs text-muted-foreground">Total Donors</p>
        </div>
      </div>
    </motion.div>
  );
}
