import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { X, ShieldPlus, AlertCircle, CheckCircle2, UserCheck, Landmark, User } from 'lucide-react';

export default function CreatePolicyModal({ isOpen, onClose, user, onPolicyCreated }) {
  if (!isOpen) return null;

  const isAgent = user?.role === 'agent';
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // General policy fields
  const [title, setTitle] = useState('');
  const [policyType, setPolicyType] = useState('Health');
  const [description, setDescription] = useState('');
  const [coverageAmount, setCoverageAmount] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [deductibleAmount, setDeductibleAmount] = useState('500');
  const [paymentFrequency, setPaymentFrequency] = useState('Annual');
  const [termMonths, setTermMonths] = useState('12');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Nominee fields
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');

  // Bank Details fields
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState(user?.name || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If agent is issuing policy, fetch registered policyholder clients
  useEffect(() => {
    if (isAgent) {
      api.getUsers({ role: 'customer', limit: 100 })
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setCustomers(res.data);
            setSelectedCustomerId(res.data[0]._id);
            setAccountHolderName(res.data[0].name);
          }
        })
        .catch(() => {});
    }
  }, [isAgent]);

  const handleCustomerChange = (e) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    const found = customers.find((c) => c._id === custId);
    if (found) {
      setAccountHolderName(found.name);
    }
  };

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

    const targetUserId = isAgent ? (selectedCustomerId || user._id) : user._id;

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
        bankDetails: {
          bankName: bankName.trim(),
          accountHolderName: accountHolderName.trim() || user?.name || '',
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase()
        },
        user: targetUserId,
        ...(isAgent ? { agent: user._id } : {}),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white shadow-xs ${isAgent ? 'bg-indigo-600' : 'bg-blue-600'}`}>
              <ShieldPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isAgent ? 'Issue / Underwrite New Policy' : 'Add New Insurance Policy'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAgent ? 'Assign policyholder client, coverage limits, and banking mandate' : 'Register policyholder coverage, nominee, and banking mandate'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Select Client (for Agent) */}
          {isAgent && (
            <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950 mb-1 text-xs">
                <User className="w-4 h-4 text-indigo-700" />
                <span>Select Policyholder Client *</span>
              </div>
              {customers.length > 0 ? (
                <select
                  value={selectedCustomerId}
                  onChange={handleCustomerChange}
                  className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.email || 'No email'}) {c.phone ? `• ${c.phone}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-indigo-800">
                  No existing customers found. Policy will be assigned under current agent account or registered policyholder.
                </p>
              )}
            </div>
          )}

          {/* Section 1: Basic Policy Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 pb-1 border-b border-slate-100">
              1. Policy Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Policy Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Comprehensive Health Cover"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Policy Type</label>
                <select
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief outline of coverage terms and scope..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Section 2: Coverage & Financial Schedule */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 pb-1 border-b border-slate-100">
              2. Coverage & Payment Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coverage Limit (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-medium">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={coverageAmount}
                    onChange={(e) => setCoverageAmount(e.target.value)}
                    placeholder="500000"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Premium (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-medium">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={premiumAmount}
                    onChange={(e) => setPremiumAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deductible (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-medium">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={deductibleAmount}
                    onChange={(e) => setDeductibleAmount(e.target.value)}
                    placeholder="1000"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Frequency</label>
                <select
                  value={paymentFrequency}
                  onChange={(e) => setPaymentFrequency(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="Annual">Annual</option>
                  <option value="Semi-Annual">Semi-Annual</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Term (Months)</label>
                <input
                  type="number"
                  min="1"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Policy Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Nominee / Beneficiary Details */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Nominee / Beneficiary Details
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nominee Full Name</label>
                <input
                  type="text"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  placeholder="e.g. Ramesh Bathwal"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship to Policyholder</label>
                <select
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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

          {/* Section 4: Bank Account Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Landmark className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  4. Bank Account Details (For Premium Auto-Debit & Settlement)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Required for direct claims disbursal and automated ECS premium debit
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank, SBI, ICICI Bank"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="e.g. Account Holder Name"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 501004382910"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0000123"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              {isAgent ? (
                <>Operating as Agent: <strong className="text-indigo-700">{user?.name}</strong></>
              ) : (
                <>Policyholder: <strong className="text-slate-800">{user?.name}</strong></>
              )}
            </span>
            <div className="flex items-center gap-2">
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
                className={`px-5 py-2 rounded-lg text-white font-semibold text-xs shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer ${
                  isAgent ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isAgent ? 'Issue Policy for Client' : 'Save Policy to Portal'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
