import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Filter, Download, UserCheck, UserX } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BloodGroupBadge } from '@/components/donor/BloodGroupBadge';
import { Badge } from '@/components/ui/badge';
import { mockService, Donor } from '@/services/mockService';
// import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ...

export default function Donors() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<string>('all');
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDonor, setNewDonor] = useState({
    full_name: '',
    email: '',
    blood_group: 'A+',
    phone: '',
    city: '',
    state: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleaddDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mockService.addDonor({
        ...newDonor,
        blood_group: newDonor.blood_group as any,
        date_of_birth: '1990-01-01', // Default for demo
        gender: 'other', // Default
        weight: 70, // Default
        has_chronic_disease: false,
        is_on_medication: false,
        is_pregnant: false
      });
      toast({
        title: "Success",
        description: `${newDonor.full_name} has been registered.`
      });
      setShowAddForm(false);
      fetchDonors(); // Refresh list
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to register donor.",
        variant: "destructive"
      });
    }
  };

  const fetchDonors = async () => {
    try {
      const data = await mockService.getDonors();
      setDonors(data);
    } catch (error) {
      console.error('Error fetching donors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch =
      donor.full_name.toLowerCase().includes(search.toLowerCase()) ||
      donor.email.toLowerCase().includes(search.toLowerCase()) ||
      (donor.phone && donor.phone.includes(search));

    const matchesBloodGroup = bloodGroupFilter === 'all' || donor.blood_group === bloodGroupFilter;
    const matchesEligibility =
      eligibilityFilter === 'all' ||
      (eligibilityFilter === 'eligible' && donor.is_eligible) ||
      (eligibilityFilter === 'ineligible' && !donor.is_eligible);

    return matchesSearch && matchesBloodGroup && matchesEligibility;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Donor Directory</h1>
              <p className="mt-1 text-muted-foreground">
                Manage and view registered blood donors
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Cancel' : 'Register New Donor'}
              </Button>
            )}
          </div>

          {isAdmin && showAddForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 border rounded-xl bg-card shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Register New Donor</h3>
              <form onSubmit={handleaddDonor} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input required value={newDonor.full_name} onChange={e => setNewDonor({ ...newDonor, full_name: e.target.value })} placeholder="Ex: John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input required type="email" value={newDonor.email} onChange={e => setNewDonor({ ...newDonor, email: e.target.value })} placeholder="ex@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Blood Group</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={newDonor.blood_group}
                    onChange={e => setNewDonor({ ...newDonor, blood_group: e.target.value })}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input value={newDonor.phone} onChange={e => setNewDonor({ ...newDonor, phone: e.target.value })} placeholder="+1 234..." />
                </div>
                <div className="col-span-2">
                  <Button type="submit" className="w-full">Register Donor</Button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search donors by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Blood Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blood Groups</SelectItem>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eligibilityFilter} onValueChange={setEligibilityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Eligibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="eligible">Eligible</SelectItem>
              <SelectItem value="ineligible">Not Eligible</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4"
        >
          <Badge variant="secondary" className="gap-2 px-4 py-2">
            <Users className="h-4 w-4" />
            {filteredDonors.length} Donors
          </Badge>
          <Badge variant="secondary" className="gap-2 px-4 py-2 bg-green-100 text-green-700">
            <UserCheck className="h-4 w-4" />
            {filteredDonors.filter(d => d.is_eligible).length} Eligible
          </Badge>
          <Badge variant="secondary" className="gap-2 px-4 py-2 bg-red-100 text-red-700">
            <UserX className="h-4 w-4" />
            {filteredDonors.filter(d => !d.is_eligible).length} Not Eligible
          </Badge>
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
                <TableHead>Contact</TableHead>
                <TableHead>Donations</TableHead>
                <TableHead>Last Donation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading donors...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDonors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center text-muted-foreground">
                    No donors found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredDonors.map((donor, index) => (
                  <motion.tr
                    key={donor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t transition-colors hover:bg-muted/30 cursor-pointer"
                    onClick={() => navigate(`/donors/${donor.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{donor.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{donor.gender}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <BloodGroupBadge bloodGroup={donor.blood_group} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{donor.email}</p>
                        <p className="text-xs text-muted-foreground">{donor.phone || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">{donor.total_donations}</span>
                    </TableCell>
                    <TableCell>
                      {donor.last_donation_date ? (
                        format(new Date(donor.last_donation_date), 'MMM d, yyyy')
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          donor.is_eligible
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : 'bg-red-100 text-red-700 hover:bg-red-100'
                        }
                      >
                        {donor.is_eligible ? 'Eligible' : 'Not Eligible'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(donor.registered_at), 'MMM d, yyyy')}
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
