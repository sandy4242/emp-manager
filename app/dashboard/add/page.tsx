'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StepIndicator from '../../components/StepIndicator';
import SuccessModal from '../../components/SuccessModal';
import DateInput from '../../components/DateInput';
import ComboBox from '../../components/ComboBox';
import { IconArrowLeft, IconArrowRight, IconCheck, IconLoader } from '../../components/Icons';
import { createEmployee } from '../../actions/employees';

const STEPS = ['Personal Details', 'Employment Details', 'Address & Bank'];

// ─── Option Lists ───
const COMPANY_OPTIONS = [
  { value: 'APPLE', label: 'APPLE' },
  { value: 'GOOGLE', label: 'GOOGLE' },
  { value: 'MICROSOFT', label: 'MICROSOFT' },
  { value: 'AMAZON', label: 'AMAZON' },
];

const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
];

const RELATION_OPTIONS = [
  'FATHER', 'MOTHER', 'SPOUSE', 'SON', 'DAUGHTER', 'BROTHER', 'SISTER',
];

const QUALIFICATION_OPTIONS = [
  '10TH', '12TH', 'GRADUATE', 'POST GRADUATE', 'DIPLOMA', 'ITI',
];

const INDIAN_STATES = [
  'ANDHRA PRADESH', 'ARUNACHAL PRADESH', 'ASSAM', 'BIHAR', 'CHHATTISGARH',
  'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH', 'JHARKHAND',
  'KARNATAKA', 'KERALA', 'MADHYA PRADESH', 'MAHARASHTRA', 'MANIPUR',
  'MEGHALAYA', 'MIZORAM', 'NAGALAND', 'ODISHA', 'PUNJAB',
  'RAJASTHAN', 'SIKKIM', 'TAMIL NADU', 'TELANGANA', 'TRIPURA',
  'UTTAR PRADESH', 'UTTARAKHAND', 'WEST BENGAL',
  'ANDAMAN AND NICOBAR ISLANDS', 'CHANDIGARH', 'DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
  'DELHI', 'JAMMU AND KASHMIR', 'LADAKH', 'LAKSHADWEEP', 'PUDUCHERRY',
];

// ─── Validation helpers ───
const DIGITS_ONLY = /[^0-9]/g;
const ALPHA_ONLY = /[^A-Za-z]/g;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

interface FormData {
  [key: string]: string;
}

// Fields that only accept digits and their max lengths
const NUMERIC_FIELDS: Record<string, number> = {
  esic_no: 10,
  uan_no: 12,
  mobile_no: 10,
  aadhaar_no: 12,
  pin_code: 6,
};

// Fields where trailing spaces should be trimmed on blur
const TRIM_FIELDS = ['emp_name', 'emp_father_name', 'nominee_name'];

