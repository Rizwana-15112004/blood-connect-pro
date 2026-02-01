import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, User, MapPin, Search, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockService, BloodRequest, Donor } from '@/services/mockService';
import { api } from '@/services/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function AdminRequestManager() {
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [donors, setDonors] = useState<Donor[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection State for Approval
    const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
    const [selectedDonorId, setSelectedDonorId] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [allRequests, allDonors] = await Promise.all([
            mockService.getRequests(),
            mockService.getDonors()
        ]);
        setRequests(allRequests);
        setDonors(allDonors);
        setLoading(false);
    };

    const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
        if (status === 'approved') {
            // Open modal to assign donor
            const req = requests.find(r => r.id === id);
            if (req) {
                setSelectedRequest(req);
                setIsDialogOpen(true);
            }
        } else {
            // Reject immediately
            await mockService.updateRequestStatus(id, 'rejected');
            toast.info("Request rejected");
            loadData();
        }
    };

    const confirmApproval = async () => {
        if (selectedRequest && selectedDonorId) {
            try {
                await api.allocateDonor(selectedRequest.id, selectedDonorId, 'approved');
                const donorName = donors.find(d => d.id === selectedDonorId)?.full_name;
                toast.success(`Donor allocated! A real email has been sent to the requester (${selectedRequest.requester_email || 'Not provided'}) with the donor's details.`);
                setIsDialogOpen(false);
                setSelectedRequest(null);
                setSelectedDonorId('');
                loadData();
            } catch (error: any) {
                toast.error(error.message || "Failed to allocate donor");
            }
        } else {
            toast.warning("Please select a donor to assign.");
        }
    };

    // Filter donors for the modal (matching blood group + location logic simulation)
    const getCompatibleDonors = (bloodGroup: string) => {
        // Exact match + O- (universal)
        // For simplicity, strict match or O-
        return donors.filter(d =>
            (d.blood_group === bloodGroup || d.blood_group === 'O-') &&
            d.is_eligible // Only eligible donors
        );
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const pastRequests = requests.filter(r => r.status !== 'pending');

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Pending Requests */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        Pending Requests <Badge>{pendingRequests.length}</Badge>
                    </h3>
                    {pendingRequests.map(req => (
                        <Card key={req.id} className="border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-lg">{req.patient_name}</h4>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-3 w-3" /> {req.location}
                                            </div>
                                            {req.requester_email && (
                                                <div className="flex items-center gap-2 text-xs text-primary font-medium">
                                                    <Mail className="h-3 w-3" /> {req.requester_email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-base px-3 py-1 bg-white dark:bg-slate-900 font-bold text-red-600 border-red-200">
                                        {req.blood_group} ({req.units}u)
                                    </Badge>
                                </div>

                                <p className="text-sm bg-white/50 dark:bg-slate-900/50 p-2 rounded mb-4 italic">
                                    Reason: {req.reason}
                                </p>

                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        size="sm"
                                        onClick={() => handleStatusChange(req.id, 'approved')}
                                    >
                                        <Check className="h-4 w-4 mr-1" /> Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        size="sm"
                                        onClick={() => handleStatusChange(req.id, 'rejected')}
                                    >
                                        <X className="h-4 w-4 mr-1" /> Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {pendingRequests.length === 0 && (
                        <div className="text-center p-8 border rounded-lg bg-muted/50 text-muted-foreground">
                            No pending requests.
                        </div>
                    )}
                </div>

                {/* Recent History */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Request History</h3>
                    <div className="rounded-lg border bg-card">
                        {pastRequests.slice(0, 5).map((req, idx) => (
                            <div key={req.id} className={`p-4 flex items-center justify-between ${idx !== 0 ? 'border-t' : ''}`}>
                                <div>
                                    <p className="font-medium">{req.patient_name}</p>
                                    <p className="text-xs text-muted-foreground">{format(new Date(req.created_at || new Date()), 'MMM d')} • {req.location}</p>
                                </div>
                                <div className="text-right">
                                    <Badge variant={req.status === 'approved' ? 'default' : 'destructive'} className={req.status === 'approved' ? 'bg-green-600' : ''}>
                                        {req.status}
                                    </Badge>
                                    {req.status === 'approved' && req.assigned_donor_id && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Assigned: {donors.find(d => d.id === req.assigned_donor_id)?.full_name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Approval Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Donor for {selectedRequest?.patient_name}</DialogTitle>
                        <DialogDescription>
                            Searching for compatible donors ({selectedRequest?.blood_group}) near {selectedRequest?.location}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Filter donors..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>

                        <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2">
                            {selectedRequest && getCompatibleDonors(selectedRequest.blood_group)
                                .filter(d => d.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(donor => (
                                    <div
                                        key={donor.id}
                                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer border transition-colors ${selectedDonorId === donor.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                                        onClick={() => setSelectedDonorId(donor.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{donor.full_name}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> {donor.city || 'Unknown City'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline">{donor.blood_group}</Badge>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={confirmApproval} disabled={!selectedDonorId}>
                            Confirm Allocation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
