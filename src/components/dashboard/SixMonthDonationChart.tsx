import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { format, subMonths } from 'date-fns';

interface MonthlyDonation {
  month: string;
  units: number;
}

interface SixMonthDonationChartProps {
  data: MonthlyDonation[];
  donorName?: string;
}

export function SixMonthDonationChart({ data, donorName }: SixMonthDonationChartProps) {
  const totalUnits = data.reduce((sum, item) => sum + item.units, 0);
  const maxUnits = Math.max(...data.map(d => d.units));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-sm text-primary">
            {payload[0].value} units donated
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="chart-container"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {donorName ? `${donorName}'s Donations` : '6-Month Donation History'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Blood units donated over the last 6 months
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{totalUnits}</p>
          <p className="text-xs text-muted-foreground">Total Units</p>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
            <Bar
              dataKey="units"
              radius={[6, 6, 0, 0]}
              animationBegin={0}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.units === maxUnits ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.6)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// Helper function to generate empty 6-month data
// Helper function to generate 6-month data from raw donations
export function generate6MonthData(donations: any[] = []): MonthlyDonation[] {
  const months: MonthlyDonation[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthKey = format(date, 'MMM yyyy'); // matches dashboard logging if needed, or just compare month/year

    // Filter donations for this specific month and year
    const monthlyTotal = donations
      .filter(d => {
        const dDate = new Date(d.donation_date);
        return format(dDate, 'MMM yyyy') === monthKey;
      })
      .reduce((sum, d) => sum + (Number(d.units_donated) || 0), 0);

    months.push({
      month: format(date, 'MMM'),
      units: monthlyTotal,
    });
  }

  return months;
}
