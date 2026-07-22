'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Code,
  Layers,
  Activity,
  Sparkles
} from 'lucide-react';
import { Logo } from './Logo';

interface NavbarProps {
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const navLinks = [
    { label: 'Features', href: '#features', icon: Layers },
    { label: 'Interactive Demo', href: '#preview', icon: Activity },
    { label: 'Design System', href: '/design', icon: Code },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 dark:bg-slate-950/75 border-b border-slate-200/60 dark:border-slate-800/60 transition-all duration-300">
      
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Header */}
        <div 
          className="flex items-center gap-3 cursor-pointer group select-none" 
          onClick={() => router.push('/')}
        >
          <div className="relative flex items-center justify-center">
            <Logo size={34} />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
            MediCore<span className="text-blue-600">360</span>
          </span>
        </div>

        {/* Desktop Nav Items - Clean Floating Segment */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 dark:bg-slate-900/50 p-1 rounded-full border border-slate-200/50 dark:border-slate-800/50 relative">
          {navLinks.map((link) => {
            const isHovered = hoveredLink === link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                onMouseEnter={() => setHoveredLink(link.label)}
                onMouseLeave={() => setHoveredLink(null)}
                className="relative px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 rounded-full"
              >
                {isHovered && (
                  <motion.div
                    layoutId="navHover"
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-xs border border-slate-200/80 dark:border-slate-700"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">

          <Link
            href="/login"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-6 py-6 space-y-4 shadow-xl"
          >
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all"
                >
                  <link.icon className="w-4 h-4 text-blue-600" />
                  <span>{link.label}</span>
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/login');
                }}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/signup');
                }}
                className="w-full py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
};
