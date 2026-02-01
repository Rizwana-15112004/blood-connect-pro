import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Droplets, Calendar as CalendarIcon, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BloodGroupBadge } from '@/components/donor/BloodGroupBadge';
import { mockService, Donation } from '@/services/mockService'; // Use new mock service types
import { api } from '@/services/api';
// import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// interface Donation ... (Imported from mockData)

interface Donor {
  id: string;
  full_name: string;
  blood_group: string;
}

export default function Donations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<string>('');
  const [units, setUnits] = useState<string>('1');
  const [donationCenter, setDonationCenter] = useState('');
  const [collectedBy, setCollectedBy] = useState('');
  const { isAdmin, user } = useAuth(); // Get user for ID
  const { toast } = useToast();

  useEffect(() => {
    fetchDonations();
    if (isAdmin) {
      fetchDonors();
    }
  }, [isAdmin]);

  const fetchDonations = async () => {
    try {
      let data;
      if (isAdmin) {
        // Admin sees ALL donations
        data = await mockService.getDonations();
      } else if (user?.id) {
        // User sees only THEIR donations
        data = await mockService.getDonations(String(user.id));
      } else {
        data = [];
      }
      setDonations(data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonors = async () => {
    try {
      const data = await mockService.getDonors();
      setDonors(data.map(d => ({ id: d.id, full_name: d.full_name, blood_group: d.blood_group })));
    } catch (error) {
      console.error('Error fetching donors:', error);
    }
  };

  const handleAddDonation = async () => {
    if (!selectedDonor || !units) {
      toast({
        title: 'Missing Information',
        description: 'Please select a donor and enter units.',
        variant: 'destructive',
      });
      return;
    }

    const donor = donors.find(d => d.id === selectedDonor);
    if (!donor) return;

    try {
      // Mock insertion
      await api.logDonation({
        donor_id: selectedDonor,
        units: units,
        bloodGroup: donor.blood_group,
        center: donationCenter || 'Main Center',
        collected_by: collectedBy || 'Staff'
      }, selectedDonor);

      toast({
        title: 'Donation Recorded',
        description: `Successfully recorded ${units} unit(s) from ${donor.full_name}`,
      });

      setIsDialogOpen(false);
      setSelectedDonor('');
      setUnits('1');
      setDonationCenter('');
      setCollectedBy('');
      fetchDonations(); // Refresh list (won't actually show new item since mock data is static, but logic holds)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredDonations = donations.filter(donation => {
    const donorName = donation.donors?.full_name || '';
    return (
      donorName.toLowerCase().includes(search.toLowerCase()) ||
      donation.blood_group.toLowerCase().includes(search.toLowerCase()) ||
      (donation.donation_center && donation.donation_center.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalUnits = filteredDonations.reduce((sum, d) => sum + Number(d.units_donated), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Donations</h1>
            <p className="mt-1 text-muted-foreground">
              Track and manage all blood donations
            </p>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Record Donation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record New Donation</DialogTitle>
                  <DialogDescription>
                    Add a new blood donation record to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="donor">Donor</Label>
                    <Select value={selectedDonor} onValueChange={setSelectedDonor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a donor" />
                      </SelectTrigger>
                      <SelectContent>
                        {donors.map(donor => (
                          <SelectItem key={donor.id} value={donor.id}>
                            {donor.full_name} ({donor.blood_group})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="units">Units Donated</Label>
                    <Input
                      id="units"
                      type="number"
                      min="0.5"
                      max="3"
                      step="0.5"
                      value={units}
                      onChange={(e) => setUnits(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="center">Donation Center</Label>
                    <Input
                      id="center"
                      placeholder="e.g., City Blood Bank"
                      value={donationCenter}
                      onChange={(e) => setDonationCenter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collector">Collected By</Label>
                    <Input
                      id="collector"
                      placeholder="Staff name"
                      value={collectedBy}
                      onChange={(e) => setCollectedBy(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDonation}>Record Donation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
            <Droplets className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">
              {filteredDonations.length} Donations
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2">
            <Droplets className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-700">
              {totalUnits} Total Units
            </span>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-md"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search donations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card overflow-hidden shadow-card"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Donor</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Collected By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading donations...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDonations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center text-muted-foreground">
                    No donations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDonations.map((donation, index) => (
                  <motion.tr
                    key={donation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t transition-colors hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">
                          {donation.donors?.full_name || 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <BloodGroupBadge bloodGroup={donation.blood_group} />
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">
                        {donation.units_donated}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(donation.donation_date), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {donation.donation_center || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {donation.collected_by || '-'}
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
