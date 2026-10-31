import React from 'react';
import { ShieldAlert, Calendar, MapPin, FileText, CheckCircle2, AlertTriangle, Trash2, ExternalLink } from 'lucide-react';

const statusStyles = {
  Submitted: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
  'Under Review': 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  Approved: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  Rejected: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
  Settled: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
};

export default function ClaimCard({ claim, onDelete }) {
  const statusPill = statusStyles[claim.status] || 'bg-slate-800 text-slate-300 border-slate-700';
  const incidentDateFormatted = claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString() : 'N/A';

  const policyTitle = claim.policy?.title || 'Linked Policy';
  const policyNum = claim.policy?.policyNumber || '';

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all duration-200 group flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-800/60">
              {claim.claimNumber}
            </span>
            {policyNum && (
              <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                {policyNum}
              </span>
            )}
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusPill}`}>
            {claim.status}
          </span>
        </div>

        {/* Policy reference & Description */}
        <div className="text-xs font-medium text-slate-400 mb-1">
          Policy: <span className="text-white">{policyTitle}</span>
        </div>
        <p className="text-sm text-slate-200 font-medium line-clamp-2 leading-relaxed">
          {claim.incidentDescription}
        </p>

        {/* Location & Date */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Incident: {incidentDateFormatted}</span>
          </div>
          {claim.incidentLocation && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="line-clamp-1">{claim.incidentLocation}</span>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Claimed Amount</span>
            <span className="text-sm font-bold text-amber-400 tracking-tight">
              ${Number(claim.claimAmount).toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Approved Amount</span>
            <span className="text-sm font-bold text-emerald-400 tracking-tight">
              ${Number(claim.approvedAmount || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Review Notes (if any) */}
        {claim.reviewNotes && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400">
            <strong className="text-slate-300">Adjuster Note: </strong>
            {claim.reviewNotes}
          </div>
        )}

        {/* Documents */}
        {claim.documents && claim.documents.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {claim.documents.map((doc, idx) => (
              <a
                key={idx}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 bg-brand-950/40 px-2 py-1 rounded-lg border border-brand-800/40 transition-colors"
              >
                <FileText className="w-3 h-3" />
                <span>{doc.name || 'Document'}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px]">Filed {new Date(claim.createdAt).toLocaleDateString()}</span>
        {onDelete && claim.status !== 'Settled' && (
          <button
            onClick={() => onDelete(claim._id)}
            title="Delete Claim"
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

