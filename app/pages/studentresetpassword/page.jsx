"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  LoaderCircle,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const ResetPasswordContent = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasLetter, setHasLetter] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  useEffect(() => {
    setHasMinLength(newPassword.length >= 8);
    setHasNumber(/[0-9]/.test(newPassword));
    setHasLetter(/[a-zA-Z]/.test(newPassword));
    setHasSpecialChar(/[^A-Za-z0-9]/.test(newPassword));
    setPasswordsMatch(newPassword === confirmPassword && newPassword !== "");
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    if (resetSuccess) {
      const timer = setTimeout(() => {
        router.push("/pages/StudentPortal");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [resetSuccess, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!token) {
      setError("Invalid reset token. Please request a new password reset link.");
      setLoading(false);
      return;
    }

    if (!hasMinLength || !hasNumber || !hasLetter || !hasSpecialChar || !passwordsMatch) {
      setError("Please meet all password requirements.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/studentresetpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-3xl p-8 border border-green-400/30">
            <motion.div variants={itemVariants} className="mb-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Password Reset Success!</h2>
              <p className="text-gray-300 mb-2">Your password has been successfully reset.</p>
              <p className="text-sm text-gray-400">Redirecting to login...</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center p-3 sm:p-4">
      <motion.div
        className="max-w-sm sm:max-w-md md:max-w-xl w-full mx-auto p-6 sm:p-8 md:p-10 backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute top-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <motion.div className="relative z-10 text-center mb-6 sm:mb-8" variants={itemVariants}>
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <KeyRound className="text-white text-2xl sm:text-3xl md:text-4xl mr-2 sm:mr-3" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">Reset Password</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-300">Create a strong new password for your student account</p>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6 bg-red-500/20 border border-red-400/50 rounded-lg p-3 sm:p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4 sm:space-y-6">
          <motion.div variants={itemVariants}>
            <label className="text-sm font-medium text-gray-300 block mb-2">New Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full h-12 sm:h-14 pl-10 sm:pl-12 pr-10 sm:pr-12 bg-white/20 text-white placeholder-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all duration-300 text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="text-sm font-medium text-gray-300 block mb-2">Confirm Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full h-12 sm:h-14 pl-10 sm:pl-12 pr-4 bg-white/20 text-white placeholder-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all duration-300 text-sm sm:text-base"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10">
            <p className="text-xs sm:text-sm font-semibold text-white mb-3">Password Requirements:</p>
            <div className="space-y-2">
              <div className={`flex items-center gap-2 text-xs sm:text-sm ${hasMinLength ? 'text-green-400' : 'text-gray-400'}`}>
                {hasMinLength ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2 text-xs sm:text-sm ${hasLetter ? 'text-green-400' : 'text-gray-400'}`}>
                {hasLetter ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>Contains letters (a-z, A-Z)</span>
              </div>
              <div className={`flex items-center gap-2 text-xs sm:text-sm ${hasNumber ? 'text-green-400' : 'text-gray-400'}`}>
                {hasNumber ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>Contains numbers (0-9)</span>
              </div>
              <div className={`flex items-center gap-2 text-xs sm:text-sm ${hasSpecialChar ? 'text-green-400' : 'text-gray-400'}`}>
                {hasSpecialChar ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>Contains special characters (!@#$%)</span>
              </div>
              <div className={`flex items-center gap-2 text-xs sm:text-sm ${passwordsMatch ? 'text-green-400' : 'text-gray-400'}`}>
                {passwordsMatch ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>Passwords match</span>
              </div>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading || !hasMinLength || !hasNumber || !hasLetter || !hasSpecialChar || !passwordsMatch}
            className={`w-full h-12 sm:h-14 rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
              loading || !hasMinLength || !hasNumber || !hasLetter || !hasSpecialChar || !passwordsMatch
                ? 'bg-blue-900 cursor-not-allowed'
                : 'bg-gradient-to-r from-slate-950 to-blue-600 hover:from-slate-950 hover:to-blue-700'
            }`}
            variants={itemVariants}
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin w-5 h-5 sm:w-6 sm:h-6" />
                <span>Resetting Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </motion.button>
        </form>

        <motion.div variants={itemVariants} className="mt-6 sm:mt-8 text-center text-sm text-gray-400">
          <p className="text-xs sm:text-sm">
            Back to{' '}
            <span
              onClick={() => window.location.href = '/pages/StudentPortal'}
              className="text-blue-900 font-medium hover:underline cursor-pointer transition-colors duration-200"
            >
              student login
            </span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center"><LoaderCircle className="animate-spin w-8 h-8 text-white" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