export default function AddEmployeePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    emp_name: '',
    emp_father_name: '',
    dob: '',
    gender: '',
    mobile_no: '',
    aadhaar_no: '',
    pan_no: '',
    qualification: '',
    company_name: '',
    emp_code: '',
    e_code: '',
    doj: '',
    department_name: '',
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

  // ─── Pincode API state ───
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  // Fetch districts when pincode becomes 6 digits
  const fetchPincodeData = useCallback(async (pincode: string) => {
    if (pincode.length !== 6) {
      setDistrictOptions([]);
      setPincodeError('');
      return;
    }
    setPincodeLoading(true);
    setPincodeError('');
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const json = await res.json();
      if (json[0]?.Status === 'Success' && json[0]?.PostOffice?.length > 0) {
        const postOffices = json[0].PostOffice;
        const districts: string[] = [...new Set(postOffices.map((po: any) => (po.District || '').toUpperCase()))] as string[];
        setDistrictOptions(districts);
        // Auto-select if only one district
        if (districts.length === 1) {
          setFormData((prev) => ({ ...prev, district_name: districts[0] }));
        } else {
          // If current district not in options, clear it
          setFormData((prev) => {
            if (!districts.includes(prev.district_name)) {
              return { ...prev, district_name: districts[0] };
            }
            return prev;
          });
        }
        // Auto-fill state from first post office
        const state = (postOffices[0].State || '').toUpperCase();
        if (state) {
          setFormData((prev) => ({ ...prev, state_name: state }));
        }
      } else {
        setDistrictOptions([]);
        setPincodeError('Invalid pincode or no data found');
      }
    } catch {
      setPincodeError('Failed to verify pincode');
      setDistrictOptions([]);
    } finally {
      setPincodeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPincodeData(formData.pin_code);
  }, [formData.pin_code, fetchPincodeData]);

  function handleInputChange(field: string, value: string) {
    // Numeric-only fields: strip non-digits and enforce max length
    if (NUMERIC_FIELDS[field] !== undefined) {
      value = value.replace(DIGITS_ONLY, '');
      if (value.length > NUMERIC_FIELDS[field]) {
        value = value.slice(0, NUMERIC_FIELDS[field]);
      }
    }
    // Name fields: letters and spaces only, uppercase
    else if (TRIM_FIELDS.includes(field)) {
      value = value.toUpperCase().replace(/[^A-Z\s]/g, '').replace(/\s+/g, ' ');
      if (value.startsWith(' ')) value = value.trimStart();
    }
    // PAN: enforce format mask (5 alpha + 4 digits + 1 alpha)
    else if (field === 'pan_no') {
      value = value.toUpperCase();
      let masked = '';
      const raw = value.replace(/[^A-Z0-9]/g, '');
      for (let i = 0; i < Math.min(raw.length, 10); i++) {
        if (i < 5) {
          // first 5 must be letters
          if (/[A-Z]/.test(raw[i])) masked += raw[i];
        } else if (i < 9) {
          // next 4 must be digits
          if (/[0-9]/.test(raw[i])) masked += raw[i];
        } else {
          // last 1 must be letter
          if (/[A-Z]/.test(raw[i])) masked += raw[i];
        }
      }
      value = masked;
    }
    // IFSC: enforce format mask (4 alpha + '0' + 6 alphanum)
    else if (field === 'ifsc_code') {
      value = value.toUpperCase();
      let masked = '';
      const raw = value.replace(/[^A-Z0-9]/g, '');
      for (let i = 0; i < Math.min(raw.length, 11); i++) {
        if (i < 4) {
          // first 4 must be letters
          if (/[A-Z]/.test(raw[i])) masked += raw[i];
        } else if (i === 4) {
          // 5th must be zero
          if (raw[i] === '0') masked += '0';
        } else {
          // remaining 6 can be alphanumeric
          if (/[A-Z0-9]/.test(raw[i])) masked += raw[i];
        }
      }
      value = masked;
    }
    // Account number: keep as-is (save as text), but trim
    else if (field === 'account_no') {
      // no transform — preserve leading zeros
    }
    // All other text fields: uppercase
    else {
      value = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    // Clear field-level error when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleBlur(field: string) {
    if (TRIM_FIELDS.includes(field)) {
      setFormData((prev) => ({ ...prev, [field]: prev[field].trim() }));
    }
  }

  function setFieldError(field: string, msg: string) {
    setFieldErrors((prev) => ({ ...prev, [field]: msg }));
  }

  function validateStep(step: number): boolean {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: {
        if (!formData.company_name) errors.company_name = 'Required';
        if (!formData.emp_name.trim()) errors.emp_name = 'Required';
        if (!formData.emp_father_name.trim()) errors.emp_father_name = 'Required';
        if (!formData.dob) errors.dob = 'Required';
        if (!formData.gender) errors.gender = 'Required';

        if (!formData.mobile_no) errors.mobile_no = 'Required';
        else if (formData.mobile_no.length !== 10) errors.mobile_no = 'Must be exactly 10 digits';

        if (!formData.aadhaar_no) errors.aadhaar_no = 'Required';
        else if (formData.aadhaar_no.length !== 12) errors.aadhaar_no = 'Must be exactly 12 digits';

        if (!formData.pan_no) errors.pan_no = 'Required';
        else if (!PAN_REGEX.test(formData.pan_no)) errors.pan_no = 'Format: ABCDE1234F';

        if (!formData.qualification) errors.qualification = 'Required';
        break;
      }
      case 1: {
        if (!formData.emp_code.trim()) errors.emp_code = 'Required';

        if (!formData.doj) errors.doj = 'Required';
        if (!formData.department_name.trim()) errors.department_name = 'Required';

        if (formData.esic_no && formData.esic_no.length !== 10) errors.esic_no = 'Must be exactly 10 digits';
        if (formData.uan_no && formData.uan_no.length !== 12) errors.uan_no = 'Must be exactly 12 digits';
        break;
      }
      case 2: {
        if (!formData.present_address.trim()) errors.present_address = 'Required';

        // if (!formData.ifsc_code) errors.ifsc_code = 'Required';
        // else if (!IFSC_REGEX.test(formData.ifsc_code)) errors.ifsc_code = 'Format: ABCD0XXXXXX';

        // if (!formData.account_no.trim()) errors.account_no = 'Required';

        if (formData.pin_code && formData.pin_code.length !== 6) errors.pin_code = 'Must be exactly 6 digits';
        break;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the highlighted errors');
      return false;
    }

    setFieldErrors({});
    return true;
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
    setFieldErrors({});
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

  // ─── Render helpers ───

  function renderTextField(
    label: string,
    field: string,
    options?: {
      required?: boolean;
      placeholder?: string;
      fullWidth?: boolean;
      hint?: string;
      maxLength?: number;
    }
  ) {
    const { required = false, placeholder = '', fullWidth = false, hint, maxLength } = options || {};
    const hasError = !!fieldErrors[field];

    return (
      <div
        className="input-group"
        style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}
      >
        <label className="input-label" htmlFor={field}>
          {label}
          {required && <span className="required">*</span>}
        </label>
        <input
          className={`input-field input-uppercase ${hasError ? 'input-field-error' : ''}`}
          id={field}
          type="text"
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onBlur={() => handleBlur(field)}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          autoComplete="off"
        />
        {hint && !hasError && <span className="field-hint">{hint}</span>}
        {hasError && <span className="field-error">{fieldErrors[field]}</span>}
      </div>
    );
  }

  function renderNumericField(
    label: string,
    field: string,
    options?: {
      required?: boolean;
      placeholder?: string;
      hint?: string;
    }
  ) {
    const { required = false, placeholder = '', hint } = options || {};
    const hasError = !!fieldErrors[field];
    const maxLen = NUMERIC_FIELDS[field];

    return (
      <div className="input-group">
        <label className="input-label" htmlFor={field}>
          {label}
          {required && <span className="required">*</span>}
        </label>
        <input
          className={`input-field ${hasError ? 'input-field-error' : ''}`}
          id={field}
          type="text"
          inputMode="numeric"
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          required={required}
          maxLength={maxLen}
          autoComplete="off"
        />
        {hint && !hasError && <span className="field-hint">{hint}</span>}
        {hasError && <span className="field-error">{fieldErrors[field]}</span>}
      </div>
    );
  }

  function renderSelectField(
    label: string,
    field: string,
    selectOptions: { value: string; label: string }[],
    options?: { required?: boolean }
  ) {
    const { required = false } = options || {};
    const hasError = !!fieldErrors[field];

    return (
      <div className="input-group">
        <label className="input-label" htmlFor={field}>
          {label}
          {required && <span className="required">*</span>}
        </label>
        <select
          className={`input-field ${hasError ? 'input-field-error' : ''}`}
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
        {hasError && <span className="field-error">{fieldErrors[field]}</span>}
      </div>
    );
  }

  function renderTextareaField(
    label: string,
    field: string,
    options?: {
      required?: boolean;
      placeholder?: string;
      fullWidth?: boolean;
    }
  ) {
    const { required = false, placeholder = '', fullWidth = false } = options || {};
    const hasError = !!fieldErrors[field];

    return (
      <div
        className="input-group"
        style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}
      >
        <label className="input-label" htmlFor={field}>
          {label}
          {required && <span className="required">*</span>}
        </label>
        <textarea
          className={`input-field input-uppercase ${hasError ? 'input-field-error' : ''}`}
          id={field}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={3}
          style={{ resize: 'vertical' }}
        />
        {hasError && <span className="field-error">{fieldErrors[field]}</span>}
      </div>
    );
  }

  function renderDateField(
    label: string,
    field: string,
    options?: { required?: boolean; showAgeWarning?: boolean }
  ) {
    const { required = false, showAgeWarning = false } = options || {};
    const hasError = !!fieldErrors[field];

    return (
      <div className="input-group">
        <label className="input-label" htmlFor={field}>
          {label}
          {required && <span className="required">*</span>}
        </label>
        <DateInput
          id={field}
          value={formData[field]}
          onChange={(iso) => handleInputChange(field, iso)}
          required={required}
          showAgeWarning={showAgeWarning}
        />
        {hasError && <span className="field-error">{fieldErrors[field]}</span>}
      </div>
    );
  }

  function renderComboField(
    label: string,
    field: string,
    comboOptions: string[],
    options?: { required?: boolean; placeholder?: string }
  ) {
    const { required = false, placeholder } = options || {};
    const hasError = !!fieldErrors[field];

    return (
      <div className="input-group">
        <label className="input-label" htmlFor={field}>
          {label}
          {required && <span className="required">*</span>}
        </label>
        <ComboBox
          id={field}
          label={label}
          value={formData[field]}
          onChange={(val) => handleInputChange(field, val)}
          options={comboOptions}
          required={required}
          placeholder={placeholder}
        />
        {hasError && <span className="field-error">{fieldErrors[field]}</span>}
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
            className="animate-fade-in form-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {renderSelectField('Company Name', 'company_name', COMPANY_OPTIONS, {
              required: true,
            })}
            {renderTextField('Employee Name', 'emp_name', {
              required: true,
              placeholder: 'Full name of employee',
            })}
            {renderTextField("Father's Name", 'emp_father_name', {
              required: true,
              placeholder: "Father's full name",
            })}
            {renderDateField('Date of Birth', 'dob', {
              required: true,
              showAgeWarning: true,
            })}
            {renderSelectField('Gender', 'gender', GENDER_OPTIONS, {
              required: true,
            })}
            {renderNumericField('Mobile Number', 'mobile_no', {
              required: true,
              placeholder: '10-digit mobile number',
              hint: 'Exactly 10 digits',
            })}
            {renderNumericField('Aadhaar Number', 'aadhaar_no', {
              required: true,
              placeholder: '12-digit Aadhaar number',
              hint: 'Exactly 12 digits',
            })}
            {renderTextField('PAN Number', 'pan_no', {
              required: true,
              placeholder: 'e.g. ABCDE1234F',
              hint: '5 letters + 4 digits + 1 letter',
              maxLength: 10,
            })}
            {renderComboField('Qualification', 'qualification', QUALIFICATION_OPTIONS, {
              required: true,
              placeholder: 'Enter qualification',
            })}
          </div>
        )}

        {/* Step 2: Employment Details */}
        {currentStep === 1 && (
          <div
            className="animate-fade-in form-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {renderTextField('Employee Code', 'emp_code', {
              required: true,
              placeholder: 'Employee code',
            })}
            {renderTextField('E.Code (Alternate)', 'e_code', {
              placeholder: 'Alternate code',
            })}
            {renderDateField('Date of Joining', 'doj', {
              required: true,
            })}
            {renderTextField('Department', 'department_name', {
              required: true,
              placeholder: 'e.g. OPERATOR, ADMIN',
            })}
            
            {renderNumericField('ESIC Number', 'esic_no', {
              placeholder: '10-digit ESIC number',
              hint: 'Exactly 10 digits',
            })}
            {renderNumericField('UAN Number', 'uan_no', {
              placeholder: '12-digit UAN number',
              hint: 'Exactly 12 digits',
            })}
            {renderTextField('EPFO Joining', 'epfo_joining', {
              placeholder: 'e.g. OK',
            })}
            {renderTextField('Nominee Name', 'nominee_name', {
              placeholder: 'Nominee full name',
            })}
            {renderComboField('Relation with Nominee', 'relation_name', RELATION_OPTIONS, {
              placeholder: 'Enter relation',
            })}
          </div>
        )}

        {/* Step 3: Address & Bank */}
        {currentStep === 2 && (
          <div
            className="animate-fade-in form-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {renderTextareaField('Present Address', 'present_address', {
              required: true,
              placeholder: 'Current residential address',
              fullWidth: true,
            })}
            {renderTextareaField('Permanent Address', 'permanent_address', {
              placeholder: 'Permanent address (if different)',
              fullWidth: true,
            })}
            {renderNumericField('PIN Code', 'pin_code', {
              placeholder: '6-digit PIN code',
              hint: pincodeLoading ? '⏳ Verifying pincode...' : pincodeError ? undefined : 'Exactly 6 digits',
            })}
            {pincodeError && (
              <div className="input-group">
                <span className="field-error">{pincodeError}</span>
              </div>
            )}
            {districtOptions.length > 0 ? (
              renderSelectField(
                'District',
                'district_name',
                districtOptions.map((d) => ({ value: d, label: d })),
              )
            ) : (
              renderTextField('District', 'district_name', {
                placeholder: 'Enter pincode first',
              })
            )}
            {renderSelectField(
              'State',
              'state_name',
              INDIAN_STATES.map((s) => ({ value: s, label: s })),
            )}
            {renderTextField('IFSC Code', 'ifsc_code', {
              required: false,
              placeholder: 'e.g. SBIN0001234',
              hint: '4 letters + 0 + 6 chars',
              maxLength: 11,
            })}
            {renderTextField('Account Number', 'account_no', {
              required: false,
              placeholder: 'Bank account number',
            })}
            {renderTextField('Narration / Remarks', 'narration', {
              placeholder: 'Any additional remarks',
            })}
          </div>
        )}

        {/* Navigation buttons */}
        <div
          className="form-nav"
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
