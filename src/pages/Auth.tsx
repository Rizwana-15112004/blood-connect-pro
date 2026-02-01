import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/Navbar';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEligible, setIsEligible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminLogin = new URLSearchParams(location.search).get('role') === 'admin';

  // Effect to handle admin mode switching
  useEffect(() => {
    if (isAdminLogin && !isLogin) {
      setIsLogin(true);
    }
  }, [isAdminLogin, isLogin]);

  // If user is logged in, show a "Already Logged In" view instead of redirecting automatically
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">Welcome Back!</h2>
              <p className="mt-2 text-muted-foreground">
                You are currently signed in.
              </p>
            </div>

            <div className="space-y-3">
              <Link to="/dashboard">
                <Button className="w-full gap-2" size="lg">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: isAdminLogin ? 'Admin Access Granted' : 'Welcome back!',
            description: 'You have successfully logged in.',
          });
          navigate('/dashboard');
        }
      } else {
        if (password !== confirmPassword) {
          toast({
            title: 'Password Mismatch',
            description: 'Passwords do not match.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          toast({
            title: 'Weak Password',
            description: 'Password must be at least 6 characters.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, isEligible);
        if (error) {
          toast({
            title: 'Sign Up Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account Created!',
            description: 'Please check your email to verify your account.',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="flex min-h-screen pt-20">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden w-1/2 flex-col justify-between bg-primary p-12 lg:flex"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">BloodLife</h1>
              <p className="text-sm text-white/80">Donation Management System</p>
            </div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl font-bold leading-tight text-white">
                Save Lives,<br />
                Donate Blood
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Join our community of life-savers. Every donation counts and can save up to three lives.
              </p>
            </motion.div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Active Donors', value: '10,000+' },
                { label: 'Lives Saved', value: '50,000+' },
                { label: 'Blood Banks', value: '100+' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="rounded-lg bg-white/10 p-4 backdrop-blur-sm"
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/60">
            © 2024 BloodLife. Making blood donation accessible to all.
          </p>
        </motion.div>

        {/* Right Side - Auth Form */}
        <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">BloodLife</h1>
                <p className="text-sm text-muted-foreground">Donation Management</p>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-8 shadow-xl">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  {isAdminLogin ? 'Admin Portal' : (isLogin ? 'Welcome Back' : 'Create Account')}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {isAdminLogin
                    ? 'Secure login for administrators'
                    : (isLogin
                      ? 'Sign in to access your dashboard'
                      : 'Join our community of blood donors')
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="mt-4 mb-4 flex items-start space-x-2 px-1">
                    <Checkbox
                      id="eligibility"
                      checked={isEligible}
                      onCheckedChange={(c) => setIsEligible(!!c)}
                      className="mt-1"
                    />
                    <Label htmlFor="eligibility" className="text-sm font-normal text-muted-foreground leading-snug cursor-pointer">
                      I confirm that I meet the <span className="text-primary font-medium">basic eligibility criteria</span> to donate blood.
                    </Label>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 font-medium text-primary hover:underline"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
