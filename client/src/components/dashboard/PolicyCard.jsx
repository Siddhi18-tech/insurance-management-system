import React from 'react';
import { Shield, Calendar, Trash2, Download, UserCheck, Landmark } from 'lucide-react';
import { generateReceiptPdf } from '../../utils/generateReceiptPdf';

const typeColors = {
  Health: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  Auto: 'bg-blue-50 text-blue-800 border-blue-300',
  Life: 'bg-purple-50 text-purple-800 border-purple-300',
  Home: 'bg-amber-50 text-amber-900 border-amber-300',
  Travel: 'bg-cyan-50 text-cyan-900 border-cyan-300',
  Property: 'bg-rose-50 text-rose-900 border-rose-300',
};

const topBorderColors = {
  Health: 'border-t-emerald-600',
  Auto: 'border-t-blue-600',
  Life: 'border-t-purple-600',
  Home: 'border-t-amber-500',
  Travel: 'border-t-cyan-600',
  Property: 'border-t-rose-600',
};

export default function PolicyCard({ policy, user, onDelete }) {
  const badgeStyle = typeColors[policy.policyType] || 'bg-slate-100 text-slate-700 border-slate-200';
  const topBorder = topBorderColors[policy.policyType] || 'border-t-blue-600';

  const startDateFormatted = policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-IN') : 'N/A';
  const endDateFormatted = policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-IN') : 'N/A';

  const bank = policy.bankDetails || {};
  const hasBank = bank.bankName || bank.accountNumber || bank.ifscCode;

  const handleDownload = () => {
    generateReceiptPdf(policy, user);
  };

  // Helper to mask account number safely
  const formatAccountNumber = (acc) => {
    if (!acc) return '';
    const clean = String(acc).trim();
    if (clean.length <= 4) return clean;
    return `••••••••${clean.slice(-4)}`;
  };

  return (
    <div className={`bg-white border-t-3 ${topBorder} border-x border-b border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}>
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${badgeStyle}`}>
              {policy.policyType}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {policy.policyNumber}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            {policy.status}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 line-clamp-1">
          {policy.title}
        </h3>
        {policy.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {policy.description}
          </p>
        )}

        {/* Financial Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Coverage Limit</span>
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              ₹{Number(policy.coverageAmount).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200/80">
            <span className="text-[10px] uppercase font-bold text-blue-800 block">Periodic Premium</span>
            <span className="text-sm font-bold text-blue-900 tracking-tight">
              ₹{Number(policy.premiumAmount).toLocaleString('en-IN')}
              <span className="text-[10px] font-semibold text-blue-700"> /{policy.paymentFrequency?.toLowerCase() || 'yr'}</span>
            </span>
          </div>
        </div>

        {/* Nominee Tag */}
        {policy.nomineeName && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-950 bg-indigo-50/70 px-2.5 py-1.5 rounded-lg border border-indigo-200/80">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="text-slate-500 font-medium">Nominee:</span>
            <span className="text-indigo-900 font-bold">{policy.nomineeName}</span>
            {policy.nomineeRelation && (
              <span className="text-[11px] text-indigo-700">({policy.nomineeRelation})</span>
            )}
          </div>
        )}

        {/* Bank Mandate & Settlement Account Details */}
        {hasBank && (
          <div className="mt-2.5 p-2.5 bg-sky-50/70 rounded-lg border border-sky-200/80 text-xs">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold mb-1 text-[11px]">
              <Landmark className="w-3.5 h-3.5 text-blue-700" />
              <span>Mandate & Settlement Account</span>
            </div>
            <div className="text-[11px] text-slate-700 space-y-0.5">
              {bank.bankName && (
                <div><span className="text-slate-500">Bank:</span> <strong className="text-slate-900 font-semibold">{bank.bankName}</strong></div>
              )}
              {bank.accountNumber && (
                <div><span className="text-slate-500">A/C:</span> <strong className="font-mono text-slate-900">{formatAccountNumber(bank.accountNumber)}</strong></div>
              )}
              {bank.ifscCode && (
                <div><span className="text-slate-500">IFSC:</span> <strong className="font-mono text-slate-900">{bank.ifscCode}</strong></div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{startDateFormatted} — {endDateFormatted}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownload}
            title="Download PDF Certificate & Receipt"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition-colors text-xs font-bold cursor-pointer border border-blue-200 hover:border-blue-600 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Receipt</span>
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(policy._id)}
              title="Delete Policy"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
