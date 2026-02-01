import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { User, Droplets } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Donor {
  id: string;
  full_name: string;
  blood_group: string;
  registered_at: string;
}

interface RecentDonorsListProps {
  donors: Donor[];
}

export function RecentDonorsList({ donors }: RecentDonorsListProps) {
  const getBloodBadgeClass = (bloodGroup: string) => {
    const baseClasses = 'font-bold';
    const colorMap: Record<string, string> = {
      'A+': 'bg-red-100 text-red-700 hover:bg-red-100',
      'A-': 'bg-red-50 text-red-600 hover:bg-red-50',
      'B+': 'bg-pink-100 text-pink-700 hover:bg-pink-100',
      'B-': 'bg-pink-50 text-pink-600 hover:bg-pink-50',
      'AB+': 'bg-purple-100 text-purple-700 hover:bg-purple-100',
      'AB-': 'bg-purple-50 text-purple-600 hover:bg-purple-50',
      'O+': 'bg-blue-100 text-blue-700 hover:bg-blue-100',
      'O-': 'bg-blue-50 text-blue-600 hover:bg-blue-50',
    };
    return `${baseClasses} ${colorMap[bloodGroup] || 'bg-gray-100 text-gray-700'}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="chart-container"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recently Registered</h3>
          <p className="text-sm text-muted-foreground">New donors who joined</p>
        </div>
        <div className="flex gap-2">
          <Link to="/donors">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </Link>
          <Badge variant="secondary" className="gap-1">
            <User className="h-3 w-3" />
            {donors.length} new
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {donors.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No recent registrations
          </p>
        ) : (
          donors.map((donor, index) => (
            <motion.div
              key={donor.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{donor.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {(() => {
                    const d = new Date(donor.registered_at);
                    return isNaN(d.getTime()) ? 'Recently' : format(d, 'MMM d, yyyy');
                  })()}
                </p>
              </div>
              <Badge className={getBloodBadgeClass(donor.blood_group)}>
                <Droplets className="mr-1 h-3 w-3" />
                {donor.blood_group}
              </Badge>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
