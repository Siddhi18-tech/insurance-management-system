import React, { useState } from 'react';
import { api } from '../../api/client';
import { X, FileText, AlertCircle, DollarSign, Calendar, MapPin, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function CreateClaimModal({ isOpen, onClose, user, policies, onClaimCreated }) {
  if (!isOpen) return null;

  const [selectedPolicyId, setSelectedPolicyId] = useState(() => (policies.length > 0 ? policies[0]._id : ''));
  const [claimAmount, setClaimAmount] = useState('');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedPolicy = policies.find((p) => p._id === selectedPolicyId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedPolicyId) {
      setError('Please select an active policy for this claim');
      return;
    }
    if (!claimAmount || Number(claimAmount) <= 0) {
      setError('Please specify a valid claim amount');
      return;
    }
    if (selectedPolicy && Number(claimAmount) > selectedPolicy.coverageAmount) {
      setError(`Claim amount ($${claimAmount}) exceeds maximum coverage limit of $${selectedPolicy.coverageAmount}`);
      return;
    }
    if (!incidentDescription.trim()) {
      setError('Please provide a description of the incident');
      return;
    }

    setLoading(true);
    try {
      const documents = [];
      if (documentName.trim() || documentUrl.trim()) {
        documents.push({
          name: documentName.trim() || 'Claim Evidence Document',
          url: documentUrl.trim() || 'https://example.com/evidence.pdf',
          uploadedAt: new Date()
        });
      }

      const payload = {
        policy: selectedPolicyId,
        user: user._id,
        claimAmount: Number(claimAmount),
        incidentDate: new Date(incidentDate),
        incidentLocation: incidentLocation.trim() || 'Unspecified Location',
        incidentDescription: incidentDescription.trim(),
        documents
      };

      const res = await api.createClaim(payload);
      if (res.success && res.data) {
        onClaimCreated(res.data);
        onClose();
      } else {
        throw new Error(res.error || 'Failed to submit claim');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">File Insurance Claim</h2>
              <p className="text-xs text-slate-400">Submit an adjudication claim linked to your active policy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If no policies exist */}
        {policies.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No Eligible Policies Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You must have at least one active policy saved in the database before you can file an insurance claim.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close & Create Policy First
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 flex items-start gap-2.5 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Select Policy */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Select Policy *</label>
              <select
                required
                value={selectedPolicyId}
                onChange={(e) => setSelectedPolicyId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {policies.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.policyNumber} — {p.title} ({p.policyType}) [Max Coverage: ${p.coverageAmount.toLocaleString()}]
                  </option>
                ))}
              </select>
              {selectedPolicy && (
                <div className="mt-1 text-[11px] text-slate-400 flex justify-between">
                  <span>Policy Status: <strong className="text-emerald-400">{selectedPolicy.status}</strong></span>
                  <span>Coverage Limit: <strong className="text-white">${selectedPolicy.coverageAmount.toLocaleString()}</strong></span>
                </div>
              )}
            </div>

            {/* Claim Amount & Incident Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Claim Amount ($) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs">$</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedPolicy?.coverageAmount}
                    required
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full pl-7 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Incident Date *</label>
                <input
                  type="date"
                  required
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Incident Location</label>
              <input
                type="text"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                placeholder="e.g. Highway 101, Exit 24 or St. Jude Memorial Hospital"
                className="w-full px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Incident Description */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Incident Description *</label>
              <textarea
                rows={3}
                required
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                placeholder="Describe what occurred, damages, or medical services rendered..."
                className="w-full px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Supporting Document (Optional) */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Evidence / Supporting Document (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Document Name (e.g. Police Report)"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <input
                  type="text"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="Document URL (e.g. https://...)"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Claim to Database</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

