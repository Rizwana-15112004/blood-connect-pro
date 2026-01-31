
import { AlertCircle, Droplets } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UrgentBloodAlertProps {
    inventory: { blood_group: string; units_available: number }[];
    threshold?: number;
}

export function UrgentBloodAlert({ inventory, threshold = 10 }: UrgentBloodAlertProps) {
    const lowStockGroups = inventory.filter(item => item.units_available < threshold);

    if (lowStockGroups.length === 0) return null;

    return (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 animate-pulse" />
                    <CardTitle className="text-lg font-bold">Urgent Blood Needs</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-sm text-red-600 dark:text-red-300">
                    The following blood groups are critically low in stock. Immediate donor outreach is recommended.
                </p>
                <div className="flex flex-wrap gap-3">
                    {lowStockGroups.map((group) => (
                        <div key={group.blood_group} className="flex items-center gap-3 rounded-lg bg-white/60 p-2 pr-4 shadow-sm dark:bg-black/20">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                <span className="font-bold">{group.blood_group}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available</span>
                                <span className={`text-sm font-bold ${group.units_available < 5 ? 'text-red-600' : 'text-orange-600'}`}>
                                    {group.units_available} Units
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
