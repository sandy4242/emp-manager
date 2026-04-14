import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
);

export interface AdminSession {
  id: string;
  adminId: string;
  name: string;
}

export async function verifyAdmin(
  adminId: string,
  password: string
): Promise<AdminSession | null> {
  // Query Supabase for the admin
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('admin_id', adminId)
    .single();

  if (error || !admin) return null;

  // Verify password using bcrypt
  const isValid = await bcrypt.compare(password, admin.password_hash);
  if (!isValid) return null;

  return { id: admin.id, adminId: admin.admin_id, name: admin.name };
}

export async function createToken(session: AdminSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

