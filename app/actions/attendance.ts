'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface AttendanceLog {
  id: string;
  employee_id?: string | null;
  employee_name?: string | null;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export async function getAttendanceLogs(statusFilter: string = 'all'): Promise<AttendanceLog[]> {
  try {
    let query = supabase
      .from('attendance_logs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching attendance logs:', error);
      throw new Error('Failed to fetch attendance logs');
    }

    return data as AttendanceLog[];
  } catch (error) {
    console.error('getAttendanceLogs error:', error);
    return [];
  }
}

export async function updateAttendanceStatus(
  id: string, 
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('attendance_logs')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating attendance status:', error);
      return { success: false, message: 'Failed to update status' };
    }

    revalidatePath('/dashboard/attendance');
    return { success: true, message: `Attendance ${status} successfully` };
  } catch (error) {
    console.error('updateAttendanceStatus error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}
