'use client';

import { useState } from 'react';
import Link from 'next/link';
import StepIndicator from '../../components/StepIndicator';
import SuccessModal from '../../components/SuccessModal';
import { IconArrowLeft, IconArrowRight, IconCheck, IconLoader } from '../../components/Icons';
import { createEmployee } from '../../actions/employees';

const STEPS = ['Personal Details', 'Employment Details', 'Address & Bank'];

interface FormData {
  [key: string]: string;
}

export default function AddEmployeePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    emp_name: '',
    emp_father_name: '',
    dob: '',
    gender: '',
    mobile_no: '',
    aadhaar_no: '',
    pan_no: '',
    qualification: '',
    emp_code: '',
    e_code: '',
    doj: '',
    department_name: '',
    pay_day: '',
    esic_no: '',
    uan_no: '',
    epfo_joining: '',
    nominee_name: '',
    relation_name: '',
    present_address: '',
    permanent_address: '',
    district_name: '',
    state_name: '',
    pin_code: '',
    ifsc_code: '',
    account_no: '',
    narration: '',
  });

  function handleInputChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  function validateStep(step: number): boolean {
    switch (step) {
      case 0: {
        const required = ['emp_name', 'emp_father_name', 'dob', 'gender', 'mobile_no', 'aadhaar_no'];
        const missing = required.filter((f) => !formData[f]);
        if (missing.length > 0) {
          setError('Please fill in all required fields marked with *');
          return false;
        }
        return true;
      }
      case 1: {
        const required = ['emp_code', 'doj', 'department_name'];
        const missing = required.filter((f) => !formData[f]);
        if (missing.length > 0) {
          setError('Please fill in all required fields marked with *');
          return false;
        }
        return true;
      }
      case 2: {
        const required = ['present_address'];
        const missing = required.filter((f) => !formData[f]);
        if (missing.length > 0) {
          setError('Please fill in all required fields marked with *');
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  }

  function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      setError('');
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError('');
  }

  async function handleSubmit() {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setError('');

    const result = await createEmployee(formData);

    if (result.success) {
      setShowSuccess(true);
    } else {
      setError(result.error || 'Failed to add employee. Please try again.');
    }
    setIsSubmitting(false);
  }

  function renderField(
    label: string,
    field: string,
    options?: {
      required?: boolean;
      type?: string;
      placeholder?: string;
      selectOptions?: { value: string; label: string }[];
      fullWidth?: boolean;
    }
  ) {
    const { required = false, type = 'text', placeholder = '', selectOptions, fullWidth = false } = options || {};

    return (
      <div
        className="input-group"
        style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}
      >
        <label className="input-label" htmlFor={field}>
          {label}
          {required && <span className="required">*</span>}
        </label>
        {selectOptions ? (
          <select
            className="input-field"
            id={field}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            required={required}
          >
            <option value="">Select {label}</option>
            {selectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            className="input-field"
            id={field}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            required={required}
            rows={3}
            style={{ resize: 'vertical' }}
          />
        ) : (
          <input
            className="input-field"
            id={field}
            type={type}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            required={required}
          />
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <SuccessModal show={showSuccess} message="Employee added successfully!" />

      {/* Back link */}
      <Link
        href="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 14,
          color: '#6b6b6b',
          textDecoration: 'none',
          marginBottom: 24,
        }}
      >
        <IconArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Form card */}
      <div className="card" style={{ maxWidth: 800, margin: '0 auto', padding: '40px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', textAlign: 'center' }}>
          Add New Employee
        </h1>
        <p style={{ fontSize: 14, color: '#6b6b6b', margin: '0 0 32px', textAlign: 'center' }}>
          Fill in the employee details below
        </p>

        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} steps={STEPS} />

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              marginBottom: 24,
              fontSize: 13,
              color: '#dc2626',
            }}
          >
            {error}
          </div>
        )}

        {/* Step 1: Personal Details */}
        {currentStep === 0 && (
          <div
            className="animate-fade-in"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {renderField('Employee Name', 'emp_name', {
              required: true,
              placeholder: 'Full name of employee',
            })}
            {renderField("Father's Name", 'emp_father_name', {
              required: true,
              placeholder: "Father's full name",
            })}
            {renderField('Date of Birth', 'dob', {
              required: true,
              type: 'date',
            })}
            {renderField('Gender', 'gender', {
              required: true,
              selectOptions: [
                { value: 'M', label: 'Male' },
                { value: 'F', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ],
            })}
            {renderField('Mobile Number', 'mobile_no', {
              required: true,
              type: 'tel',
              placeholder: '10-digit mobile number',
            })}
            {renderField('Aadhaar Number', 'aadhaar_no', {
              required: true,
              placeholder: '12-digit Aadhaar number',
            })}
            {renderField('PAN Number', 'pan_no', {
              placeholder: 'PAN card number',
            })}
            {renderField('Qualification', 'qualification', {
              placeholder: 'e.g., 10TH, 12TH, GRADUATE',
            })}
          </div>
        )}

        {/* Step 2: Employment Details */}
        {currentStep === 1 && (
          <div
            className="animate-fade-in"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {renderField('Employee Code', 'emp_code', {
              required: true,
              placeholder: 'Unique employee code',
            })}
            {renderField('E.Code (Alternate)', 'e_code', {
              placeholder: 'Alternate code',
            })}
            {renderField('Date of Joining', 'doj', {
              required: true,
              type: 'date',
            })}
            {renderField('Department', 'department_name', {
              required: true,
              placeholder: 'e.g., OPERATOR, ADMIN',
            })}
            {renderField('Pay Day', 'pay_day', {
              type: 'number',
              placeholder: 'Day of month',
            })}
            {renderField('ESIC Number', 'esic_no', {
              placeholder: 'ESIC number',
            })}
            {renderField('UAN Number', 'uan_no', {
              placeholder: 'UAN number',
            })}
            {renderField('EPFO Joining', 'epfo_joining', {
              placeholder: 'e.g., OK',
            })}
            {renderField('Nominee Name', 'nominee_name', {
              placeholder: 'Nominee full name',
            })}
            {renderField('Relation with Nominee', 'relation_name', {
              placeholder: 'e.g., FATHER, MOTHER, SPOUSE',
            })}
          </div>
        )}

        {/* Step 3: Address & Bank */}
        {currentStep === 2 && (
          <div
            className="animate-fade-in"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {renderField('Present Address', 'present_address', {
              required: true,
              type: 'textarea',
              placeholder: 'Current residential address',
              fullWidth: true,
            })}
            {renderField('Permanent Address', 'permanent_address', {
              type: 'textarea',
              placeholder: 'Permanent address (if different)',
              fullWidth: true,
            })}
            {renderField('District', 'district_name', {
              placeholder: 'District name',
            })}
            {renderField('State', 'state_name', {
              placeholder: 'State name',
            })}
            {renderField('PIN Code', 'pin_code', {
              placeholder: '6-digit PIN code',
            })}
            {renderField('IFSC Code', 'ifsc_code', {
              placeholder: 'Bank IFSC code',
            })}
            {renderField('Account Number', 'account_no', {
              placeholder: 'Bank account number',
            })}
            {renderField('Narration / Remarks', 'narration', {
              placeholder: 'Any additional remarks',
            })}
          </div>
        )}

        {/* Navigation buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 32,
            paddingTop: 24,
            borderTop: '1px solid #e5e5e3',
          }}
        >
          {currentStep > 0 ? (
            <button
              className="btn btn-secondary"
              onClick={handleBack}
              type="button"
            >
              <IconArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              type="button"
            >
              Next
              <IconArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={isSubmitting}
              type="button"
              style={{ paddingLeft: 24, paddingRight: 24 }}
            >
              {isSubmitting ? (
                <>
                  <IconLoader size={16} />
                  Submitting...
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  Submit
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
