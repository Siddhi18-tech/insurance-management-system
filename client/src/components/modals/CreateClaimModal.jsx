import React, { useState } from 'react';
import { api } from '../../api/client';
import { X, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

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
      setError(`Claim amount (₹${Number(claimAmount).toLocaleString('en-IN')}) exceeds maximum coverage limit of ₹${Number(selectedPolicy.coverageAmount).toLocaleString('en-IN')}`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">File Insurance Claim</h2>
              <p className="text-xs text-slate-400">Submit an adjudication claim linked to your active policy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If no policies exist */}
        {policies.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Active Policies Available</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You must have at least one active policy registered in the portal before filing a claim.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close & Create Policy First
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Select Policy */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Policy *</label>
              <select
                required
                value={selectedPolicyId}
                onChange={(e) => setSelectedPolicyId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                {policies.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.policyNumber} — {p.title} ({p.policyType}) [Limit: ₹{Number(p.coverageAmount).toLocaleString('en-IN')}]
                  </option>
                ))}
              </select>
              {selectedPolicy && (
                <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                  <span>Status: <strong className="text-emerald-700 font-semibold">{selectedPolicy.status}</strong></span>
                  <span>Coverage Limit: <strong className="text-slate-900">₹{Number(selectedPolicy.coverageAmount).toLocaleString('en-IN')}</strong></span>
                </div>
              )}
            </div>

            {/* Claim Amount & Incident Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Claim Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-medium">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedPolicy?.coverageAmount}
                    required
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Date *</label>
                <input
                  type="date"
                  required
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Location</label>
              <input
                type="text"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                placeholder="e.g. City Hospital, Bangalore or MG Road"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            {/* Incident Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Description *</label>
              <textarea
                rows={3}
                required
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                placeholder="Provide a clear description of the occurrence, loss, or medical treatment..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            {/* Supporting Document */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Evidence / Supporting Document (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Doc Name (e.g. Medical Bill)"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <input
                  type="text"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="Doc URL (e.g. https://...)"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Claim to Portal</span>
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
