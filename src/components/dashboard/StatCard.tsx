import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
  description?: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  description,
  variant = 'default',
  className,
}: StatCardProps) {
  const variants = {
    default: 'stat-card',
    primary: 'stat-card stat-card-primary',
    success: 'stat-card stat-card-success',
    warning: 'stat-card border-warning/30 bg-warning/5',
    destructive: 'stat-card border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800',
  };

  const iconVariants = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-white/20 text-white',
    success: 'bg-white/20 text-white',
    warning: 'bg-warning/20 text-warning',
    destructive: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(variants[variant], className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === 'primary' || variant === 'success' ? 'text-white/80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={cn(
              "text-3xl font-bold tracking-tight",
              variant === 'primary' || variant === 'success' ? 'text-white' : 'text-foreground'
            )}
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className={cn(
              "text-xs",
              variant === 'primary' || variant === 'success' ? 'text-white/70' : 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              trend.isPositive !== false ? 'text-green-500' : 'text-red-500'
            )}>
              <span>{trend.isPositive !== false ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className={cn(
                variant === 'primary' || variant === 'success' ? 'text-white/60' : 'text-muted-foreground'
              )}>
                {trend.label || 'vs last month'}
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          iconVariants[variant]
        )}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
