import { getEmployees, getEmployeeCounts } from '../actions/employees';
import DashboardClient from '../dashboard/DashboardClient';


export default async function DashboardPage() {
  const [counts, { employees }] = await Promise.all([
    getEmployeeCounts(),
    getEmployees(),
  ]);

  return <DashboardClient counts={counts} employees={employees} />;
}
