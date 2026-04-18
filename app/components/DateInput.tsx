'use client';

import { useState, useEffect } from 'react';

interface DateInputProps {
  id: string;
  value: string; // ISO format YYYY-MM-DD from parent
  onChange: (isoDate: string) => void;
  required?: boolean;
  showAgeWarning?: boolean; // only for DOB
}

function isoToDisplay(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return '';
  const yy = parts[0].slice(-2); // last 2 digits of year
  return `${parts[2]}/${parts[1]}/${yy}`;
}

function expandYear(yy: number): number {
  // YY <= 50 → 20YY, YY > 50 → 19YY
  return yy <= 50 ? 2000 + yy : 1900 + yy;
}

function displayToIso(display: string): string {
  const clean = display.replace(/\D/g, '');
  if (clean.length === 6) {
    const dd = clean.slice(0, 2);
    const mm = clean.slice(2, 4);
    const yy = parseInt(clean.slice(4, 6), 10);
    const yyyy = expandYear(yy);
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
}

function calculateAge(isoDate: string): number | null {
  if (!isoDate) return null;
  const birth = new Date(isoDate);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function isValidDate(dd: number, mm: number, yyyy: number): boolean {
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;
  if (yyyy < 1900 || yyyy > 2100) return false;
  const date = new Date(yyyy, mm - 1, dd);
  return (
    date.getFullYear() === yyyy &&
    date.getMonth() === mm - 1 &&
    date.getDate() === dd
  );
}

export default function DateInput({
  id,
  value,
  onChange,
  required = false,
  showAgeWarning = false,
}: DateInputProps) {
  const [display, setDisplay] = useState(() => isoToDisplay(value));
  const [error, setError] = useState('');
  const [ageWarning, setAgeWarning] = useState('');

  // Sync display when value changes externally
  useEffect(() => {
    const newDisplay = isoToDisplay(value);
    if (newDisplay !== display && value) {
      setDisplay(newDisplay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Only allow digits and slashes
    let cleaned = raw.replace(/[^\d/]/g, '');

    // Auto-insert slashes
    const digits = cleaned.replace(/\//g, '');
    if (digits.length <= 6) {
      let formatted = '';
      for (let i = 0; i < digits.length; i++) {
        if (i === 2 || i === 4) formatted += '/';
        formatted += digits[i];
      }
      cleaned = formatted;
    }

    setDisplay(cleaned);
    setError('');
    setAgeWarning('');

    // If complete (DD/MM/YY = 8 chars)
    if (cleaned.length === 8) {
      const parts = cleaned.split('/');
      const dd = parseInt(parts[0], 10);
      const mm = parseInt(parts[1], 10);
      const yy = parseInt(parts[2], 10);
      const yyyy = expandYear(yy);

      if (!isValidDate(dd, mm, yyyy)) {
        setError('Invalid date');
        onChange('');
        return;
      }

      const iso = displayToIso(cleaned);
      onChange(iso);

      // Age warning for DOB
      if (showAgeWarning && iso) {
        const age = calculateAge(iso);
        if (age !== null) {
          if (age < 18) {
            setAgeWarning(`⚠ Age is ${age} — employee is under 18`);
          } else if (age > 58) {
            setAgeWarning(`⚠ Age is ${age} — employee is above 58`);
          }
        }
      }
    } else {
      // Incomplete — clear the ISO value
      if (cleaned.length > 0 && cleaned.length < 8) {
        onChange('');
      }
    }
  }

  function handleBlur() {
    if (display && display.length > 0 && display.length < 8) {
      setError('Enter complete date (DD/MM/YY)');
    }
  }

  return (
    <div className="date-input-wrapper">
      <input
        className={`input-field ${error ? 'input-field-error' : ''}`}
        id={id}
        type="text"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="DD/MM/YY"
        maxLength={8}
        required={required}
        inputMode="numeric"
        autoComplete="off"
      />
      {error && <span className="field-error">{error}</span>}
      {ageWarning && <span className="field-warning">{ageWarning}</span>}
    </div>
  );
}
