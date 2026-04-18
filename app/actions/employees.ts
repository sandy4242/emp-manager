'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

/** Uppercase and trim a text value, return null if empty */
function clean(val: string | null | undefined): string | null {
  if (!val) return null;
  return val.toUpperCase().trim() || null;
}

/** Uppercase and trim, but never return null (for required fields) */
function cleanReq(val: string | null | undefined): string {
  return (val || '').toUpperCase().trim();
}

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) throw new Error('Not authenticated');
  const session = await verifyToken(token);
  if (!session) throw new Error('Invalid session');
  return session;
}

async function checkUniqueness(
  aadhaar: string | null,
  pan: string | null,
  uan: string | null,
  adminId: string,
  excludeId?: string
): Promise<string | null> {
  // Check Aadhaar uniqueness
  if (aadhaar) {
    const query = supabase
      .from('employees')
      .select('id')
      .eq('admin_id', adminId)
      .eq('aadhaar_no', aadhaar);
    if (excludeId) query.neq('id', excludeId);
    const { data } = await query.limit(1);
    if (data && data.length > 0) {
      return 'Employee already exists with that Aadhaar number';
    }
  }

  // Check PAN uniqueness
  if (pan) {
    const query = supabase
      .from('employees')
      .select('id')
      .eq('admin_id', adminId)
      .eq('pan_no', pan);
    if (excludeId) query.neq('id', excludeId);
    const { data } = await query.limit(1);
    if (data && data.length > 0) {
      return 'Employee already exists with that PAN number';
    }
  }

  // Check UAN uniqueness (optional field)
  if (uan) {
    const query = supabase
      .from('employees')
      .select('id')
      .eq('admin_id', adminId)
      .eq('uan_no', uan);
    if (excludeId) query.neq('id', excludeId);
    const { data } = await query.limit(1);
    if (data && data.length > 0) {
      return 'Employee already exists with that UAN number';
    }
  }

  return null;
}

export async function createEmployee(data: Record<string, string | null>) {
  const session = await getSession();

  // Check uniqueness before insert
  const uniqueError = await checkUniqueness(
    cleanReq(data.aadhaar_no),
    cleanReq(data.pan_no),
    clean(data.uan_no),
    session.id as string
  );
  if (uniqueError) {
    return { success: false, error: uniqueError };
  }

  const { error } = await supabase.from('employees').insert({
    admin_id: session.id,
    company_name: cleanReq(data.company_name),
    emp_code: cleanReq(data.emp_code),
    e_code: clean(data.e_code),
    emp_name: cleanReq(data.emp_name),
    emp_father_name: cleanReq(data.emp_father_name),
    esic_no: clean(data.esic_no),
    uan_no: clean(data.uan_no),
    mobile_no: cleanReq(data.mobile_no),
    aadhaar_no: cleanReq(data.aadhaar_no),
    epfo_joining: clean(data.epfo_joining),
    pan_no: cleanReq(data.pan_no),
    dob: data.dob,
    doj: data.doj,
    gender: cleanReq(data.gender),
    pay_day: data.pay_day ? parseInt(data.pay_day) : null,
    department_name: cleanReq(data.department_name),
    nominee_name: clean(data.nominee_name),
    relation_name: clean(data.relation_name),
    qualification: cleanReq(data.qualification),
    present_address: cleanReq(data.present_address),
    permanent_address: clean(data.permanent_address),
    district_name: clean(data.district_name),
    state_name: clean(data.state_name),
    pin_code: clean(data.pin_code),
    ifsc_code: cleanReq(data.ifsc_code),
    account_no: (data.account_no || '').trim() || null,
    narration: clean(data.narration),
    status: 'pending',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateEmployee(
  id: string,
  data: Record<string, string | null>
) {
  const session = await getSession();

  // Check uniqueness before update (exclude self)
  const uniqueError = await checkUniqueness(
    cleanReq(data.aadhaar_no),
    cleanReq(data.pan_no),
    clean(data.uan_no),
    session.id as string,
    id
  );
  if (uniqueError) {
    return { success: false, error: uniqueError };
  }

  const { error } = await supabase
    .from('employees')
    .update({
      company_name: cleanReq(data.company_name),
      emp_code: cleanReq(data.emp_code),
      e_code: clean(data.e_code),
      emp_name: cleanReq(data.emp_name),
      emp_father_name: cleanReq(data.emp_father_name),
      esic_no: clean(data.esic_no),
      uan_no: clean(data.uan_no),
      mobile_no: cleanReq(data.mobile_no),
      aadhaar_no: cleanReq(data.aadhaar_no),
      epfo_joining: clean(data.epfo_joining),
      pan_no: cleanReq(data.pan_no),
      dob: data.dob,
      doj: data.doj,
      gender: cleanReq(data.gender),
      pay_day: data.pay_day ? parseInt(data.pay_day) : null,
      department_name: cleanReq(data.department_name),
      nominee_name: clean(data.nominee_name),
      relation_name: clean(data.relation_name),
      qualification: cleanReq(data.qualification),
      present_address: cleanReq(data.present_address),
      permanent_address: clean(data.permanent_address),
      district_name: clean(data.district_name),
      state_name: clean(data.state_name),
      pin_code: clean(data.pin_code),
      ifsc_code: cleanReq(data.ifsc_code),
      account_no: (data.account_no || '').trim() || null,
      narration: clean(data.narration),
    })
    .eq('id', id)
    .eq('admin_id', session.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateEmployeeStatus(id: string, status: string) {
  const session = await getSession();

  const { error } = await supabase
    .from('employees')
    .update({ status })
    .eq('id', id)
    .eq('admin_id', session.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteEmployee(id: string) {
  const session = await getSession();

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
    .eq('admin_id', session.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function getEmployees() {
  const session = await getSession();

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('admin_id', session.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { employees: [], error: error.message };
  }

  return { employees: data || [] };
}

export async function getEmployee(id: string) {
  const session = await getSession();

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .eq('admin_id', session.id)
    .single();

  if (error) {
    return { employee: null, error: error.message };
  }

  return { employee: data };
}

export async function getEmployeeCounts() {
  const session = await getSession();

  const { data, error } = await supabase
    .from('employees')
    .select('status')
    .eq('admin_id', session.id);

  if (error) {
    return { approved: 0, pending: 0, rejected: 0 };
  }

  const counts = {
    approved: data?.filter((e) => e.status === 'approved').length || 0,
    pending: data?.filter((e) => e.status === 'pending').length || 0,
    rejected: data?.filter((e) => e.status === 'rejected').length || 0,
  };

  return counts;
}
