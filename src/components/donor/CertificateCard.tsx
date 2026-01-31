import { motion } from 'framer-motion';
import { Award, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Donor } from '@/lib/mockData';

interface CertificateCardProps {
    donor: Donor;
}

export function CertificateCard({ donor }: CertificateCardProps) {
    const { toast } = useToast();

    const handleDownload = () => {
        // Simulate download
        toast({
            title: 'Certificate Downloaded',
            description: 'Your Certificate of Appreciation has been saved.',
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:from-amber-950/20 dark:to-orange-950/20"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Award className="h-40 w-40 text-amber-500" />
            </div>

            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                    <Award className="h-6 w-6" />
                </div>

                <div>
                    <h3 className="text-xl font-bold text-foreground">Certificate of Appreciation</h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-[80%]">
                        Recognizing your commitment to saving lives. You have made {donor.total_donations} donations!
                    </p>
                </div>

                <div className="mt-2 flex gap-3">
                    <Button onClick={handleDownload} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                    <Button variant="outline" className="gap-2 border-amber-200 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/50">
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
