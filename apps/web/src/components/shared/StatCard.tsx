'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  change?: number; // e.g. +12.3 or -4.5
  changeLabel?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  change,
  changeLabel = 'vs last month',
}) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-white border border-slate-200 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-slate-700">{title}</span>
        {Icon && (
          <div className="p-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl">
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 tabular-nums">{value}</h2>
        {description && <span className="text-xs text-slate-600 font-medium mt-1">{description}</span>}
      </div>

      {change !== undefined && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
              isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isPositive ? `+${change}%` : `${change}%`}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">{changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
};
