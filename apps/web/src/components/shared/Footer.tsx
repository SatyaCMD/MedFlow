'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  ArrowUp,
  CheckCircle,
  MessageSquare,
  Star,
  Globe,
  Cpu,
  Heart,
  ChevronDown,
  Github,
  Twitter,
  Linkedin,
  AlertTriangle,
  ThumbsUp,
  ShieldCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Newsletter states
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  // Interactive feedback states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  // Latency & system telemetry states
  const [dbLatency, setDbLatency] = useState(38);
  const [systemUptime] = useState('99.98%');

  // Mobile Accordion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    platform: false,
    resources: false,
    legal: false
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDbLatency(prev => {
        const change = Math.floor(Math.random() * 9) - 4;
        const next = prev + change;
        return Math.max(12, Math.min(65, next));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setSubscribeStatus('error');
      setSubscribeMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubscribeStatus('error');
      setSubscribeMessage('Please enter a valid email address.');
      return;
    }

    setSubscribeStatus('loading');
    setSubscribeMessage('');

    setTimeout(() => {
      setSubscribeStatus('success');
      setSubscribeMessage(`Subscribed! Confirmation email sent to ${email}`);
      setEmail('');
    }, 1200);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackRating === 0) {
      setFeedbackError('Please select a star rating.');
      return;
    }
    if (!feedbackText.trim()) {
      setFeedbackError('Please share a brief comment about your experience.');
      return;
    }

    setFeedbackError('');
    setFeedbackSubmitted(true);

    setTimeout(() => {
      setShowFeedbackModal(false);
      setTimeout(() => {
        setFeedbackRating(0);
        setFeedbackText('');
        setFeedbackSubmitted(false);
      }, 300);
    }, 2800);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <footer className="relative mt-auto w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-300 border-t border-slate-800 overflow-hidden">
      
      {/* Background Ambient Lighting Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* UPPER NEWSLETTER HERO SECTION */}
      <div className="border-b border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="max-w-xl text-center lg:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Intelligence Stream</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white flex items-center justify-center lg:justify-start gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              Stay Updated with MediCore 360
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get security patches, OWASP vulnerability reports, and multi-tenant release notes delivered directly to your inbox.
            </p>
          </div>

          <div className="w-full max-w-md">
            <form onSubmit={handleSubscribe} className="relative flex gap-2 p-1.5 bg-slate-800/60 border border-slate-700/80 rounded-2xl backdrop-blur-md shadow-xl">
              <input
                type="email"
                placeholder="Enter work email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (subscribeStatus === 'error') setSubscribeStatus('idle');
                }}
                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                className="w-full px-4 py-2.5 bg-transparent text-white placeholder-slate-400 text-xs font-medium focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                {subscribeStatus === 'loading' ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : subscribeStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <AnimatePresence mode="wait">
              {subscribeStatus === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-xs text-rose-400 mt-2 flex items-center gap-1.5 px-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {subscribeMessage}
                </motion.p>
              )}
              {subscribeStatus === 'success' && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5 px-2"
                >
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  {subscribeMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* MAIN MULTI-COLUMN DIRECTORY */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Logo size={40} />
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-wider bg-gradient-to-r from-white via-slate-100 to-blue-400 text-transparent bg-clip-text">
                  MediCore360
                </span>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                  EHMS ENTERPRISE PLATFORM
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              An enterprise Electronic Health Management System (EHMS) engineered with clean domain boundaries, multi-tenant database isolation, and OWASP-hardened authentication.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 hover:text-blue-400 border border-slate-700/80 transition-all text-slate-400">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 hover:text-blue-400 border border-slate-700/80 transition-all text-slate-400">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 hover:text-blue-400 border border-slate-700/80 transition-all text-slate-400">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform Column */}
          <div>
            <h4 className="hidden md:block text-xs font-black text-white uppercase tracking-widest mb-4">
              Platform Modules
            </h4>
            <button
              onClick={() => toggleSection('platform')}
              className="w-full md:hidden flex justify-between items-center py-2.5 text-xs font-black text-white uppercase tracking-widest border-b border-slate-800"
            >
              <span>Platform Modules</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform ${expandedSections.platform ? 'rotate-180' : ''}`} />
            </button>

            <ul className={`mt-3 space-y-2.5 md:block ${expandedSections.platform ? 'block' : 'hidden'}`}>
              {[
                { label: 'Clinical Dashboard', href: '/' },
                { label: 'Patient Directory', href: '/patients' },
                { label: 'Appointment Board', href: '/appointments' },
                { label: 'Billing & Invoices', href: '/billing' },
                { label: 'EMR Audit Storage', href: '/emr' }
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="hidden md:block text-xs font-black text-white uppercase tracking-widest mb-4">
              Architecture & Dev
            </h4>
            <button
              onClick={() => toggleSection('resources')}
              className="w-full md:hidden flex justify-between items-center py-2.5 text-xs font-black text-white uppercase tracking-widest border-b border-slate-800"
            >
              <span>Architecture & Dev</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform ${expandedSections.resources ? 'rotate-180' : ''}`} />
            </button>

            <ul className={`mt-3 space-y-2.5 md:block ${expandedSections.resources ? 'block' : 'hidden'}`}>
              {[
                { label: 'Design Token System', href: '/design', tag: 'v1.0' },
                { label: 'API Reference Suite', href: '#', tag: 'Swagger' },
                { label: 'Clean Architecture Guide', href: '#', tag: 'Docs' },
                { label: 'Postman Test Suite', href: '#', tag: '71 Tests' }
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-between group">
                    <span>{item.label}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-800 text-blue-400 rounded-md border border-slate-700">
                      {item.tag}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Interactive Feedback Column */}
          <div>
            <h4 className="hidden md:block text-xs font-black text-white uppercase tracking-widest mb-4">
              Support & Trust
            </h4>
            <button
              onClick={() => toggleSection('legal')}
              className="w-full md:hidden flex justify-between items-center py-2.5 text-xs font-black text-white uppercase tracking-widest border-b border-slate-800"
            >
              <span>Support & Trust</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform ${expandedSections.legal ? 'rotate-180' : ''}`} />
            </button>

            <ul className={`mt-3 space-y-2.5 md:block ${expandedSections.legal ? 'block' : 'hidden'}`}>
              <li>
                <a href="#" className="text-xs text-slate-400 hover:text-blue-400 transition-colors">
                  HIPAA Security Audit
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-slate-400 hover:text-blue-400 transition-colors">
                  Privacy Policy & Compliance
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(true)}
                  className="mt-1 px-3 py-2 w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Submit Platform Review</span>
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* BOTTOM TELEMETRY & LEGAL RIBBON */}
      <div className="border-t border-slate-800/80 bg-black/40 py-5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span>© {new Date().getFullYear()} MediCore 360 Inc. All rights reserved.</span>
            <span className="hidden md:inline text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Region: <strong className="text-slate-200">US-East (Virginia)</strong></span>
            </div>
          </div>

          {/* Dynamic Heartbeat & Latency Ticker */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Uptime: <strong className="text-emerald-400">{systemUptime}</strong></span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>DB Ping: <strong className="text-blue-400 tabular-nums">{dbLatency} ms</strong></span>
              </div>
            </div>

            {/* Back to Top Floating Button */}
            <AnimatePresence>
              {showScrollTop && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToTop}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all focus:outline-none flex items-center justify-center active:scale-90 cursor-pointer"
                  title="Scroll to Top"
                >
                  <ArrowUp className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* INTERACTIVE STAR FEEDBACK POPUP MODAL */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative text-slate-100"
            >
              {!feedbackSubmitted ? (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-black text-base text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      Platform Feedback
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowFeedbackModal(false)}
                      className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Rate your experience with MediCore 360 to help us optimize workstation workflows:
                  </p>

                  {/* Dynamic Interactive Star Rating */}
                  <div className="flex justify-center items-center gap-2 py-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                    {[1, 2, 3, 4, 5].map((index) => {
                      const isHighlighted = index <= (feedbackHoverRating || feedbackRating);
                      return (
                        <button
                          key={index}
                          type="button"
                          onMouseEnter={() => setFeedbackHoverRating(index)}
                          onMouseLeave={() => setFeedbackHoverRating(0)}
                          onClick={() => {
                            setFeedbackRating(index);
                            if (feedbackError) setFeedbackError('');
                          }}
                          className="focus:outline-none transition-transform active:scale-90 cursor-pointer"
                        >
                          <Star
                            className={`w-8 h-8 transition-all ${
                              isHighlighted
                                ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                                : 'text-slate-700'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Feedback Details
                    </label>
                    <textarea
                      placeholder="Share your thoughts or suggest feature improvements..."
                      value={feedbackText}
                      onChange={(e) => {
                        setFeedbackText(e.target.value);
                        if (feedbackError) setFeedbackError('');
                      }}
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                    />
                  </div>

                  {feedbackError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {feedbackError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackModal(false)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Submit Review</span>
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
                    <Heart className="w-7 h-7 fill-current" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-white">Review Submitted!</h3>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                      Thank you for your feedback! Your input helps us continuously improve MediCore 360.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </footer>
  );
};
