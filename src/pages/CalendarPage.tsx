import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, MapPin, User, Droplet } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DonationCalendar } from '@/components/donor/DonationCalendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { calculateNextEligibleDate } from '@/lib/eligibility';
import { mockService } from '@/services/mockService';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DonorDonation {
  date: Date;
  units: number;
}

interface UpcomingDonation {
  id: string;
  date: string;
  location: string;
  donorName: string;
  bloodGroup: string;
}

export default function CalendarPage() {
  const [donations, setDonations] = useState<DonorDonation[]>([]);
  const [upcomingDonations, setUpcomingDonations] = useState<UpcomingDonation[]>([]);
  const [nextEligibleDate, setNextEligibleDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (isAdmin) {
        await fetchAdminData();
      } else if (user) {
        await fetchDonorData();
      }
      setLoading(false);
    };
    loadData();
  }, [user, isAdmin]);

  const fetchAdminData = async () => {
    try {
      const data = await mockService.getUpcomingDonations();
      setUpcomingDonations(data);
    } catch (error) {
      console.error('Error fetching admin calendar data:', error);
    }
  };

  const fetchDonorData = async () => {
    try {
      // Use mockService to align with Dashboard logic and support Demo Mode data isolation
      const donorId = String(user?.id);
      const donationsData = await mockService.getDonations(donorId);

      const mappedDonations = donationsData.map(d => ({
        date: new Date(d.donation_date),
        units: Number(d.units_donated),
      }));

      setDonations(mappedDonations);

      // Calculate next eligible date based on latest donation
      if (mappedDonations.length > 0) {
        // donationsData is already sorted desc by date in mockService
        const lastDonationDate = mappedDonations[0].date;
        const nextDate = calculateNextEligibleDate(lastDonationDate);
        setNextEligibleDate(nextDate);
      } else {
        setNextEligibleDate(new Date()); // Eligible now if never donated
      }
    } catch (error) {
      console.error('Error fetching donor data:', error);
    }
  };

  const handleAddDonation = (date: Date, units: number) => {
    const newDonation = { date, units };
    const updatedDonations = [...donations, newDonation];

    // Sort by date descending
    updatedDonations.sort((a, b) => b.date.getTime() - a.date.getTime());

    setDonations(updatedDonations);

    // Recalculate next eligible date based on the most recent donation
    if (updatedDonations.length > 0) {
      // Assuming first item is latest after sort
      setNextEligibleDate(calculateNextEligibleDate(updatedDonations[0].date));
    }

    // In a real app, we would persist this to Supabase here
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            {isAdmin ? 'Donation Schedule' : 'Donation Calendar'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isAdmin
              ? 'View upcoming scheduled donations and camps'
              : 'Track your donation history and upcoming eligible dates'}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : isAdmin ? (
          // Admin View
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Upcoming Donations</h2>
              {upcomingDonations.map((donation, index) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {(() => {
                          const d = new Date(donation.date);
                          return isNaN(d.getTime()) ? 'Soon' : format(d, 'MMMM d, yyyy');
                        })()}
                      </CardTitle>
                      <Badge>{donation.bloodGroup}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm font-bold mt-1">
                        <User className="h-4 w-4 text-primary" />
                        {donation.donorName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <MapPin className="h-3 w-3" />
                        {donation.location}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {upcomingDonations.length === 0 && (
                <p className="text-muted-foreground">No upcoming donations scheduled.</p>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border bg-muted/50 p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px]"
            >
              <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Calendar Overview</h3>
              <p className="text-muted-foreground mt-2 max-w-xs">
                Future updates will allow you to manage camp schedules directly from this calendar.
              </p>
            </motion.div>
          </div>
        ) : (
          // Donor View
          <>
            <DonationCalendar
              donations={donations}
              nextEligibleDate={nextEligibleDate}
              onAddDonation={handleAddDonation}
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border bg-card p-6"
              >
                <h3 className="font-semibold text-foreground">Total Donations</h3>
                <p className="mt-2 text-3xl font-bold text-primary">{donations.length}</p>
                <p className="text-sm text-muted-foreground">All-time donations</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border bg-card p-6"
              >
                <h3 className="font-semibold text-foreground">Total Units</h3>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {donations.reduce((sum, d) => sum + d.units, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Blood units donated</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border bg-card p-6"
              >
                <h3 className="font-semibold text-foreground">Lives Saved</h3>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {donations.reduce((sum, d) => sum + d.units, 0) * 3}
                </p>
                <p className="text-sm text-muted-foreground">Each unit saves up to 3 lives</p>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
