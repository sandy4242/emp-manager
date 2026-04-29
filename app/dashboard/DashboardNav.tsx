'use client';

import { useState, useRef, useEffect } from 'react';
import { logoutAction } from '../actions/auth';
import { IconBriefcase, IconLogOut, IconUser } from '../components/Icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardNavProps {
  adminName: string;
}

export default function DashboardNav({ adminName }: DashboardNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* Center Navigation */}
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }} className="desktop-only">
          <Link
            href="/dashboard"
            style={{
              fontSize: 14,
              fontWeight: pathname === '/dashboard' ? 600 : 500,
              color: pathname === '/dashboard' ? '#2563eb' : '#6b6b6b',
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              background: pathname === '/dashboard' ? '#eff6ff' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            Employees
          </Link>
          <Link
            href="/dashboard/attendance"
            style={{
              fontSize: 14,
              fontWeight: pathname === '/dashboard/attendance' ? 600 : 500,
              color: pathname === '/dashboard/attendance' ? '#2563eb' : '#6b6b6b',
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              background: pathname === '/dashboard/attendance' ? '#eff6ff' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            Attendance
          </Link>
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} ref={dropdownRef}>
          {/* Avatar / Admin info */}
          <div 
            className="nav-user-info" 
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
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
                flexShrink: 0
              }}
            >
              <IconUser size={16} />
            </div>
            <span className="desktop-only" style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', whiteSpace: 'nowrap' }}>
              {adminName}
            </span>
          </div>

          {/* Logout (Desktop Only) */}
          <form action={logoutAction} className="desktop-only">
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

          {/* Mobile Dropdown Menu */}
          <div className="mobile-only">
            {dropdownOpen && (
              <div
                className="animate-fade-in card"
                style={{
                  position: 'absolute',
                  top: 60,
                  right: 24,
                  width: 200,
                  padding: '8px 0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  overflow: 'hidden',
                  background: '#ffffff'
                }}
              >
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e5e3', marginBottom: 8 }}>
                  <p style={{ fontSize: 11, color: '#9b9b9b', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 600 }}>Signed in as</p>
                  <p style={{ fontSize: 14, color: '#1a1a1a', margin: 0, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {adminName}
                  </p>
                </div>
                <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Link
                    href="/dashboard"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      fontSize: 14,
                      color: pathname === '/dashboard' ? '#2563eb' : '#4b5563',
                      fontWeight: pathname === '/dashboard' ? 600 : 500,
                      background: pathname === '/dashboard' ? '#eff6ff' : 'transparent',
                      borderRadius: '6px',
                      textDecoration: 'none'
                    }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Employees
                  </Link>
                  <Link
                    href="/dashboard/attendance"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      fontSize: 14,
                      color: pathname === '/dashboard/attendance' ? '#2563eb' : '#4b5563',
                      fontWeight: pathname === '/dashboard/attendance' ? 600 : 500,
                      background: pathname === '/dashboard/attendance' ? '#eff6ff' : 'transparent',
                      borderRadius: '6px',
                      textDecoration: 'none'
                    }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Attendance
                  </Link>
                  <div style={{ height: 1, background: '#e5e5e3', margin: '4px 0' }}></div>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="btn btn-ghost"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        color: '#dc2626',
                        padding: '10px 8px'
                      }}
                    >
                      <IconLogOut size={16} />
                      Logout
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
