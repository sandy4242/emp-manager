'use client';

import { logoutAction } from '../actions/auth';
import { IconBriefcase, IconLogOut, IconUser } from '../components/Icons';

interface DashboardNavProps {
  adminName: string;
}

export default function DashboardNav({ adminName }: DashboardNavProps) {
  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e5e3',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <IconBriefcase size={20} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>
            EmpManager
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Admin info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <IconUser size={16} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>
              {adminName}
            </span>
          </div>

          {/* Logout */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="btn btn-ghost"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: '#6b6b6b',
              }}
            >
              <IconLogOut size={16} />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
