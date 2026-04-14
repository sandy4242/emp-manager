import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardNav from '../dashboard/DashboardNav';

export const metadata = {
  title: 'Dashboard — EmpManager',
  description: 'Manage and track employee records',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) redirect('/');

  const session = await verifyToken(token);
  if (!session) redirect('/');

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6' }}>
      <DashboardNav adminName={session.name} />
      <main
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        {children}
      </main>
    </div>
  );
}
