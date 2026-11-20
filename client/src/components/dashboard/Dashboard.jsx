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
  ShieldAlert,
  LogOut,
  Plus,
  RefreshCw,
  Calendar,
  Clock,
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  Landmark
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Real database records (Strictly no mock data)
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'policies', 'dues', 'claims'

  // Modals & Notifications
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
      setError(err.message || 'Failed to connect to insurance server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id]);

  // Real live calculations
  const totalPoliciesCount = policies.length;
  const activePolicies = policies.filter((p) => p.status === 'Active');
  const activePoliciesCount = activePolicies.length;
  const totalCoverageAmount = policies.reduce((acc, p) => acc + (Number(p.coverageAmount) || 0), 0);
  const totalClaimsCount = claims.length;
  const totalClaimedAmount = claims.reduce((acc, c) => acc + (Number(c.claimAmount) || 0), 0);

  // Policy creation callback
  const handlePolicyCreated = (newPolicy) => {
    setPolicies((prev) => [newPolicy, ...prev]);
    showNotification(`Policy '${newPolicy.title}' registered and saved successfully.`);
  };

  // Claim creation callback
  const handleClaimCreated = (newClaim) => {
    setClaims((prev) => [newClaim, ...prev]);
    showNotification(`Claim '${newClaim.claimNumber}' submitted successfully.`);
  };

  // Policy deletion handler
  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy record?')) return;
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
    if (!window.confirm('Are you sure you want to delete this claim record?')) return;
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
        showNotification(`Reminder set for ${policy.title}`);
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
      showNotification('Reminder marked as acknowledged');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Distinguished Corporate Navy Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-sm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand with rich blue accent */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                AgiesShield
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold tracking-normal">
                  PORTAL
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                Policy Administration & Claims Disbursal
              </div>
            </div>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
              <div className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center font-bold text-[11px]">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <div className="font-semibold text-white leading-none">{user?.name}</div>
                <div className="text-[10px] text-blue-300 capitalize font-medium">{user?.role || 'Policyholder'}</div>
              </div>
            </div>

            <button
              onClick={() => setIsPolicyModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Policy</span>
            </button>

            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>File Claim</span>
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

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-slate-900 text-white shadow-xl text-xs font-medium border border-slate-800 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex-1 w-full space-y-6">
        {/* ACTIVE REMINDERS ALERTS BANNER */}
        {reminders.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-800 uppercase tracking-wider">
              <BellRing className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span>Premium Payment Reminders ({reminders.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reminders
                .slice()
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .map((rem) => {
                  const dueDateFormatted = new Date(rem.dueDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  const diffDays = Math.ceil(
                    (new Date(rem.dueDate).getTime() - new Date().setHours(0, 0, 0, 0)) /
                      (1000 * 60 * 60 * 24)
                  );

                  // ── Urgency tiers ──
                  const isOverdue   = diffDays <= 0;          // red fast-blink
                  const isCritical  = diffDays > 0 && diffDays <= 10;  // red slow-blink
                  const isWarning   = diffDays > 10 && diffDays <= 15; // orange glow
                  const isNormal    = diffDays > 15;                   // blue calm

                  // CSS animation class
                  const animClass = isOverdue
                    ? 'reminder-overdue'
                    : isCritical
                    ? 'reminder-critical'
                    : isWarning
                    ? 'reminder-warning'
                    : '';

                  // Container styling
                  const containerStyle = isOverdue || isCritical
                    ? 'bg-red-50 border-red-400 text-red-950'
                    : isWarning
                    ? 'bg-orange-50 border-orange-400 text-orange-950'
                    : 'bg-blue-50/90 border-blue-200 text-blue-950';

                  // Icon background
                  const iconStyle = isOverdue || isCritical
                    ? 'bg-red-100 text-red-700'
                    : isWarning
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700';

                  // Days badge styling
                  const badgeStyle = isOverdue
                    ? 'bg-red-600 text-white border-red-700 font-extrabold'
                    : isCritical
                    ? 'bg-red-100 text-red-900 border-red-400 font-bold'
                    : isWarning
                    ? 'bg-orange-100 text-orange-900 border-orange-400 font-semibold'
                    : 'bg-blue-100 text-blue-800 border-blue-300';

                  // Label text
                  const daysLabel = isOverdue
                    ? '⚠ OVERDUE / DUE TODAY'
                    : isCritical
                    ? `🔴 URGENT — Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`
                    : isWarning
                    ? `⚡ Due in ${diffDays} days`
                    : `Due in ${diffDays} days`;

                  return (
                    <div
                      key={rem._id}
                      className={`flex items-start justify-between p-4 rounded-xl border-2 transition-all shadow-sm ${containerStyle} ${animClass}`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Bell Icon with urgency indicator */}
                        <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${iconStyle}`}>
                          {isOverdue || isCritical ? (
                            <BellRing className="w-4 h-4 animate-bounce" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className={`text-sm font-bold leading-tight ${
                              isOverdue || isCritical ? 'text-red-900' : isWarning ? 'text-orange-900' : 'text-slate-900'
                            }`}>
                              {rem.title}
                            </h4>
                            {/* Urgency Days Badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] border ${badgeStyle} whitespace-nowrap`}>
                              {daysLabel}
                            </span>
                          </div>

                          {/* Critical / Overdue warning message */}
                          {(isOverdue || isCritical) && (
                            <p className="text-[11px] text-red-800 font-semibold mb-1 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping inline-block" />
                              Immediate payment required to avoid policy lapse
                            </p>
                          )}
                          {isWarning && (
                            <p className="text-[11px] text-orange-800 font-semibold mb-1 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse inline-block" />
                              Payment due soon — please schedule in advance
                            </p>
                          )}

                          {/* Meta row */}
                          <div className={`text-xs flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 ${
                            isOverdue || isCritical ? 'text-red-800' : isWarning ? 'text-orange-800' : 'text-slate-600'
                          }`}>
                            <span>
                              Due Date:{' '}
                              <strong className={`font-bold ${
                                isOverdue || isCritical ? 'text-red-900' : isWarning ? 'text-orange-900' : 'text-slate-900'
                              }`}>
                                {dueDateFormatted}
                              </strong>
                            </span>
                            <span>
                              Premium:{' '}
                              <strong className={`font-mono font-bold text-sm ${
                                isOverdue || isCritical ? 'text-red-900' : isWarning ? 'text-orange-900' : 'text-blue-900'
                              }`}>
                                ₹{Number(rem.amount).toLocaleString('en-IN')}
                              </strong>
                            </span>
                            {rem.policy?.policyNumber && (
                              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                                {rem.policy.policyNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dismiss Button */}
                      <button
                        onClick={() => handleDismissReminder(rem._id)}
                        title="Acknowledge and dismiss"
                        className={`p-1.5 rounded-md transition-colors ml-2 cursor-pointer shrink-0 ${
                          isOverdue || isCritical
                            ? 'text-red-400 hover:text-red-800 hover:bg-red-200/60'
                            : isWarning
                            ? 'text-orange-400 hover:text-orange-800 hover:bg-orange-200/60'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Dashboard Title & Quick Stats Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
              Policyholder Portfolio
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Account: <span className="font-semibold text-slate-800">{user?.name}</span> • All records loaded directly from database
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Professional Color-Coded Financial Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Policies (Sapphire Blue Accent) */}
          <div className="bg-white border-t-4 border-t-blue-600 border-x border-b border-slate-200 rounded-xl p-4.5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Active Policies</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {activePoliciesCount}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
              {totalPoliciesCount} total registered
            </span>
          </div>

          {/* Card 2: Insured Coverage (Mint Jade / Emerald Accent) */}
          <div className="bg-white border-t-4 border-t-emerald-600 border-x border-b border-slate-200 rounded-xl p-4.5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Insured Coverage</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                ₹
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-2">
              ₹{totalCoverageAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
              Cumulative coverage limit
            </span>
          </div>

          {/* Card 3: Claims Filed (Amber / Topaz Gold Accent) */}
          <div className="bg-white border-t-4 border-t-amber-500 border-x border-b border-slate-200 rounded-xl p-4.5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Claims Filed</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-900 mt-2">
              {totalClaimsCount}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
              In adjudication queue
            </span>
          </div>

          {/* Card 4: Claimed Amount (Royal Indigo Accent) */}
          <div className="bg-white border-t-4 border-t-indigo-600 border-x border-b border-slate-200 rounded-xl p-4.5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Claimed Amount</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                ₹
              </div>
            </div>
            <div className="text-2xl font-extrabold text-indigo-900 mt-2">
              ₹{totalClaimedAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
              Total requested compensation
            </span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            All Overview
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'policies'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Policies</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'policies' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {policies.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('dues')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dues'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Upcoming Dues & Mandates</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'dues' ? 'bg-amber-300 text-amber-950' : 'bg-amber-100 text-amber-800'
            }`}>
              {activePoliciesCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'claims'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Claims</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'claims' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {claims.length}
            </span>
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-red-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="font-semibold text-red-700 underline hover:text-red-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-xs font-medium">Loading records from server...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            {/* UPCOMING DUES & REMINDERS SECTION (Warm Amber Accent Header & Cards) */}
            {(activeTab === 'all' || activeTab === 'dues') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Upcoming Premium Dues & Bank Mandates</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      {activePoliciesCount}
                    </span>
                  </div>
                </div>

                {activePolicies.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
                    <Clock className="w-7 h-7 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">
                      No active policies to compute upcoming premium installments for.
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
                      const bank = pol.bankDetails || {};

                      return (
                        <div
                          key={pol._id}
                          className="bg-white border-l-4 border-l-amber-500 border-r border-t border-b border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {pol.policyNumber}
                              </span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                {pol.paymentFrequency}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{pol.title}</h3>

                            <div className="mt-3 p-3 rounded-lg bg-amber-50/50 border border-amber-200/60 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600">Next Due Date:</span>
                                <span className="font-semibold text-slate-900">{dueInfo?.formattedDate}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600">Installment Amount:</span>
                                <span className="font-mono font-bold text-blue-900 text-sm">
                                  ₹{Number(pol.premiumAmount).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-amber-200/50">
                                <span className="text-slate-600">Timeline:</span>
                                <span className={`font-bold ${dueInfo?.isUrgent ? 'text-amber-800 bg-amber-100 px-2 py-0.5 rounded' : 'text-slate-700'}`}>
                                  {dueInfo?.statusLabel}
                                </span>
                              </div>
                              {bank.bankName && (
                                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-amber-200/50">
                                  <span className="text-slate-600 flex items-center gap-1">
                                    <Landmark className="w-3 h-3 text-blue-700" />
                                    <span>Mandate Bank:</span>
                                  </span>
                                  <span className="font-semibold text-slate-900">{bank.bankName}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              onClick={() => generateReceiptPdf(pol, user)}
                              title="Download PDF Certificate & Receipt"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Receipt</span>
                            </button>

                            <button
                              onClick={() => handleSetReminder(pol, dueInfo)}
                              disabled={hasActiveReminder || isSettingThis}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                hasActiveReminder
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
                                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
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

            {/* POLICIES SECTION (Sapphire Blue Accent Header) */}
            {(activeTab === 'all' || activeTab === 'policies') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <Shield className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Your Insurance Policies</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      {policies.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPolicyModalOpen(true)}
                    className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Policy</span>
                  </button>
                </div>

                {policies.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">No Policies Registered</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      You do not have any policies in the portal. Add a new policy along with nominee and banking details to get started.
                    </p>
                    <div className="pt-1">
                      <button
                        onClick={() => setIsPolicyModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Register First Policy</span>
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

            {/* CLAIMS SECTION (Amber / Indigo Accent Header) */}
            {(activeTab === 'all' || activeTab === 'claims') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Your Submitted Claims</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {claims.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsClaimModalOpen(true)}
                    className="text-xs text-indigo-700 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Submit Claim</span>
                  </button>
                </div>

                {claims.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">No Claims on Record</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      You have not filed any insurance claims. When an incident or loss occurs on an active policy, submit a claim here.
                    </p>
                    <div className="pt-1">
                      <button
                        onClick={() => setIsClaimModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>File an Insurance Claim</span>
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
