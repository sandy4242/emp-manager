'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface InventoryItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number | null;
  status: string;
  image_url: string | null;
  created_at: string;
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory items:', error);
      throw new Error('Failed to fetch inventory items');
    }

    return data as InventoryItem[];
  } catch (error) {
    console.error('getInventoryItems error:', error);
    return [];
  }
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at'>): Promise<{ success: boolean; message: string; data?: InventoryItem }> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('Error adding inventory item:', error);
      return { success: false, message: 'Failed to add inventory item' };
    }

    revalidatePath('/dashboard/inventory');
    return { success: true, message: 'Item added successfully', data: data as InventoryItem };
  } catch (error) {
    console.error('addInventoryItem error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

export async function updateInventoryStatus(
  id: string, 
  status: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('inventory')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating inventory status:', error);
      return { success: false, message: 'Failed to update status' };
    }

    revalidatePath('/dashboard/inventory');
    return { success: true, message: `Inventory status updated successfully` };
  } catch (error) {
    console.error('updateInventoryStatus error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}
