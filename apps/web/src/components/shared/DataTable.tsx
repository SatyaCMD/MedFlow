'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found matching current query.',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
      {/* Scrollable table container */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-100/90 sticky top-0 backdrop-blur-sm z-10 border-b border-slate-200">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-700 ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              // Loading Skeletons
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State view
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                    <AlertCircle className="w-10 h-10 text-slate-400" />
                    <span className="text-sm font-semibold">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows rendering
              data.map((row, rIdx) => (
                <motion.tr
                  key={rIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: rIdx * 0.05 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-6 py-4 text-xs text-slate-800 font-semibold ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control panel */}
      {totalPages > 1 && (
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>
            Page <strong className="text-slate-900 font-bold">{currentPage}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white disabled:opacity-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white disabled:opacity-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
