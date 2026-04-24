'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';


// React Icons from fa6 (only the ones you're actually using)
import { 
  FaX,
  FaSchool,
  FaUser,
  FaTrash,
  FaDownload,
  FaUsers,
  FaChartBar,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaEdit,
  FaCalendar,
  FaShieldAlt,
  FaEnvelope,
  FaPhone,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaInfo,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaUserGraduate,
  FaBuilding,
  FaAward,
  FaCrown,
  FaChartLine,
  FaChartPie,
  FaPaperclip,
  FaQuoteLeft,
  FaQuoteRight,
  FaExclamationTriangle,
  FaLogOut
} from 'react-icons/fa6';

import {FiClock } from 'react-icons/fi';

// Import Lucide React icons for the rest
import {
  Search,
  School,
  Users,
  User,
  Trash2,
  Download,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Calendar,
  Shield,
  Mail,
  Phone,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  Eye,
  EyeOff,
  Check,
  X,
  GraduationCap,
  Building2,
  Award,
  Crown,
  TrendingUp,
  PieChart,
  Paperclip,
  Quote,
  AlertTriangle,
  LogOut,
  // Add other Lucide icons as needed
  Book,
  Video,
  MapPin,
  Globe,
  Clock,
  Upload,
  Settings,
  Save,
  ExternalLink,
  Rocket,
  Hash,
  Palette,
  Zap,
  Gem,
  Flame,
  FileText,
  LayoutGrid,
  List,
  CalendarDays,
  FileDown,
  FileUp,
  Percent,
  ClipboardList,
  UserCheck,
  DollarSign,
  Receipt,
  Calculator,
  AreaChart,
  Share2,
  ListChecks,
  StarHalf,
  Lightbulb,
  Newspaper,
  StickyNote,
  Sun,
  Moon,
  Youtube,
  FileVideo,
  FileCode,
  FileAudio,
  File,
  Tags,
  Cog,
  University,
  Briefcase,
  PlayCircle
} from 'lucide-react';
import {IoSparkles} from 'react-icons/io5';
import { CircularProgress, Box, Typography, Stack } from '@mui/material';

export default function AdminManager() {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  // Add this after your existing states
const [currentUserRole, setCurrentUserRole] = useState(null);

  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [selectedAdmins, setSelectedAdmins] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  // Add these states
const [showViewModal, setShowViewModal] = useState(false);
const [viewingAdmin, setViewingAdmin] = useState(null);
  const itemsPerPage = 8;

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '+254',
    role: 'SUPER_ADMIN', // Default to SUPER_ADMIN
    permissions: {
      manageUsers: false,
      manageContent: true,
      manageSettings: false,
      viewReports: true
    },
    status: 'active'
  });




// Handle view admin details
const handleViewAdmin = (admin) => {
  setViewingAdmin(admin);
  setShowViewModal(true);
};  
  // Check authentication on component mount - CORRECTED
  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('🔍 AdminManager: Checking authentication...');
        
        // Use the correct keys from localStorage
        const token = localStorage.getItem('admin_token');
        const user = localStorage.getItem('admin_user');
        
        console.log('Token found:', !!token);
        console.log('User found:', !!user);
        
        if (token && user) {
          const userData = JSON.parse(user);
          console.log('User data:', userData);


           setCurrentUserRole(userData.role || userData.userRole);
 
          
          // Verify token expiration
          try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            if (tokenPayload.exp < currentTime) {
              console.log('❌ Token expired');
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_user');
              setStatus('unauthenticated');
              toast.error('Session expired. Please login again.');
              router.push('/pages/adminLogin');
              return;
            }
            
            console.log('✅ Token valid, expires:', new Date(tokenPayload.exp * 1000).toLocaleString());
          } catch (tokenError) {
            console.log('⚠️ Token validation skipped:', tokenError.message);
          }
          
          setSession({ user: userData, token });
          setStatus('authenticated');
          console.log('✅ Authentication successful');
        } else {
          console.log('❌ No valid auth data found');
          setStatus('unauthenticated');
          toast.error('Please login to access this page');
          router.push('/pages/adminLogin');
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setStatus('unauthenticated');
        router.push('/pages/adminLogin');
      }
    };

    checkAuth();
  }, [router]);


  // Add these states
const [confirmPassword, setConfirmPassword] = useState('');
const [passwordStrength, setPasswordStrength] = useState({
  score: 0,
  hasMinLength: false,
  hasUpperCase: false,
  hasLowerCase: false,
  hasNumbers: false,
  hasSpecialChar: false,
  matches: false
});

// Password validation function
const validatePassword = (password, confirm = confirmPassword) => {
  const validations = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    matches: password === confirm && password.length > 0
  };

  const score = Object.values(validations).filter(Boolean).length;
  
  setPasswordStrength({
    ...validations,
    score
  });
};

// Update password field handler
const handlePasswordChange = (password) => {
  setAdminData({ ...adminData, password });
  validatePassword(password);
};

const handleConfirmPasswordChange = (confirm) => {
  setConfirmPassword(confirm);
  validatePassword(adminData.password, confirm);
};

