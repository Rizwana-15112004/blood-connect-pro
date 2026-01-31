import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function useSecurity() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    // Track if we were just in a protected route
    const wasProtected = useRef(false);

    // List of public paths that should trigger logout if navigating TO them FROM a protected route
    const publicPaths = ['/auth', '/'];

    // Base paths considered "protected" (add any new top-level protected routes here)
    const isProtectedRoute = (pathname: string) => {
        const protectedPrefixes = [
            '/dashboard',
            '/donors',
            '/inventory',
            '/donations',
            '/eligibility',
            '/calendar',
            '/profile',
            '/settings'
        ];
        return protectedPrefixes.some(prefix => pathname.startsWith(prefix));
    };

    useEffect(() => {
        const currentIsProtected = isProtectedRoute(location.pathname);
        const currentIsPublic = publicPaths.includes(location.pathname);

        if (user) {
            // DETECT LOGOUT CONDITION:
            // If we were in a protected route, and now we are in a public route (like Auth or Home),
            // it likely means the user clicked "Back" or manually navigated away.
            // We enforce a logout to clear the session.
            if (wasProtected.current && currentIsPublic) {
                console.log("Security: Navigated from protected to public route. Logging out...");
                signOut();
            }

            // Update state for next render
            if (currentIsProtected) {
                wasProtected.current = true;
            }
        } else {
            wasProtected.current = false;
        }
    }, [location, user, signOut]);
}
