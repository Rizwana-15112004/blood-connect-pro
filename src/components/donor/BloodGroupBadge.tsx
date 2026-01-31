import { Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BloodGroupBadgeProps {
  bloodGroup: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function BloodGroupBadge({ 
  bloodGroup, 
  size = 'md', 
  showIcon = true,
  className 
}: BloodGroupBadgeProps) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    'A+': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    'A-': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    'B+': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
    'B-': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
    'AB+': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    'AB-': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    'O+': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    'O-': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  };

  const colors = colorMap[bloodGroup] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-bold',
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Droplets className={iconSizes[size]} />}
      {bloodGroup}
    </span>
  );
}
