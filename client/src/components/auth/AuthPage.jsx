import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, User, Mail, ArrowRight, AlertCircle, Briefcase, Phone, Award } from 'lucide-react';

export default function AuthPage() {
  // Portal Tab: 'policyholder' vs 'agent'
  const [portalType, setPortalType] = useState('policyholder'); // 'policyholder' | 'agent'
  
  // Auth Mode: true = Sign In, false = Register / Sign Up
  const [isLogin, setIsLogin] = useState(true);
  
  const { login, signup, loading, authError, setAuthError } = useAuth();

  // Policyholder Form State
  const [custUsername, setCustUsername] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custPassword, setCustPassword] = useState('');

  // Agent Form State
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [agentLicense, setAgentLicense] = useState('');
  const [agentPassword, setAgentPassword] = useState('');

  const handlePortalSwitch = (type) => {
    setPortalType(type);
    setIsLogin(true);
    setAuthError(null);
  };

  const handleModeSwitch = (loginMode) => {
    setIsLogin(loginMode);
    setAuthError(null);
  };

  // Submit Handler for Policyholder Portal
  const handlePolicyholderSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    try {
      if (isLogin) {
        if (!custUsername.trim()) {
          setAuthError('Please enter your policyholder username or registered email');
          return;
        }
        if (!custPassword) {
          setAuthError('Please enter your password');
          return;
        }
        await login({
          ...(custUsername.includes('@') ? { email: custUsername.trim() } : { name: custUsername.trim() }),
          password: custPassword
        });
      } else {
        if (!custUsername.trim()) {
          setAuthError('Please enter your full legal name');
          return;
        }
        if (custPassword.length < 6) {
          setAuthError('Password must be at least 6 characters');
          return;
        }
        await signup({
          name: custUsername.trim(),
          password: custPassword,
          ...(custEmail.trim() ? { email: custEmail.trim() } : {}),
          ...(custPhone.trim() ? { phone: custPhone.trim() } : {}),
          role: 'customer'
        });
      }
    } catch {
      // Error handled by AuthContext
    }
  };

  // Submit Handler for Agent Portal
  const handleAgentSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    try {
      if (isLogin) {
        if (!agentName.trim()) {
          setAuthError('Please enter your agent username or official email');
          return;
        }
        if (!agentPassword) {
          setAuthError('Please enter your agent account password');
          return;
        }
        await login({
          ...(agentName.includes('@') ? { email: agentName.trim() } : { name: agentName.trim() }),
          password: agentPassword
        });
      } else {
        if (!agentName.trim()) {
          setAuthError('Please enter agent full legal name');
          return;
        }
        if (agentPassword.length < 6) {
          setAuthError('Password must be at least 6 characters');
          return;
        }
        await signup({
          name: agentName.trim(),
          password: agentPassword,
          ...(agentEmail.trim() ? { email: agentEmail.trim() } : {}),
          ...(agentPhone.trim() || agentLicense.trim() 
              ? { phone: `${agentPhone.trim()} ${agentLicense ? `(Lic: ${agentLicense.trim()})` : ''}`.trim() } 
              : {}),
          role: 'agent'
        });
      }
    } catch {
      // Error handled by AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Top Header & Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 mb-3">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          AgiesShield
        </h1>
        <p className="mt-1 text-sm text-slate-400 font-medium">
          Enterprise Policy Administration & Underwriting Network
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Dual Portal Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 shadow-md mb-4">
          <button
            type="button"
            onClick={() => handlePortalSwitch('policyholder')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              portalType === 'policyholder'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Policyholder Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('agent')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              portalType === 'agent'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Agent & Broker Portal</span>
          </button>
        </div>

        {/* Portal Form Card */}
        <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 border-t-4 ${
          portalType === 'policyholder' ? 'border-t-blue-600' : 'border-t-indigo-600'
        }`}>
          {/* Portal Sub-Header Banner */}
          <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${
            portalType === 'policyholder' ? 'bg-blue-50/50' : 'bg-indigo-50/50'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  portalType === 'policyholder' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                }`}>
                  {portalType === 'policyholder' ? 'Customer Access' : 'Agent & Underwriter Portal'}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {portalType === 'policyholder'
                  ? (isLogin ? 'Policyholder Sign In' : 'Register New Policyholder')
                  : (isLogin ? 'Licensed Agent Sign In' : 'Register Broker / Agent Account')}
              </h2>
            </div>

            <div className={`p-2.5 rounded-xl ${
              portalType === 'policyholder' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {portalType === 'policyholder' ? <User className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
            </div>
          </div>

          <div className="py-6 px-6 sm:px-8">
            {/* Sign In vs Register Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-5 border border-slate-200">
              <button
                type="button"
                onClick={() => handleModeSwitch(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  isLogin
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  !isLogin
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {portalType === 'policyholder' ? 'Register Account' : 'Sign Up as Agent'}
              </button>
            </div>

            {/* Error Notification */}
            {authError && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{authError}</div>
              </div>
            )}

            {/* POLICYHOLDER FORM */}
            {portalType === 'policyholder' && (
              <form onSubmit={handlePolicyholderSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isLogin ? 'Policyholder Username or Email' : 'Full Legal Name *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={custUsername}
                      onChange={(e) => setCustUsername(e.target.value)}
                      placeholder={isLogin ? 'e.g. siddhi or siddhi@example.com' : 'e.g. Siddhi Bathwal'}
                      className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          value={custEmail}
                          onChange={(e) => setCustEmail(e.target.value)}
                          placeholder="policyholder@example.com"
                          className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Contact Phone <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone className="h-4 w-4" />
                        </div>
                        <input
                          type="tel"
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={custPassword}
                      onChange={(e) => setCustPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                    />
                  </div>
                  {!isLogin && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Minimum 6 characters
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isLogin ? 'Sign In as Policyholder' : 'Create Policyholder Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* AGENT FORM */}
            {portalType === 'agent' && (
              <form onSubmit={handleAgentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isLogin ? 'Agent Username or Official Email' : 'Agent Full Legal Name *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder={isLogin ? 'e.g. agent_rahul or rahul@agies.com' : 'e.g. Rahul Sharma'}
                      className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Corporate / Agency Email *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={agentEmail}
                          onChange={(e) => setAgentEmail(e.target.value)}
                          placeholder="agent@agiesshield.com"
                          className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Agent License ID
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Award className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            value={agentLicense}
                            onChange={(e) => setAgentLicense(e.target.value)}
                            placeholder="LIC-98402"
                            className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Official Phone
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Phone className="h-4 w-4" />
                          </div>
                          <input
                            type="tel"
                            value={agentPhone}
                            onChange={(e) => setAgentPhone(e.target.value)}
                            placeholder="+91 99887 76655"
                            className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Agent Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={agentPassword}
                      onChange={(e) => setAgentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                    />
                  </div>
                  {!isLogin && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Requires minimum 6 characters
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isLogin ? 'Sign In to Agent Portal' : 'Register Licensed Agent'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Footer Note */}
            <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
              {isLogin ? (
                <span>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch(false)}
                    className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                  >
                    Register here
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch(true)}
                    className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Security attestation */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Encrypted Session • Official AgiesShield Database</span>
        </div>
      </div>
    </div>
  );
}
