import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Moon, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useTheme } from '@/components/theme-provider';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';
import { useState } from 'react';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const handleAction = async (action: string) => {
    toast({
      title: "Processing...",
      description: `Please wait while we ${action.toLowerCase()}.`,
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (action === "Delete Account") {
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
        variant: "destructive"
      });
      setTimeout(() => signOut(), 1000);
    } else if (action === "Change Password") {
      setShowPasswordDialog(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6 lg:col-span-2"
          >
            {/* Notifications */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Manage how you receive notifications</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates about donations</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminder" className="font-medium">Donation Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded when you're eligible to donate</p>
                  </div>
                  <Switch id="reminder" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="urgent" className="font-medium">Urgent Blood Requests</Label>
                    <p className="text-sm text-muted-foreground">Be notified for emergency blood needs</p>
                  </div>
                  <Switch id="urgent" defaultChecked />
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Privacy & Security</h3>
                  <p className="text-sm text-muted-foreground">Control your privacy settings</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profile-visible" className="font-medium">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your donor profile</p>
                  </div>
                  <Switch id="profile-visible" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="2fa" className="font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch id="2fa" />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <Moon className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Appearance</h3>
                  <p className="text-sm text-muted-foreground">Customize the look and feel</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Account</h3>
                  <p className="text-sm text-muted-foreground">Manage your account</p>
                </div>
              </div>
              <div className="space-y-4">
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    Edit Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction("Change Password")}
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => handleAction("Delete Account")}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <ChangePasswordDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} />
    </DashboardLayout>
  );
}
