import React from 'react';
import { MapPin, CheckCircle2, Camera, FileCheck } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onSelectStep: (step: number) => void;
}

const steps = [
  { id: 1, title: 'Vị trí', icon: MapPin },
  { id: 2, title: 'Hạng mục', icon: CheckCircle2 },
  { id: 3, title: 'Bằng chứng', icon: Camera },
  { id: 4, title: 'Đệ trình', icon: FileCheck },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onSelectStep,
}) => {
  return (
    <div className="w-full bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm mb-6">
      <div className="flex items-center justify-between relative">
        {/* Thanh kết nối giữa các bước */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-100 -z-0">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-sky-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className="group flex flex-col items-center relative z-10 focus:outline-none"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-bold text-xs ${
                  isCompleted
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-100'
                    : isCurrent
                    ? 'bg-sky-600 text-white ring-4 ring-sky-100 shadow-md scale-105'
                    : 'bg-white text-slate-400 border-2 border-slate-200 group-hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`mt-1.5 text-[11px] font-semibold tracking-tight transition-colors ${
                  isCurrent
                    ? 'text-sky-600 font-bold'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
