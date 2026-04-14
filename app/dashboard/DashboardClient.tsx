'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import StatusBadge from '../components/StatusBadge';
import {
  IconCheckCircle,
  IconClock,
  IconXCircle,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconCheck,
  IconEye,
} from '../components/Icons';
import {
  updateEmployeeStatus,
  deleteEmployee,
} from '../actions/employees';

interface Employee {
  id: string;
  emp_code: string;
  emp_name: string;
  emp_father_name: string;
  mobile_no: string;
  department_name: string;
  doj: string;
  status: string;
  gender: string;
  aadhaar_no: string;
  dob: string;
  present_address: string;
  [key: string]: string | number | null;
}

interface DashboardClientProps {
  counts: { approved: number; pending: number; rejected: number };
  employees: Employee[];
}

export default function DashboardClient({
  counts,
  employees: initialEmployees,
}: DashboardClientProps) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.emp_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.emp_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.mobile_no.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' || emp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  async function handleStatusChange(id: string, status: string) {
    setIsLoading(id);
    const result = await updateEmployeeStatus(id, status);
    if (result.success) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      );
    }
    setIsLoading(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    setIsLoading(id);
    const result = await deleteEmployee(id);
    if (result.success) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
    setIsLoading(null);
  }

  const statCards = [
    {
      label: 'Approved',
      count: counts.approved,
      icon: <IconCheckCircle size={22} />,
      color: '#16a34a',
      bg: '#f0fdf4',
    },
    {
      label: 'Pending',
      count: counts.pending,
      icon: <IconClock size={22} />,
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      label: 'Rejected',
      count: counts.rejected,
      icon: <IconXCircle size={22} />,
      color: '#dc2626',
      bg: '#fef2f2',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: '#6b6b6b', margin: 0 }}>
            Overview of all employee records
          </p>
        </div>
        <Link
          href="/dashboard/add"
          className="btn btn-primary"
          style={{ fontSize: 14, fontWeight: 600 }}
        >
          <IconPlus size={18} />
          Add Employee
        </Link>
      </div>

      {/* Status Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            className="card"
            style={{
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              cursor: 'pointer',
            }}
            onClick={() =>
              setStatusFilter(
                statusFilter === card.label.toLowerCase()
                  ? 'all'
                  : card.label.toLowerCase()
              )
            }
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>
            <div>
              <p
                style={{
                  fontSize: 13,
                  color: '#6b6b6b',
                  margin: '0 0 2px',
                  fontWeight: 400,
                }}
              >
                {card.label}
              </p>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#1a1a1a',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {card.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table section */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Table toolbar */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e5e5e3',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
            Employee Records
            <span
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: '#9b9b9b',
                marginLeft: 8,
              }}
            >
              ({filteredEmployees.length})
            </span>
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9b9b9b',
                }}
              >
                <IconSearch size={16} />
              </div>
              <input
                className="input-field"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: 36,
                  width: 240,
                  fontSize: 13,
                  height: 38,
                }}
              />
            </div>

            {/* Status filter */}
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 140, fontSize: 13, height: 38 }}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Emp Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Mobile</th>
                <th>Date of Joining</th>
                <th>Gender</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: 'center',
                      padding: '48px 16px',
                      color: '#9b9b9b',
                    }}
                  >
                    <p style={{ fontSize: 15, margin: '0 0 4px' }}>
                      No employees found
                    </p>
                    <p style={{ fontSize: 13, margin: 0 }}>
                      {employees.length === 0
                        ? 'Click "Add Employee" to get started'
                        : 'Try adjusting your search or filters'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <Fragment key={emp.id}>
                    <tr>
                      <td style={{ fontWeight: 500 }}>{emp.emp_code}</td>
                      <td>
                        <div>
                          <span style={{ fontWeight: 500 }}>{emp.emp_name}</span>
                          <br />
                          <span style={{ fontSize: 12, color: '#9b9b9b' }}>
                            S/o {emp.emp_father_name}
                          </span>
                        </div>
                      </td>
                      <td>{emp.department_name}</td>
                      <td>{emp.mobile_no}</td>
                      <td>
                        {emp.doj
                          ? new Date(emp.doj).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td>{emp.gender === 'M' ? 'Male' : emp.gender === 'F' ? 'Female' : emp.gender}</td>
                      <td>
                        <StatusBadge status={emp.status} />
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                          }}
                        >
                          {/* View details */}
                          <button
                            className="btn btn-ghost"
                            title="View details"
                            onClick={() =>
                              setExpandedRow(
                                expandedRow === emp.id ? null : emp.id
                              )
                            }
                          >
                            <IconEye size={16} />
                          </button>

                          {/* Approve */}
                          {emp.status !== 'approved' && (
                            <button
                              className="btn btn-ghost"
                              title="Approve"
                              disabled={isLoading === emp.id}
                              onClick={() => handleStatusChange(emp.id, 'approved')}
                              style={{ color: '#16a34a' }}
                            >
                              <IconCheck size={16} />
                            </button>
                          )}

                          {/* Reject */}
                          {emp.status !== 'rejected' && (
                            <button
                              className="btn btn-ghost"
                              title="Reject"
                              disabled={isLoading === emp.id}
                              onClick={() => handleStatusChange(emp.id, 'rejected')}
                              style={{ color: '#dc2626' }}
                            >
                              <IconXCircle size={16} />
                            </button>
                          )}

                          {/* Edit */}
                          <Link
                            href={`/dashboard/edit/${emp.id}`}
                            className="btn btn-ghost"
                            title="Edit"
                          >
                            <IconEdit size={16} />
                          </Link>

                          {/* Delete */}
                          <button
                            className="btn btn-ghost"
                            title="Delete"
                            disabled={isLoading === emp.id}
                            onClick={() => handleDelete(emp.id)}
                            style={{ color: '#dc2626' }}
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded details row */}
                    {expandedRow === emp.id && (
                      <tr key={`${emp.id}-details`}>
                        <td colSpan={8} style={{ background: '#fafaf8', padding: '20px 24px' }}>
                          <div
                            className="animate-fade-in"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                              gap: '14px 24px',
                            }}
                          >
                            {[
                              { label: 'E.Code', value: emp.e_code },
                              { label: 'Aadhaar No', value: emp.aadhaar_no },
                              { label: 'PAN No', value: emp.pan_no },
                              { label: 'ESIC No', value: emp.esic_no },
                              { label: 'UAN No', value: emp.uan_no },
                              { label: 'EPFO Joining', value: emp.epfo_joining },
                              { label: 'DOB', value: emp.dob ? new Date(emp.dob).toLocaleDateString('en-IN') : null },
                              { label: 'Pay Day', value: emp.pay_day },
                              { label: 'Qualification', value: emp.qualification },
                              { label: 'Nominee', value: emp.nominee_name },
                              { label: 'Relation', value: emp.relation_name },
                              { label: 'Present Address', value: emp.present_address },
                              { label: 'Permanent Address', value: emp.permanent_address },
                              { label: 'District', value: emp.district_name },
                              { label: 'State', value: emp.state_name },
                              { label: 'PIN Code', value: emp.pin_code },
                              { label: 'IFSC Code', value: emp.ifsc_code },
                              { label: 'Account No', value: emp.account_no },
                              { label: 'Narration', value: emp.narration },
                            ].map(
                              (item) =>
                                item.value && (
                                  <div key={item.label}>
                                    <p style={{ fontSize: 11, color: '#9b9b9b', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.05em' }}>
                                      {item.label}
                                    </p>
                                    <p style={{ fontSize: 14, color: '#1a1a1a', margin: 0 }}>
                                      {String(item.value)}
                                    </p>
                                  </div>
                                )
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}
