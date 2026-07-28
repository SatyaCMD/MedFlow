'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Code2,
  ArrowLeft,
  Terminal,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Globe
} from 'lucide-react';
import { Navbar } from '../../../components/shared/Navbar';
import { Footer } from '../../../components/shared/Footer';

export default function ApiReferenceSuitePage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);
  const [copied, setCopied] = useState(false);

  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/auth/login',
      title: 'Authenticate User & Issue JWT Pair',
      desc: 'Validates identifier and password against Argon2id hash with app pepper key, returning 15-minute access token and HTTP-only refresh token.',
      requestBody: `{\n  "identifier": "doctor@medflow.com",\n  "password": "Password123!"\n}`,
      responseBody: `{\n  "success": true,\n  "data": {\n    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n    "user": {\n      "id": "66a8...",\n      "email": "doctor@medflow.com",\n      "role": "DOCTOR"\n    }\n  }\n}`
    },
    {
      method: 'GET',
      path: '/api/v1/patients',
      title: 'Query Patient Master Registry',
      desc: 'Fetches paginated patient records strictly filtered by host header tenant isolation scope.',
      requestBody: `// Query Parameters:\n?page=1&limit=10&search=Sarah`,
      responseBody: `{\n  "success": true,\n  "data": [\n    {\n      "mrn": "MC-1049",\n      "name": "Sarah Connor",\n      "age": 34,\n      "gender": "Female"\n    }\n  ]\n}`
    },
    {
      method: 'POST',
      path: '/api/v1/emr/consultation',
      title: 'Record Clinical Consultation Note',
      desc: 'Creates a SHA-256 tamper-evident EMR consultation record linked to patient MRN.',
      requestBody: `{\n  "mrn": "MC-1049",\n  "icd10Code": "I10",\n  "prescription": "Amlodipine 5mg QD"\n}`,
      responseBody: `{\n  "success": true,\n  "auditHash": "0x8f2a...39b1",\n  "timestamp": "2026-07-28T19:40:00Z"\n}`
    }
  ];

  const current = endpoints[selectedEndpoint];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.responseBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Platform Overview</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold rounded-full mb-3">
                <Code2 className="w-3.5 h-3.5" />
                <span>OpenAPI 3.0 & Swagger Reference Suite</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                API Reference Suite Explorer
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-1 max-w-2xl">
                Explore interactive REST API endpoints, request validation DTOs, response schemas, and authentication headers.
              </p>
            </div>
          </div>
        </div>

        {/* API Playground */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Endpoint Sidebar */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">Available Endpoints</span>
            {endpoints.map((ep, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedEndpoint(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedEndpoint === idx
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                    ep.method === 'POST' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold truncate">{ep.path}</span>
                </div>
                <p className={`text-xs font-medium truncate ${selectedEndpoint === idx ? 'text-blue-100' : 'text-slate-500'}`}>
                  {ep.title}
                </p>
              </button>
            ))}
          </div>

          {/* Interactive Code Console */}
          <div className="lg:col-span-2 bg-slate-950 text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${
                    current.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  }`}>
                    {current.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-white">{current.path}</span>
                </div>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Response'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">{current.desc}</p>

              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 font-sans">
                  Request Payload DTO / Query
                </span>
                <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
                  <code>{current.requestBody}</code>
                </pre>
              </div>

              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 font-sans">
                  Response Schema (200 OK)
                </span>
                <pre className="p-4 bg-slate-900 text-blue-300 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
                  <code>{current.responseBody}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
