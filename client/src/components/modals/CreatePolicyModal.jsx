import React, { useState } from 'react';
import { api } from '../../api/client';
import { X, ShieldPlus, AlertCircle, DollarSign, Calendar, FileText, CheckCircle2, UserCheck } from 'lucide-react';

export default function CreatePolicyModal({ isOpen, onClose, user, onPolicyCreated }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [policyType, setPolicyType] = useState('Health');
  const [description, setDescription] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [deductibleAmount, setDeductibleAmount] = useState('500');
  const [paymentFrequency, setPaymentFrequency] = useState('Monthly');
  const [termMonths, setTermMonths] = useState('12');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Policy title is required');
      return;
    }
    if (!coverageAmount || Number(coverageAmount) <= 0) {
      setError('Please specify a valid coverage amount');
      return;
    }
    if (!premiumAmount || Number(premiumAmount) <= 0) {
      setError('Please specify a valid premium amount');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        policyType,
        description: description.trim(),
        coverageAmount: Number(coverageAmount),
        premiumAmount: Number(premiumAmount),
        deductibleAmount: Number(deductibleAmount) || 0,
        paymentFrequency,
        termMonths: Number(termMonths) || 12,
        startDate: new Date(startDate),
        nomineeName: nomineeName.trim(),
        nomineeRelation: nomineeRelation.trim(),
        user: user._id,
        status: 'Active'
      };

      const res = await api.createPolicy(payload);
      if (res.success && res.data) {
        onPolicyCreated(res.data);
        onClose();
      } else {
        throw new Error(res.error || 'Failed to create policy');
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
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <ShieldPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Insurance Policy</h2>
              <p className="text-xs text-slate-400">Add a new coverage policy directly to the database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 flex items-start gap-2.5 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Policy Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Comprehensive Health Plan"
                className="w-full px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Policy Type</label>
              <select
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Health">Health</option>
                <option value="Auto">Auto</option>
                <option value="Life">Life</option>
                <option value="Home">Home</option>
                <option value="Travel">Travel</option>
                <option value="Property">Property</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Coverage Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Primary medical, hospital, prescription, and emergency coverage."
              className="w-full px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Nominee Details Section */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <UserCheck className="w-4 h-4 text-brand-400" />
              <span>Nominee / Beneficiary Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Nominee Name</label>
                <input
                  type="text"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Relation</label>
                <select
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financials: Coverage, Premium, Deductible */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Coverage Limit (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-xs">₹</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={coverageAmount}
                  onChange={(e) => setCoverageAmount(e.target.value)}
                  placeholder="250000"
                  className="w-full pl-7 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Premium (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-xs">₹</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={premiumAmount}
                  onChange={(e) => setPremiumAmount(e.target.value)}
                  placeholder="2500"
                  className="w-full pl-7 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Deductible (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-xs">₹</span>
                <input
                  type="number"
                  min="0"
                  value={deductibleAmount}
                  onChange={(e) => setDeductibleAmount(e.target.value)}
                  placeholder="500"
                  className="w-full pl-7 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Term, Frequency, Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Payment Frequency</label>
              <select
                value={paymentFrequency}
                onChange={(e) => setPaymentFrequency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annual">Semi-Annual</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Term (Months)</label>
              <input
                type="number"
                min="1"
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            Policy will be registered under policyholder: <span className="text-white font-medium">{user.name}</span> ({user.email || 'Current User'})
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Policy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
