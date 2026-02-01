import { motion } from 'framer-motion';
import { Award, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Donor } from '@/types';
import { jsPDF } from 'jspdf';

interface CertificateCardProps {
    donor: Donor;
}

export function CertificateCard({ donor }: CertificateCardProps) {
    const { toast } = useToast();

    const handleDownload = () => {
        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });

            // Colors
            const primaryColor = '#dc2626'; // Red
            const goldColor = '#d97706';    // Amber

            // Border
            doc.setLineWidth(2);
            doc.setDrawColor(goldColor);
            doc.rect(10, 10, 277, 190);
            doc.setLineWidth(1);
            doc.setDrawColor(primaryColor);
            doc.rect(15, 15, 267, 180);

            // Mock Logo Placeholder (Text)
            doc.setFontSize(24);
            doc.setTextColor(primaryColor);
            doc.setFont("helvetica", "bold");
            doc.text("BloodConnect Pro", 148.5, 40, { align: 'center' });

            // Title
            doc.setFontSize(40);
            doc.setTextColor(goldColor);
            doc.setFont("times", "bolditalic");
            doc.text("Certificate of Appreciation", 148.5, 70, { align: 'center' });

            // Presented to
            doc.setFontSize(16);
            doc.setTextColor('#333333');
            doc.setFont("helvetica", "normal");
            doc.text("This certificate is proudly presented to", 148.5, 95, { align: 'center' });

            // Name
            doc.setFontSize(32);
            doc.setTextColor('#000000');
            doc.setFont("helvetica", "bold");
            doc.text(donor.full_name.toUpperCase(), 148.5, 115, { align: 'center' });
            doc.setLineWidth(0.5);
            doc.line(70, 117, 227, 117); // Underline

            // Achievement
            doc.setFontSize(16);
            doc.setTextColor('#333333');
            doc.setFont("helvetica", "normal");
            doc.text(`In recognition of your selfless contribution of`, 148.5, 135, { align: 'center' });

            doc.setFontSize(22);
            doc.setTextColor(primaryColor);
            doc.setFont("helvetica", "bold");
            doc.text(`${donor.total_donations} Blood Donations`, 148.5, 148, { align: 'center' });

            doc.setFontSize(16);
            doc.setTextColor('#333333');
            doc.setFont("helvetica", "normal");
            doc.text(`helping to save lives and support our community.`, 148.5, 160, { align: 'center' });

            // Date & Signature
            const today = new Date().toLocaleDateString();
            doc.setFontSize(12);
            doc.text(`Date: ${today}`, 50, 180);
            doc.text("_______________________", 220, 180);
            doc.text("Authorized Signature", 225, 187);

            doc.save(`Certificate_${donor.full_name.replace(/\s+/g, '_')}.pdf`);

            toast({
                title: 'Certificate Downloaded',
                description: 'Your Certificate of Appreciation has been saved.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Download Failed',
                description: 'Could not generate certificate. Please try again.',
                variant: 'destructive',
            });
        }
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
                        Download Certificate
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
