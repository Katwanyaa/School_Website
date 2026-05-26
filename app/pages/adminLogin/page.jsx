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
  Clock
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

      {/* Password Reset Modal */}
      {showPasswordResetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[9999]">
          {/* Modal content - keeping as is */}
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-950/85 p-3 backdrop-blur-md sm:items-center sm:p-5">
          <div className="relative my-auto grid w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-2xl md:grid-cols-[0.9fr_1.1fr]">
            <button
              onClick={closeVerificationModal}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white shadow-lg backdrop-blur transition hover:bg-slate-900 active:scale-95"
              aria-label="Close verification"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative overflow-hidden bg-slate-950 p-6 text-white sm:p-8">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-blue-400 to-blue-900" />
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/10" />
              <div className="absolute bottom-6 right-6 h-20 w-20 rounded-full border border-blue-300/20" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-blue-100">
                  <Key className="h-3.5 w-3.5 text-amber-300" />
                  Token Gate
                </div>

                <h3 className="mt-6 max-w-xs text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                  {requiresPasswordAfterVerification ? 'Confirm final access' : 'Verify this admin device'}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
                  {requiresPasswordAfterVerification
                    ? 'Your code is accepted. Confirm your password to complete the protected admin session.'
                    : 'A one-time token was sent to the admin email so this browser can be trusted safely.'}
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verification reason</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white">
                    <AlertCircle className="h-4 w-4 text-amber-300" />
                    {verificationReason?.replace(/_/g, ' ') || 'SECURITY PROTOCOL'}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    'Encrypted token check',
                    'Device fingerprint review',
                    'Session audit logging',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-xs font-bold text-slate-200">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="max-h-[88vh] overflow-y-auto bg-white p-5 sm:p-8">
              <div className="mb-6 pr-10">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">
                  Katwanyaa Admin Access
                </p>
                <h4 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  {requiresPasswordAfterVerification ? 'Password required' : 'Enter verification token'}
                </h4>
              </div>

              {!requiresPasswordAfterVerification ? (
                <>
                  <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
                      Sent to
                    </p>
                    <p className="mt-1 break-all text-sm font-black text-slate-900">{verificationEmail}</p>
                  </div>

                  <div className="mb-6">
                    <div className="grid grid-cols-6 gap-2 sm:gap-3">
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
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 text-center text-xl font-black text-slate-950 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:h-14"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Token window
                      </span>
                      <span className="font-mono text-sm font-black text-slate-950">
                        {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                    Confirm portal password
                  </p>
                  <div className="relative group">
                    <input
                      type="password"
                      value={passwordAfterVerification}
                      onChange={(e) => setPasswordAfterVerification(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 pr-12 font-bold text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      autoFocus
                    />
                    <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-700" />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={requiresPasswordAfterVerification ? handlePasswordAfterVerification : handleVerifyCode}
                  disabled={verificationLoading || (!requiresPasswordAfterVerification && verificationCode.join('').length !== 6)}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-slate-200 transition-all hover:bg-blue-950 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
                >
                  {verificationLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span className="text-sm font-medium capitalize">Verifying...</span>
                    </div>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-amber-300" />
                      <span>{requiresPasswordAfterVerification ? 'Grant Access' : 'Verify Token'}</span>
                    </>
                  )}
                </button>

                {!requiresPasswordAfterVerification && (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading || countdown > 0}
                    className="w-full rounded-2xl border border-slate-200 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-40"
                  >
                    Didn't receive it? <span className="text-blue-700">Request new token</span>
                  </button>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <p className="text-[11px] font-bold leading-5 text-amber-900">
                    Admin verification is monitored by Katwanyaa ICT. Do not approve a token request you did not start.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-950/85 p-3 backdrop-blur-md sm:items-center sm:p-5">
          <div className="relative my-auto grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl lg:grid-cols-[320px_1fr]">
            <button
              onClick={closeTermsModal}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:bg-slate-100 active:scale-95"
              aria-label="Close terms"
            >
              <X className="h-5 w-5" />
            </button>

            <aside className="relative overflow-hidden bg-slate-950 p-6 text-white sm:p-8">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-blue-400 to-emerald-300" />
              <div className="absolute -bottom-16 -right-16 h-44 w-44 rounded-full border border-white/10" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.24em] text-blue-200">
                  Admin Portal Policy
                </p>
                <h3 className="mt-3 text-3xl font-black leading-tight tracking-tight">
                  Terms for secure school access
                </h3>
                <p className="mt-4 text-sm font-medium leading-6 text-slate-300">
                  These conditions protect Katwanyaa Senior School records, staff tools, student data, and official communication channels.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    'Authorized users only',
                    'Activity is monitored',
                    'Data must remain confidential',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs font-bold text-slate-100">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="flex max-h-[90vh] flex-col bg-slate-50">
              <div className="border-b border-slate-200 bg-white p-5 pr-16 sm:p-7 sm:pr-16">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">
                  Terms & Conditions
                </p>
                <h4 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Before you continue
                </h4>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                  Read and accept these conditions before signing in. The login flow and device verification remain protected by the existing API controls.
                </p>
              </div>

              <div className="overflow-y-auto p-5 sm:p-7">
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <div>
                      <h5 className="text-sm font-black uppercase tracking-[0.18em] text-red-900">
                        Legal Notice
                      </h5>
                      <p className="mt-2 text-sm font-bold leading-6 text-red-800">
                        Unauthorized access is prohibited. Login attempts, device details, and system activity may be logged, reviewed, and used for disciplinary or legal action where necessary.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: 'Authorized Use',
                      icon: Database,
                      body: 'This portal is reserved for approved Katwanyaa Senior School personnel. Credentials are personal and must not be shared, transferred, or used on behalf of another person.',
                    },
                    {
                      title: 'Data Protection',
                      icon: Shield,
                      body: 'Student, staff, parent, and institutional records must be handled confidentially. Users must not copy, expose, or misuse information accessed through the system.',
                    },
                    {
                      title: 'Monitoring & Logs',
                      icon: Clock,
                      body: 'The system may record sign-ins, device verification, record changes, uploads, and administrative actions for audit and accountability.',
                    },
                    {
                      title: 'Device Responsibility',
                      icon: Cpu,
                      body: 'Use a trusted device and secure network. Report suspected compromise, unusual behavior, or unauthorized account activity to the ICT team immediately.',
                    },
                    {
                      title: 'Institutional Compliance',
                      icon: Building,
                      body: 'Access confirms that you will follow school ICT policy, data protection expectations, and applicable Kenyan laws governing electronic systems.',
                    },
                    {
                      title: 'Session Care',
                      icon: Key,
                      body: 'Sign out after administrative work, protect verification tokens, and never approve a token prompt that you did not personally request.',
                    },
                  ].map((section) => {
                    const SectionIcon = section.icon;
                    return (
                      <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <SectionIcon className="h-5 w-5" />
                          </span>
                          <h5 className="text-sm font-black uppercase tracking-[0.16em] text-slate-900">
                            {section.title}
                          </h5>
                        </div>
                        <p className="text-sm font-medium leading-6 text-slate-600">{section.body}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-center text-xs font-black uppercase tracking-[0.14em] text-amber-900">
                    Protected system: suspicious access attempts can trigger immediate ICT review.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => {
                      setAgreedToTerms(true);
                      closeTermsModal();
                      toast.success('You have accepted the Terms & Conditions');
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition-all hover:bg-blue-950 active:scale-[0.98]"
                  >
                    <CheckCircle className="h-4 w-4" />
                    I Understand & Accept
                  </button>
                  <button
                    onClick={closeTermsModal}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Login Page Layout */}
      <main className="min-h-screen bg-slate-100 font-sans flex items-center justify-center">
        <div className="w-full h-screen grid md:grid-cols-2">
          
          {/* Left Panel - Branding */}
          <div className="relative hidden md:flex flex-col justify-between bg-slate-950 text-white px-16 py-20 lg:px-24 overflow-hidden border-r border-white/5">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-100"
              style={{ backgroundImage: "url('/katz.png')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-slate-950 to-black"></div>
            
            <div className="relative z-10 flex flex-col h-full w-full">
              <div className="mb-auto">
                <Link href="/" className="flex items-center gap-5 group transition-transform hover:translate-x-1">
                  <div className="relative p-1 bg-white/10 rounded-lg backdrop-blur-xl border border-white/20 shadow-2xl">
                    <Image
                      src="/katz.png"
                      alt="katwanyaa Logo"
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tighter leading-none uppercase">
                      katwanyaa <span className="text-blue-400">'</span>
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.4em] text-blue-300/60 uppercase mt-1">
                      Senior School
                    </span>
                  </div>
                </Link>
              </div>

              <div className="my-auto max-w-xl py-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-200">
                  <ShieldCheck size={14} />
                  Verified Administration
                </div>

                <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight lg:text-5xl">
                  Protected access for school operations.
                </h1>
                <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-slate-200 lg:text-base">
                  Sign in to manage Katwanyaa Senior School content, records, communication, uploads, and daily administration from a verified device.
                </p>

                <div className="mt-8 grid gap-3">
                  {[
                    {
                      title: 'Device-aware access',
                      text: 'Trusted-device checks help keep admin actions tied to approved sessions.',
                      icon: Smartphone,
                    },
                    {
                      title: 'Protected school records',
                      text: 'Operational data remains behind authenticated dashboard controls.',
                      icon: Database,
                    },
                    {
                      title: 'Admin activity trail',
                      text: 'Sensitive actions are designed for monitoring and accountability.',
                      icon: Network,
                    },
                  ].map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={item.title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                          <ItemIcon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-black text-white">{item.title}</p>
                          <p className="mt-1 text-xs font-medium leading-5 text-slate-300">{item.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-auto border-t border-white/10 pt-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['Token', 'Checked'],
                    ['Device', 'Verified'],
                    ['Session', 'Logged'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                      <p className="mt-1 text-xs font-black uppercase tracking-wide text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  <span>&copy; {new Date().getFullYear()} Katwanyaa Senior</span>
                  <span className="flex items-center gap-2">
                    <Server size={10} />
                    KATZ ICT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="min-h-screen bg-white p-6 sm:p-12 flex flex-col justify-start">
            <div className="w-full max-w-md ml-0 md:ml-[15%]">
              <div className="md:hidden text-center mb-8">
                <Image
                  src="/katz.png"
                  alt="katwanyaa Logo"
                  width={60}
                  height={60}
                  className="rounded-full mx-auto mb-4 shadow-sm"
                />
              </div>

              <div className="mb-8 sm:mb-10 text-left">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
                  {isForgotMode ? "Recover Access" : "Welcome Back"}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
                  {isForgotMode 
                    ? "Enter your email address below and we'll send you a secure recovery link." 
                    : "Please enter your official credentials to access your dashboard."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <label className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-slate-700 mb-2 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="admin@katz.ac.ke"
                      className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-50 border text-slate-900 font-semibold border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm text-sm sm:text-base"
                    />
                  </div>
                </div>

                {!isForgotMode && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-slate-700">
                          Password
                        </label>
                        <button 
                          type="button"
                          onClick={() => router.push("/pages/forgotpassword")}
                          className="text-[10px] sm:text-xs md:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          placeholder="••••••••"
                          className="w-full pl-12 pr-12 py-3.5 sm:py-4 text-slate-900 font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm text-sm sm:text-base"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-start justify-between">
                        <label className="flex items-start gap-3 cursor-pointer group flex-1">
                          <input 
                            type="checkbox" 
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-0.5 h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition"
                          />
                          <span className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-900 transition-colors leading-tight">
                            I agree to the{' '}
                            <button 
                              type="button"
                              onClick={openTermsModal}
                              className="font-bold text-blue-600 hover:underline"
                            >
                              Terms & Conditions
                            </button>
                          </span>
                        </label>
                      </div>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={rememberDevice}
                          onChange={(e) => setRememberDevice(e.target.checked)}
                          className="mt-0.5 h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition"
                        />
                        <span className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-900 transition-colors leading-tight">
                          Keep me logged in on this device
                        </span>
                      </label>
                    </div>
                  </>
                )}

                <button 
                  type="submit"
                  disabled={isLoading || (!isForgotMode && !agreedToTerms)}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-lg shadow-blue-100 flex items-center justify-center gap-3 mt-4"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>{isForgotMode ? "Send Reset Link" : "Sign In to Portal"}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {isForgotMode && (
                  <button 
                    type="button"
                    onClick={() => setIsForgotMode(false)}
                    className="w-full text-center text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors pt-4"
                  >
                    &larr; Return to login
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
