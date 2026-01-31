import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { motion } from 'framer-motion';
import { format, isSameDay, addMonths } from 'date-fns';
import { Droplets, CalendarCheck, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Donation {
  date: Date;
  units: number;
}

interface DonationCalendarProps {
  donations: Donation[];
  nextEligibleDate?: Date;
  onAddDonation?: (date: Date, units: number) => void;
}

export function DonationCalendar({ donations, nextEligibleDate, onAddDonation }: DonationCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [units, setUnits] = useState<string>("1"); // Input state

  const donationDates = donations.map(d => d.date);

  const modifiers = {
    donation: donationDates,
    eligible: nextEligibleDate ? [nextEligibleDate] : [],
  };

  const modifiersStyles = {
    donation: {
      backgroundColor: '#ef4444', // Red-500
      color: 'white',
      borderRadius: '50%',
    },
    eligible: {
      backgroundColor: '#22c55e', // Green-500
      color: 'white',
      borderRadius: '50%',
    },
  };

  const selectedDonation = donations.find(d =>
    selectedDate && isSameDay(d.date, selectedDate)
  );

  const handleAddClick = () => {
    if (selectedDate && onAddDonation) {
      const numUnits = parseInt(units);
      if (numUnits > 0) {
        onAddDonation(selectedDate, numUnits);
        // Reset or feedback?
      }
    }
  };

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
                <div className="h-4 w-4 rounded-full bg-red-500" />
                <span className="text-sm text-muted-foreground">Donation Date</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Next Eligible</span>
              </div>
            </div>
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground mb-2">
                {format(selectedDate, 'MMMM d, yyyy')}
              </p>

              {selectedDonation ? (
                <div className="mt-2 flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-foreground">
                    {selectedDonation.units} unit(s) donated
                  </span>
                </div>
              ) : nextEligibleDate && isSameDay(selectedDate, nextEligibleDate) ? (
                <div className="mt-2 flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-500">
                    Eligible to donate!
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">No donation recorded.</p>

                  {onAddDonation && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label htmlFor="units" className="text-xs">Record past donation:</Label>
                      <div className="flex gap-2">
                        <Input
                          id="units"
                          type="number"
                          min="1"
                          max="5"
                          value={units}
                          onChange={(e) => setUnits(e.target.value)}
                          className="w-20 h-9"
                        />
                        <Button size="sm" onClick={handleAddClick} className="h-9 gap-1">
                          <Plus className="h-3.5 w-3.5" />
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upcoming */}
          {nextEligibleDate && (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800 p-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Next Eligible Date</p>
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
