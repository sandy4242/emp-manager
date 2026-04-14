'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdmin, createToken } from '@/lib/auth';

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const adminId = formData.get('adminId') as string;
  const password = formData.get('password') as string;

  if (!adminId || !password) {
    return { error: 'Please enter both Admin ID and Password.' };
  }

  const session = await verifyAdmin(adminId, password);
  if (!session) {
    return { error: 'Invalid Admin ID or Password.' };
  }

  const token = await createToken(session);
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/');
}
