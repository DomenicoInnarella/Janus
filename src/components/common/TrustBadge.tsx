import React from 'react';
import { ShieldCheck, CheckCircle2, Award, Star, ShieldAlert } from 'lucide-react';
import { HostStatus, VerificationStatus } from '../../types';

interface TrustBadgeProps {
  status: HostStatus | VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ 
  status, 
  size = 'md', 
  showLabel = true 
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'super_host':
        return {
          label: 'Super Host',
          icon: Award,
          bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          iconClass: 'text-amber-400',
          tooltip: 'Top-tier host: 20+ completed bookings with >4.8 rating',
        };
      case 'trusted_host':
      case 'trusted':
        return {
          label: 'Trusted Host',
          icon: ShieldCheck,
          bgClass: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          iconClass: 'text-blue-400',
          tooltip: 'Verified host with consistently great driver feedback',
        };
      case 'verified_host':
      case 'verified':
        return {
          label: 'Verified Host',
          icon: CheckCircle2,
          bgClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          iconClass: 'text-emerald-400',
          tooltip: 'Host identity and space verified by Janus',
        };
      case 'new_host':
      default:
        return {
          label: 'New Host',
          icon: Star,
          bgClass: 'bg-neutral-800 border-neutral-700 text-neutral-300',
          iconClass: 'text-neutral-400',
          tooltip: 'New community member building trust',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      id={`trust-badge-${status}`}
      title={config.tooltip}
      className={`inline-flex items-center rounded-full border ${config.bgClass} ${sizeClasses[size]} tracking-tight transition-colors`}
    >
      <Icon className={`${iconSizes[size]} ${config.iconClass} shrink-0`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
