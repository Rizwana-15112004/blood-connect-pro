import { useState } from 'react';
import { Search, MapPin, Droplets, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { mockService } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function BloodSearchSection() {
    const [bloodGroup, setBloodGroup] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);
    const [expandedDonorId, setExpandedDonorId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bloodGroup) {
            toast({
                title: "Blood Group Required",
                description: "Please select a blood group to search.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        setResults(null);

        try {
            // Simulate API search using mock data
            const inventory = await mockService.getInventory();
            const donors = await mockService.getDonors();

            // Artificial delay for realism
            await new Promise(resolve => setTimeout(resolve, 800));

            // Filter Inventory
            const availableStock = inventory.find(i => i.blood_group === bloodGroup);

            // Filter Donors (simple city match if provided)
            const matchingDonors = donors.filter(d =>
                d.blood_group === bloodGroup &&
                d.is_eligible &&
                (location ? d.city?.toLowerCase().includes(location.toLowerCase()) : true)
            );

            setResults([{
                type: 'stock',
                units: availableStock?.units_available || 0,
                donors: matchingDonors.length,
                donorsList: matchingDonors // Pass actual donor list for display
            }]);

        } catch (error) {
            console.error("Search failed:", error);
            toast({ title: "Error", description: "Search failed. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-16 bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left scale-110" />

            <div className="relative container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-4">Find Blood Availability</h2>
                    <p className="text-muted-foreground">Search for available blood stock and active donors in your area.</p>
                </div>

                <div className="bg-card shadow-lg rounded-2xl p-6 border">
                    <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-1">
                            <Select value={bloodGroup} onValueChange={setBloodGroup}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Blood Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-2 relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="City or Location (Optional)"
                                className="pl-9"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <span className="animate-spin mr-2">⏳</span> : <Search className="mr-2 h-4 w-4" />}
                                Search
                            </Button>
                        </div>
                    </form>
                </div>

                <AnimatePresence>
                    {results && results.map((result, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-8 grid gap-4 md:grid-cols-2"
                        >
                            <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium mb-1">Available Stock</p>
                                    <p className="text-3xl font-bold text-primary">{result.units} Units</p>
                                    <p className="text-xs text-green-600 mt-1">Ready for dispatch</p>
                                </div>
                                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Droplets className="h-6 w-6 text-primary" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium mb-1">Eligible Donors</p>
                                    <p className="text-3xl font-bold text-blue-600">{result.donors}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Registered & Available</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-50/50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>

                            {/* Donor List with Contact Details */}
                            {result.donorsList && result.donorsList.length > 0 && (
                                <div className="md:col-span-2 space-y-3 mt-4">
                                    <h3 className="font-semibold text-lg">Available Donors</h3>
                                    {result.donorsList.map((donor: any) => (
                                        <div key={donor.id} className="bg-card border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <p className="font-medium">{donor.full_name}</p>
                                                <p className="text-sm text-muted-foreground">{donor.city}, {donor.state}</p>
                                            </div>
                                            {/* Show Contact Button or Details */}
                                            {expandedDonorId === donor.id ? (
                                                <div className="flex flex-col gap-1 text-sm text-right">
                                                    <a href={`tel:${donor.phone}`} className="text-primary font-medium hover:underline flex items-center justify-end gap-1">
                                                        📞 {donor.phone}
                                                    </a>
                                                    <a href={`mailto:${donor.email}`} className="text-muted-foreground hover:underline flex items-center justify-end gap-1">
                                                        ✉️ {donor.email}
                                                    </a>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setExpandedDonorId(donor.id)}
                                                >
                                                    Contact Donor
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {result.units === 0 && result.donors === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="md:col-span-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-6 text-center"
                                >
                                    <div className="flex justify-center mb-4">
                                        <div className="h-16 w-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center animate-pulse">
                                            <div className="h-8 w-8 text-3xl">🏥</div>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                                        Urgent Requirement?
                                    </h3>
                                    <p className="text-red-600/80 dark:text-red-400/80 mb-6 max-w-md mx-auto">
                                        No individual donors are currently available online for this blood group.
                                        Please contact the Central Blood Bank directly.
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto gap-2">
                                            <span className="text-lg">📞</span> Call Blood Bank: 1800-BLOOD-HELP
                                        </Button>
                                        <Button variant="outline" size="lg" className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-100 gap-2">
                                            <span className="text-lg">📍</span> View Nearby Hospitals
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}
