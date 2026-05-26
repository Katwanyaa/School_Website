"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldQuestion, LoaderCircle, User } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const StudentForgotPasswordPage = () => {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [gmailEnabled, setGmailEnabled] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading('Sending reset link to parent email...', {
      position: 'top-right',
    });

    try {
      const res = await fetch("/api/studentforgotpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionNumber }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.dismiss(loadingToast);
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-bold">✅ Reset Link Sent!</span>
            <span className="text-sm opacity-90">{data.message}</span>
          </div>,
          {
            duration: 5000,
            icon: '📧',
            position: 'top-right',
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
            },
          }
        );
        
        setAdmissionNumber("");
        setGmailEnabled(true);
      } else {
        toast.dismiss(loadingToast);
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">❌ Failed to Send</span>
            <span className="text-sm opacity-90">{data.message}</span>
          </div>,
          {
            duration: 5000,
            position: 'top-right',
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
            },
          }
        );
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-bold">❌ Network Error</span>
          <span className="text-sm opacity-90">Failed to send reset link. Please try again.</span>
        </div>,
        {
          duration: 5000,
          position: 'top-right',
          style: {
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
          },
        }
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGmailClick = () => {
    if (!admissionNumber) {
      toast.warning('Please enter your admission number first', {
        position: 'top-right',
        style: {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          border: 'none',
        },
      });
      return;
    }
    
    toast.info('Opening Gmail...', {
      position: 'top-right',
      duration: 2000,
      style: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white',
        border: 'none',
      },
    });
    
    window.location.href = `https://mail.google.com/mail/u/0/#inbox`;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white flex items-center justify-center p-3 sm:p-4">
      <Toaster 
        position="top-right"
        richColors
        expand={true}
        toastOptions={{
          style: {
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
            },
          },
          warning: {
            style: {
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
            },
          },
          info: {
            style: {
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
            },
          },
        }}
      />

      <motion.div
        className="max-w-sm sm:max-w-md md:max-w-xl w-full mx-auto p-6 sm:p-8 md:p-10 backdrop-blur-lg bg-white/10 rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden transform-gpu"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute top-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <motion.div className="relative z-10 text-center" variants={itemVariants}>
          <div className="flex flex-col sm:flex-row items-center justify-center mb-3 sm:mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <ShieldQuestion className="text-white text-2xl sm:text-3xl md:text-4xl mr-2 sm:mr-3" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                Reset Password
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-300 mb-2 sm:mb-3 px-2">
            Enter your admission number and we'll send a reset link to your parent's email address.
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 px-2">
            Your parent will receive the password reset link
          </p>
          <div className="flex justify-center flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <span className="bg-white/20 text-white px-2 sm:px-3 py-1 rounded-full">#StudentPortal</span>
            <span className="bg-white/20 text-white px-2 sm:px-3 py-1 rounded-full">#Security</span>
            <span className="bg-white/20 text-white px-2 sm:px-3 py-1 rounded-full">#ParentNotification</span>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4 sm:space-y-6">
          <motion.div variants={itemVariants}>
            <div className="relative">
              <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value.toUpperCase())}
                placeholder="Enter your admission number (e.g., ADM001)"
                className="w-full h-12 sm:h-14 pl-10 sm:pl-12 pr-4 bg-white/20 text-white placeholder-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-sm sm:text-base"
                required
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:flex-1 flex items-center justify-center gap-2 h-12 sm:h-14 rounded-xl text-white font-semibold transition-all duration-300 ${
                loading ? 'bg-blue-400 cursor-not-allowed' :
                'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
              } text-sm sm:text-base`}
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <button
              type="button"
              disabled={!gmailEnabled}
              onClick={handleGmailClick}
              className={`w-full sm:flex-1 flex items-center justify-center gap-2 h-12 sm:h-14 rounded-xl font-semibold transition-all duration-300 ${
                !gmailEnabled ? 'bg-gray-700 text-gray-500 cursor-not-allowed' :
                'bg-white/30 text-white hover:bg-white/40'
              } text-sm sm:text-base`}
            >
              <Mail size={18} />
              <span>{gmailEnabled ? 'Check Email' : 'Check Email'}</span>
            </button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 border border-white/20">
            <p className="text-xs sm:text-sm text-gray-300">
              <span className="font-semibold text-white block mb-1">📧 What happens next?</span>
              A password reset link will be sent to your parent's registered email address. Your parent should share this link with you to reset your password.
            </p>
          </div>

          <div className="text-center text-sm text-gray-400">
            <p className="text-xs sm:text-sm">
              Know your password?{' '}
              <span
                onClick={() => window.location.href = '/pages/StudentPortal'}
                className="text-blue-400 font-medium hover:underline cursor-pointer transition-colors duration-200"
              >
                Log in here
              </span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudentForgotPasswordPage;
