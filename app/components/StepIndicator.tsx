'use client';

import { IconUser, IconBriefcase, IconMapPin, IconCheck } from './Icons';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const stepIcons = [
  <IconUser size={18} key="user" />,
  <IconBriefcase size={18} key="briefcase" />,
  <IconMapPin size={18} key="map" />,
];

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Step circle + label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted
                    ? '#16a34a'
                    : isActive
                    ? '#2563eb'
                    : '#f0f0ee',
                  color: isCompleted || isActive ? '#ffffff' : '#9b9b9b',
                  transition: 'all 0.3s ease',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {isCompleted ? <IconCheck size={18} /> : stepIcons[index]}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#1a1a1a' : isCompleted ? '#16a34a' : '#9b9b9b',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.3s ease',
                }}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                style={{
                  width: 80,
                  height: 2,
                  background: isCompleted ? '#16a34a' : '#e5e5e3',
                  marginBottom: 24,
                  marginLeft: 8,
                  marginRight: 8,
                  transition: 'background 0.3s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
