import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Activity, MapPin, Phone, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RequestBlood() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        patientName: '',
        bloodGroup: '',
        hospital: '',
        city: '',
        contactNumber: '',
        urgency: '',
        additionalNotes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Real API call
        try {
            const getCookie = (name: string) => {
                let cookieValue = null;
                if (document.cookie && document.cookie !== '') {
                    const cookies = document.cookie.split(';');
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i].trim();
                        if (cookie.substring(0, name.length + 1) === (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            };

            const response = await fetch('/api/request-blood', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || ''
                },
                body: JSON.stringify(formData),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Submission failed');

            toast({
                title: "Request Submitted Successfully",
                description: "An admin will verify your request and allocate a donor shortly.",
                className: "bg-green-600 text-white border-none"
            });

            // Reset form
            setFormData({
                patientName: '',
                bloodGroup: '',
                hospital: '',
                city: '',
                contactNumber: '',
                urgency: '',
                additionalNotes: ''
            });

        } catch (error) {
            console.error(error);
            toast({
                title: "Submission Failed",
                description: error instanceof Error ? error.message : "Please try again later.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container max-w-3xl py-24 mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-2 shadow-xl">
                        <CardHeader className="text-center bg-muted/30 pb-8 border-b">
                            <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4 text-red-600">
                                <Heart className="h-8 w-8 fill-current" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-foreground">Request Blood</CardTitle>
                            <CardDescription className="text-lg mt-2 max-w-md mx-auto">
                                Submit a request for blood. Our admins will verify and connect you with the nearest eligible donor.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="patientName">Patient Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="patientName"
                                                placeholder="Full Name"
                                                className="pl-9"
                                                required
                                                value={formData.patientName}
                                                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bloodGroup">Blood Group Needed</Label>
                                        <Select
                                            required
                                            onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                                            value={formData.bloodGroup}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="hospital">Hospital Name</Label>
                                        <div className="relative">
                                            <Activity className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="hospital"
                                                placeholder="Hospital Name"
                                                className="pl-9"
                                                required
                                                value={formData.hospital}
                                                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">City / Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="city"
                                                placeholder="City"
                                                className="pl-9"
                                                required
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contactNumber">Contact Number (Private)</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="contactNumber"
                                                placeholder="Primary Contact"
                                                className="pl-9"
                                                required
                                                type="tel"
                                                value={formData.contactNumber}
                                                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">This number will only be visible to admins.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="urgency">Urgency Level</Label>
                                        <Select
                                            required
                                            onValueChange={(val) => setFormData({ ...formData, urgency: val })}
                                            value={formData.urgency}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Urgency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Standard (Within 24h)</SelectItem>
                                                <SelectItem value="medium">Urgent (Within 6h)</SelectItem>
                                                <SelectItem value="critical">Critical (Immediate)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any specific requirements or medical details..."
                                        className="min-h-[100px]"
                                        value={formData.additionalNotes}
                                        onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" size="lg" className="w-full text-lg h-12" disabled={loading}>
                                        {loading ? 'Submitting Request...' : 'Submit Request'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
