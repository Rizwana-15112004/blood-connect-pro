import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface BloodGroupData {
  name: string;
  value: number;
  color: string;
}

interface BloodGroupDonutChartProps {
  data: BloodGroupData[];
  title: string;
  subtitle?: string;
}

const BLOOD_GROUP_COLORS: Record<string, string> = {
  'A+': '#dc2626',
  'A-': '#ef4444',
  'B+': '#db2777',
  'B-': '#ec4899',
  'AB+': '#9333ea',
  'AB-': '#a855f7',
  'O+': '#2563eb',
  'O-': '#3b82f6',
};

export function BloodGroupDonutChart({ data, title, subtitle }: BloodGroupDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <p className="font-semibold text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">
            {item.value} units ({((item.value / total) * 100).toFixed(1)}%)
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
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
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
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || BLOOD_GROUP_COLORS[entry.name] || '#888'} />
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

      <div className="mt-4 text-center">
        <p className="text-3xl font-bold text-foreground">{total}</p>
        <p className="text-sm text-muted-foreground">Total Units</p>
      </div>
    </motion.div>
  );
}
