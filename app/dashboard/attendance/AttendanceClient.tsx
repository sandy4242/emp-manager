'use client';

import { useState } from 'react';
import { AttendanceLog, updateAttendanceStatus } from '@/app/actions/attendance';
import { IconCheck, IconXCircle, IconClock } from '../../components/Icons';
import Image from 'next/image';

interface AttendanceClientProps {
  initialLogs: AttendanceLog[];
}

export default function AttendanceClient({ initialLogs }: AttendanceClientProps) {
  const [logs, setLogs] = useState<AttendanceLog[]>(initialLogs);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    setLoadingId(id);
    const result = await updateAttendanceStatus(id, status);
    
    if (result.success) {
      setLogs((prevLogs) =>
        prevLogs.map((log) => (log.id === id ? { ...log, status } : log))
      );
    } else {
      alert(result.message);
    }
    
    setLoadingId(null);
  };

  const filteredLogs = logs.filter((log) => filter === 'all' || log.status === filter);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              border: filter === f ? '1px solid #2563eb' : '1px solid #e5e7eb',
              background: filter === f ? '#eff6ff' : '#ffffff',
              color: filter === f ? '#2563eb' : '#4b5563',
              textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredLogs.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>No attendance logs found for this status.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #f3f4f6',
              }}
            >
              {/* Image Container */}
              <div style={{ position: 'relative', width: '100%', height: '250px', backgroundColor: '#f3f4f6' }}>
                {log.image_url ? (
                  <img
                    src={log.image_url}
                    alt="Attendance Selfie"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                    No Image Provided
                  </div>
                )}
                
                {/* Status Badge */}
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  {log.status === 'pending' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                      <IconClock size={14} /> Pending
                    </span>
                  )}
                  {log.status === 'approved' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#d1fae5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                      <IconCheck size={14} /> Approved
                    </span>
                  )}
                  {log.status === 'rejected' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                      <IconXCircle size={14} /> Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* Info & Actions */}
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0' }}>
                  Submitted: {new Date(log.created_at).toLocaleString()}
                </p>

                {log.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleStatusUpdate(log.id, 'rejected')}
                      disabled={loadingId === log.id}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        fontWeight: 600,
                        cursor: loadingId === log.id ? 'not-allowed' : 'pointer',
                        opacity: loadingId === log.id ? 0.5 : 1,
                      }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(log.id, 'approved')}
                      disabled={loadingId === log.id}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        background: '#2563eb',
                        border: '1px solid #2563eb',
                        color: '#ffffff',
                        fontWeight: 600,
                        cursor: loadingId === log.id ? 'not-allowed' : 'pointer',
                        opacity: loadingId === log.id ? 0.5 : 1,
                      }}
                    >
                      Approve
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStatusUpdate(log.id, 'approved')}
                    disabled={loadingId === log.id}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#f3f4f6',
                      border: 'none',
                      color: '#4b5563',
                      fontWeight: 500,
                      cursor: loadingId === log.id ? 'not-allowed' : 'pointer',
                      opacity: loadingId === log.id ? 0.5 : 1,
                    }}
                  >
                    Reset Status
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
