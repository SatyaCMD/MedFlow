'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  category?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface CustomSelectProps {
  id?: string;
  label?: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'slate';
  disabled?: boolean;
  className?: string;
}

const ACCENT_STYLES = {
  blue: {
    label: 'text-blue-900',
    trigger: 'bg-white border-blue-200 hover:border-blue-400 focus:ring-blue-500/20 text-slate-900',
    selectedBg: 'bg-blue-600 text-white',
    selectedItem: 'bg-blue-50 text-blue-700 font-bold',
    badge: 'bg-blue-100 text-blue-700',
    iconColor: 'text-blue-600',
    ring: 'focus:border-blue-600 focus:ring-blue-500/20',
  },
  purple: {
    label: 'text-purple-900',
    trigger: 'bg-white border-purple-200 hover:border-purple-400 focus:ring-purple-500/20 text-slate-900',
    selectedBg: 'bg-purple-600 text-white',
    selectedItem: 'bg-purple-50 text-purple-700 font-bold',
    badge: 'bg-purple-100 text-purple-700',
    iconColor: 'text-purple-600',
    ring: 'focus:border-purple-600 focus:ring-purple-500/20',
  },
  amber: {
    label: 'text-amber-900',
    trigger: 'bg-white border-amber-200 hover:border-amber-400 focus:ring-amber-500/20 text-slate-900',
    selectedBg: 'bg-amber-600 text-white',
    selectedItem: 'bg-amber-50 text-amber-700 font-bold',
    badge: 'bg-amber-100 text-amber-700',
    iconColor: 'text-amber-600',
    ring: 'focus:border-amber-600 focus:ring-amber-500/20',
  },
  emerald: {
    label: 'text-emerald-900',
    trigger: 'bg-white border-emerald-200 hover:border-emerald-400 focus:ring-emerald-500/20 text-slate-900',
    selectedBg: 'bg-emerald-600 text-white',
    selectedItem: 'bg-emerald-50 text-emerald-700 font-bold',
    badge: 'bg-emerald-100 text-emerald-700',
    iconColor: 'text-emerald-600',
    ring: 'focus:border-emerald-600 focus:ring-emerald-500/20',
  },
  rose: {
    label: 'text-rose-900',
    trigger: 'bg-white border-rose-200 hover:border-rose-400 focus:ring-rose-500/20 text-slate-900',
    selectedBg: 'bg-rose-600 text-white',
    selectedItem: 'bg-rose-50 text-rose-700 font-bold',
    badge: 'bg-rose-100 text-rose-700',
    iconColor: 'text-rose-600',
    ring: 'focus:border-rose-600 focus:ring-rose-500/20',
  },
  slate: {
    label: 'text-slate-700',
    trigger: 'bg-white border-slate-200 hover:border-slate-400 focus:ring-slate-500/20 text-slate-900',
    selectedBg: 'bg-slate-900 text-white',
    selectedItem: 'bg-slate-100 text-slate-900 font-bold',
    badge: 'bg-slate-200 text-slate-700',
    iconColor: 'text-slate-600',
    ring: 'focus:border-slate-600 focus:ring-slate-500/20',
  },
};

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  label,
  required,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  searchable = true,
  searchPlaceholder = 'Search options...',
  icon: IconComponent,
  accentColor = 'blue',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const style = ACCENT_STYLES[accentColor] || ACCENT_STYLES.blue;

  // Selected option details
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(term)) ||
        (opt.category && opt.category.toLowerCase().includes(term))
    );
  }, [options, searchTerm]);

  // Group filtered options by category if category is provided
  const groupedOptions = useMemo(() => {
    const hasCategories = filteredOptions.some((opt) => !!opt.category);
    if (!hasCategories) return { _all: filteredOptions };

    const map: Record<string, SelectOption[]> = {};
    filteredOptions.forEach((opt) => {
      const cat = opt.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(opt);
    });
    return map;
  }, [filteredOptions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className={`block text-[10px] font-bold uppercase tracking-wider ${style.label} mb-1`}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-left text-xs font-bold transition-all duration-200 flex items-center justify-between shadow-xs cursor-pointer ${
          style.trigger
        } ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500 shadow-md' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-1 flex-1">
          {IconComponent && <IconComponent className={`w-4 h-4 shrink-0 ${style.iconColor}`} />}
          <div className="min-w-0 flex-1">
            {selectedOption ? (
              <span className="truncate block font-bold text-slate-900 text-xs" title={selectedOption.label}>
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-slate-400 font-medium text-xs">{placeholder}</span>
            )}
          </div>
        </div>

        <div className="flex items-center shrink-0 pl-1">
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
          />
        </div>
      </button>

      {/* Popup Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-72 flex flex-col backdrop-blur-xl"
          >
            {/* Search Header */}
            {searchable && (
              <div className="p-2 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto flex-1 p-1.5 space-y-1 divide-y divide-slate-100/60 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  No matching options found
                </div>
              ) : (
                Object.entries(groupedOptions).map(([catName, catOptions]) => (
                  <div key={catName} className="pt-1 first:pt-0">
                    {catName !== '_all' && (
                      <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 rounded-md mb-1">
                        {catName}
                      </div>
                    )}

                    <div className="space-y-0.5">
                      {catOptions.map((opt) => {
                        const isSelected = opt.value === value;
                        const OptIcon = opt.icon;

                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-all duration-150 flex items-center justify-between cursor-pointer group ${
                              isSelected
                                ? style.selectedItem
                                : 'hover:bg-slate-100/80 text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {OptIcon && (
                                <OptIcon
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSelected ? style.iconColor : 'text-slate-400 group-hover:text-slate-600'
                                  }`}
                                />
                              )}
                              <div className="min-w-0">
                                <span className={`block truncate ${isSelected ? 'font-black' : 'font-semibold'}`}>
                                  {opt.label}
                                </span>
                                {opt.sublabel && (
                                  <span className="block text-[10px] text-slate-400 truncate font-normal">
                                    {opt.sublabel}
                                  </span>
                                )}
                              </div>
                            </div>

                            {isSelected && <Check className={`w-3.5 h-3.5 shrink-0 ${style.iconColor}`} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
