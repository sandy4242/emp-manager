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
import * as XLSX from 'xlsx';

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
  const [exportAlert, setExportAlert] = useState<string | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

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

  function requestDelete(id: string) {
    setEmployeeToDelete(id);
  }

  async function confirmDelete() {
    if (!employeeToDelete) return;
    const id = employeeToDelete;
    setIsLoading(id);
    const result = await deleteEmployee(id);
    if (result.success) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
    setEmployeeToDelete(null);
    setIsLoading(null);
  }

  function handleExport() {
    if (filteredEmployees.length === 0) {
      const statusLabel = statusFilter === 'all' ? 'all statuses' : statusFilter;
      setExportAlert(`No data found for ${statusLabel} to export.`);
      return;
    }

    const exportData = filteredEmployees.map(emp => ({
      'Emp Code': emp.emp_code,
      'Name': emp.emp_name,
      'Father Name': emp.emp_father_name,
      'DOB': emp.dob ? new Date(emp.dob).toLocaleDateString('en-IN') : '',
      'Gender': emp.gender === 'M' ? 'Male' : emp.gender === 'F' ? 'Female' : emp.gender,
      'Mobile No': emp.mobile_no,
      'Aadhaar No': emp.aadhaar_no,
      'PAN No': emp.pan_no || '',
      'Qualification': emp.qualification || '',
      'Company': emp.company_name || '',
      'E.Code (Alt)': emp.e_code || '',
      'DOJ': emp.doj ? new Date(emp.doj).toLocaleDateString('en-IN') : '',
      'Department': emp.department_name,
      'Pay Day': emp.pay_day || '',
      'ESIC No': emp.esic_no || '',
      'UAN No': emp.uan_no || '',
      'EPFO Joining': emp.epfo_joining || '',
      'Nominee Name': emp.nominee_name || '',
      'Relation': emp.relation_name || '',
      'Present Address': emp.present_address,
      'Permanent Address': emp.permanent_address || '',
      'District': emp.district_name || '',
      'State': emp.state_name || '',
      'PIN Code': emp.pin_code || '',
      'IFSC Code': emp.ifsc_code || '',
      'Account No': emp.account_no || '',
      'Narration': emp.narration || '',
      'Status': emp.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    
    // Auto-adjust column widths roughly based on header length
    const colWidths = Object.keys(exportData[0]).map(key => ({ wch: Math.max(12, key.length + 2) }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `Employees_${statusFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        className="dashboard-header"
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

            {/* Export button */}
            <button
              onClick={handleExport}
              style={{
                backgroundColor: '#f97316',
                color: 'white',
                border: 'none',
                height: 38,
                padding: '0 16px',
                borderRadius: '8px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Emp Code</th>
                <th style={{ width: '22%' }}>Name</th>
                <th style={{ width: '15%' }}>Department</th>
                <th style={{ width: '12%' }}>Mobile</th>
                <th style={{ width: '14%' }}>Date of Joining</th>
                <th style={{ width: '8%' }}>Gender</th>
                {/* <th>Status</th> */}
                <th style={{ width: '17%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
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
                      <td title={emp.emp_code} style={{ fontWeight: 500 }}>{emp.emp_code}</td>
                      <td title={`${emp.emp_name} S/o ${emp.emp_father_name}`}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 500 }}>{emp.emp_name}</span>
                          <br />
                          <span style={{ fontSize: 12, color: '#9b9b9b' }}>
                            S/o {emp.emp_father_name}
                          </span>
                        </div>
                      </td>
                      <td title={emp.department_name}>{emp.department_name}</td>
                      <td title={emp.mobile_no}>{emp.mobile_no}</td>
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
                      {/* <td>
                        <StatusBadge status={emp.status} />
                      </td> */}
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
                          {/* {emp.status !== 'approved' && (
                            <button
                              className="btn btn-ghost"
                              title="Approve"
                              disabled={isLoading === emp.id}
                              onClick={() => handleStatusChange(emp.id, 'approved')}
                              style={{ color: '#16a34a' }}
                            >
                              <IconCheck size={16} />
                            </button>
                          )} */}

                          {/* Reject */}
                          {/* {emp.status !== 'rejected' && (
                            <button
                              className="btn btn-ghost"
                              title="Reject"
                              disabled={isLoading === emp.id}
                              onClick={() => handleStatusChange(emp.id, 'rejected')}
                              style={{ color: '#dc2626' }}
                            >
                              <IconXCircle size={16} />
                            </button>
                          )} */}

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
                            onClick={() => requestDelete(emp.id)}
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
                        <td colSpan={7} style={{ background: '#fafaf8', padding: '20px 24px' }}>
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


      {/* Export Alert Modal */}
      {exportAlert && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content animate-fade-in" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#fffbeb',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#1a1a1a' }}>Export Unavailable</h3>
            <p style={{ fontSize: 14, color: '#6b6b6b', marginBottom: 24 }}>{exportAlert}</p>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setExportAlert(null)}>Got it</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content animate-fade-in" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <IconTrash size={32} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#1a1a1a' }}>Delete Employee?</h3>
            <p style={{ fontSize: 14, color: '#6b6b6b', marginBottom: 24 }}>This action cannot be undone. All details for this employee will be permanently removed.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={() => setEmployeeToDelete(null)} 
                disabled={isLoading === employeeToDelete}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                style={{ flex: 1, justifyContent: 'center', backgroundColor: '#dc2626', color: 'white', border: 'none' }} 
                onClick={confirmDelete} 
                disabled={isLoading === employeeToDelete}
              >
                {isLoading === employeeToDelete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
