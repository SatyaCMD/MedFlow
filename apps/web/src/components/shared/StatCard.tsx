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
      className="p-6 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className="p-2 bg-slate-950 border border-slate-800 text-blue-400 rounded-xl">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-slate-100 tabular-nums">{value}</h2>
        {description && <span className="text-xs text-slate-400 mt-1">{description}</span>}
      </div>

      {change !== undefined && (
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2">
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isPositive ? `+${change}%` : `${change}%`}</span>
          </div>
          <span className="text-[10px] text-slate-500">{changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
};
