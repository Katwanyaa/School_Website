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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-login-title"
    >
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <header className="relative bg-gradient-to-r from-blue-800 to-indigo-900 px-4 sm:px-6 md:px-8 py-4 md:py-5 text-white flex-shrink-0">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-xl sm:rounded-2xl p-1 shadow-md overflow-hidden flex-shrink-0">
                <Image
                  src="/katz.jpeg"
                  alt="Katwanyaa Senior School Logo"
                  width={56}
                  height={56}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h1 id="student-login-title" className="text-base sm:text-lg md:text-xl font-bold tracking-tight">
                  Katwanyaa Student Portal
                </h1>
                <p className="text-blue-100 text-[10px] sm:text-xs font-medium tracking-wide">
                  Secure student access
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors flex-shrink-0"
              aria-label="Close login modal"
            >
              <FiX className="text-xl" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Content Grid - Mobile Responsive */}
        <div className="flex flex-col md:grid md:grid-cols-[0.9fr_1.1fr] min-h-0 overflow-y-auto">
          {/* Left Sidebar - Info */}
          <aside className="bg-blue-50 border-b md:border-b-0 md:border-r border-blue-100 p-4 sm:p-5 md:p-6">
            <div className="rounded-xl bg-white border border-blue-100 p-4 sm:p-5 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 sm:mb-4">
                <FiShield className="text-lg sm:text-xl" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">How access works</h2>
              <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                {[
                  ['First time', 'Verify your admission number and registered name.'],
                  ['Create password', 'Set a strong password that stays saved after record refreshes.'],
                  ['Password help', 'Forgot and change requests are recorded for secure school follow-up.']
                ].map(([title, text]) => (
                  <div key={title} className="flex gap-3">
                    <div className="mt-0.5 w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FiCheckCircle className="text-xs sm:text-sm" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-800">{title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 sm:mt-4 rounded-xl border border-blue-100 bg-white p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-700 font-bold text-xs sm:text-sm">
                <FiClock className="text-blue-600" />
                Session duration
              </div>
              <p className="text-xs text-gray-500 mt-1">For safety, student sessions expire after 2 hours.</p>
            </div>
          </aside>

          {/* Right Side - Forms */}
          <section className="bg-white p-4 sm:p-5 md:p-6 overflow-y-auto">
            {/* Mode Tabs */}
            {!passwordSetupToken && (
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 mb-4 sm:mb-5">
                <button
                  type="button"
                  onClick={() => switchMode('password')}
                  className={`py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    mode === 'password' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('firstAccess')}
                  className={`py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    mode === 'firstAccess' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  First-Time Access
                </button>
              </div>
            )}

            {/* Error Message */}
            {localError && (
              <div className="mb-4 sm:mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4">
                <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg text-red-700">
                  <FiAlertCircle className="text-sm sm:text-base" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-900">{requiresContact ? 'Record needs attention' : 'Access issue'}</p>
                  <p className="text-xs sm:text-sm text-red-700 mt-1">{localError}</p>
                  {requiresContact && (
                    <div className="mt-2 space-y-1 text-xs text-red-700">
                      <p className="flex items-center gap-1">
                        <FiHelpCircle className="text-xs" /> Contact your class teacher or the school office.
                      </p>
                      <p className="font-bold">katzict@gmail.com • 0710 894 145</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            {localSuccess && (
              <div className="mb-4 sm:mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3 sm:p-4">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg text-green-700">
                  <FiCheckCircle className="text-sm sm:text-base" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-900">Request sent</p>
                  <p className="text-xs sm:text-sm text-green-700 mt-1">{localSuccess}</p>
                </div>
              </div>
            )}

            {/* Setup Password Form */}
            {mode === 'setup' && passwordSetupToken ? (
              <form onSubmit={handleSetupPassword} className="space-y-4 sm:space-y-5" autoComplete="off">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Create Your Password</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
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
                      <div key={index} className={`h-1.5 rounded-full ${index < strength ? 'bg-green-500' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Use 8+ characters with uppercase, lowercase, a number, and a symbol.</p>
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
              <form onSubmit={handleFirstAccess} className="space-y-4 sm:space-y-5" autoComplete="off">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Verify Student Record</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Use your uploaded student record details for first-time access.</p>
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
              <form onSubmit={handlePasswordResetRequest} className="space-y-4 sm:space-y-5" autoComplete="off">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    {mode === 'changePassword' ? 'Request Password Change' : 'Forgot Password'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
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
                  className="w-full text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Back to password login.
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordLogin} className="space-y-4 sm:space-y-5" autoComplete="off">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Sign In Securely</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Use your admission number and your portal password.</p>
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

                <div className="flex flex-col gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode('firstAccess')}
                    className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    First time here? Verify your record and create a password.
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('forgotPassword')}
                    className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Forgot password? Send reset request.
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('changePassword')}
                    className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Change password? Verify current password first.
                  </button>
                </div>
              </form>
            )}

            {/* Footer Features */}
            <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-100 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                [FiBook, 'Resources'],
                [FiShield, 'Secure'],
                [FiAward, 'Results']
              ].map(([Icon, label]) => (
                <div key={label} className="text-center rounded-xl bg-gray-50 border border-gray-100 p-2 sm:p-3">
                  <Icon className="text-blue-600 mx-auto mb-1 text-sm sm:text-base" />
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Input Field Component - Light Theme & Mobile Optimized
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
      <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-1.5 sm:mb-2">
        <Icon className="text-blue-500 text-xs sm:text-sm" />
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
          className={`w-full rounded-xl border bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-gray-800 placeholder-gray-400 transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
            rightAction ? 'pr-10 sm:pr-12' : ''
          } ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 hover:border-gray-300'}`}
        />
        {rightAction && (
          <div className="absolute inset-y-0 right-1 sm:right-2 flex items-center">
            {rightAction}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600 flex items-center gap-1">
          <FiAlertCircle className="text-xs" />
          {error}
        </p>
      )}
    </div>
  );
}

// Password Visibility Button - Light Theme
function PasswordVisibilityButton({ visible, onClick, label }) {
  const Icon = visible ? FiEyeOff : FiEye;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label={`${visible ? 'Hide' : 'Show'} ${label}`}
    >
      <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
    </button>
  );
}

// Submit Button - Light Theme & Mobile Optimized
function SubmitButton({ loading, label, loadingLabel, icon: Icon }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-2.5 sm:py-3 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-70 transition-all shadow-sm"
    >
      {loading ? (
        <>
          <CircularProgress size={16} sm={{ size: 18 }} thickness={4} sx={{ color: 'white' }} />
          <span className="text-xs sm:text-sm">{loadingLabel}</span>
        </>
      ) : (
        <>
          <Icon className="text-sm sm:text-base" />
          <span className="text-xs sm:text-sm">{label}</span>
        </>
      )}
    </button>
  );
}