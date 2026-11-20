import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { generateReceiptPdf } from '../../utils/generateReceiptPdf';
import CreatePolicyModal from '../modals/CreatePolicyModal';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Plus,
  RefreshCw,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  Landmark,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Check,
  FileText,
  Search,
  Filter,
  Briefcase,
  Award,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Building,
  UserCheck
} from 'lucide-react';

const typeBadgeStyles = {
  Health: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  Auto: 'bg-blue-50 text-blue-800 border-blue-300',
  Life: 'bg-purple-50 text-purple-800 border-purple-300',
  Home: 'bg-amber-50 text-amber-900 border-amber-300',
  Travel: 'bg-cyan-50 text-cyan-900 border-cyan-300',
  Property: 'bg-rose-50 text-rose-900 border-rose-300',
};

const claimStatusStyles = {
  Submitted: 'bg-amber-50 text-amber-900 border-amber-300',
  'Under Review': 'bg-blue-50 text-blue-800 border-blue-300',
  Approved: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  Rejected: 'bg-red-50 text-red-800 border-red-300',
  Settled: 'bg-purple-50 text-purple-800 border-purple-300',
};

export default function AgentDashboard() {
  const { user, logout } = useAuth();

  // Live Database States
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active View / Tab: 'claims' (Incoming Claim Requests), 'policies' (Sold Policies), 'clients' (Policyholder Directory)
  const [activeTab, setActiveTab] = useState('claims');

  // Claim filtering: 'all', 'pending', 'approved', 'rejected'
  const [claimFilter, setClaimFilter] = useState('all');

  // Policy search & filter
  const [policySearch, setPolicySearch] = useState('');
  const [policyTypeFilter, setPolicyTypeFilter] = useState('All');

  // Adjudication Modals State
  const [approvingClaim, setApprovingClaim] = useState(null);
  const [approvedAmountInput, setApprovedAmountInput] = useState('');
  const [approvalNotesInput, setApprovalNotesInput] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  const [rejectingClaim, setRejectingClaim] = useState(null);
  const [rejectionNotesInput, setRejectionNotesInput] = useState('');

  // Policy creation modal
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  // Toast notification
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch real data from backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [policiesRes, claimsRes, usersRes] = await Promise.all([
        api.getPolicies({ limit: 200 }),
        api.getClaims({ limit: 200 }),
        api.getUsers({ role: 'customer', limit: 200 })
      ]);

      setPolicies(policiesRes.data || []);
      setClaims(claimsRes.data || []);
      setClients(usersRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch agent portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Live Portfolio Metrics
  const totalPoliciesSold = policies.length;
  const totalCoveredPortfolio = policies.reduce((acc, p) => acc + (Number(p.coverageAmount) || 0), 0);
  const totalPremiumBook = policies.reduce((acc, p) => acc + (Number(p.premiumAmount) || 0), 0);

  // Claims Metrics
  const pendingClaims = claims.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  );
  const approvedClaims = claims.filter((c) => c.status === 'Approved');
  const rejectedClaims = claims.filter((c) => c.status === 'Rejected');

  // Filtered Claims
  const filteredClaims = claims.filter((c) => {
    if (claimFilter === 'pending') {
      return c.status === 'Submitted' || c.status === 'Under Review';
    }
    if (claimFilter === 'approved') return c.status === 'Approved';
    if (claimFilter === 'rejected') return c.status === 'Rejected';
    return true;
  });

  // Filtered Policies
  const filteredPolicies = policies.filter((p) => {
    const matchesType = policyTypeFilter === 'All' || p.policyType === policyTypeFilter;
    const query = policySearch.toLowerCase();
    const matchesSearch =
      !query ||
      p.policyNumber?.toLowerCase().includes(query) ||
      p.title?.toLowerCase().includes(query) ||
      p.user?.name?.toLowerCase().includes(query) ||
      p.user?.email?.toLowerCase().includes(query);

    return matchesType && matchesSearch;
  });

  // Action: Open Approve Modal
  const openApproveModal = (claim) => {
    setApprovingClaim(claim);
    setApprovedAmountInput(claim.claimAmount?.toString() || '');
    setApprovalNotesInput(
      `Claim documentation verified and approved by Agent ${user?.name || ''}. Authorized for direct bank disbursal.`
    );
  };

  // Action: Submit Claim Approval
  const handleConfirmApproval = async (e) => {
    e.preventDefault();
    if (!approvingClaim) return;

    const amount = Number(approvedAmountInput);
    if (isNaN(amount) || amount <= 0) {
      alert('Please specify a valid approved amount');
      return;
    }

    setSubmittingDecision(true);
    try {
      const res = await api.updateClaimStatus(approvingClaim._id, {
        status: 'Approved',
        approvedAmount: amount,
        reviewNotes: approvalNotesInput.trim(),
        reviewedBy: user._id
      });

      if (res.success && res.data) {
        setClaims((prev) =>
          prev.map((c) => (c._id === approvingClaim._id ? res.data : c))
        );
        showNotification(
          `Claim ${approvingClaim.claimNumber} Approved! Disbursal of ₹${amount.toLocaleString(
            'en-IN'
          )} authorized.`
        );
        setApprovingClaim(null);
      }
    } catch (err) {
      alert(`Error approving claim: ${err.message}`);
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Action: Open Reject Modal
  const openRejectModal = (claim) => {
    setRejectingClaim(claim);
    setRejectionNotesInput('');
  };

  // Action: Submit Claim Rejection
  const handleConfirmRejection = async (e) => {
    e.preventDefault();
    if (!rejectingClaim) return;

    if (!rejectionNotesInput.trim()) {
      alert('Please provide a reason or assessment note for rejecting this claim');
      return;
    }

    setSubmittingDecision(true);
    try {
      const res = await api.updateClaimStatus(rejectingClaim._id, {
        status: 'Rejected',
        reviewNotes: rejectionNotesInput.trim(),
        reviewedBy: user._id
      });

      if (res.success && res.data) {
        setClaims((prev) =>
          prev.map((c) => (c._id === rejectingClaim._id ? res.data : c))
        );
        showNotification(`Claim ${rejectingClaim.claimNumber} marked as Rejected.`);
        setRejectingClaim(null);
      }
    } catch (err) {
      alert(`Error rejecting claim: ${err.message}`);
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Policy creation callback
  const handlePolicyCreated = (newPolicy) => {
    setPolicies((prev) => [newPolicy, ...prev]);
    showNotification(`Policy '${newPolicy.title}' registered under client ${newPolicy.user?.name || ''}`);
  };

  // Safe Account Number Mask
  const formatAccountNumber = (acc) => {
    if (!acc) return 'Not Provided';
    const clean = String(acc).trim();
    if (clean.length <= 4) return clean;
    return `••••••••${clean.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Enterprise Executive Agent Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Portal Type */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                AgiesShield
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold uppercase tracking-wider">
                  AGENT & UNDERWRITING
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Broker Portal • Policy Portfolio & Claims Adjudication
              </div>
            </div>
          </div>

          {/* Agent Identification & Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
              <div className="w-6 h-6 rounded-md bg-indigo-500 text-white flex items-center justify-center font-bold text-[11px]">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="text-left">
                <div className="font-semibold text-white leading-none">{user?.name}</div>
                <div className="text-[10px] text-indigo-300 font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3 text-indigo-400" />
                  <span>Licensed Agent</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsPolicyModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue Policy</span>
            </button>

            <button
              onClick={fetchData}
              title="Refresh Portfolio Data"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-slate-900 text-white shadow-xl text-xs font-medium border border-slate-800 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Main Agent Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex-1 w-full space-y-6">
        {/* KPI Summary Executive Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Policies Sold */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Policies Sold
              </span>
              <div className="text-xl font-extrabold text-slate-900">
                {totalPoliciesSold}
              </div>
              <span className="text-[10px] text-blue-700 font-semibold">Active In Portfolio</span>
            </div>
          </div>

          {/* Card 2: Total Premium Book Value */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Premium Book
              </span>
              <div className="text-xl font-extrabold text-slate-900">
                ₹{totalPremiumBook.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">Periodic Revenue</span>
            </div>
          </div>

          {/* Card 3: Insured Portfolio */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Sum Insured
              </span>
              <div className="text-xl font-extrabold text-slate-900">
                ₹{totalCoveredPortfolio.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-purple-700 font-semibold">Total Underwritten</span>
            </div>
          </div>

          {/* Card 4: Pending Claims Requiring Review */}
          <div className={`p-4 rounded-xl border shadow-xs flex items-center gap-3.5 transition-all ${
            pendingClaims.length > 0
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-white border-slate-200'
          }`}>
            <div className={`p-3 rounded-xl ${
              pendingClaims.length > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-600'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Incoming Claims
              </span>
              <div className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                {pendingClaims.length}
                {pendingClaims.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold uppercase">
                    Needs Action
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500">
                {approvedClaims.length} Approved • {rejectedClaims.length} Rejected
              </span>
            </div>
          </div>
        </div>

        {/* Primary Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs">
          <button
            onClick={() => setActiveTab('claims')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'claims'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Incoming Claim Requests</span>
            {pendingClaims.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                {pendingClaims.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'policies'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Sold Policies & Policyholder Details</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
              {totalPoliciesSold}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'clients'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Client Directory</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
              {clients.length}
            </span>
          </button>
        </div>

        {/* TAB 1: INCOMING CLAIM REQUESTS (Agent Adjudication Queue) */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            {/* Filter Pill Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Adjudication Queue:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: 'all', label: 'All Requests', count: claims.length },
                  { key: 'pending', label: 'Pending Review', count: pendingClaims.length },
                  { key: 'approved', label: 'Approved Claims', count: approvedClaims.length },
                  { key: 'rejected', label: 'Rejected Claims', count: rejectedClaims.length }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setClaimFilter(item.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      claimFilter === item.key
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label} ({item.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Claims List */}
            {filteredClaims.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No Claim Requests Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {claimFilter === 'pending'
                    ? 'All incoming claim requests have been reviewed and adjudicated.'
                    : 'No policyholder claims match the selected status filter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClaims.map((claim) => {
                  const statusPill =
                    claimStatusStyles[claim.status] || 'bg-slate-100 text-slate-700 border-slate-200';
                  const incidentDateFormatted = claim.incidentDate
                    ? new Date(claim.incidentDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A';
                  const filedDateFormatted = claim.createdAt
                    ? new Date(claim.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A';

                  const claimant = claim.user || {};
                  const linkedPolicy = claim.policy || {};
                  const bank = linkedPolicy.bankDetails || {};
                  const isPending =
                    claim.status === 'Submitted' || claim.status === 'Under Review';

                  return (
                    <div
                      key={claim._id}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                    >
                      {/* Top Row: Claim ID, Status Badge & Filing Date */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                            {claim.claimNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${statusPill}`}
                          >
                            {claim.status}
                          </span>
                          {isPending && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              Requires Agent Decision
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Filed on: {filedDateFormatted}</span>
                        </div>
                      </div>

                      {/* Middle Grid: Policyholder Details vs Policy & Incident Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Column 1: Policyholder Information */}
                        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 text-xs space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1 border-b border-slate-200">
                            <User className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Claimant / Policyholder Details</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Legal Name:</span>{' '}
                            <strong className="text-slate-900 text-sm font-bold">
                              {claimant.name || 'Registered Policyholder'}
                            </strong>
                          </div>
                          {claimant.email && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{claimant.email}</span>
                            </div>
                          )}
                          {claimant.phone && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{claimant.phone}</span>
                            </div>
                          )}
                          {claimant.address?.city && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>
                                {[
                                  claimant.address.street,
                                  claimant.address.city,
                                  claimant.address.state
                                ]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </div>
                          )}

                          {/* Bank Mandate for Claim Disbursal */}
                          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700">
                            <div className="font-bold text-slate-900 flex items-center gap-1 mb-1">
                              <Landmark className="w-3 h-3 text-blue-600" />
                              <span>Direct Disbursal Bank Mandate:</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[11px]">
                              <div>Bank: <strong>{bank.bankName || 'HDFC Bank'}</strong></div>
                              <div>A/C: <strong className="font-mono">{formatAccountNumber(bank.accountNumber)}</strong></div>
                              {bank.ifscCode && <div>IFSC: <strong className="font-mono">{bank.ifscCode}</strong></div>}
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Policy & Incident Details */}
                        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/90 text-xs space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1 border-b border-slate-200">
                            <Shield className="w-3.5 h-3.5 text-blue-600" />
                            <span>Linked Policy & Incident Details</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Policy:</span>{' '}
                            <strong className="text-slate-900 font-bold">
                              {linkedPolicy.title || 'Insurance Policy'}
                            </strong>{' '}
                            <span className="text-[11px] font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {linkedPolicy.policyNumber || 'N/A'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-[11px] text-slate-600">
                            <div>
                              <span>Coverage Limit: </span>
                              <strong className="text-slate-900 font-bold">
                                ₹{Number(linkedPolicy.coverageAmount || 0).toLocaleString('en-IN')}
                              </strong>
                            </div>
                            <div>
                              <span>Type: </span>
                              <strong className="text-slate-900 font-semibold">{linkedPolicy.policyType || 'General'}</strong>
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-slate-200">
                            <div className="font-bold text-slate-900">Incident Report:</div>
                            <p className="text-slate-700 mt-0.5 leading-relaxed bg-white p-2 rounded border border-slate-200 text-[11px]">
                              {claim.incidentDescription}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span>Incident Date: <strong className="text-slate-800">{incidentDateFormatted}</strong></span>
                            {claim.incidentLocation && (
                              <span>Location: <strong className="text-slate-800">{claim.incidentLocation}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Financials & Status Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 text-xs">
                            <span className="text-[10px] uppercase font-bold text-amber-800 block">
                              Claim Amount Requested
                            </span>
                            <span className="text-base font-extrabold text-amber-950 font-mono">
                              ₹{Number(claim.claimAmount).toLocaleString('en-IN')}
                            </span>
                          </div>

                          {claim.status === 'Approved' && (
                            <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs">
                              <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                                Approved Disbursal Amount
                              </span>
                              <span className="text-base font-extrabold text-emerald-950 font-mono">
                                ₹{Number(claim.approvedAmount || claim.claimAmount).toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Agent Adjudication Action Buttons */}
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openApproveModal(claim)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Accept & Approve Claim</span>
                            </button>

                            <button
                              onClick={() => openRejectModal(claim)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-red-50 text-red-700 border border-red-300 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                              <span>Reject Claim</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs">
                            {claim.status === 'Approved' && (
                              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Approved by Agent {claim.reviewedBy?.name ? `(${claim.reviewedBy.name})` : ''}</span>
                              </div>
                            )}
                            {claim.status === 'Rejected' && (
                              <div className="flex items-center gap-2 text-red-800 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 font-bold">
                                <X className="w-4 h-4 text-red-600" />
                                <span>Rejected by Agent {claim.reviewedBy?.name ? `(${claim.reviewedBy.name})` : ''}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Display Review Notes if Present */}
                      {claim.reviewNotes && (
                        <div className={`p-3 rounded-lg text-xs border ${
                          claim.status === 'Approved'
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            : claim.status === 'Rejected'
                            ? 'bg-red-50/70 border-red-200 text-red-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}>
                          <strong className="font-bold">Agent Adjudication Notes: </strong>
                          <span>{claim.reviewNotes}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SOLD POLICIES & POLICYHOLDER DETAILS */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={policySearch}
                  onChange={(e) => setPolicySearch(e.target.value)}
                  placeholder="Search by policy number, title, or policyholder name..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Category:</span>
                <select
                  value={policyTypeFilter}
                  onChange={(e) => setPolicyTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="All">All Types</option>
                  <option value="Health">Health</option>
                  <option value="Auto">Auto</option>
                  <option value="Life">Life</option>
                  <option value="Home">Home</option>
                  <option value="Travel">Travel</option>
                  <option value="Property">Property</option>
                </select>

                <button
                  onClick={() => setIsPolicyModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer ml-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Issue Policy</span>
                </button>
              </div>
            </div>

            {/* Policies Cards List */}
            {filteredPolicies.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No Sold Policies Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click 'Issue Policy' above to register and sell a new policy to a policyholder client.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPolicies.map((policy) => {
                  const badgeStyle =
                    typeBadgeStyles[policy.policyType] || 'bg-slate-100 text-slate-700 border-slate-200';
                  const startDateFormatted = policy.startDate
                    ? new Date(policy.startDate).toLocaleDateString('en-IN')
                    : 'N/A';
                  const endDateFormatted = policy.endDate
                    ? new Date(policy.endDate).toLocaleDateString('en-IN')
                    : 'N/A';

                  const client = policy.user || {};
                  const bank = policy.bankDetails || {};
                  const hasBank = bank.bankName || bank.accountNumber || bank.ifscCode;

                  return (
                    <div
                      key={policy._id}
                      className="bg-white border-t-3 border-t-indigo-600 border-x border-b border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div>
                        {/* Header: Type, Policy Number, Status */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${badgeStyle}`}>
                              {policy.policyType}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {policy.policyNumber}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            {policy.status}
                          </span>
                        </div>

                        {/* Policy Title & Description */}
                        <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                          {policy.title}
                        </h3>
                        {policy.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {policy.description}
                          </p>
                        )}

                        {/* Financial Metrics */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Sum Insured
                            </span>
                            <span className="text-sm font-bold text-slate-900 tracking-tight font-mono">
                              ₹{Number(policy.coverageAmount).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="bg-indigo-50/70 p-2 rounded-lg border border-indigo-200/80">
                            <span className="text-[10px] uppercase font-bold text-indigo-800 block">
                              Periodic Premium
                            </span>
                            <span className="text-sm font-bold text-indigo-950 tracking-tight font-mono">
                              ₹{Number(policy.premiumAmount).toLocaleString('en-IN')}
                              <span className="text-[10px] font-semibold text-indigo-700">
                                /{policy.paymentFrequency?.toLowerCase() || 'yr'}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* POLICYHOLDER FULL DETAILS CARD */}
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1 border-b border-slate-200">
                            <User className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Policyholder Client Details</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                            <div>
                              <span className="text-slate-500">Name:</span>{' '}
                              <strong className="text-slate-900 font-bold">{client.name || 'N/A'}</strong>
                            </div>
                            <div>
                              <span className="text-slate-500">Phone:</span>{' '}
                              <strong className="text-slate-900">{client.phone || 'N/A'}</strong>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-500">Email:</span>{' '}
                              <span className="text-slate-800 font-medium">{client.email || 'N/A'}</span>
                            </div>
                            {client.address?.city && (
                              <div className="col-span-2">
                                <span className="text-slate-500">Address:</span>{' '}
                                <span className="text-slate-800">
                                  {[client.address.street, client.address.city, client.address.state]
                                    .filter(Boolean)
                                    .join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Nominee Tag */}
                        {policy.nomineeName && (
                          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-indigo-950 bg-indigo-50/70 px-2.5 py-1.5 rounded-lg border border-indigo-200/80">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="text-slate-500 font-medium">Nominee:</span>
                            <span className="text-indigo-900 font-bold">{policy.nomineeName}</span>
                            {policy.nomineeRelation && (
                              <span className="text-[11px] text-indigo-700 font-medium">
                                ({policy.nomineeRelation})
                              </span>
                            )}
                          </div>
                        )}

                        {/* Bank Mandate & Settlement Account */}
                        {hasBank && (
                          <div className="mt-2 p-2.5 bg-sky-50/70 rounded-lg border border-sky-200/80 text-xs">
                            <div className="flex items-center gap-1.5 text-blue-900 font-bold mb-1 text-[11px]">
                              <Landmark className="w-3.5 h-3.5 text-blue-700" />
                              <span>Mandate & Settlement Account</span>
                            </div>
                            <div className="text-[11px] text-slate-700 grid grid-cols-2 gap-1">
                              {bank.bankName && (
                                <div><span className="text-slate-500">Bank:</span> <strong className="text-slate-900 font-semibold">{bank.bankName}</strong></div>
                              )}
                              {bank.accountNumber && (
                                <div><span className="text-slate-500">A/C:</span> <strong className="font-mono text-slate-900">{formatAccountNumber(bank.accountNumber)}</strong></div>
                              )}
                              {bank.ifscCode && (
                                <div><span className="text-slate-500">IFSC:</span> <strong className="font-mono text-slate-900">{bank.ifscCode}</strong></div>
                              )}
                              {bank.accountHolderName && (
                                <div><span className="text-slate-500">Holder:</span> <strong className="text-slate-900 font-semibold">{bank.accountHolderName}</strong></div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{startDateFormatted} — {endDateFormatted}</span>
                        </div>
                        <button
                          onClick={() => generateReceiptPdf(policy, client)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white transition-colors text-xs font-bold cursor-pointer border border-indigo-200 hover:border-indigo-600"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Receipt</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CLIENT POLICYHOLDER DIRECTORY */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Registered Policyholders</h3>
                <p className="text-xs text-slate-500">Direct clients enrolled in the AgiesShield network</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                {clients.length} Total Clients
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {clients.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No policyholder accounts registered in the database yet.
                </div>
              ) : (
                clients.map((c) => {
                  const clientPolicies = policies.filter((p) => p.user?._id === c._id);
                  const totalClientSum = clientPolicies.reduce(
                    (acc, p) => acc + (p.coverageAmount || 0),
                    0
                  );

                  return (
                    <div key={c._id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                          {c.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                          <div className="text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {c.email}
                            </span>
                            {c.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {c.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="font-bold text-slate-900">{clientPolicies.length} Policies</div>
                          <div className="text-[11px] text-slate-500">₹{totalClientSum.toLocaleString('en-IN')} Insured</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* APPROVE CLAIM MODAL */}
      {approvingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-100" />
                <h3 className="font-bold text-sm">Accept & Authorize Claim Disbursal</h3>
              </div>
              <button
                onClick={() => setApprovingClaim(null)}
                className="p-1 rounded text-emerald-100 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmApproval} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Claim ID:</span>{' '}
                  <strong className="font-mono text-slate-900">{approvingClaim.claimNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Claimant:</span>{' '}
                  <strong className="text-slate-900">{approvingClaim.user?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Claimed Amount:</span>{' '}
                  <strong className="text-amber-900 font-mono font-bold">
                    ₹{Number(approvingClaim.claimAmount).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Approved Disbursal Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={approvedAmountInput}
                    onChange={(e) => setApprovedAmountInput(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Amount to be credited to the policyholder's bank mandate.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Agent Assessment & Adjudication Notes
                </label>
                <textarea
                  rows={3}
                  required
                  value={approvalNotesInput}
                  onChange={(e) => setApprovalNotesInput(e.target.value)}
                  placeholder="e.g. Verified hospital bills and incident report. Disbursal approved."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApprovingClaim(null)}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDecision}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingDecision ? 'Authorizing...' : 'Authorize & Disburse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT CLAIM MODAL */}
      {rejectingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-100" />
                <h3 className="font-bold text-sm">Reject Claim Request</h3>
              </div>
              <button
                onClick={() => setRejectingClaim(null)}
                className="p-1 rounded text-red-100 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRejection} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Claim ID:</span>{' '}
                  <strong className="font-mono text-slate-900">{rejectingClaim.claimNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Claimant:</span>{' '}
                  <strong className="text-slate-900">{rejectingClaim.user?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Requested Amount:</span>{' '}
                  <strong className="text-slate-900 font-mono font-bold">
                    ₹{Number(rejectingClaim.claimAmount).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionNotesInput}
                  onChange={(e) => setRejectionNotesInput(e.target.value)}
                  placeholder="e.g. Incident is excluded under Section 4.2 of Policy Terms or insufficient documentation."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This justification will be displayed transparently on the policyholder's dashboard.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingClaim(null)}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDecision}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingDecision ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE POLICY MODAL */}
      <CreatePolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        user={user}
        onPolicyCreated={handlePolicyCreated}
      />
    </div>
  );
}
