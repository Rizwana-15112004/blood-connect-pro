import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, CheckCircle, XCircle, MapPin, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockService, BloodRequest, Donor } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function BloodRequestSection({ userId }: { userId: number | string }) {
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [donors, setDonors] = useState<Donor[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        patient_name: '',
        blood_group: '',
        units: '1',
        reason: '',
        location: ''
    });

    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        const [allRequests, allDonors] = await Promise.all([
            mockService.getRequests(),
            mockService.getDonors()
        ]);
        // Filter for current user
        const userRequests = allRequests.filter(r => r.requester_id === String(userId));
        setRequests(userRequests);
        setDonors(allDonors);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await mockService.addRequest({
                requester_id: String(userId),
                patient_name: formData.patient_name,
                blood_group: formData.blood_group,
                units: parseInt(formData.units),
                reason: formData.reason,
                location: formData.location
            });

            toast.success("Blood request submitted successfully");
            setIsOpen(false);
            setFormData({ patient_name: '', blood_group: '', units: '1', reason: '', location: '' });
            loadData(); // Refresh
        } catch (error) {
            toast.error("Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    const getDonorName = (id: string | null) => {
        if (!id) return null;
        return donors.find(d => d.id === id)?.full_name || 'Unknown Donor';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">My Blood Requests</h2>
                    <p className="text-muted-foreground">Manage your requests for blood donation.</p>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4" /> Request Blood
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Request Blood Donation</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to request blood. We will notify eligible donors nearby.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="patient">Patient Name</Label>
                                        <Input
                                            id="patient"
                                            required
                                            value={formData.patient_name}
                                            onChange={e => setFormData({ ...formData, patient_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bg">Blood Group</Label>
                                        <Select onValueChange={v => setFormData({ ...formData, blood_group: v })} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="units">Units Required</Label>
                                        <Input
                                            id="units"
                                            type="number"
                                            min="1"
                                            max="10"
                                            required
                                            value={formData.units}
                                            onChange={e => setFormData({ ...formData, units: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Hospital/Location</Label>
                                        <Input
                                            id="location"
                                            required
                                            placeholder="e.g. City Hospital"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason">Medical Reason</Label>
                                    <Textarea
                                        id="reason"
                                        required
                                        placeholder="Brief description of the medical need"
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requests.map((req) => (
                    <motion.div
                        key={req.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="overflow-hidden border-l-4" style={{
                            borderLeftColor: req.status === 'approved' ? '#22c55e' : req.status === 'rejected' ? '#ef4444' : '#eab308'
                        }}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {req.patient_name}
                                            <Badge variant="outline" className={getStatusColor(req.status)}>
                                                {req.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                                {req.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                {req.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                            </Badge>
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">{format(new Date(req.request_date), 'MMM d, yyyy')}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 font-bold border border-red-200 dark:border-red-800">
                                        {req.blood_group}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <FileText className="h-4 w-4" />
                                        <span>{req.units} Unit(s)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span className="truncate" title={req.location}>{req.location}</span>
                                    </div>
                                </div>

                                {req.reason && (
                                    <p className="text-sm bg-muted/50 p-2 rounded-md italic">
                                        "{req.reason}"
                                    </p>
                                )}

                                {req.status === 'approved' && req.assigned_donor_id && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-xs font-semibold text-green-600 mb-2">DONOR ASSIGNED</p>
                                        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                                            <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center text-green-700">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{getDonorName(req.assigned_donor_id)}</p>
                                                <p className="text-xs text-muted-foreground">Contact details shared via email</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

                {requests.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
                        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No Request Found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                            You haven't made any blood requests yet. Click the "Request Blood" button to create one.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
