import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Droplets, Users, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { BloodSearchSection } from '@/components/home/BloodSearchSection';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-background dark:from-red-950/20 dark:to-slate-950 -z-10" />

        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-0 -z-10 bg-primary/20 w-96 h-96 blur-3xl rounded-full opacity-50 animate-blob" />
        <div className="absolute bottom-0 left-0 -z-10 bg-blue-400/20 w-80 h-80 blur-3xl rounded-full opacity-30 animate-blob animation-delay-2000" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm font-medium mb-6 animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Urgent: O+ Blood Needed in Mumbai
              </div>

              <h1 className="text-5xl font-extrabold leading-tight text-foreground sm:text-6xl lg:text-7xl mb-6 tracking-tight">
                Save a Life, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                  Be a Hero.
                </span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground max-w-lg leading-relaxed">
                Connect directly with those in need. Our professional platform ensures every donation reaches the right person, right on time.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/auth">
                  <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-lg hover:shadow-primary/25 shadow-primary/20 transition-all gap-2 group">
                    <Heart className="h-5 w-5 fill-current animate-pulse bg-transparent group-hover:scale-110 transition-transform" />
                    Donate Now
                  </Button>
                </Link>
                <Link to="/eligibility">
                  <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg border-2 hover:bg-accent gap-2">
                    <Activity className="h-5 w-5" />
                    Check Eligibility
                  </Button>
                </Link>
                <Link to="/request-blood">
                  <Button size="lg" variant="secondary" className="h-14 px-8 rounded-full text-lg shadow-lg hover:shadow-secondary/25 transition-all gap-2 group">
                    <Droplets className="h-5 w-5 fill-current" />
                    Request Blood
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* 3D Pulsing Heart Animation */}
            <div className="relative flex justify-center items-center">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl text-primary filter brightness-110">
                    <path fill="currentColor" d="M40.7,-68.6C52.8,-63.3,62.8,-53.4,71.2,-42.2C79.6,-31,86.4,-18.5,85.2,-6.6C84,5.3,74.8,16.6,66.1,27.1C57.4,37.6,49.2,47.3,39.3,55.1C29.4,62.9,17.7,68.8,5.4,69.5C-6.9,70.2,-19.8,65.7,-31.6,59C-43.4,52.3,-54.1,43.4,-61.7,32.3C-69.3,21.2,-73.8,7.9,-72.7,-4.8C-71.6,-17.5,-64.9,-29.6,-55.4,-39.3C-45.9,-49,-33.6,-56.3,-21.3,-61.4C-9,-66.5,3.3,-69.4,15.7,-70.7C28.1,-72,40.7,-68.6,40.7,-68.6Z" transform="translate(100 100) scale(1.1)" />
                  </svg>
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Heart className="h-32 w-32 text-white fill-white drop-shadow-lg" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating Stats Cards around the heart */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -top-10 -right-10 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl border z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Verified</p>
                    <p className="text-xs text-muted-foreground">Trusted Donors</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-10 -left-10 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl border z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">50k+</p>
                    <p className="text-xs text-muted-foreground">Community</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Blood Search Section */}
      <BloodSearchSection />

      {/* Features Section */}
      <section className="bg-background py-24 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4">Why Choose BloodLife?</h2>
            <p className="text-lg text-muted-foreground">We combine medical-grade security with modern technology to ensure safe, fast, and reliable blood donation.</p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Smart Eligibility', desc: 'Instant WHO-compliant checks ensure you are safe to donate.', icon: Activity },
              { title: 'Live Inventory', desc: 'Real-time tracking of blood units prevents wastage and shortages.', icon: Droplets },
              { title: 'Secure Privacy', desc: 'Your health data is encrypted and never shared without consent.', icon: CheckCircle2 },
              { title: 'Donation History', desc: 'Track your impact with beautiful visualizations and health charts.', icon: Activity },
              { title: 'Emergency Alerts', desc: 'Get notified instantly when your blood type is critically needed.', icon: Heart },
              { title: 'Community Badges', desc: 'Earn recognition and certificates for your life-saving contributions.', icon: Users },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="mt-4 text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Voices of Hope</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Hear from the heroes who give and the warriors who survive.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "I found a donor for my father in less than 30 minutes. This platform is a lifesaver.", author: "Anjali Gupta", role: "Recipient" },
              { quote: "Donating is so easy now. I love tracking my health stats after every donation!", author: "Vikram Singh", role: "Regular Donor" },
              { quote: "As a hospital administrator, managing camps has never been smoother.", author: "Dr. Rajesh Kumar", role: "Medical Director" }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className="bg-background p-8 rounded-2xl shadow-sm border relative"
              >
                <div className="absolute top-6 right-8 text-6xl text-primary/10 font-serif">"</div>
                <p className="text-lg italic text-foreground/80 mb-6 relative z-10">{t.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {t.author[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-900 text-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 grid gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <span className="text-2xl font-bold text-white">BloodLife</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              Connecting donors with those in need. Secured, verified, and always free for the community.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/auth" className="hover:text-primary transition-colors">Find Blood</Link></li>
              <li><Link to="/auth" className="hover:text-primary transition-colors">Donate Now</Link></li>
              <li><Link to="/auth" className="hover:text-primary transition-colors">Organize Camp</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          © 2026 BloodLife. Developed by Rapid.AI.
        </div>
      </footer>
    </div>
  );
}
