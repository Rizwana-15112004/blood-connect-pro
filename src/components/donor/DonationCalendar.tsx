import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { Droplets, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Donation {
  date: Date;
  units: number;
}

interface DonationCalendarProps {
  donations: Donation[];
  nextEligibleDate?: Date;
}

export function DonationCalendar({ donations, nextEligibleDate }: DonationCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const donationDates = donations.map(d => d.date);
  
  const modifiers = {
    donation: donationDates,
    eligible: nextEligibleDate ? [nextEligibleDate] : [],
  };

  const modifiersStyles = {
    donation: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'white',
      borderRadius: '50%',
    },
    eligible: {
      backgroundColor: 'hsl(var(--success))',
      color: 'white',
      borderRadius: '50%',
    },
  };

  const selectedDonation = donations.find(d => 
    selectedDate && isSameDay(d.date, selectedDate)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="chart-container"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Donation Calendar</h3>
        <p className="text-sm text-muted-foreground">Track your donation history</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="rounded-lg border p-3"
        />

        <div className="flex-1 space-y-4">
          {/* Legend */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Legend</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Donation Date</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">Next Eligible</span>
              </div>
            </div>
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, 'MMMM d, yyyy')}
              </p>
              {selectedDonation ? (
                <div className="mt-2 flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">
                    {selectedDonation.units} unit(s) donated
                  </span>
                </div>
              ) : nextEligibleDate && isSameDay(selectedDate, nextEligibleDate) ? (
                <div className="mt-2 flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-success" />
                  <span className="font-medium text-success">
                    Eligible to donate!
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-muted-foreground">No donation on this date</p>
              )}
            </div>
          )}

          {/* Upcoming */}
          {nextEligibleDate && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-4">
              <p className="text-sm font-medium text-success">Next Eligible Date</p>
              <p className="text-lg font-bold text-foreground">
                {format(nextEligibleDate, 'MMMM d, yyyy')}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
