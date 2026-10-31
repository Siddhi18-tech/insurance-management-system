import React from 'react';
import { Shield, Calendar, Trash2, Download, UserCheck } from 'lucide-react';
import { generateReceiptPdf } from '../../utils/generateReceiptPdf';

const typeColors = {
  Health: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Auto: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Life: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  Home: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Travel: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  Property: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export default function PolicyCard({ policy, user, onDelete }) {
  const badgeStyle = typeColors[policy.policyType] || 'bg-slate-800 text-slate-300 border-slate-700';

  const startDateFormatted = policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-IN') : 'N/A';
  const endDateFormatted = policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-IN') : 'N/A';

  const handleDownload = () => {
    generateReceiptPdf(policy, user);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all duration-200 group flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg border ${badgeStyle}`}>
              {policy.policyType}
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
              {policy.policyNumber}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {policy.status}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
          {policy.title}
        </h3>
        {policy.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {policy.description}
          </p>
        )}

        {/* Nominee Tag (if specified) */}
        {policy.nomineeName && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/60">
            <UserCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="text-slate-500">Nominee:</span>
            <span className="text-slate-200 font-medium">{policy.nomineeName}</span>
            {policy.nomineeRelation && (
              <span className="text-[10px] text-slate-400">({policy.nomineeRelation})</span>
            )}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Coverage Limit</span>
            <span className="text-sm font-bold text-white tracking-tight">
              ₹{Number(policy.coverageAmount).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Premium</span>
            <span className="text-sm font-bold text-brand-400 tracking-tight">
              ₹{Number(policy.premiumAmount).toLocaleString('en-IN')}
              <span className="text-[10px] font-normal text-slate-400"> /{policy.paymentFrequency?.toLowerCase() || 'yr'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{startDateFormatted} — {endDateFormatted}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownload}
            title="Download PDF Receipt"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white transition-colors text-xs font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Receipt</span>
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(policy._id)}
              title="Delete Policy"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
