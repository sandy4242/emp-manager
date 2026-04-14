'use client';

import { useActionState } from 'react';
import { loginAction } from './actions/auth';
import { IconLock, IconUser, IconLoader, IconBriefcase } from './components/Icons';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#f8f8f6',
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 40,
        }}
      >
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <IconBriefcase size={28} className="" />
            <style>{`.card div:first-child svg { color: white; }`}</style>
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#1a1a1a',
              margin: '0 0 6px',
            }}
          >
            EmpManager
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#6b6b6b',
              margin: 0,
            }}
          >
            Sign in to manage employee records
          </p>
        </div>

        {/* Error message */}
        {state?.error && (
          <div
            style={{
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 13,
              color: '#dc2626',
            }}
          >
            {state.error}
          </div>
        )}

        {/* Login Form */}
        <form action={formAction}>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label className="input-label" htmlFor="adminId">
              Admin ID
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9b9b9b',
                }}
              >
                <IconUser size={16} />
              </div>
              <input
                className="input-field"
                id="adminId"
                name="adminId"
                type="text"
                placeholder="Enter your admin ID"
                required
                autoComplete="username"
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 24 }}>
            <label className="input-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9b9b9b',
                }}
              >
                <IconLock size={16} />
              </div>
              <input
                className="input-field"
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={pending}
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {pending ? (
              <>
                <IconLoader size={18} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
