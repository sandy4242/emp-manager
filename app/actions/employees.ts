'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) throw new Error('Not authenticated');
  const session = await verifyToken(token);
  if (!session) throw new Error('Invalid session');
  return session;
}

export async function createEmployee(data: Record<string, string | null>) {
  const session = await getSession();

  const { error } = await supabase.from('employees').insert({
    admin_id: session.id,
    emp_code: data.emp_code,
    e_code: data.e_code || null,
    emp_name: data.emp_name,
    emp_father_name: data.emp_father_name,
    esic_no: data.esic_no || null,
    uan_no: data.uan_no || null,
    mobile_no: data.mobile_no,
    aadhaar_no: data.aadhaar_no,
    epfo_joining: data.epfo_joining || null,
    pan_no: data.pan_no || null,
    dob: data.dob,
    doj: data.doj,
    gender: data.gender,
    pay_day: data.pay_day ? parseInt(data.pay_day) : null,
    department_name: data.department_name,
    nominee_name: data.nominee_name || null,
    relation_name: data.relation_name || null,
    qualification: data.qualification || null,
    present_address: data.present_address,
    permanent_address: data.permanent_address || null,
    district_name: data.district_name || null,
    state_name: data.state_name || null,
    pin_code: data.pin_code || null,
    ifsc_code: data.ifsc_code || null,
    account_no: data.account_no || null,
    narration: data.narration || null,
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

  const { error } = await supabase
    .from('employees')
    .update({
      emp_code: data.emp_code,
      e_code: data.e_code || null,
      emp_name: data.emp_name,
      emp_father_name: data.emp_father_name,
      esic_no: data.esic_no || null,
      uan_no: data.uan_no || null,
      mobile_no: data.mobile_no,
      aadhaar_no: data.aadhaar_no,
      epfo_joining: data.epfo_joining || null,
      pan_no: data.pan_no || null,
      dob: data.dob,
      doj: data.doj,
      gender: data.gender,
      pay_day: data.pay_day ? parseInt(data.pay_day) : null,
      department_name: data.department_name,
      nominee_name: data.nominee_name || null,
      relation_name: data.relation_name || null,
      qualification: data.qualification || null,
      present_address: data.present_address,
      permanent_address: data.permanent_address || null,
      district_name: data.district_name || null,
      state_name: data.state_name || null,
      pin_code: data.pin_code || null,
      ifsc_code: data.ifsc_code || null,
      account_no: data.account_no || null,
      narration: data.narration || null,
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
