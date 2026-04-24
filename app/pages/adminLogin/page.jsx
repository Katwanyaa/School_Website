'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck,
  Key,
  Cpu,
  Database,
  Shield,
  Users,
  Building,
  Server,
  Network,
  Smartphone,
  CheckCircle,
  Globe,
  X,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Clock,
  Fingerprint,
  LogIn,
  Sparkles,
  GraduationCap,
  BookOpen,
  Trophy,
  Users2,
  Calendar,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';
import Image from "next/image";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Verification Modal States
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationReason, setVerificationReason] = useState('');
  const [requiresPasswordAfterVerification, setRequiresPasswordAfterVerification] = useState(false);
  const [passwordAfterVerification, setPasswordAfterVerification] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Password Reset Modal
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const router = useRouter();

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Device Fingerprint Generator
  class DeviceFingerprint {
    static generate() {
      const fingerprint = {
        userAgent: navigator.userAgent,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio
        },
        language: navigator.language || navigator.userLanguage,
        platform: navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        languages: navigator.languages
      };

      return {
        raw: fingerprint,
        hash: this.hashFingerprint(fingerprint)
      };
    }

    static hashFingerprint(fingerprint) {
      const str = JSON.stringify(fingerprint);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    }
  }

  class LocalStorageManager {
    static KEYS = {
        DEVICE_FINGERPRINT: 'device_fingerprint',
        DEVICE_TOKEN: 'device_token',
        LOGIN_COUNT: 'login_count',
        LAST_LOGIN: 'last_login',
        ADMIN_TOKEN: 'admin_token',
        ADMIN_USER: 'admin_user',
        DASHBOARD_ACCESS: 'last_dashboard_access'
    };

    static checkAdminTokenValidity() {
        try {
            const token = localStorage.getItem(this.KEYS.ADMIN_TOKEN);
            
            if (!token) {
                return { isValid: false, reason: 'no_token' };
            }
            
            const tokenData = this.parseJwt(token);
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (tokenData.exp && tokenData.exp <= currentTime) {
                console.log('🔑 Admin token expired');
                return { isValid: false, reason: 'expired' };
            }
            
            return { isValid: true, expiresAt: new Date(tokenData.exp * 10000) };
        } catch (error) {
            console.error('Error checking admin token:', error);
            return { isValid: false, reason: 'parse_error' };
        }
    }

    static base64UrlDecode(str) {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        
        const pad = str.length % 4;
        if (pad) {
            if (pad === 1) {
                throw new Error('Invalid base64 string');
            }
            str += '==='.slice(pad);
        }
        
        return atob(str);
    }

    static parseJwt(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }
            
            const payload = parts[1];
            const decoded = this.base64UrlDecode(payload);
            return JSON.parse(decoded);
        } catch (error) {
            console.error('JWT parsing error:', error);
            throw error;
        }
    }

    static checkVerificationRequirement(forceCheck = false) {
        try {
            console.log('🔍 Checking verification requirement:', { forceCheck });
            
            if (!forceCheck) {
                const deviceToken = localStorage.getItem(this.KEYS.DEVICE_TOKEN);
                const storedFingerprint = localStorage.getItem(this.KEYS.DEVICE_FINGERPRINT);
                const currentFingerprint = DeviceFingerprint.generate();
                
                if (deviceToken && storedFingerprint === currentFingerprint.hash) {
                    console.log('✅ Quick check passed - likely valid device');
                    return { 
                        requiresVerification: false,
                        deviceToken: deviceToken,
                        deviceHash: currentFingerprint.hash
                    };
                }
            }
            
            const deviceToken = localStorage.getItem(this.KEYS.DEVICE_TOKEN);
            const storedFingerprint = localStorage.getItem(this.KEYS.DEVICE_FINGERPRINT);
            const currentFingerprint = DeviceFingerprint.generate();
            
            console.log('📱 Full device data check:', {
                hasDeviceToken: !!deviceToken,
                hasStoredFingerprint: !!storedFingerprint,
                currentFingerprint: currentFingerprint.hash.substring(0, 10) + '...',
                storedFingerprint: storedFingerprint ? storedFingerprint.substring(0, 10) + '...' : 'none'
            });

            if (!deviceToken) {
                console.log('📱 No device token found - NEW DEVICE');
                return { 
                    requiresVerification: true, 
                    reason: 'new_device',
                    deviceToken: null,
                    deviceHash: currentFingerprint.hash
                };
            }

            try {
                let tokenData;
                
                if (deviceToken.includes('.')) {
                    tokenData = this.parseJwt(deviceToken);
                } else {
                    const decodedStr = this.base64UrlDecode(deviceToken);
                    tokenData = JSON.parse(decodedStr);
                }
                
                console.log('🔑 Token data parsed:', {
                    deviceHash: tokenData.deviceHash ? `${tokenData.deviceHash.substring(0, 10)}...` : 'missing',
                    loginCount: tokenData.loginCount || 0,
                    exp: tokenData.exp ? new Date(tokenData.exp * 1000).toLocaleString() : 'missing'
                });

                const currentTime = Math.floor(Date.now() / 1000);
                const tokenExpiry = tokenData.exp;
                
                if (!tokenExpiry) {
                    console.log('❌ Token missing expiry');
                    return { 
                        requiresVerification: true, 
                        reason: 'token_invalid',
                        deviceToken: deviceToken,
                        deviceHash: currentFingerprint.hash
                    };
                }

                if (tokenExpiry <= currentTime) {
                    console.log('⏰ Token expired');
                    return { 
                        requiresVerification: true, 
                        reason: 'token_expired',
                        deviceToken: deviceToken,
                        deviceHash: currentFingerprint.hash
                    };
                }

                const loginCount = tokenData.loginCount || 0;
                if (loginCount >= 15) {
                    console.log('🚫 Max login attempts reached:', loginCount);
                    return { 
                        requiresVerification: true, 
                        reason: 'max_logins_reached',
                        deviceToken: deviceToken,
                        loginCount: loginCount,
                        deviceHash: currentFingerprint.hash
                    };
                }

                if (storedFingerprint !== currentFingerprint.hash) {
                    console.log('⚠️ Device fingerprint mismatch');
                    return { 
                        requiresVerification: true, 
                        reason: 'device_mismatch',
                        deviceToken: deviceToken,
                        deviceHash: currentFingerprint.hash
                    };
                }

                if (tokenData.deviceHash && tokenData.deviceHash !== currentFingerprint.hash) {
                    console.log('🔐 Token device hash mismatch');
                    return { 
                        requiresVerification: true, 
                        reason: 'token_device_mismatch',
                        deviceToken: deviceToken,
                        deviceHash: currentFingerprint.hash
                    };
                }

                console.log('✅ Device token is VALID');
                return { 
                    requiresVerification: false, 
                    deviceToken: deviceToken, 
                    loginCount: loginCount,
                    deviceHash: currentFingerprint.hash 
                };

            } catch (tokenError) {
                console.error('❌ Token parsing error:', tokenError);
                return { 
                    requiresVerification: true, 
                    reason: 'invalid_token_format',
                    deviceToken: deviceToken,
                    deviceHash: currentFingerprint.hash
                };
            }

        } catch (error) {
            console.error('❌ LocalStorage check error:', error);
            return { 
                requiresVerification: true, 
                reason: 'storage_error',
                deviceToken: null,
                deviceHash: null
            };
        }
    }

    static storeDeviceData(deviceToken, deviceHash, loginCount) {
        try {
            console.log('💾 Storing device data:', {
                deviceTokenLength: deviceToken ? deviceToken.length : 0,
                deviceHash: deviceHash.substring(0, 10) + '...',
                loginCount: loginCount
            });
            
            localStorage.setItem(this.KEYS.DEVICE_TOKEN, deviceToken);
            localStorage.setItem(this.KEYS.DEVICE_FINGERPRINT, deviceHash);
            localStorage.setItem(this.KEYS.LAST_LOGIN, new Date().toISOString());
            localStorage.setItem(this.KEYS.LOGIN_COUNT, loginCount.toString());
            
            localStorage.removeItem('requires_verification');
            
            console.log('✅ Device data stored successfully');
            
            const storedToken = localStorage.getItem(this.KEYS.DEVICE_TOKEN);
            const storedHash = localStorage.getItem(this.KEYS.DEVICE_FINGERPRINT);
            console.log('🔍 Storage verification:', {
                tokenStored: !!storedToken,
                hashStored: !!storedHash,
                tokenMatches: storedToken === deviceToken
            });
            
        } catch (error) {
            console.error('❌ Error storing device data:', error);
        }
    }

    static storeAuthData(authToken, userData) {
        try {
            localStorage.setItem(this.KEYS.ADMIN_TOKEN, authToken);
            localStorage.setItem(this.KEYS.ADMIN_USER, JSON.stringify(userData));
            console.log('🔐 Auth data stored');
        } catch (error) {
            console.error('❌ Error storing auth data:', error);
        }
    }

    static storeDashboardAccess() {
        try {
            localStorage.setItem(this.KEYS.DASHBOARD_ACCESS, new Date().toISOString());
            console.log('📊 Dashboard access timestamp stored');
        } catch (error) {
            console.error('❌ Error storing dashboard access:', error);
        }
    }

    static getLastDashboardAccess() {
        try {
            const timestamp = localStorage.getItem(this.KEYS.DASHBOARD_ACCESS);
            return timestamp ? new Date(timestamp) : null;
        } catch (error) {
            console.error('❌ Error getting dashboard access:', error);
            return null;
        }
    }

    static getAuthData() {
        try {
            const token = localStorage.getItem(this.KEYS.ADMIN_TOKEN);
            const userStr = localStorage.getItem(this.KEYS.ADMIN_USER);
            const user = userStr ? JSON.parse(userStr) : null;
            
            return { token, user };
        } catch (error) {
            console.error('❌ Error getting auth data:', error);
            return { token: null, user: null };
        }
    }

    static getDeviceData() {
        try {
            const token = localStorage.getItem(this.KEYS.DEVICE_TOKEN);
            const fingerprint = localStorage.getItem(this.KEYS.DEVICE_FINGERPRINT);
            const loginCount = parseInt(localStorage.getItem(this.KEYS.LOGIN_COUNT) || '0', 10);
            const lastLogin = localStorage.getItem(this.KEYS.LAST_LOGIN);
            
            return { token, fingerprint, loginCount, lastLogin };
        } catch (error) {
            console.error('❌ Error getting device data:', error);
            return { token: null, fingerprint: null, loginCount: 0, lastLogin: null };
        }
    }

    static clearLoginData() {
        try {
            localStorage.removeItem(this.KEYS.DEVICE_TOKEN);
            localStorage.removeItem(this.KEYS.DEVICE_FINGERPRINT);
            localStorage.removeItem(this.KEYS.LOGIN_COUNT);
            localStorage.removeItem(this.KEYS.LAST_LOGIN);
            localStorage.removeItem('requires_verification');
            console.log('🧹 Cleared all device login data');
        } catch (error) {
            console.error('❌ Error clearing login data:', error);
        }
    }

    static clearAllAuthData() {
        try {
            this.clearLoginData();
            localStorage.removeItem(this.KEYS.ADMIN_TOKEN);
            localStorage.removeItem(this.KEYS.ADMIN_USER);
            localStorage.removeItem(this.KEYS.DASHBOARD_ACCESS);
            console.log('🧹 Cleared all authentication data');
        } catch (error) {
            console.error('❌ Error clearing auth data:', error);
        }
    }

    static isAuthenticated() {
        try {
            const token = localStorage.getItem(this.KEYS.ADMIN_TOKEN);
            const userStr = localStorage.getItem(this.KEYS.ADMIN_USER);
            
            if (!token || !userStr) {
                return false;
            }
            
            if (token.includes('.')) {
                try {
                    const tokenData = this.parseJwt(token);
                    const currentTime = Math.floor(Date.now() / 1000);
                    
                    if (tokenData.exp && tokenData.exp <= currentTime) {
                        console.log('🔑 Auth token expired');
                        return false;
                    }
                } catch (e) {
                    console.warn('Could not parse auth token for expiration check:', e);
                }
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error checking authentication:', error);
            return false;
        }
    }

    static getUser() {
        try {
            const userStr = localStorage.getItem(this.KEYS.ADMIN_USER);
            if (!userStr) {
                return null;
            }
            
            return JSON.parse(userStr);
        } catch (error) {
            console.error('❌ Error getting user:', error);
            return null;
        }
    }

    static getToken() {
        try {
            return localStorage.getItem(this.KEYS.ADMIN_TOKEN);
        } catch (error) {
            console.error('❌ Error getting token:', error);
            return null;
        }
    }

    static hasValidDeviceToken() {
        try {
            const deviceToken = localStorage.getItem(this.KEYS.DEVICE_TOKEN);
            if (!deviceToken) {
                return false;
            }
            
            const checkResult = this.checkVerificationRequirement();
            return !checkResult.requiresVerification;
        } catch (error) {
            console.error('❌ Error checking device token:', error);
            return false;
        }
    }

    static getLoginCount() {
        try {
            const count = localStorage.getItem(this.KEYS.LOGIN_COUNT);
            return count ? parseInt(count, 10) : 0;
        } catch (error) {
            console.error('❌ Error getting login count:', error);
            return 0;
        }
    }

    static incrementLoginCount() {
        try {
            const currentCount = this.getLoginCount();
            const newCount = currentCount + 1;
            localStorage.setItem(this.KEYS.LOGIN_COUNT, newCount.toString());
            
            const deviceToken = localStorage.getItem(this.KEYS.DEVICE_TOKEN);
            if (deviceToken) {
                try {
                    let tokenData;
                    if (deviceToken.includes('.')) {
                        tokenData = this.parseJwt(deviceToken);
                    } else {
                        const decodedStr = this.base64UrlDecode(deviceToken);
                        tokenData = JSON.parse(decodedStr);
                    }
                    
                    tokenData.loginCount = newCount;
                    
                    const updatedToken = btoa(JSON.stringify(tokenData));
                    localStorage.setItem(this.KEYS.DEVICE_TOKEN, updatedToken);
                    
                    console.log('📈 Login count incremented to:', newCount);
                } catch (tokenError) {
                    console.error('❌ Error updating token login count:', tokenError);
                }
            }
            
            return newCount;
        } catch (error) {
            console.error('❌ Error incrementing login count:', error);
            return 0;
        }
    }

    static setRequiresVerification(reason = 'security_check') {
        try {
            localStorage.setItem('requires_verification', 'true');
            localStorage.setItem('verification_reason', reason);
            console.log('⚠️ Verification required set:', reason);
        } catch (error) {
            console.error('❌ Error setting verification requirement:', error);
        }
    }

    static clearVerificationFlag() {
        try {
            localStorage.removeItem('requires_verification');
            localStorage.removeItem('verification_reason');
            console.log('✅ Verification flags cleared');
        } catch (error) {
            console.error('❌ Error clearing verification flags:', error);
        }
    }

    static shouldShowVerification() {
        try {
            const requiresVerification = localStorage.getItem('requires_verification');
            const reason = localStorage.getItem('verification_reason');
            
            return {
                requires: requiresVerification === 'true',
                reason: reason || 'unknown'
            };
        } catch (error) {
            console.error('❌ Error checking verification flag:', error);
            return { requires: false, reason: 'error' };
        }
    }

    static debugAllStorage() {
        try {
            console.log('📋 === LOCALSTORAGE DEBUG INFO ===');
            
            const deviceData = this.getDeviceData();
            console.log('📱 Device Data:', deviceData);
            
            const authData = this.getAuthData();
            console.log('🔐 Auth Data:', {
                hasToken: !!authData.token,
                tokenLength: authData.token ? authData.token.length : 0,
                user: authData.user ? {
                    id: authData.user.id,
                    name: authData.user.name,
                    email: authData.user.email,
                    role: authData.user.role
                } : null
            });
            
            console.log('🗂️ All localStorage items:');
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                console.log(`  ${key}: ${value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : 'null'}`);
            }
            
            console.log('📋 === END DEBUG INFO ===');
        } catch (error) {
            console.error('❌ Error debugging storage:', error);
        }
    }
  }

  // Terms Modal Functions
  const openTermsModal = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  // Handle verification code input
  const handleVerificationCodeChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value.replace(/\D/g, '');
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`verification-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    setVerificationCode(newCode);
  };

  // Handle backspace
  const handleVerificationKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`verification-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyCode = async (e) => {
    if (e) e.preventDefault();
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setVerificationLoading(true);

    try {
      const deviceFingerprint = DeviceFingerprint.generate();
      
      const pendingVerification = JSON.parse(localStorage.getItem('pending_verification_device') || '{}');
      
      const emailToUse = verificationEmail || formData.email;
      
      if (!emailToUse) {
        toast.error('Email not found. Please try logging in again.');
        setVerificationLoading(false);
        return;
      }
      
      console.log('🔐 Verifying OTP with reset info:', {
        email: emailToUse,
        deviceHash: deviceFingerprint.hash,
        pendingReason: pendingVerification.reason,
        shouldReset: pendingVerification.reason === 'max_logins_reached' || 
                    pendingVerification.reason === 'expired'
      });
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailToUse,
          verificationCode: code,
          action: 'verify',
          clientDeviceHash: deviceFingerprint.hash,
          shouldResetCounts: pendingVerification.reason === 'max_logins_reached' || 
                           pendingVerification.reason === 'expired'
        }),
      });

      const data = await response.json();
      console.log('📩 OTP verification response:', {
        success: data.success,
        countsWereReset: data.countsWereReset,
        loginCount: data.loginCount
      });

      if (response.ok && data.success) {
        localStorage.removeItem('pending_verification_device');
        
        if (data.countsWereReset) {
          console.log('🔄 Backend reset device counts. New count:', data.loginCount);
          
          LocalStorageManager.clearLoginData();
          
          if (data.deviceToken) {
            LocalStorageManager.storeDeviceData(
              data.deviceToken, 
              deviceFingerprint.hash, 
              data.loginCount || 1
            );
          }
          
          toast.success(`Login successful! Device verification counts have been reset.`);
        } else {
          if (data.deviceToken) {
            LocalStorageManager.storeDeviceData(
              data.deviceToken, 
              deviceFingerprint.hash, 
              data.loginCount || 1
            );
          }
          
          toast.success(`Login successful! Welcome back ${data.user?.name || ''}.`);
        }
        
        if (data.token) {
          LocalStorageManager.storeAuthData(data.token, data.user);
        }
        
        setShowVerificationModal(false);
        setVerificationCode(['', '', '', '', '', '']);
        setVerificationEmail('');
        setPasswordAfterVerification('');
        setRequiresPasswordAfterVerification(false);
        
        if (data.countsWereReset) {
          toast.info('Device verification counts have been reset. You now have 15 fresh logins available.');
        }
        
        setTimeout(() => {
          router.push('/MainDashboard');
        }, 1000);
      } else {
        if (data.requiresPassword === true) {
          setRequiresPasswordAfterVerification(true);
          setVerificationEmail(emailToUse);
          toast.info('Please enter your password to complete login.');
        } else {
          toast.error(data.error || 'Invalid verification code');
          setVerificationCode(['', '', '', '', '', '']);
          if (document.getElementById('verification-input-0')) {
            document.getElementById('verification-input-0').focus();
          }
        }
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      console.error('❌ Verification error:', error);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);

    try {
      const deviceFingerprint = DeviceFingerprint.generate();
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verificationEmail,
          action: 'resend',
          clientDeviceHash: deviceFingerprint.hash,
          clientDeviceToken: localStorage.getItem('device_token')
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('New verification code sent! Check your email.');
        setCountdown(60);
        setVerificationCode(['', '', '', '', '', '']);
        if (document.getElementById('verification-input-0')) {
          document.getElementById('verification-input-0').focus();
        }
      } else {
        toast.error(data.error || 'Failed to resend code');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Handle main login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚀 Login form submitted');
    console.log('📧 Email:', formData.email);
    
    if (!isForgotMode) {
      if (!agreedToTerms) {
        toast.error("Verification Required: Please accept the Terms of Access before proceeding.");
        return;
      }

      if (!formData.email || !formData.password) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else {
      if (!formData.email) {
        toast.error("Please enter your email address");
        return;
      }
      
      const loadingToast = toast.loading("Sending recovery instructions...");
      setTimeout(() => {
        toast.dismiss(loadingToast);
        toast.success("Recovery email sent! Check your inbox.");
        setIsForgotMode(false);
      }, 2000);
      return;
    }

    setIsLoading(true);
    
    const loadingToast = toast.loading('Checking please wait...');

    try {
      const localStorageCheck = LocalStorageManager.checkVerificationRequirement(true);
      const deviceFingerprint = DeviceFingerprint.generate();
      
      console.log('📊 Device verification check result:', {
        requiresVerification: localStorageCheck.requiresVerification,
        reason: localStorageCheck.reason,
        loginCount: localStorageCheck.loginCount,
        hasDeviceToken: !!localStorageCheck.deviceToken
      });
      
      if (!localStorageCheck.requiresVerification && localStorageCheck.deviceToken) {
        console.log('✅ Device is trusted - attempting direct login');
        
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            clientDeviceToken: localStorageCheck.deviceToken,
            clientLoginCount: localStorageCheck.loginCount || 0,
            clientDeviceHash: deviceFingerprint.hash,
            action: 'login',
            skipDeviceCheck: true
          }),
        });

        const data = await response.json();
        
        console.log('📩 Direct login response:', {
          success: data.success,
          hasToken: !!data.token,
          deviceTrusted: data.deviceTrusted
        });

        toast.dismiss(loadingToast);

        if (response.ok && data.success) {
          const newLoginCount = LocalStorageManager.incrementLoginCount();
          
          if (data.token) {
            LocalStorageManager.storeAuthData(data.token, data.user);
          }
          
          if (data.deviceToken) {
            LocalStorageManager.storeDeviceData(data.deviceToken, deviceFingerprint.hash, newLoginCount);
          }
          
          toast.success(`Welcome back, ${data.user?.name || 'Admin'}! 🎉`);
          
          console.log('✅ Direct login successful. Login count:', newLoginCount);

          setTimeout(() => {
            router.push('/MainDashboard');
          }, 1500);
          
          return;
        } else {
          console.log('⚠️ Direct login failed, falling back to normal flow');
          toast.dismiss(loadingToast);
        }
      }
      
      console.log('🔐 Device verification required, reason:', localStorageCheck.reason);
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          clientDeviceToken: localStorageCheck.deviceToken,
          clientLoginCount: localStorageCheck.loginCount || 0,
          clientDeviceHash: deviceFingerprint.hash,
          action: 'login'
        }),
      });

      const data = await response.json();
      
      console.log('📩 Login response:', {
        success: data.success,
        requiresVerification: data.requiresVerification,
        reason: data.reason,
        shouldResetAfterVerification: data.shouldResetAfterVerification
      });

      toast.dismiss(loadingToast);

      if (response.ok && data.requiresVerification === true) {
        console.log('🔐 Verification required, reason:', data.reason);
        
        setVerificationReason(data.reason || 'security_check');
        setVerificationEmail(data.email || formData.email);
        setShowVerificationModal(true);
        setCountdown(60);
       
        const resetHint = data.shouldResetAfterVerification 
          ? "After verification, your device login counts will be reset to give you 15 fresh logins."
          : "";
        
        if (data.shouldResetAfterVerification) {
          toast.info(`Device verification required. ${resetHint}`);
        } else {
          toast.info('Device verification required. Check your email.');
        }
        
        setRequiresPasswordAfterVerification(false);
        setPasswordAfterVerification('');
        
      } else if (data.success) {
        console.log('✅ Login successful - No OTP needed');
        
        if (data.token) {
          LocalStorageManager.storeAuthData(data.token, data.user);
        }

        if (data.deviceToken) {
          LocalStorageManager.storeDeviceData(data.deviceToken, deviceFingerprint.hash, data.loginCount || 1);
        }

        toast.success(`Welcome back, ${data.user.name || 'Admin'}! 🎉`);

        setTimeout(() => {
          router.push('/MainDashboard');
        }, 1500);
        
      } else {
        console.log('❌ Login failed:', data.error);
        toast.error(data.error || 'Login failed. Please try again.');
      }
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Network error. Please check your connection.');
      console.error('❌ Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Close verification modal
  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setVerificationCode(['', '', '', '', '', '']);
    setVerificationLoading(false);
    setRequiresPasswordAfterVerification(false);
    setPasswordAfterVerification('');
  };

  // Handle password submit after verification
  const handlePasswordAfterVerification = async () => {
    if (!passwordAfterVerification) {
      toast.error('Please enter your password');
      return;
    }
    
    setVerificationLoading(true);
    
    try {
      const deviceFingerprint = DeviceFingerprint.generate();
      const localStorageCheck = LocalStorageManager.checkVerificationRequirement();
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verificationEmail,
          password: passwordAfterVerification,
          verificationCode: verificationCode.join(''),
          action: 'verify_password',
          clientDeviceToken: localStorageCheck.deviceToken,
          clientLoginCount: localStorageCheck.loginCount,
          clientDeviceHash: deviceFingerprint.hash
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        if (data.countsWereReset) {
          console.log('🔄 Backend reset device counts. New count:', data.loginCount);
          
          LocalStorageManager.clearLoginData();
          
          if (data.deviceToken) {
            LocalStorageManager.storeDeviceData(
              data.deviceToken, 
              deviceFingerprint.hash, 
              data.loginCount || 1
            );
          }
          
          toast.success('Login successful! Device verification counts have been reset.');
        } else {
          if (data.deviceToken) {
            LocalStorageManager.storeDeviceData(data.deviceToken, deviceFingerprint.hash, data.loginCount || 1);
          }
          
          toast.success('Login successful!');
        }
        
        if (data.token) {
          LocalStorageManager.storeAuthData(data.token, data.user);
        }
        
        setShowVerificationModal(false);
        setVerificationCode(['', '', '', '', '', '']);
        setVerificationEmail('');
        setPasswordAfterVerification('');
        setRequiresPasswordAfterVerification(false);
        
        if (data.countsWereReset) {
          toast.info('Device verification counts have been reset. You now have 15 fresh logins available.');
        }
        
        setTimeout(() => {
          router.push('/MainDashboard');
        }, 1000);
      } else {
        toast.error(data.error || 'Invalid credentials');
        setPasswordAfterVerification('');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      console.error('❌ Password verification error:', error);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <Toaster
        position={isMobile ? "top-center" : "top-right"}
        expand={false}
        richColors
        closeButton
      />

      {/* Verification Modal - Redesigned */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-4 z-[9999] animate-in fade-in duration-300 overflow-y-auto">
          <div className="relative w-full max-w-md my-auto bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in duration-300">
            {/* Modal Header - Katwaanyaa Branding */}
            <div className="relative bg-gradient-to-r from-emerald-700 to-teal-700 p-5 text-white">
              <button
                onClick={closeVerificationModal}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-lg transition-colors active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <ShieldCheck className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Verify Access</h3>
                  <p className="text-emerald-200 text-xs font-medium">Secure Authentication Required</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {!requiresPasswordAfterVerification ? (
                <>
                  <div className="text-center mb-5">
                    <p className="text-gray-600 text-sm mb-2">Verification code sent to</p>
                    <p className="font-mono font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg text-sm break-all">{verificationEmail}</p>
                  </div>
                  
                  <div className="mb-5">
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {verificationCode.map((digit, index) => (
                        <input
                          key={index}
                          id={`verification-input-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                          className="w-full aspect-square text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-800"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Code expires in <span className="font-mono font-bold text-emerald-700">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span></span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-5">
                  <p className="text-gray-700 text-sm font-medium mb-3">Enter your password to continue</p>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="password"
                      value={passwordAfterVerification}
                      onChange={(e) => setPasswordAfterVerification(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-800"
                      autoFocus
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={requiresPasswordAfterVerification ? handlePasswordAfterVerification : handleVerifyCode}
                  disabled={verificationLoading || (!requiresPasswordAfterVerification && verificationCode.join('').length !== 6)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {verificationLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{requiresPasswordAfterVerification ? 'Complete Login' : 'Verify Code'}</span>
                    </>
                  )}
                </button>

                {!requiresPasswordAfterVerification && (
                  <button
                    onClick={handleResendCode}
                    disabled={resendLoading || countdown > 0}
                    className="w-full py-2 text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend verification code'}
                  </button>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 justify-center">
                  <Shield className="w-3 h-3" />
                  <span>Secured by Katwaanyaa ICT | Encrypted Session</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-4 z-[9999] animate-in fade-in duration-300 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-auto bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in duration-300">
            
            <div className="relative bg-gradient-to-r from-emerald-700 to-teal-700 p-5 text-white">
              <button
                onClick={closeTermsModal}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Terms & Conditions</h3>
                  <p className="text-emerald-200 text-xs font-medium">Authorized Access Only</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-5 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800 font-medium">
                    Unauthorized access is prohibited under the Computer Misuse and Cybercrimes Act. All access attempts are logged.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    1. Authorized Use
                  </h4>
                  <p className="text-xs text-gray-600">This portal is exclusively for Katwaanyaa Senior School authorized personnel. Credentials are non-transferable.</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    2. Data Protection
                  </h4>
                  <p className="text-xs text-gray-600">All data accessed is protected under the Data Protection Act. Maintain confidentiality at all times.</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    3. Monitoring
                  </h4>
                  <p className="text-xs text-gray-600">All activities are logged and monitored. Unauthorized access attempts trigger immediate alerts.</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setAgreedToTerms(true);
                    closeTermsModal();
                    toast.success('Terms accepted');
                  }}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-all"
                >
                  I Accept
                </button>
                <button
                  onClick={closeTermsModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-300 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Login Page Layout - Redesigned */}
      <main className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-white">
        <div className="w-full min-h-screen grid lg:grid-cols-2">
          
          {/* Left Panel - Branding with Katwaanyaa Theme */}
          <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 xl:p-12 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col">
              {/* Logo Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                  <Image
                    src="/hero/katz.png"
                    alt="Katwaanyaa Logo"
                    width={70}
                    height={70}
                    className="rounded-2xl relative z-10 shadow-2xl"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight uppercase leading-tight">
                    Katwaanyaa <span className="text-emerald-300">'</span>
                  </h1>
                  <p className="text-[10px] font-bold tracking-[0.3em] text-emerald-300/80 uppercase">
                    Senior School
                  </p>
                </div>
              </div>

              {/* Hero Content */}
              <div className="flex-1 flex flex-col justify-center max-w-md mx-auto text-center py-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mx-auto mb-6">
                  <ShieldCheck size={14} />
                  Authorized Personnel Only
                </div>
                
                <h2 className="text-4xl font-black tracking-tight mb-4">
                  Welcome to{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
                    Katwaanyaa
                  </span>
                </h2>
                
                <p className="text-emerald-100/80 text-sm leading-relaxed">
                  Your gateway to the administrative management system. Access institutional data, oversee operations, and drive excellence at Katwaanyaa Senior School.
                </p>

                {/* Stats Decor */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-emerald-700/30">
                  <div>
                    <div className="text-2xl font-black text-emerald-300">500+</div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-300/60">Students</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-300">45+</div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-300/60">Staff</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-300">15+</div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-300/60">Years</div>
                  </div>
                </div>
              </div>

              {/* Footer Motto */}
              <div className="border-t border-emerald-700/30 pt-6">
                <p className="text-xs text-emerald-300/60 tracking-wide">
                  <span className="font-bold">Motto:</span> "Striving for Academic and Moral Excellence"
                </p>
                <p className="text-[10px] text-emerald-400/40 mt-2">
                  © {new Date().getFullYear()} Katwaanyaa Senior School | Secure Portal v2.0
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="min-h-screen flex items-center justify-center p-6 sm:p-8 lg:p-12">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <Image
                  src="/hero/katz.png"
                  alt="Katwaanyaa Logo"
                  width={60}
                  height={60}
                  className="rounded-xl mx-auto mb-3 shadow-lg"
                />
                <h2 className="text-2xl font-black text-gray-800">Katwaanyaa Senior</h2>
                <p className="text-xs text-gray-500 mt-1">Administrative Portal</p>
              </div>

              {/* Form Header */}
              <div className="mb-8 text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">
                  {isForgotMode ? "Recover Access" : "Secure Login"}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {isForgotMode 
                    ? "Enter your registered email to receive recovery instructions" 
                    : "Enter your credentials to access the dashboard"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-emerald-600 transition-colors" />
                    <input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="admin@katwaanyaa.ac.ke"
                      className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                {!isForgotMode && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                        Password
                      </label>
                      <button 
                        type="button"
                        onClick={() => router.push("/pages/forgotpassword")}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-emerald-600 transition-colors" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-gray-800"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Checkboxes */}
                {!isForgotMode && (
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        I agree to the{' '}
                        <button 
                          type="button"
                          onClick={openTermsModal}
                          className="font-bold text-emerald-600 hover:underline"
                        >
                          Terms & Conditions
                        </button>
                      </span>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        Keep me logged in on this device
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={isLoading || (!isForgotMode && !agreedToTerms)}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-base hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{isForgotMode ? "Send Recovery Link" : "Sign In to Portal"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Forgot Mode Toggle */}
                {isForgotMode && (
                  <button 
                    type="button"
                    onClick={() => setIsForgotMode(false)}
                    className="w-full text-center text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors pt-3"
                  >
                    ← Back to Login
                  </button>
                )}
              </form>

              {/* Security Notice */}
              <div className="mt-8 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2 justify-center">
                  <Fingerprint className="w-3 h-3 text-emerald-600" />
                  <p className="text-[9px] text-emerald-700 font-medium uppercase tracking-wider">
                    Secure Session • 256-bit Encryption • Activity Logged
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation-duration: 0.2s;
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .zoom-in {
          animation-name: zoom-in;
        }
      `}</style>
    </>
  );
}