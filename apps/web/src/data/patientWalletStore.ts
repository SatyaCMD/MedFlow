'use client';

export interface WalletTransaction {
  id: string;
  appointmentId?: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  date: string;
  timestamp: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface PatientWallet {
  balance: number;
  transactions: WalletTransaction[];
}

const WALLET_STORAGE_KEY = 'medflow_patient_wallet_v1';

const INITIAL_WALLET: PatientWallet = {
  balance: 1500,
  transactions: [
    {
      id: 'tx-initial-101',
      appointmentId: 'APP-88402',
      type: 'CREDIT',
      amount: 1500,
      description: 'Auto-Refund: Doctor approval pending over 3 days (Appointment #APP-88402)',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
      status: 'SUCCESS',
    },
  ],
};

export function getPatientWallet(userEmail?: string): PatientWallet {
  const emptyWallet: PatientWallet = { balance: 0, transactions: [] };
  if (typeof window === 'undefined') return emptyWallet;
  try {
    const cleanEmail = (userEmail || '').trim().toLowerCase();
    const isSeedUser = !cleanEmail || cleanEmail.includes('sai_satyabrata') || cleanEmail.includes('test_admin') || cleanEmail.includes('patient@medflow.com');
    const storageKey = cleanEmail ? `${WALLET_STORAGE_KEY}_${cleanEmail}` : WALLET_STORAGE_KEY;
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      if (isSeedUser) {
        localStorage.setItem(storageKey, JSON.stringify(INITIAL_WALLET));
        return INITIAL_WALLET;
      }
      return emptyWallet;
    }
    return JSON.parse(raw);
  } catch {
    return emptyWallet;
  }
}

export function creditPatientWallet(
  amount: number,
  description: string,
  appointmentId?: string,
  userEmail?: string
): PatientWallet {
  const cleanEmail = (userEmail || '').trim().toLowerCase();
  const wallet = getPatientWallet(cleanEmail);
  const newTx: WalletTransaction = {
    id: `tx-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    appointmentId,
    type: 'CREDIT',
    amount,
    description,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    timestamp: Date.now(),
    status: 'SUCCESS',
  };

  const updatedWallet: PatientWallet = {
    balance: wallet.balance + amount,
    transactions: [newTx, ...wallet.transactions],
  };

  if (typeof window !== 'undefined') {
    try {
      const storageKey = cleanEmail ? `${WALLET_STORAGE_KEY}_${cleanEmail}` : WALLET_STORAGE_KEY;
      localStorage.setItem(storageKey, JSON.stringify(updatedWallet));
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(updatedWallet));
      window.dispatchEvent(new Event('medflow-wallet-updated'));
    } catch {
      // Non-blocking
    }
  }

  return updatedWallet;
}

export function debitPatientWallet(amount: number, description: string): PatientWallet {
  const wallet = getPatientWallet();
  if (wallet.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  const newTx: WalletTransaction = {
    id: `tx-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    type: 'DEBIT',
    amount,
    description,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    timestamp: Date.now(),
    status: 'SUCCESS',
  };

  const updatedWallet: PatientWallet = {
    balance: wallet.balance - amount,
    transactions: [newTx, ...wallet.transactions],
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(updatedWallet));
      window.dispatchEvent(new Event('medflow-wallet-updated'));
    } catch {
      // Non-blocking
    }
  }

  return updatedWallet;
}
