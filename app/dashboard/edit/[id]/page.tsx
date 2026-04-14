import { getEmployee } from '../../../actions/employees';
import { notFound } from 'next/navigation';
import EditEmployeeClient from './EditEmployeeClient';

export default async function EditEmployeePage(props: PageProps<'/dashboard/edit/[id]'>) {
  const { id } = await props.params;
  const { employee, error } = await getEmployee(id);

  if (!employee || error) {
    notFound();
  }

  return <EditEmployeeClient employee={employee} />;
}
