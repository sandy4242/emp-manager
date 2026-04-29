import { getAttendanceLogs } from '@/app/actions/attendance';
import AttendanceClient from './AttendanceClient';

export const metadata = {
  title: 'Attendance Approvals | EmpManager',
};

export default async function AttendancePage() {
  const logs = await getAttendanceLogs();
  
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>
          Attendance Approvals
        </h1>
        <p style={{ fontSize: 14, color: '#6b6b6b', margin: 0 }}>
          Review and approve employee attendance selfies.
        </p>
      </div>
      
      <AttendanceClient initialLogs={logs} />
    </div>
  );
}
