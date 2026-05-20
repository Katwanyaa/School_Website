'use client';

import { useState, useEffect } from 'react';
import {
  FiUser, FiLock, FiAlertCircle, FiX,
  FiHelpCircle, FiBook, FiShield, FiClock,
  FiLogIn, FiCheckCircle, FiAward, FiEye, FiEyeOff, FiSend
} from 'react-icons/fi';
import Image from 'next/image';
import CircularProgress from '@mui/material/CircularProgress';

const EMPTY_FORM_DATA = {
  identifier: '',
  password: '',
  fullName: '',
  admissionNumber: '',
  newPassword: '',
  confirmPassword: '',
  currentPassword: '',
  resetMessage: ''
};

const EMPTY_PASSWORD_VISIBILITY = {
  login: false,
  setup: false,
  confirm: false,
  current: false
};

const buildInitialFormData = (admissionNumber = '') => ({
  ...EMPTY_FORM_DATA,
  identifier: admissionNumber,
  admissionNumber
});

export default function StudentLoginModal({
  isOpen,
  onClose,
  onLogin,
  onSetupPassword = () => {},
  onPasswordResetRequest = () => {},
  isLoading = false,
  error = null,
  requiresContact = false,
  passwordSetupToken = null,
  passwordSetupStudent = null,
  initialMode = 'password',
  defaultAdmissionNumber = ''
}) {
  const [mode, setMode] = useState('password');
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);
  const [localError, setLocalError] = useState(null);
  const [localSuccess, setLocalSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState(EMPTY_PASSWORD_VISIBILITY);

  useEffect(() => {
    setLocalError(error || null);
  }, [error]);

  useEffect(() => {
    if (!isOpen || passwordSetupToken) return;

    setMode(initialMode);
    setFormData(buildInitialFormData(defaultAdmissionNumber));
    setLocalError(null);
    setLocalSuccess(null);
    setValidationErrors({});
    setVisiblePasswords(EMPTY_PASSWORD_VISIBILITY);
  }, [isOpen, passwordSetupToken, initialMode, defaultAdmissionNumber]);

  useEffect(() => {
    if (passwordSetupToken) {
      setMode('setup');
      setFormData(EMPTY_FORM_DATA);
      setLocalSuccess(null);
      setValidationErrors({});
      setVisiblePasswords(EMPTY_PASSWORD_VISIBILITY);
    }
  }, [passwordSetupToken, passwordSetupStudent]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setLocalError(null);
    setLocalSuccess(null);
    setValidationErrors(prev => ({ ...prev, [field]: '' }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFormData(EMPTY_FORM_DATA);
    setLocalError(null);
    setLocalSuccess(null);
    setValidationErrors({});
    setVisiblePasswords(EMPTY_PASSWORD_VISIBILITY);
  };

  const passwordStrength = (password) => {
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];
    return checks.filter(Boolean).length;
  };

  const validatePasswordSetup = () => {
    const errors = {};
    const score = passwordStrength(formData.newPassword);

    if (score < 5) {
      errors.newPassword = 'Use at least 8 characters with uppercase, lowercase, a number, and a symbol.';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordLogin = (event) => {
    event.preventDefault();
    const errors = {};
    if (!formData.identifier.trim()) errors.identifier = 'Enter your admission number.';
    if (!formData.password) errors.password = 'Enter your password.';
    setValidationErrors(errors);
    if (Object.keys(errors).length) return;

    onLogin({
      action: 'login',
      identifier: formData.identifier.trim(),
      password: formData.password
    });
  };

  const handleFirstAccess = (event) => {
    event.preventDefault();
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Enter your registered name.';
    if (!formData.admissionNumber.trim()) errors.admissionNumber = 'Enter your admission number.';
    setValidationErrors(errors);
    if (Object.keys(errors).length) return;

    onLogin({
      action: 'verify-first-access',
      fullName: formData.fullName.trim(),
      admissionNumber: formData.admissionNumber.trim()
    });
  };

  const handleSetupPassword = (event) => {
    event.preventDefault();
    if (!validatePasswordSetup()) return;

    onSetupPassword({
      action: 'setup-password',
      setupToken: passwordSetupToken,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    });
  };

  const handlePasswordResetRequest = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!formData.admissionNumber.trim()) errors.admissionNumber = 'Enter your admission number.';
    if (mode === 'changePassword' && !formData.currentPassword) {
      errors.currentPassword = 'Enter your current password to request a password change.';
    }
    setValidationErrors(errors);
    if (Object.keys(errors).length) return;

    const result = await onPasswordResetRequest({
      action: mode === 'changePassword' ? 'request-change-password' : 'request-forgot-password',
      requestType: mode === 'changePassword' ? 'change' : 'forgot',
      admissionNumber: formData.admissionNumber.trim().toUpperCase(),
      currentPassword: formData.currentPassword,
      message: formData.resetMessage.trim()
    });

    if (result?.success) {
      setLocalError(null);
      setLocalSuccess(result.message || 'Password help request received by the school office.');
    }
  };

  const handleClose = () => {
    setMode('password');
    setFormData(EMPTY_FORM_DATA);
    setLocalError(null);
    setLocalSuccess(null);
    setValidationErrors({});
    setVisiblePasswords(EMPTY_PASSWORD_VISIBILITY);
    onClose();
  };

  const strength = passwordStrength(formData.newPassword);

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-login-title"
    >
      <main className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        <header className="relative bg-slate-950 px-5 sm:px-7 py-5 text-white flex-shrink-0">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl p-1 shadow-xl overflow-hidden">
                <Image
                  src="/katz.jpeg"
                  alt="Katwanyaa Senior School Logo"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 id="student-login-title" className="text-lg sm:text-xl font-black tracking-tight">
                  Katwanyaa Student Portal
                </h1>
                <p className="text-slate-300 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em]">
                  Secure student access
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Close login modal"
            >
              <FiX className="text-xl" aria-hidden="true" />
            </button>
          </div>
        </header>

        <article className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] min-h-0 overflow-y-auto">
          <aside className="bg-slate-50 border-r border-slate-200 p-5 sm:p-7">
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4">
                <FiShield className="text-xl" />
              </div>
              <h2 className="text-lg font-black text-slate-950">How access works</h2>
              <div className="mt-4 space-y-4">
                {[
                  ['First time', 'Verify your admission number and registered name.'],
                  ['Create password', 'Set a strong password that stays saved after record refreshes.'],
                  ['Password help', 'Forgot and change requests are recorded for secure school follow-up.']
                ].map(([title, text]) => (
                  <div key={title} className="flex gap-3">
                    <div className="mt-0.5 w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FiCheckCircle className="text-sm" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{title}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-900 font-black text-sm">
                <FiClock />
                Session duration
              </div>
              <p className="text-xs text-blue-800 mt-1">For safety, student sessions expire after 2 hours.</p>
            </div>
          </aside>

          <section className="p-5 sm:p-7">
            {!passwordSetupToken && (
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 mb-5">
                <button
                  type="button"
                  onClick={() => switchMode('password')}
                  className={`py-3 rounded-xl text-sm font-black transition-all ${mode === 'password' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('firstAccess')}
                  className={`py-3 rounded-xl text-sm font-black transition-all ${mode === 'firstAccess' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  First-Time Access
                </button>
              </div>
            )}

            {localError && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="p-2 bg-red-100 rounded-xl text-red-700">
                  <FiAlertCircle />
                </div>
                <div>
                  <p className="text-sm font-black text-red-900">{requiresContact ? 'Record needs attention' : 'Access issue'}</p>
                  <p className="text-sm text-red-700 mt-1">{localError}</p>
                  {requiresContact && (
                    <p className="text-xs text-red-700 mt-2 flex items-center gap-1">
                      <FiHelpCircle /> Contact your class teacher or the school office.
                    </p>
                  )}
                </div>
              </div>
            )}

            {localSuccess && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
                  <FiCheckCircle />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-900">Request sent</p>
                  <p className="text-sm text-emerald-700 mt-1">{localSuccess}</p>
                </div>
              </div>
            )}

            {mode === 'setup' && passwordSetupToken ? (
              <form onSubmit={handleSetupPassword} className="space-y-5" autoComplete="off">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Create Your Password</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Verified for {passwordSetupStudent?.fullName || 'student'} ({passwordSetupStudent?.admissionNumber}).
                  </p>
                </div>

                <InputField
                  label="New Password"
                  icon={FiLock}
                  type={visiblePasswords.setup ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(value) => updateField('newPassword', value)}
                  error={validationErrors.newPassword}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                  autoComplete="new-password"
                  rightAction={
                    <PasswordVisibilityButton
                      visible={visiblePasswords.setup}
                      onClick={() => setVisiblePasswords(prev => ({ ...prev, setup: !prev.setup }))}
                      label="new password"
                    />
                  }
                />

                <div>
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {[0, 1, 2, 3, 4].map(index => (
                      <div key={index} className={`h-1.5 rounded-full ${index < strength ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Use 8+ characters with uppercase, lowercase, a number, and a symbol.</p>
                </div>

                <InputField
                  label="Confirm Password"
                  icon={FiLock}
                  type={visiblePasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(value) => updateField('confirmPassword', value)}
                  error={validationErrors.confirmPassword}
                  placeholder="Repeat password"
                  disabled={isLoading}
                  autoComplete="new-password"
                  rightAction={
                    <PasswordVisibilityButton
                      visible={visiblePasswords.confirm}
                      onClick={() => setVisiblePasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      label="confirm password"
                    />
                  }
                />

                <SubmitButton loading={isLoading} label="Create Password" loadingLabel="Creating..." icon={FiShield} />
              </form>
            ) : mode === 'firstAccess' ? (
              <form onSubmit={handleFirstAccess} className="space-y-5" autoComplete="off">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Verify Student Record</h2>
                  <p className="text-sm text-slate-600 mt-1">Use your uploaded student record details for first-time access.</p>
                </div>

                <InputField
                  label="Registered Name"
                  icon={FiUser}
                  value={formData.fullName}
                  onChange={(value) => updateField('fullName', value)}
                  error={validationErrors.fullName}
                  placeholder="Name as it appears in school records"
                  disabled={isLoading}
                  autoComplete="off"
                />

                <InputField
                  label="Admission Number"
                  icon={FiBook}
                  value={formData.admissionNumber}
                  onChange={(value) => updateField('admissionNumber', value.toUpperCase())}
                  error={validationErrors.admissionNumber}
                  placeholder="e.g. 2903"
                  disabled={isLoading}
                />

                <SubmitButton loading={isLoading} label="Verify and Continue" loadingLabel="Verifying..." icon={FiCheckCircle} />
              </form>
            ) : mode === 'forgotPassword' || mode === 'changePassword' ? (
              <form onSubmit={handlePasswordResetRequest} className="space-y-5" autoComplete="off">
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    {mode === 'changePassword' ? 'Request Password Change' : 'Forgot Password'}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {mode === 'changePassword'
                      ? 'Confirm your current password so the school office can help safely.'
                      : 'Send a secure password help request to the school office.'}
                  </p>
                </div>

                <InputField
                  label="Admission Number"
                  icon={FiUser}
                  value={formData.admissionNumber}
                  onChange={(value) => updateField('admissionNumber', value.toUpperCase())}
                  error={validationErrors.admissionNumber}
                  placeholder="Admission number"
                  disabled={isLoading}
                />

                {mode === 'changePassword' && (
                  <InputField
                    label="Current Password"
                    icon={FiLock}
                    type={visiblePasswords.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(value) => updateField('currentPassword', value)}
                    error={validationErrors.currentPassword}
                    placeholder="Enter your current portal password"
                    disabled={isLoading}
                    autoComplete="current-password"
                    rightAction={
                      <PasswordVisibilityButton
                        visible={visiblePasswords.current}
                        onClick={() => setVisiblePasswords(prev => ({ ...prev, current: !prev.current }))}
                        label="current password"
                      />
                    }
                  />
                )}

                <InputField
                  label="Optional Note"
                  icon={FiAlertCircle}
                  value={formData.resetMessage}
                  onChange={(value) => updateField('resetMessage', value)}
                  error={validationErrors.resetMessage}
                  placeholder="Optional note for the school office"
                  disabled={isLoading}
                />

                <SubmitButton
                  loading={isLoading}
                  label={mode === 'changePassword' ? 'Send Change Request' : 'Send Reset Request'}
                  loadingLabel="Sending..."
                  icon={FiSend}
                />

                <button
                  type="button"
                  onClick={() => switchMode('password')}
                  className="w-full text-sm font-bold text-slate-700 hover:text-slate-950"
                >
                  Back to password login.
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordLogin} className="space-y-5" autoComplete="off">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Sign In Securely</h2>
                  <p className="text-sm text-slate-600 mt-1">Use your admission number and your portal password.</p>
                </div>

                <InputField
                  label="Admission Number"
                  icon={FiUser}
                  value={formData.identifier}
                  onChange={(value) => updateField('identifier', value.toUpperCase())}
                  error={validationErrors.identifier}
                  placeholder="Admission number"
                  disabled={isLoading}
                />

                <InputField
                  label="Password"
                  icon={FiLock}
                  type={visiblePasswords.login ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(value) => updateField('password', value)}
                  error={validationErrors.password}
                  placeholder="Your portal password"
                  disabled={isLoading}
                  autoComplete="current-password"
                  rightAction={
                    <PasswordVisibilityButton
                      visible={visiblePasswords.login}
                      onClick={() => setVisiblePasswords(prev => ({ ...prev, login: !prev.login }))}
                      label="password"
                    />
                  }
                />

                <SubmitButton loading={isLoading} label="Login to Portal" loadingLabel="Signing in..." icon={FiLogIn} />

                <div className="grid gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode('firstAccess')}
                    className="w-full text-sm font-bold text-slate-700 hover:text-slate-950"
                  >
                    First time here? Verify your record and create a password.
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('forgotPassword')}
                    className="w-full text-sm font-bold text-blue-700 hover:text-blue-900"
                  >
                    Forgot password? Send reset request.
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('changePassword')}
                    className="w-full text-sm font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    Change password? Verify current password first.
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-3 gap-3">
              {[
                [FiBook, 'Resources'],
                [FiShield, 'Secure'],
                [FiAward, 'Results']
              ].map(([Icon, label]) => (
                <div key={label} className="text-center rounded-2xl bg-slate-50 p-3">
                  <Icon className="text-slate-800 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-slate-700">{label}</p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}

function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  disabled,
  autoComplete = 'off',
  rightAction = null
}) {
  return (
    <div>
      <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-2">
        <Icon className="text-slate-600" />
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full rounded-2xl border-2 bg-white px-4 py-3.5 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${rightAction ? 'pr-12' : ''} ${error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300'}`}
        />
        {rightAction && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            {rightAction}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-bold text-red-600 flex items-center gap-1">
          <FiAlertCircle />
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordVisibilityButton({ visible, onClick, label }) {
  const Icon = visible ? FiEyeOff : FiEye;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
      aria-label={`${visible ? 'Hide' : 'Show'} ${label}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

function SubmitButton({ loading, label, loadingLabel, icon: Icon }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-black flex items-center justify-center gap-2 disabled:opacity-70 transition-all shadow-lg shadow-slate-900/20"
    >
      {loading ? (
        <>
          <CircularProgress size={18} thickness={4} sx={{ color: 'white' }} />
          {loadingLabel}
        </>
      ) : (
        <>
          <Icon />
          {label}
        </>
      )}
    </button>
  );
}
