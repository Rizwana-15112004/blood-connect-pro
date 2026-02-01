import { AlertCircle } from "lucide-react";
import { api } from "@/services/api";

export function DemoBanner() {
    if (!api.isMockMode) return null;

    return (
        <div className="bg-amber-100 text-amber-800 px-4 py-2 text-sm text-center border-b border-amber-200 flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>
                <strong>Demo Mode:</strong> You are viewing a static preview. Backend features are simulated.
            </span>
        </div>
    );
}
