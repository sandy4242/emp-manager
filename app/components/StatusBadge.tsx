'use client';

import { IconCheckCircle, IconClock, IconXCircle } from './Icons';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    approved: {
      label: 'Approved',
      className: 'badge badge-approved',
      icon: <IconCheckCircle size={14} />,
    },
    pending: {
      label: 'Pending',
      className: 'badge badge-pending',
      icon: <IconClock size={14} />,
    },
    rejected: {
      label: 'Rejected',
      className: 'badge badge-rejected',
      icon: <IconXCircle size={14} />,
    },
  };

  const current = config[status as keyof typeof config] || config.pending;

  return (
    <span className={current.className}>
      {current.icon}
      {current.label}
    </span>
  );
}
