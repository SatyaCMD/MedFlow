'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: any;
  category?: string;
  [key: string]: any;
}

export type SelectOption = CustomSelectOption;

export interface CustomSelectProps {
  options: (string | CustomSelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: any;
  className?: string;
  disabled?: boolean;
  label?: string;
  [key: string]: any;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  icon,
  className = '',
  disabled = false,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to object format
  const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const renderIcon = (ic: any) => {
    if (!ic) return null;
    if (typeof ic === 'function') {
      return React.createElement(ic, { className: 'w-4 h-4' });
    }
    return ic;
  };

  // Click Outside Handler to auto-close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative w-full text-left font-sans ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          {label}
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border rounded-xl text-xs font-bold text-slate-900 transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
          isOpen ? 'border-blue-600 ring-2 ring-blue-500/20 bg-white' : 'border-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon || selectedOption?.icon ? (
            <span className="text-blue-600 shrink-0">
              {renderIcon(selectedOption?.icon || icon)}
            </span>
          ) : null}
          <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-50 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-300"
          >
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-800 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="text-blue-600 shrink-0">{opt.icon}</span>}
                    <div>
                      <span className="block truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="block text-[10px] text-slate-400 font-normal truncate">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
