
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Award, Heart, ShieldCheck, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateProps {
    donation: {
        donor_name?: string;
        donors?: { full_name: string };
        blood_group: string;
        donation_date: string;
        donation_center?: string;
        units_donated: number;
        id: string;
    };
}

export const DonationCertificate: React.FC<CertificateProps> = ({ donation }) => {
    const certificateRef = useRef<HTMLDivElement>(null);

    const donorName = donation.donors?.full_name || donation.donor_name || 'Valued Donor';
    const donationDate = (() => {
        const d = new Date(donation.donation_date);
        return isNaN(d.getTime()) ? 'Recently' : format(d, 'MMMM do, yyyy');
    })();

    const downloadPDF = async () => {
        if (!certificateRef.current) return;

        const canvas = await html2canvas(certificateRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`Donation_Certificate_${donation.id}.pdf`);
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Certificate Preview Card */}
            <div
                ref={certificateRef}
                className="relative w-[800px] h-[560px] bg-white border-[16px] border-double border-red-800 p-12 overflow-hidden flex flex-col items-center justify-between text-center font-serif text-slate-900 shadow-2xl rounded-sm"
                style={{ fontFamily: "'Playfair Display', serif" }}
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

                {/* Header */}
                <div className="w-full flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-12 h-12 text-red-700" />
                        <div className="text-left font-sans">
                            <p className="text-xs font-bold text-red-800 uppercase tracking-widest">Blood Connect Pro</p>
                            <p className="text-[10px] text-slate-500 italic">Saving Lives, One Drop at a Time</p>
                        </div>
                    </div>
                    <div className="text-right font-sans">
                        {/* ID removed for professional design */}
                    </div>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center gap-4 py-4">
                    <Award className="w-16 h-16 text-yellow-500 mb-2" />
                    <h1 className="text-5xl font-bold italic text-slate-800 border-b-2 border-red-800 pb-2 px-8">Certificate of Recognition</h1>
                    <p className="text-xl text-slate-600 mt-4">We proudly honor and appreciate the selfless contribution of</p>
                    <h2 className="text-5xl font-bold text-red-900 my-4 drop-shadow-sm">{donorName}</h2>
                    <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                        In recognition of your exceptional humanitarian service and dedication to saving lives by donating <span className="font-bold text-slate-800 text-2xl mx-1">{donation.units_donated} Unit(s)</span> of <span className="font-bold text-red-700 text-2xl mx-1">{donation.blood_group}</span> blood.
                    </p>
                </div>

                {/* Footer Details */}
                <div className="w-full grid grid-cols-3 gap-8 mt-4 pt-8 border-t border-slate-200">
                    <div className="flex flex-col items-center gap-1">
                        <Calendar className="w-5 h-5 text-red-700" />
                        <p className="text-xs font-sans text-slate-400 uppercase tracking-tight">Date of Donation</p>
                        <p className="text-sm font-bold font-sans">{donationDate}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-12 border-b border-slate-400 mb-1 flex items-end justify-center">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-16 h-16 grayscale opacity-80" alt="signature" />
                        </div>
                        <p className="text-xs font-sans text-slate-400 uppercase tracking-tight">Signed by Medical Director</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <MapPin className="w-5 h-5 text-red-700" />
                        <p className="text-xs font-sans text-slate-400 uppercase tracking-tight">Donation Center</p>
                        <p className="text-sm font-bold font-sans">{donation.donation_center || 'Blood Connect Pro Center'}</p>
                    </div>
                </div>

                {/* Bottom Tagline */}
                <div className="mt-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-600 fill-red-600" />
                    <p className="text-xs font-sans font-medium text-slate-400 uppercase tracking-[0.2em]">Your compassion saves lives</p>
                    <Heart className="w-4 h-4 text-red-600 fill-red-600" />
                </div>
            </div>

            <Button
                onClick={downloadPDF}
                size="lg"
                className="gap-2 bg-red-700 hover:bg-red-800 shadow-lg px-8 py-6 text-lg rounded-full"
            >
                <Download className="w-5 h-5" />
                Download Certificate (PDF)
            </Button>
        </div>
    );
};
