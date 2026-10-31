import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import PolicyCard from './PolicyCard';
import ClaimCard from './ClaimCard';
import CreatePolicyModal from '../modals/CreatePolicyModal';
import CreateClaimModal from '../modals/CreateClaimModal';
import { calculateNextDueDate } from '../../utils/dueCalculator';
import { generateReceiptPdf } from '../../utils/generateReceiptPdf';
import {
  Shield,
  ShieldPlus,
  ShieldAlert,
  LogOut,
  Plus,
  RefreshCw,
  FolderOpen,
  Calendar,
  Clock,
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  AlertCircle,
  Download,
  X
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Real data states (no mock data)
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'policies', 'claims', 'dues'

  // Modal controls
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [settingReminderId, setSettingReminderId] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch real data from backend API
  const fetchData = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    try {
      const [policiesRes, claimsRes, remindersRes] = await Promise.all([
        api.getUserPolicies(user._id),
        api.getUserClaims(user._id),
        api.getReminders({ user: user._id, status: 'Active' }),
      ]);

      setPolicies(policiesRes.data || []);
      setClaims(claimsRes.data || []);
      setReminders(remindersRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load insurance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id]);

  // Real data calculations (strictly zero if empty)
  const totalPoliciesCount = policies.length;
  const activePolicies = policies.filter((p) => p.status === 'Active');
  const activePoliciesCount = activePolicies.length;
  const totalCoverageAmount = policies.reduce((acc, p) => acc + (Number(p.coverageAmount) || 0), 0);
  const totalClaimsCount = claims.length;
  const totalClaimedAmount = claims.reduce((acc, c) => acc + (Number(c.claimAmount) || 0), 0);

  // Policy creation callback
  const handlePolicyCreated = (newPolicy) => {
    setPolicies((prev) => [newPolicy, ...prev]);
    showNotification(`Policy '${newPolicy.title}' created and saved to database!`);
  };

  // Claim creation callback
  const handleClaimCreated = (newClaim) => {
    setClaims((prev) => [newClaim, ...prev]);
    showNotification(`Claim '${newClaim.claimNumber}' submitted to database!`);
  };

  // Policy deletion handler
  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    try {
      await api.deletePolicy(policyId);
      setPolicies((prev) => prev.filter((p) => p._id !== policyId));
      setReminders((prev) => prev.filter((r) => r.policy?._id !== policyId && r.policy !== policyId));
      showNotification('Policy deleted successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Claim deletion handler
  const handleDeleteClaim = async (claimId) => {
    if (!window.confirm('Are you sure you want to delete this claim?')) return;
    try {
      await api.deleteClaim(claimId);
      setClaims((prev) => prev.filter((c) => c._id !== claimId));
      showNotification('Claim deleted successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Set Reminder Handler
  const handleSetReminder = async (policy, calculatedDue) => {
    if (!calculatedDue) return;
    setSettingReminderId(policy._id);
    try {
      const res = await api.createReminder({
        user: user._id,
        policy: policy._id,
        title: `Premium Due: ${policy.title}`,
        dueDate: calculatedDue.nextDueDate,
        amount: policy.premiumAmount,
        note: `Payment frequency: ${policy.paymentFrequency}`
      });

      if (res.success && res.data) {
        setReminders((prev) => {
          const filtered = prev.filter((r) => (r.policy?._id || r.policy) !== policy._id);
          return [res.data, ...filtered];
        });
        showNotification(`Reminder set for ${policy.title}!`);
      }
    } catch (err) {
      alert(`Error setting reminder: ${err.message}`);
    } finally {
      setSettingReminderId(null);
    }
  };

  // Dismiss Reminder Handler
  const handleDismissReminder = async (reminderId) => {
    try {
      await api.updateReminderStatus(reminderId, { status: 'Dismissed' });
      setReminders((prev) => prev.filter((r) => r._id !== reminderId));
      showNotification('Reminder dismissed');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 border border-white/10">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Aegis<span className="text-brand-400">Shield</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Live DB
              </span>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <div className="font-semibold text-white leading-none">{user?.name}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user?.role || 'Customer'}</div>
              </div>
            </div>

            <button
              onClick={() => setIsPolicyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Policy</span>
            </button>

            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">File</span> Claim
            </button>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors ml-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-950/90 text-emerald-200 border border-emerald-800/80 shadow-2xl backdrop-blur-md text-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* ACTIVE REMINDERS ALERTS BANNER (Tailwind Alert Components) */}
        {reminders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <BellRing className="w-4 h-4 animate-bounce" />
              <span>Active Premium Due Reminders ({reminders.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reminders.map((rem) => {
                const dueDateFormatted = new Date(rem.dueDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                const diffDays = Math.ceil((new Date(rem.dueDate).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
                const isUrgent = diffDays <= 7;

                return (
                  <div
                    key={rem._id}
                    className={`flex items-start justify-between p-4 rounded-2xl border backdrop-blur-md transition-all shadow-lg ${
                      isUrgent
                        ? 'bg-amber-950/40 border-amber-600/60 text-amber-100 shadow-amber-950/20'
                        : 'bg-slate-900/90 border-brand-500/40 text-slate-100 shadow-brand-950/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl mt-0.5 ${isUrgent ? 'bg-amber-500/20 text-amber-400' : 'bg-brand-500/20 text-brand-400'}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{rem.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            diffDays <= 0
                              ? 'bg-red-950 text-red-300 border-red-800'
                              : isUrgent
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-brand-950 text-brand-300 border-brand-800'
                          }`}>
                            {diffDays <= 0 ? 'Due Today / Overdue' : `Due in ${diffDays} days`}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>Next Due: <strong className="text-white">{dueDateFormatted}</strong></span>
                          <span>Premium: <strong className="text-emerald-400 font-mono text-sm">₹{Number(rem.amount).toLocaleString('en-IN')}</strong></span>
                          {rem.policy?.policyNumber && (
                            <span className="text-slate-400 font-mono text-[11px]">{rem.policy.policyNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDismissReminder(rem._id)}
                      title="Dismiss reminder"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ml-2 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
              Welcome back, <span className="text-brand-400">{user?.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live Insurance Portfolio — Real-time records fetched directly from Express API
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Real Metrics Banner (Values are 0 until real data is created) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Policies</span>
              <Shield className="w-4 h-4 text-brand-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {activePoliciesCount}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {totalPoliciesCount} total registered
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Coverage</span>
              <span className="text-xs font-bold text-emerald-400">₹</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">
              ₹{totalCoverageAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Cumulative insured limit
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Claims Filed</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2">
              {totalClaimsCount}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Pending adjudication
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Claimed Amount</span>
              <span className="text-xs font-bold text-purple-400">₹</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-2">
              ₹{totalClaimedAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Requested settlements
            </span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'policies'
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>Policies</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {policies.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('dues')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dues'
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>Upcoming Dues</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 text-amber-300 border border-amber-800/60">
              {activePoliciesCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'claims'
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>Claims</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {claims.length}
            </span>
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 flex items-center justify-between text-red-200 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="text-xs font-semibold text-red-300 underline hover:text-white cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-xs">Querying Express API and database...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-10">
            {/* FEATURE 3: UPCOMING DUES & REMINDERS SECTION */}
            {(activeTab === 'all' || activeTab === 'dues') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Upcoming Dues & Reminders</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                      {activePoliciesCount}
                    </span>
                  </div>
                </div>

                {activePolicies.length === 0 ? (
                  <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2">
                    <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">
                      No active policies to calculate upcoming premium dues for.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activePolicies.map((pol) => {
                      const dueInfo = calculateNextDueDate(pol.startDate, pol.paymentFrequency);
                      const hasActiveReminder = reminders.some(
                        (r) => (r.policy?._id || r.policy) === pol._id
                      );
                      const isSettingThis = settingReminderId === pol._id;

                      return (
                        <div
                          key={pol._id}
                          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                                {pol.policyNumber}
                              </span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">
                                {pol.paymentFrequency}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-white line-clamp-1">{pol.title}</h3>

                            <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Next Due Date:</span>
                                <span className="font-semibold text-white">{dueInfo?.formattedDate}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Premium Amount:</span>
                                <span className="font-mono font-bold text-emerald-400 text-sm">
                                  ₹{Number(pol.premiumAmount).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="pt-1 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">Timeline:</span>
                                <span className={`font-semibold ${dueInfo?.isUrgent ? 'text-amber-400' : 'text-slate-300'}`}>
                                  {dueInfo?.statusLabel}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            <button
                              onClick={() => generateReceiptPdf(pol, user)}
                              title="Download PDF Certificate & Receipt"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Receipt</span>
                            </button>

                            <button
                              onClick={() => handleSetReminder(pol, dueInfo)}
                              disabled={hasActiveReminder || isSettingThis}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                                hasActiveReminder
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 cursor-default'
                                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                              }`}
                            >
                              {hasActiveReminder ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Reminder Set</span>
                                </>
                              ) : isSettingThis ? (
                                <span>Saving...</span>
                              ) : (
                                <>
                                  <Bell className="w-3.5 h-3.5" />
                                  <span>Set Reminder</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* POLICIES SECTION */}
            {(activeTab === 'all' || activeTab === 'policies') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">Your Insurance Policies</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                      {policies.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPolicyModalOpen(true)}
                    className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Policy</span>
                  </button>
                </div>

                {/* Completely Empty State: zero hardcoded mock cards */}
                {policies.length === 0 ? (
                  <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center mx-auto">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">No Policies Created Yet</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Your insurance portfolio is currently empty. Use the button below to manually create your first policy and persist it to the database.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => setIsPolicyModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Your First Policy</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {policies.map((policy) => (
                      <PolicyCard
                        key={policy._id}
                        policy={policy}
                        user={user}
                        onDelete={handleDeletePolicy}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* CLAIMS SECTION */}
            {(activeTab === 'all' || activeTab === 'claims') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">Your Submitted Claims</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                      {claims.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsClaimModalOpen(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Submit Claim</span>
                  </button>
                </div>

                {/* Completely Empty State: zero hardcoded mock cards */}
                {claims.length === 0 ? (
                  <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">No Claims Submitted</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      You do not have any claims filed in the database. When an incident occurs on an active policy, submit a claim here to start adjudication.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => setIsClaimModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Submit a Claim</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {claims.map((claim) => (
                      <ClaimCard
                        key={claim._id}
                        claim={claim}
                        onDelete={handleDeleteClaim}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreatePolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        user={user}
        onPolicyCreated={handlePolicyCreated}
      />

      <CreateClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        user={user}
        policies={policies}
        onClaimCreated={handleClaimCreated}
      />
    </div>
  );
}