// Password strength indicator component
const PasswordStrengthIndicator = () => {
  const { score, hasMinLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, matches } = passwordStrength;
  
  const getStrengthColor = () => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-700">Password Strength:</span>
        <span className={`text-xs font-bold px-2 py-1 rounded ${score <= 2 ? 'text-red-600 bg-red-50' : score <= 4 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50'}`}>
          {getStrengthText()}
        </span>
      </div>
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${(score / 6) * 100}%` }}
        />
      </div>

      {/* Validation Rules */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {[
          { label: '8+ characters', valid: hasMinLength },
          { label: 'Uppercase letter', valid: hasUpperCase },
          { label: 'Lowercase letter', valid: hasLowerCase },
          { label: 'Number (0-9)', valid: hasNumbers },
          { label: 'Special character', valid: hasSpecialChar },
          { label: 'Passwords match', valid: matches }
        ].map((rule, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${rule.valid ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className={`text-xs ${rule.valid ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== AUTHENTICATION HELPERS ====================
const getAuthHeaders = (contentType = 'application/json') => {
  const adminToken = localStorage.getItem('admin_token');
  const deviceToken = localStorage.getItem('device_token');
  
  console.log('🔑 Auth debug:', {
    hasAdminToken: !!adminToken,
    hasDeviceToken: !!deviceToken,
  });
  
  if (!adminToken) {
    throw new Error('Admin authentication required. Please login again.');
  }
  
  // Clean headers matching your PortalHeader pattern
  const headers = {
    'x-admin-token': adminToken,  // Primary header for your API
    'Content-Type': contentType
  };
  
  // Add device token if exists
  if (deviceToken) {
    headers['x-device-token'] = deviceToken;
  }
  
  return headers;
};

const isAuthenticated = () => {
  try {
    getAuthHeaders();
    return true;
  } catch {
    return false;
  }
};

const handleAuthError = (error, showNotification) => {
  console.error('🔐 Auth error details:', {
    message: error.message,
    name: error.name,
    type: error.constructor.name
  });
  
  if (error.message.includes('Authentication required') || 
      error.message.includes('login') ||
      error.message.includes('Session expired') ||
      error.message.includes('Unauthorized') ||
      error.message === 'Access Denied') {
    
    toast.error('Your session has expired. Please login again.');
    
    // Clear all auth data
    localStorage.removeItem('admin_token');
    localStorage.removeItem('device_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('last_login');
    localStorage.removeItem('login_count');
    
    setTimeout(() => {
      window.location.href = '/pages/adminLogin';
    }, 1500);
    
    return true;
  }
  
  // Handle 403 Forbidden errors specifically
  if (error.message.includes('Permission Denied') || 
      error.message.includes('do not have permission')) {
    toast.error('You do not have permission to perform this action');
    return true;
  }
  
  return false;
};
const fetchAdmins = async (showRefresh = false) => {
  if (status !== 'authenticated') {
    console.log('❌ Cannot fetch admins: Not authenticated');
    return;
  }
  
  try {
    console.log('📥 Fetching admins from API...');
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    // Get authentication headers
    const headers = getAuthHeaders('application/json');
    
    // Fetch from your API endpoint
    const response = await fetch('/api/register', {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('device_token');
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Map the data to match your expected format
      const adminsData = (data.users || []).map(user => ({
        ...user,
        permissions: {
          manageUsers: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
          manageContent: true,
          manageSettings: user.role === 'SUPER_ADMIN',
          viewReports: true
        },
        status: 'active'
      }));
      
      setAdmins(adminsData);
      setFilteredAdmins(adminsData);
      console.log('✅ Admins fetched successfully:', adminsData.length);
    } else {
      throw new Error(data.error || 'Failed to fetch admins');
    }

    if (showRefresh) {
      toast.success('Admins refreshed successfully!');
    }
  } catch (error) {
    console.error('❌ Error fetching admins:', error);
    
    // Handle authentication errors
    if (handleAuthError(error, toast.error)) {
      return;
    }
    
    toast.error('Failed to load admins');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
  useEffect(() => {
    if (status === 'authenticated') {
      fetchAdmins();
    }
  }, [status]);

  // Calculate statistics with safe access
  const calculateStats = () => {
    const adminArray = admins || [];
    const totalAdmins = adminArray.length;
    const activeAdmins = adminArray.filter(admin => admin.status === 'active').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthAdmins = adminArray.filter(admin => {
      if (!admin.createdAt) return false;
      const adminDate = new Date(admin.createdAt);
      return adminDate.getMonth() === currentMonth && adminDate.getFullYear() === currentYear;
    }).length;
    
    const lastMonthAdmins = adminArray.filter(admin => {
      if (!admin.createdAt) return false;
      const adminDate = new Date(admin.createdAt);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      return adminDate.getMonth() === lastMonth && adminDate.getFullYear() === year;
    }).length;
    
    const growthRate = lastMonthAdmins > 0 
      ? ((thisMonthAdmins - lastMonthAdmins) / lastMonthAdmins * 100).toFixed(1)
      : thisMonthAdmins > 0 ? 100 : 0;

    return {
      totalAdmins,
      activeAdmins,
      thisMonthAdmins,
      lastMonthAdmins,
      growthRate: parseFloat(growthRate),
      growthCount: thisMonthAdmins - lastMonthAdmins
    };
  };

  const stats = calculateStats();




  // Filter admins by search
  useEffect(() => {
    let filtered = admins || [];

    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.phone?.includes(searchTerm)
      );
    }

    setFilteredAdmins(filtered);
    setCurrentPage(1);
  }, [searchTerm, admins]);

  // Pagination logic
  const totalPages = Math.ceil((filteredAdmins?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAdmins = (filteredAdmins || []).slice(startIndex, startIndex + itemsPerPage);

  // Handle admin selection
  const toggleAdminSelection = (adminId) => {
    const newSelected = new Set(selectedAdmins);
    if (newSelected.has(adminId)) {
      newSelected.delete(adminId);
    } else {
      newSelected.add(adminId);
    }
    setSelectedAdmins(newSelected);
  };

  const selectAllAdmins = () => {
    if (selectedAdmins.size === currentAdmins.length) {
      setSelectedAdmins(new Set());
    } else {
      setSelectedAdmins(new Set(currentAdmins.map(admin => admin.id)));
    }
  };

  // Handle admin deletion
  const handleDelete = (admin) => {
    if (session?.user && admin.id === session.user.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    setAdminToDelete(admin);
    setShowDeleteConfirm(true);
  };
const confirmDelete = async () => {
  if (!adminToDelete) return;
  
  try {
    // Check current user role
    const currentUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
    console.log('👤 Current user attempting delete:', {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      targetUser: adminToDelete.name,
      targetRole: adminToDelete.role
    });
    
    // Check if trying to delete an ADMIN without SUPER_ADMIN role
    if (adminToDelete.role === 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      toast.error('Only SUPER_ADMIN can delete other ADMIN users');
      setShowDeleteConfirm(false);
      setAdminToDelete(null);
      return;
    }
    
    // Check if trying to delete SUPER_ADMIN
    if (adminToDelete.role === 'SUPER_ADMIN') {
      toast.error('Cannot delete SUPER_ADMIN users');
      setShowDeleteConfirm(false);
      setAdminToDelete(null);
      return;
    }
    
    const headers = getAuthHeaders('application/json');
    console.log('📤 Sending delete request with headers:', {
      hasToken: !!headers['x-admin-token'],
      hasDeviceToken: !!headers['x-device-token']
    });
    
    const response = await fetch(`/api/register/${adminToDelete.id}`, {
      method: 'DELETE',
      headers: headers
    });

    console.log('📥 Delete response status:', response.status);
    
    if (response.status === 403) {
      const errorData = await response.json();
      console.error('❌ 403 Forbidden details:', errorData);
      toast.error(errorData.message || 'You do not have permission to delete this user');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete admin (${response.status})`);
    }

    // Remove from local state
    const updatedAdmins = admins.filter(admin => admin.id !== adminToDelete.id);
    setAdmins(updatedAdmins);
    setSelectedAdmins(prev => {
      const newSet = new Set(prev);
      newSet.delete(adminToDelete.id);
      return newSet;
    });
    
    toast.success('Admin deleted successfully!');
    
  } catch (error) {
    console.error('Error deleting admin:', error);
    
    if (handleAuthError(error, toast.error)) {
      return;
    }
    
    toast.error(error.message || 'Failed to delete admin');
  } finally {
    setShowDeleteConfirm(false);
    setAdminToDelete(null);
  }
};

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAdminToDelete(null);
  };

// In your handleCreateAdmin function:
const handleCreateAdmin = () => {
  setAdminData({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'ADMIN',
    permissions: {
      manageUsers: false,
      manageContent: false,
      manageSettings: false,
      viewReports: false
    },
    status: 'active'
  });
  setConfirmPassword('');
  setPasswordStrength({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
    matches: false
  });
  setEditingAdmin(null);
  setShowAdminModal(true);
};

// In your handleEditAdmin function:
const handleEditAdmin = (admin) => {
  setAdminData({
    name: admin.name || '',
    email: admin.email || '',
    password: '',
    phone: admin.phone || '',
    role: admin.role || 'ADMIN',
    permissions: admin.permissions || {
      manageUsers: false,
      manageContent: false,
      manageSettings: false,
      viewReports: false
    },
    status: admin.status || 'active'
  });
  setConfirmPassword('');
  setPasswordStrength({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
    matches: false
  });
  setEditingAdmin(admin);
  setShowAdminModal(true);
};
const handleSaveAdmin = async (e) => {
  e.preventDefault();
  setSavingAdmin(true);
  
  try {
    // ====================
    // 1. FORM VALIDATION
    // ====================
    
    // Check required fields
    if (!adminData.name.trim()) {
      toast.error('Name is required');
      setSavingAdmin(false);
      return;
    }
    
    if (!adminData.email.trim()) {
      toast.error('Email is required');
      setSavingAdmin(false);
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminData.email)) {
      toast.error('Please enter a valid email address');
      setSavingAdmin(false);
      return;
    }
    
    if (!adminData.phone.trim()) {
      toast.error('Phone number is required');
      setSavingAdmin(false);
      return;
    }
    
    // Phone number validation (Kenyan format)
    const phoneRegex = /^\+254[17]\d{8}$/;
    if (!phoneRegex.test(adminData.phone)) {
      toast.error('Phone number must be in format: +2547XXXXXXXX or +2541XXXXXXXX');
      setSavingAdmin(false);
      return;
    }
    
    // ====================
    // 2. PASSWORD VALIDATION
    // ====================
    
    // For NEW admin creation
    if (!editingAdmin) {
      // Password required for new admin
      if (!adminData.password.trim()) {
        toast.error('Password is required for new admin');
        setSavingAdmin(false);
        return;
      }
      
      // Password length check
      if (adminData.password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        setSavingAdmin(false);
        return;
      }
      
      // Password complexity check
      const hasUpperCase = /[A-Z]/.test(adminData.password);
      const hasLowerCase = /[a-z]/.test(adminData.password);
      const hasNumbers = /\d/.test(adminData.password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(adminData.password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        toast.error('Password must contain uppercase, lowercase, numbers, and special characters');
        setSavingAdmin(false);
        return;
      }
      
      // Confirm password check
      if (adminData.password !== confirmPassword) {
        toast.error('Passwords do not match');
        setSavingAdmin(false);
        return;
      }
    }
    
    // For EXISTING admin editing (if changing password)
    if (editingAdmin && adminData.password.trim()) {
      // If password is being changed, validate it
      if (adminData.password.length < 8) {
        toast.error('New password must be at least 8 characters long');
        setSavingAdmin(false);
        return;
      }
      
      const hasUpperCase = /[A-Z]/.test(adminData.password);
      const hasLowerCase = /[a-z]/.test(adminData.password);
      const hasNumbers = /\d/.test(adminData.password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(adminData.password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        toast.error('New password must contain uppercase, lowercase, numbers, and special characters');
        setSavingAdmin(false);
        return;
      }
      
      if (adminData.password !== confirmPassword) {
        toast.error('Passwords do not match');
        setSavingAdmin(false);
        return;
      }
    }
    
    // ====================
    // 3. PREPARE API PAYLOAD
    // ====================
    
    const adminPayload = {
      name: adminData.name.trim(),
      email: adminData.email.trim().toLowerCase(),
      phone: adminData.phone.trim(),
      role: adminData.role,
      status: adminData.status,
      // Only send password if it's provided (for new admin or password change)
      ...(adminData.password.trim() && { password: adminData.password }),
      // Include permissions if your backend supports it
      permissions: adminData.permissions
    };
    
    // ====================
    // 4. GET AUTHENTICATION HEADERS
    // ====================
    
    const headers = getAuthHeaders('application/json');
    
    // ====================
    // 5. MAKE API REQUEST
    // ====================
    
    let url = '/api/register';
    let method = 'POST';
    let successMessage = 'Admin created successfully!';
    
    if (editingAdmin) {
      // Update existing admin
      url = `/api/register/${editingAdmin.id}`;
      method = 'PUT';
      successMessage = 'Admin updated successfully!';
      
      // Don't send password field if empty (not changing password)
      if (!adminData.password.trim()) {
        delete adminPayload.password;
      }
    }
    
    console.log(`Sending ${method} request to ${url}`, adminPayload);
    
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(adminPayload),
    });
    
    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('device_token');
      throw new Error('Session expired. Please login again.');
    }
    
    const data = await response.json();
    
    // ====================
    // 6. HANDLE RESPONSE
    // ====================
    
    if (!response.ok) {
      // Handle specific HTTP error codes
      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('device_token');
        router.push('/pages/adminLogin');
        return;
      }
      
      if (response.status === 409) {
        toast.error('Email already exists. Please use a different email.');
        return;
      }
      
      if (response.status === 403) {
        toast.error('You do not have permission to perform this action');
        return;
      }
      
      throw new Error(data.error || data.message || `Failed to ${editingAdmin ? 'update' : 'create'} admin`);
    }
    
    if (data.success) {
      toast.success(successMessage);
      
      // ====================
      // 7. UPDATE LOCAL STATE
      // ====================
      
      if (editingAdmin) {
        // Update existing admin in state
        const updatedAdmins = admins.map(admin => 
          admin.id === editingAdmin.id 
            ? { ...admin, ...adminPayload, updatedAt: new Date().toISOString() }
            : admin
        );
        setAdmins(updatedAdmins);
      } else {
        // Add new admin to state
        const newAdmin = {
          id: data.user?.id || `admin_${Date.now()}`,
          ...adminPayload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setAdmins(prev => [newAdmin, ...prev]);
      }
      
      // ====================
      // 8. RESET FORM & CLOSE MODAL
      // ====================
      
      setAdminData({
        name: '',
        email: '',
        password: '',
        phone: '+254',
        role: 'ADMIN',
        permissions: {
          manageUsers: false,
          manageContent: true,
          manageSettings: false,
          viewReports: true
        },
        status: 'active'
      });
      setConfirmPassword('');
      setPasswordStrength({
        score: 0,
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumbers: false,
        hasSpecialChar: false,
        matches: false
      });
      setEditingAdmin(null);
      setShowAdminModal(false);
      
      await fetchAdmins();
      
    } else {
      throw new Error(data.error || data.message || `Failed to ${editingAdmin ? 'update' : 'create'} admin`);
    }
    
  } catch (error) {
    console.error('Error saving admin:', error);
    
    // Handle authentication errors
    if (handleAuthError(error, toast.error)) {
      return;
    }
    
    // Handle specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      toast.error('Network error. Please check your connection.');
    } else if (error.message.includes('Email already exists')) {
      toast.error('Email already exists. Please use a different email.');
    } else if (error.message.includes('Session expired')) {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('device_token');
      router.push('/pages/adminLogin');
    } else {
      toast.error(error.message || 'An unexpected error occurred');
    }
    
  } finally {
    setSavingAdmin(false);
  }
};

  // Update permission
  const updatePermission = (permission, value) => {
    setAdminData({
      ...adminData,
      permissions: {
        ...adminData.permissions,
        [permission]: value
      }
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Created At'];
      const csvData = (filteredAdmins || []).map(admin => [
        admin.name,
        admin.email,
        admin.phone,
        admin.role,
        admin.status,
        new Date(admin.createdAt).toLocaleDateString()
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admins-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  // Handle logout - CORRECTED
  const handleLogout = () => {
    // Clear admin-specific auth data
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    console.log('👋 Logged out successfully');
    toast.info('Logged out successfully');
    router.push('/pages/adminLogin');
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return null;
  }



if (loading) {
  return (
    <Box 
      className="min-h-[70vh] flex items-center justify-center p-4 bg-transparent"
    >
      <Stack 
        spacing={2} 
        alignItems="center"
        className="w-full transition-all duration-500"
      >
        {/* Modern Layered Loader - Responsive sizing */}
        <Box className="relative flex items-center justify-center scale-90 sm:scale-110">
          <CircularProgress
            variant="determinate"
            value={100}
            size={48} 
            thickness={4.5}
            sx={{ color: '#f1f5f9' }} 
          />
          <CircularProgress
            variant="indeterminate"
            disableShrink
            size={48}
            thickness={4.5}
            sx={{
              color: '#0f172a', // Matches your dark slate theme
              animationDuration: '1000ms',
              position: 'absolute',
              [`& .MuiCircularProgress-circle`]: {
                strokeLinecap: 'round',
              },
            }}
          />
          <Box className="absolute">
            <IoSparkles className="text-teal-600 text-sm animate-pulse" />
          </Box>
        </Box>

        {/* Minimalist Typography */}
        <div className="text-center px-4">
          <p className="text-slate-900 font-medium text-sm sm:text-base tracking-tight italic">
           Loading For Administrators
          </p>
          <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-widest mt-1 font-bold">
            kinyui boys Senior School
          </p>
        </div>
      </Stack>
    </Box>
  );
}


  // Only ADMIN or SUPER_ADMIN can access privileged actions
  if (currentUserRole && !['ADMIN', 'SUPER_ADMIN'].includes(currentUserRole.toUpperCase())) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-700">Only ADMIN or SUPER ADMIN can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 p-4 lg:p-8 space-y-8">
      <Toaster position="top-right" richColors />

{/* Modern Admin Management Dashboard Header */}
<div className="group relative bg-[#0F172A] rounded-xl md:rounded-[2.5rem] p-5 md:p-8 text-white overflow-hidden shadow-2xl border border-white/5 transition-all duration-500 mb-6">
  
  {/* Abstract Gradient Orbs - Blue/Purple Theme */}
  <div className="absolute top-[-25%] right-[-10%] w-[250px] h-[250px] md:w-[420px] md:h-[420px] bg-gradient-to-br from-teal-600/30 via-emerald-600/20 to-green-600/20 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
  <div className="absolute bottom-[-25%] left-[-10%] w-[200px] h-[200px] md:w-[340px] md:h-[340px] bg-gradient-to-tr from-emerald-600/20 via-teal-600/10 to-transparent rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
  
  {/* Central Floating Orb */}
  <div className="absolute top-[40%] right-[20%] w-[180px] h-[180px] bg-gradient-to-r from-teal-600/20 to-emerald-600/20 rounded-full blur-[70px] pointer-events-none animate-pulse" />
  
  {/* Subtle Grid Pattern */}
  <div className="absolute inset-0 opacity-[0.02]" style={{ 
    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
    backgroundSize: '40px 40px'
  }} />
  
  {/* Noise Texture */}
  <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '100px 100px'
  }} />

  <div className="relative z-10">
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
      
      {/* Left Section - Title & Description */}
      <div className="flex-1">
        {/* Premium Badge */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 via-teal-500 to-green-500 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.5)]" />
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
              kinyui boys Senior School
            </h2>
            <p className="text-[9px] italic font-medium text-white/40 tracking-widest uppercase">
              Central Authority Hub
            </p>
          </div>
        </div>
        
        {/* Title with Icon */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            {/* Icon with Multi-layer Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 rounded-xl md:rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl md:rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Main Icon */}
            <div className="relative p-3 md:p-4 bg-gradient-to-br from-teal-700 via-emerald-700 to-green-700 rounded-xl md:rounded-2xl shadow-2xl transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
              <Shield className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
      <div className="flex-1">
  <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight leading-snug">
    <span className="text-white">Admin</span>
    <br className="sm:hidden" />
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-green-200 ml-0 sm:ml-2">
      Management Dashboard
    </span>
  </h1>
</div>
        </div>{/* Main Icon */}
        
        {/* Enhanced Description */}
        <p className="text-emerald-100/70 text-sm md:text-[13px] font-medium leading-relaxed max-w-3xl">
          Access the central authority hub to oversee system custodians. Regulate 
          administrative privileges, monitor security protocols, and orchestrate 
          high-level permissions to ensure total platform integrity and seamless 
          governance.
        </p>
        
        {/* Quick Stats Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">System: Secure</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <Shield className="w-3 h-3 text-teal-300" />
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Role: {session?.user?.role || 'Administrator'}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <Users className="w-3 h-3 text-emerald-300" />
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Privileges: Full</span>
          </div>
        </div>
      </div>
      
      {/* Profile Card - Enhanced */}
      {session?.user && (
        <div className="group/card relative bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-5 sm:p-7 border border-white/10 w-full max-w-[450px] shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          
          {/* Card Background Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-teal-600/20 to-emerald-600/20 rounded-full blur-3xl group-hover/card:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-emerald-600/20 to-green-600/20 rounded-full blur-3xl group-hover/card:scale-150 transition-transform duration-700" />
          
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                {/* Avatar with Multi-layer Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-600 to-emerald-400 rounded-2xl blur-md opacity-50 group-hover/card:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm opacity-0 group-hover/card:opacity-100 transition-opacity" />
                
                <div className="relative w-14 h-14 bg-gradient-to-tr from-teal-700 via-emerald-700 to-green-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 group-hover/card:rotate-0 group-hover/card:scale-105 transition-all duration-500">
                  <User className="text-white" size={22} />
                </div>
                
                {/* Online Status Indicator */}
                <div className="absolute -bottom-1 -right-1">
                  <div className="relative">
                    <div className="w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-lg" />
                    <div className="absolute inset-0 w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-50" />
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="font-black text-white text-sm uppercase tracking-widest leading-none mb-1">
                  {session.user.name.split(' ')[0]}'s Profile
                </h2>
                <p className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300 uppercase tracking-tighter">
                  {session.user.role || 'System Administrator'}
                </p>
                
                {/* Session Timer - New Addition */}
                <div className="flex items-center gap-1 mt-2">
                  <FiClock className="w-2.5 h-2.5 text-white/30" />
                  <span className="text-[8px] font-bold text-white/30 uppercase tracking-wider">
                    Session: Active
                  </span>
                </div>
              </div>
            </div>

            {/* Modern Logout Button */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="relative group/btn p-2.5 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300 active:scale-90 overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <LogOut size={16} className="relative z-10" />
            </button>
          </div>

          {/* Info Grid - Enhanced */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
            {[
              { 
                label: 'Ident', 
                val: session.user.name, 
                icon: <User size={10} />,
                color: 'from-teal-500/20 to-teal-600/10'
              },
              { 
                label: 'Mail', 
                val: session.user.email, 
                icon: <Mail size={10} />,
                color: 'from-emerald-500/20 to-emerald-600/10'
              },
              { 
                label: 'Contact', 
                val: session.user.phone || '+254 XXX XXX', 
                icon: <Phone size={10} />,
                color: 'from-green-500/20 to-green-600/10'
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className={`group/item relative overflow-hidden flex flex-col p-3 bg-gradient-to-br ${item.color} rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-lg`}
              >
                {/* Item Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover/item:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                
                <div className="flex items-center gap-1.5 mb-1.5 text-emerald-200/60 uppercase font-black text-[8px] tracking-[0.15em] relative z-10">
                  <span className="opacity-70">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <p className="text-[11px] font-bold text-slate-100 truncate tracking-tight relative z-10">
                  {item.val}
                </p>
                
                {/* Bottom Glow */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            ))}
          </div>

          {/* Bottom Status Bar */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-50" />
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Session Active</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="w-2.5 h-2.5 text-emerald-300/50" />
              <span className="text-[9px] font-black text-slate-500 italic tracking-wider">v2.0.26</span>
            </div>
          </div>
          
          {/* Security Badge */}
          <div className="absolute top-2 right-12 opacity-10 group-hover/card:opacity-30 transition-opacity">
            <Shield className="w-16 h-16 text-white" />
          </div>
        </div>
      )}
    </div>
    
    {/* Security Status Bar */}
    <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 sm:gap-6 text-[10px] font-bold uppercase tracking-wider">
      
      {/* Security Status */}
      <div className="flex items-center gap-2">
        <Shield className="w-3 h-3 text-emerald-400" />
        <span className="text-white/40">Security:</span>
        <span className="text-emerald-400">2 factor</span>
      </div>
      
      {/* Encryption */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full border-2 border-teal-400 border-t-transparent" />
        <span className="text-white/40">Encryption:</span>
        <span className="text-teal-300">Token based</span>
      </div>
      
      {/* MFA Status */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-white/40">Token storage:</span>
        <span className="text-emerald-300">Enabled</span>
      </div>
      
      {/* Last Login */}
      <div className="flex items-center gap-2 ml-auto">
        <FiClock className="w-3 h-3 text-white/30" />
        <span className="text-white/40">
          Last Access: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  </div>
</div>

{/* MODERN QUICK ACTIONS - Left Aligned & Compact */}
<div className="flex flex-col sm:flex-row gap-3 w-fit ml-0">
  
  {/* Refresh Action */}
  <button
    onClick={() => fetchAdmins(true)}
    disabled={refreshing}
    className="group flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-teal-700 hover:border-teal-200 hover:bg-teal-50/30 transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50"
  >
    <div className={`${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`}>
      <RefreshCw size={18} className={refreshing ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-600'} />
    </div>
    <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">
      {refreshing ? 'Syncing...' : 'Refresh'}
    </span>
  </button>
  
{/* Create Action - Only visible to SUPER_ADMIN */}
{currentUserRole === 'SUPER_ADMIN' && (
  <button
    onClick={handleCreateAdmin}
    className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-teal-700 shadow-xl shadow-slate-200 hover:shadow-teal-200/50 transition-all duration-300 active:scale-95"
  >
    <div className="bg-white/20 p-1 rounded-lg">
      <Plus size={18} strokeWidth={3} />
    </div>
    <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">
      Add Admin
    </span>
  </button>
)}

</div>

      {/* Stats Cards - Modern Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200 relative overflow-hidden group hover:shadow-xl transition-all duration-200">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-50 rounded-2xl transition-colors duration-200 group-hover:bg-teal-100">
                <Users className="text-teal-700 text-2xl" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.totalAdmins}</div>
                <div className="text-teal-700 text-sm font-bold">Total Admins</div>
              </div>
            </div>
            <div className="text-gray-600 text-sm">All system administrators</div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-teal-100 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-200"></div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200 relative overflow-hidden group hover:shadow-xl transition-all duration-200">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-2xl transition-colors duration-200 group-hover:bg-green-100">
                <CheckCircle className="text-green-600 text-2xl" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.activeAdmins}</div>
                <div className="text-green-600 text-sm font-bold">Active Admins</div>
              </div>
            </div>
            <div className="text-gray-600 text-sm">Currently active administrators</div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-green-100 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-200"></div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200 relative overflow-hidden group hover:shadow-xl transition-all duration-200">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-2xl transition-colors duration-200 group-hover:bg-orange-100">
                <TrendingUp className="text-orange-600 text-2xl" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.growthRate}%</div>
                <div className="text-orange-600 text-sm font-bold">
                  {stats.growthCount >= 0 ? '+' : ''}{stats.growthCount} this month
                </div>
              </div>
            </div>
            <div className="text-gray-600 text-sm">Monthly growth rate</div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-orange-100 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-200"></div>
        </div>
      </div>

      {/* Main Content Panel */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search admins by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 font-bold bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-gray-600 text-sm font-bold">
              {selectedAdmins.size > 0 
                ? `${selectedAdmins.size} selected` 
                : `${filteredAdmins.length} admins found`
              }
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAdmins.size === currentAdmins.length && currentAdmins.length > 0}
                      onChange={selectAllAdmins}
                      className="w-4 h-4 rounded border-gray-300 bg-white text-teal-700 focus:ring-teal-600"
                    />
                    <span className="text-gray-700 text-sm font-bold uppercase tracking-wider">Admin Information</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-bold uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-bold uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-4 text-left text-gray-700 text-sm font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentAdmins.map((admin) => (
                <tr
                  key={admin.id}
                  className="hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAdmins.has(admin.id)}
                        onChange={() => toggleAdminSelection(admin.id)}
                        className="w-4 h-4 rounded border-gray-300 bg-white text-teal-700 focus:ring-teal-600"
                      />
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl border border-teal-200">
                          <User className="text-teal-700" />
                        </div>
                        <div>
                       {/* In the table row, update the admin name to be clickable */}
<p className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors text-sm">
  {admin.name}
  <button
    onClick={() => handleViewAdmin(admin)}
    className="ml-2 text-teal-700 hover:text-teal-900 font-medium hover:underline cursor-pointer text-sm"
  >
    View profile
  </button>
  {session?.user && admin.id === session.user.id && (
    <span className="ml-2 text-xs bg-gradient-to-r from-teal-600 to-teal-700 text-white px-2 py-1 rounded-full font-bold">You</span>
  )}
</p>
                          <p className="text-xs text-gray-500 mt-1">{admin.email}</p>
                          <p className="text-xs text-gray-400">{admin.phone}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      admin.role === 'SUPER_ADMIN' 
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white'
                        : admin.role === 'ADMIN'
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      admin.status === 'active' 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    }`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Calendar className="text-gray-400" />
                      {new Date(admin.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                 <td className="px-6 py-4">
  <div className="flex items-center gap-2">
    {/* Edit button - Only visible to SUPER_ADMIN */}
    {currentUserRole === 'SUPER_ADMIN' && (
      <button
        onClick={() => handleEditAdmin(admin)}
        className="p-2 bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 text-teal-700 rounded-xl transition-all duration-200 border border-teal-200 hover:scale-100 active:scale-95"
      >
        <Edit className="text-sm" />
      </button>
    )}
    
    {/* Delete button - Only visible to SUPER_ADMIN AND not current user */}
    {currentUserRole === 'SUPER_ADMIN' && session?.user && admin.id !== session.user.id && (
      <button
        onClick={() => handleDelete(admin)}
        className="p-2 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 rounded-xl transition-all duration-200 border border-red-200 hover:scale-100 active:scale-95"
      >
        <Trash2 className="text-sm" />
      </button>
    )}
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAdmins.length === 0 && (
            <div className="text-center py-16">
              <User className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                {searchTerm ? 'No admins found matching your search.' : 'No admins found.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination - Modern */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="text-gray-600 text-sm font-medium">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAdmins.length)} of {filteredAdmins.length}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-2xl text-gray-700 disabled:opacity-30 transition-all duration-200 hover:scale-100 active:scale-95 disabled:hover:scale-100"
              >
                <ChevronLeft className="text-lg" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-3 rounded-2xl font-bold transition-all duration-200 hover:scale-100 active:scale-95 ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-2xl text-gray-700 disabled:opacity-30 transition-all duration-200 hover:scale-100 active:scale-95 disabled:hover:scale-100"
              >
                <ChevronRight className="text-lg" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Admin Modal */}
      {showAdminModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowAdminModal(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 p-8 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <User className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">
                      {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
                    </h2>
                    <p className="text-emerald-100 opacity-90 mt-1">Manage admin details and permissions</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-all duration-200 hover:scale-110"
                >
                  <FaX className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Form - Scrollable */}
            <form onSubmit={handleSaveAdmin} className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-teal-700 rounded-full"></div>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-5 border border-teal-200">
                    <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="text-teal-700 text-lg" /> Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminData.name}
                      onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white text-base font-bold"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
                    <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Mail className="text-green-600 text-lg" /> Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-base font-bold"
                      placeholder="admin@school.edu"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
                    <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Phone className="text-emerald-700 text-lg" /> Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={adminData.phone}
                      onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white text-base font-bold"
                      placeholder="+254700000000"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
                    <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Shield className="text-orange-600 text-lg" /> Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={adminData.role}
                      onChange={(e) => setAdminData({ ...adminData, role: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-base font-bold"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="MODERATOR">Moderator</option>
                    </select>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200">
                    <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="text-red-600 text-lg" /> Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={adminData.status}
                      onChange={(e) => setAdminData({ ...adminData, status: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-base font-bold"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-700 rounded-full"></div>
                  Security
                </h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-200">
                    <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      🔐 {editingAdmin ? 'New Password (optional)' : 'Password <span className="text-red-500">*</span>'}
                      <span className="text-gray-500 text-xs font-normal ml-2">8+ chars, uppercase, lowercase, number & special char</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!editingAdmin}
                        value={adminData.password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white text-base font-bold"
                        placeholder="Enter secure password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {(adminData.password || !editingAdmin) && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-teal-200">
                      <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        ✓ Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required={!editingAdmin || adminData.password}
                          value={confirmPassword}
                          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                          className="w-full px-4 py-3 pr-12 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white text-base font-bold"
                          placeholder="Re-enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {adminData.password && <PasswordStrengthIndicator />}
                </div>
              </div>

              {/* Permissions Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
                  Permissions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl border border-teal-200 hover:border-teal-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminData.permissions.manageUsers}
                      onChange={(e) => updatePermission('manageUsers', e.target.checked)}
                      className="w-5 h-5 rounded font-bold cursor-pointer border-gray-300 text-teal-700 focus:ring-teal-600 mt-1"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-base">Manage Users</p>
                      <p className="text-sm text-gray-600">Create, edit, and delete users</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:border-green-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminData.permissions.manageContent}
                      onChange={(e) => updatePermission('manageContent', e.target.checked)}
                      className="w-5 h-5 rounded cursor-pointer border-gray-300 text-green-600 focus:ring-green-500 mt-1"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-base">Manage Content</p>
                      <p className="text-sm text-gray-600">Create and edit website content</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 hover:border-emerald-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminData.permissions.manageSettings}
                      onChange={(e) => updatePermission('manageSettings', e.target.checked)}
                      className="w-5 h-5 rounded cursor-pointer border-gray-300 text-emerald-700 focus:ring-emerald-600 mt-1"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-base">Manage Settings</p>
                      <p className="text-sm text-gray-600">Modify system settings</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:border-orange-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminData.permissions.viewReports}
                      onChange={(e) => updatePermission('viewReports', e.target.checked)}
                      className="w-5 h-5 rounded cursor-pointer border-gray-300 text-orange-600 focus:ring-orange-500 mt-1"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-base">View Reports</p>
                      <p className="text-sm text-gray-600">Access analytics and reports</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions - Sticky Footer */}
              <div className="flex gap-4 pt-6 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-6 py-4 rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-3 text-base"
                >
                  <X className="text-lg" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdmin}
                  className="flex-1 cursor-pointer bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-200 shadow-lg shadow-teal-500/25 disabled:opacity-50 flex items-center justify-center gap-3 text-base"
                >
                  {savingAdmin ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="text-lg" />
                      {editingAdmin ? 'Update Admin' : 'Create Admin'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
{/* MODERN VIEW ADMIN MODAL - Detailed & Enhanced */}
{showViewModal && viewingAdmin && (
  <div 
    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 z-[100]"
    onClick={() => setShowViewModal(false)}
  >
    <div 
      className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 bg-grid-16 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <User size={24} className="text-teal-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{viewingAdmin.name}</h2>
                <p className="text-slate-400 text-sm">Admin Account Details</p>
              </div>
            </div>
            <button
              onClick={() => setShowViewModal(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <FaX size={18} />
            </button>
          </div>
          
          {/* Quick Status Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-4 py-2 rounded-lg border text-sm font-bold uppercase tracking-tight ${
              viewingAdmin.status === 'active' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {viewingAdmin.status}
            </div>
            <div className="px-4 py-2 bg-teal-500/10 rounded-lg border border-teal-500/20 text-teal-600 text-sm font-bold uppercase tracking-tight">
              {viewingAdmin.role}
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-slate-300 text-sm font-bold">
              ID: {viewingAdmin.id?.substring(0, 12)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        
        {/* Personal Information Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-teal-700 rounded-full"></div>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', val: viewingAdmin.name, icon: <User size={16}/> },
              { label: 'Email Address', val: viewingAdmin.email, icon: <Mail size={16}/> },
              { label: 'Phone Number', val: viewingAdmin.phone || 'N/A', icon: <Phone size={16}/> },
              { label: 'Member Since', val: viewingAdmin.createdAt ? new Date(viewingAdmin.createdAt).toLocaleDateString() : 'N/A', icon: <Calendar size={16}/> }
            ].map((field, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-teal-700">{field.icon}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{field.label}</span>
                </div>
                <p className="text-base font-bold text-slate-900">{field.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account Settings Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-emerald-700 rounded-full"></div>
            Account Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-teal-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-teal-700" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Role</span>
              </div>
              <p className="text-base font-bold text-slate-900">{viewingAdmin.role}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</span>
              </div>
              <p className="text-base font-bold text-slate-900 capitalize">{viewingAdmin.status}</p>
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
            System Permissions
          </h3>
          {viewingAdmin.permissions ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(viewingAdmin.permissions).map(([key, value]) => {
                const displayName = key
                  .replace(/([A-Z])/g, ' $1')
                  .trim()
                  .split(' ')
                  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ');
                
                const colorMap = {
                  'manageUsers': 'teal',
                  'manageContent': 'green',
                  'manageSettings': 'emerald',
                  'viewReports': 'orange'
                };
                
                const color = colorMap[key] || 'gray';
                const colorClasses = {
                  teal: 'bg-teal-50 border-teal-200 text-teal-700',
                  green: 'bg-green-50 border-green-200 text-green-700',
                  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                  orange: 'bg-orange-50 border-orange-200 text-orange-700',
                  gray: 'bg-gray-50 border-gray-200 text-gray-700'
                };

                return (
                  <div key={key} className={`flex items-center gap-3 p-4 rounded-xl border ${colorClasses[color]} transition-all ${value ? 'opacity-100' : 'opacity-60'}`}>
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${value ? `bg-${color}-600 shadow-lg shadow-${color}-500/50` : 'bg-gray-400'}`} />
                    <span className="text-sm font-bold">{displayName}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-100 p-4 rounded-xl text-slate-600 text-center">No permissions data available</div>
          )}
        </div>

        {/* Activity Info */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <FiClock size={18} className="text-slate-500" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Last Updated</p>
                <p className="text-sm font-bold text-slate-900">{viewingAdmin.updatedAt ? new Date(viewingAdmin.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            <span className="text-xs font-black text-teal-700 bg-teal-100 px-3 py-1 rounded-lg">VERIFIED ADMIN</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


      {/* Modern Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 border border-gray-200 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-200">
                <Trash2 className="text-3xl text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Admin</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete <strong className="text-gray-900">{adminToDelete?.name}</strong>?
              </p>
              <p className="text-gray-500 text-xs mt-3">This action cannot be undone.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-6 py-4 rounded-2xl font-bold transition-all duration-200 hover:scale-100 active:scale-95 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-200 shadow-lg shadow-red-500/25 hover:scale-100 active:scale-95 text-sm"
              >
                Delete Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}