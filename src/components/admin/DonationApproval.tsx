import { useState, useEffect } from 'react';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { mockService } from '@/services/mockService';

interface PendingDonation {
    id: string; // Updated to string to match mockService
    donor_name: string;
    units: number; // Updated to number
    blood_group: string;
    center: string;
    date: string;
}

export function DonationApproval() {
    const [donations, setDonations] = useState<PendingDonation[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchPendingDonations();
    }, []);

    const fetchPendingDonations = async () => {
        try {
            const data = await mockService.getUnverifiedDonations();
            // Map mock service data to component state if helpful, but they match well enough now
            setDonations(data);
        } catch (error) {
            console.error('Error fetching pending donations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (donationId: string, action: 'approve' | 'reject') => {
        try {
            const res = await mockService.verifyDonation(donationId, action);

            if (res.success) {
                toast({
                    title: action === 'approve' ? "Donation Verified" : "Donation Rejected",
                    description: `Successfully ${action}ed donation #${donationId}`,
                });
                // Remove from list
                setDonations(prev => prev.filter(d => d.id !== donationId));
            } else {
                throw new Error("Action failed");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to process request. Please try again.",
                variant: "destructive"
            });
        }
    };

    if (loading) return <div className="text-center py-4">Loading pending donations...</div>;

    if (donations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-xl border-dashed border-2">
                <Check className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground font-medium">No pending donations to verify.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-lg">Pending Verifications</h3>
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold">
                    {donations.length}
                </span>
            </div>

            <AnimatePresence>
                {donations.map(donation => (
                    <motion.div
                        key={donation.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900/50 rounded-lg shadow-sm"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">{donation.donor_name}</span>
                                <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">
                                    {donation.blood_group}
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-4">
                                <span>Units: <strong className="text-foreground">{donation.units}</strong></span>
                                <span>Center: {donation.center}</span>
                                <span>{format(new Date(donation.date), "MMM d, yyyy")}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 md:flex-none border-red-200 hover:bg-red-50 text-red-600"
                                onClick={() => handleAction(donation.id, 'reject')}
                            >
                                <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAction(donation.id, 'approve')}
                            >
                                <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
