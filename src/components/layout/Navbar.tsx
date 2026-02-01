
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, ArrowRight, Sun, Moon, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/theme-provider';
import { isMockMode } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Zap } from 'lucide-react';

export const Navbar = () => {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20);
    });

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Donors', path: '/donors' },
        { name: 'Eligibility', path: '/eligibility' },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                    isScrolled
                        ? "bg-background/80 backdrop-blur-xl border-border/40 shadow-sm py-3"
                        : "bg-transparent py-5"
                )}
            >
                <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground overflow-hidden shadow-lg transition-transform group-hover:scale-105">
                            <Heart className="h-5 w-5 relative z-10" />
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 group-hover:to-primary transition-all duration-300">
                            BloodLife
                        </span>
                    </Link>

                    {/* Status Badge */}
                    <div className="hidden lg:flex items-center ml-4">
                        {isMockMode ? (
                            <Badge variant="outline" className="gap-1 border-yellow-500/50 text-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/10">
                                <AlertCircle className="h-3 w-3" /> Demo Mode
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="gap-1 border-green-500/50 text-green-600 bg-green-50/50 dark:bg-green-900/10">
                                <Zap className="h-3 w-3 fill-current" /> Live Server
                            </Badge>
                        )}
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-primary relative group",
                                        location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {link.name}
                                    <span className={cn(
                                        "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                                        location.pathname === link.path ? "w-full" : ""
                                    )} />
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 pl-4 border-l border-border/50">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="mr-2"
                            >
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                            {user ? (
                                <Link to="/dashboard">
                                    <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-105">
                                        Dashboard <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/auth?role=admin">
                                        <Button variant="ghost" className="gap-2 hover:bg-primary/5 hover:text-primary transition-colors">
                                            <ShieldCheck className="h-4 w-4" />
                                            Admin
                                        </Button>
                                    </Link>
                                    <Link to="/auth">
                                        <Button variant="ghost" className="hover:bg-primary/5 hover:text-primary transition-colors">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link to="/auth">
                                        <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-105">
                                            Get Started <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-foreground/80 hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 top-[70px] z-40 bg-background/95 backdrop-blur-xl border-t border-border/50 md:hidden p-6 flex flex-col gap-4"
                    >
                        {navLinks.map((link, idx) => (
                            <motion.div
                                key={link.path}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Link
                                    to={link.path}
                                    className={cn(
                                        "block text-lg font-medium p-4 rounded-xl transition-all hover:bg-primary/5 hover:text-primary hover:pl-6",
                                        location.pathname === link.path ? "bg-primary/10 text-primary pl-6" : "text-foreground"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center justify-between p-4"
                        >
                            <span className="text-lg font-medium">Dark Mode</span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-4 flex flex-col gap-3"
                        >
                            {user ? (
                                <Link to="/dashboard">
                                    <Button className="w-full justify-center text-base py-6 shadow-lg shadow-primary/20">
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/auth?role=admin">
                                        <Button variant="ghost" className="w-full justify-start text-base py-6 gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            Admin Login
                                        </Button>
                                    </Link>
                                    <Link to="/auth">
                                        <Button variant="outline" className="w-full justify-center text-base py-6">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link to="/auth">
                                        <Button className="w-full justify-center text-base py-6 shadow-lg shadow-primary/20">
                                            Get Started
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
