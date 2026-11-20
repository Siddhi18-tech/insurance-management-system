import React from 'react';
import { Calendar, MapPin, FileText, Trash2, ExternalLink } from 'lucide-react';

const statusStyles = {
  Submitted: 'bg-blue-50 text-blue-800 border-blue-300',
  'Under Review': 'bg-amber-50 text-amber-900 border-amber-300',
  Approved: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  Rejected: 'bg-red-50 text-red-800 border-red-300',
  Settled: 'bg-purple-50 text-purple-800 border-purple-300',
};

const borderStyles = {
  Submitted: 'border-t-blue-600',
  'Under Review': 'border-t-amber-500',
  Approved: 'border-t-emerald-600',
  Rejected: 'border-t-red-600',
  Settled: 'border-t-purple-600',
};

export default function ClaimCard({ claim, onDelete }) {
  const statusPill = statusStyles[claim.status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const topBorder = borderStyles[claim.status] || 'border-t-slate-400';
  const incidentDateFormatted = claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString('en-IN') : 'N/A';

  const policyTitle = claim.policy?.title || 'Linked Policy';
  const policyNum = claim.policy?.policyNumber || '';

  return (
    <div className={`bg-white border-t-3 ${topBorder} border-x border-b border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}>
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {claim.claimNumber}
            </span>
            {policyNum && (
              <span className="text-xs text-slate-500 font-mono">
                {policyNum}
              </span>
            )}
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusPill}`}>
            {claim.status}
          </span>
        </div>

        {/* Policy reference & Description */}
        <div className="text-xs font-bold text-blue-900 mb-1">
          Policy: <span className="text-slate-900">{policyTitle}</span>
        </div>
        <p className="text-sm text-slate-800 font-medium line-clamp-2 leading-relaxed">
          {claim.incidentDescription}
        </p>

        {/* Location & Date */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Incident: {incidentDateFormatted}</span>
          </div>
          {claim.incidentLocation && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="line-clamp-1">{claim.incidentLocation}</span>
            </div>
          )}
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/70">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Claimed Amount</span>
            <span className="text-sm font-bold text-amber-950 tracking-tight">
              ₹{Number(claim.claimAmount).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200/70">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Approved Amount</span>
            <span className="text-sm font-bold text-emerald-900 tracking-tight">
              ₹{Number(claim.approvedAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Adjuster / Agent Review Status Notice */}
        {claim.status === 'Approved' && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Claim Accepted & Approved by Agent</span>
              {claim.reviewedBy?.name && (
                <span className="font-semibold text-emerald-800">({claim.reviewedBy.name})</span>
              )}
            </div>
            <div className="text-[11px] text-emerald-850">
              Disbursal Amount: <strong className="font-mono text-emerald-900 text-xs">₹{Number(claim.approvedAmount || claim.claimAmount).toLocaleString('en-IN')}</strong>
            </div>
            {claim.reviewNotes && (
              <div className="text-[11px] text-emerald-800 italic pt-0.5 border-t border-emerald-200">
                "{claim.reviewNotes}"
              </div>
            )}
          </div>
        )}

        {claim.status === 'Rejected' && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-300 text-xs text-red-950 space-y-1">
            <div className="font-bold text-red-900">
              Claim Rejected by Agent {claim.reviewedBy?.name ? `(${claim.reviewedBy.name})` : ''}
            </div>
            {claim.reviewNotes && (
              <div className="text-[11px] text-red-800">
                Reason: {claim.reviewNotes}
              </div>
            )}
          </div>
        )}

        {claim.status === 'Under Review' && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Currently under loss verification by assigned insurance agent</span>
          </div>
        )}

        {claim.status === 'Settled' && (
          <div className="mt-3 p-3 rounded-lg bg-purple-50 border border-purple-300 text-xs text-purple-950 space-y-1">
            <div className="font-bold text-purple-900">
              Claim Fully Settled & Disbursed
            </div>
            <div className="text-[11px] text-purple-800">
              Amount ₹{Number(claim.approvedAmount || claim.claimAmount).toLocaleString('en-IN')} transferred via bank mandate.
            </div>
          </div>
        )}

        {claim.reviewNotes && claim.status !== 'Approved' && claim.status !== 'Rejected' && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <strong className="text-slate-900 font-bold">Adjuster Assessment: </strong>
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
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200 transition-colors"
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
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px]">Filed on {new Date(claim.createdAt).toLocaleDateString('en-IN')}</span>
        {onDelete && claim.status !== 'Settled' && (
          <button
            onClick={() => onDelete(claim._id)}
            title="Delete Claim"
            className="p-1 rounded-md text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
