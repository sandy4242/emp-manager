'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconCheckCircle } from './Icons';

interface SuccessModalProps {
  show: boolean;
  message?: string;
  redirectTo?: string;
}

export default function SuccessModal({
  show,
  message = 'Employee added successfully!',
  redirectTo = '/dashboard',
}: SuccessModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        router.push(redirectTo);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, redirectTo, router]);

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#f0fdf4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <IconCheckCircle size={32} className="animate-scale-in" />
        </div>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
            color: '#1a1a1a',
          }}
        >
          Success
        </h3>
        <p
          style={{
            fontSize: 14,
            color: '#6b6b6b',
            marginBottom: 0,
          }}
        >
          {message}
        </p>
        <p
          style={{
            fontSize: 12,
            color: '#9b9b9b',
            marginTop: 16,
          }}
        >
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
}
