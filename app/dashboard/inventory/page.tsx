import { getInventoryItems } from '@/app/actions/inventory';
import InventoryClient from './InventoryClient';

export const metadata = {
  title: 'Inventory | EmpManager',
};

export default async function InventoryPage() {
  const items = await getInventoryItems();
  
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <InventoryClient initialItems={items} />
    </div>
  );
}
