import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

const TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes

export function useAutoLogout() {
    const { signOut, user } = useAuth();
    const { toast } = useToast();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!user) return; // Only track if logged in

        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                handleLogout();
            }, TIMEOUT_MS);
        };

        const handleLogout = () => {
            toast({
                title: "Session Expired",
                description: "You have been logged out due to inactivity.",
                variant: "destructive",
            });
            signOut();
        };

        // Events to track activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        const onActivity = () => {
            resetTimer();
        };

        // Initialize timer
        resetTimer();

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, onActivity);
        });

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, onActivity);
            });
        };
    }, [user, signOut, toast]);
}
