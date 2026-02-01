import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Clock, Heart, Scale, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { EligibilityResult, formatEligibilityCategory } from '@/lib/eligibility';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface EligibilityCardProps {
  eligibility: EligibilityResult;
  lastDonationDate?: Date;
  age?: number;
  weight?: number;
  className?: string;
}

export function EligibilityCard({ eligibility, lastDonationDate, age, weight, className }: EligibilityCardProps) {
  const getStatusIcon = () => {
    switch (eligibility.category) {
      case 'eligible':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'temporarily_ineligible':
        return <Clock className="h-8 w-8 text-yellow-500" />;
      case 'permanently_ineligible':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'needs_review':
        return <AlertTriangle className="h-8 w-8 text-orange-500" />;
    }
  };

  const getStatusColor = () => {
    switch (eligibility.category) {
      case 'eligible':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900';
      case 'temporarily_ineligible':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900';
      case 'permanently_ineligible':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900';
      case 'needs_review':
        return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-900';
    }
  };

  const getHealthScoreColor = () => {
    if (eligibility.healthScore >= 80) return 'bg-green-500';
    if (eligibility.healthScore >= 60) return 'bg-yellow-500';
    if (eligibility.healthScore >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('rounded-xl border p-6 dark:text-gray-100 transition-colors', getStatusColor(), className)}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm">
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground">
            {formatEligibilityCategory(eligibility.category)}
          </h3>
          <p className="text-sm text-muted-foreground">
            Based on WHO blood donation guidelines
          </p>
        </div>
      </div>

      {/* Health Score */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Health Score</span>
          <span className="text-sm font-bold text-foreground">{eligibility.healthScore}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white dark:bg-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${eligibility.healthScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn('h-full rounded-full', getHealthScoreColor())}
          />
        </div>
      </div>

      {/* User Data Summary */}
      {(age !== undefined || weight !== undefined) && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {age !== undefined && (
            <div className="flex items-center gap-3 rounded-lg bg-white/60 dark:bg-black/20 p-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-semibold text-foreground">{age} Years</p>
              </div>
            </div>
          )}
          {weight !== undefined && (
            <div className="flex items-center gap-3 rounded-lg bg-white/60 dark:bg-black/20 p-3">
              <Scale className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="font-semibold text-foreground">{weight} kg</p>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Next Eligible Date */}
      {eligibility.nextEligibleDate && (
        <div className="mt-4 rounded-lg bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {eligibility.isEligible ? 'Eligible Now!' : 'Next Eligible Date'}
              </p>
              <p className="text-lg font-bold text-primary">
                {format(eligibility.nextEligibleDate, 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Last Donation */}
      {lastDonationDate && (
        <div className="mt-3 rounded-lg bg-white/50 dark:bg-gray-800/50 p-3">
          <p className="text-xs text-muted-foreground">Last Donation</p>
          <p className="font-medium text-foreground">
            {format(lastDonationDate, 'MMMM d, yyyy')}
          </p>
        </div>
      )}

      {/* Reasons List */}
      {eligibility.reasons.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">Concerns:</p>
          <ul className="space-y-1">
            {eligibility.reasons.map((reason, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                <span>{reason}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
