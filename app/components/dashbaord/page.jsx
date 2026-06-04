'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  FiUsers,
  FiBook,
  FiCalendar,
  FiFileText,
  FiTrendingUp,
  FiTrendingDown,
  FiEye,
  FiDownload,
  FiMail,
  FiUserPlus,
  FiArrowUpRight,
  FiStar,
  FiUser,
  FiImage,
  FiMessageCircle,
  FiX,
  FiPlay,
  FiBarChart2,
  FiAward,
  FiTarget,
  FiActivity,
  FiRefreshCw,
  FiClipboard,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiThumbsUp,
  FiThumbsDown,
  FiPercent,
  FiDollarSign,
  FiZap,
  FiGlobe,
  FiMapPin,
  FiBookOpen,
  FiHeart,
  FiCpu,
  FiTrendingUp as FiTrendingUpSolid,
  FiTrendingDown as FiTrendingDownSolid,
  FiActivity as FiActivitySolid,
  FiBriefcase,
  FiSend,
  FiLayers,  // ADD THIS LINE
} from 'react-icons/fi';

import {
  IoPeopleCircle,
  IoNewspaper,
  IoSparkles,
  IoClose,
  IoStatsChart,
  IoAnalytics,
  IoSchool,
  IoDocumentText
} from 'react-icons/io5';
import { CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

// Decode JWT token
const decodeToken = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = String(url).match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const isAudioFileUrl = (url) => {
  if (!url) return false;
  const cleaned = String(url).toLowerCase().split('?')[0].split('#')[0];
  return ['.mp3', '.wav', '.m4a', '.aac', '.ogg'].some(ext => cleaned.endsWith(ext));
};

// ========== HELPER FUNCTIONS ==========
const calculateMonthOverMonthGrowth = (currentCount, previousCount) => {
  if (!previousCount || previousCount === 0) {
    return currentCount > 0 ? 100 : 0;
  }
  return ((currentCount - previousCount) / previousCount) * 100;
};

const countRecordsByMonth = (dataArray, monthOffset = 0) => {
  // Add this guard clause at the beginning
  if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
    return 0;
  }

  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const nextMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1);

  return dataArray.filter(item => {
    if (!item?.createdAt) return false;
    try {
      const itemDate = new Date(item.createdAt);
      return !isNaN(itemDate.getTime()) && itemDate >= targetMonth && itemDate < nextMonth;
    } catch {
      return false;
    }
  }).length;
};

// Improved relative time function
const getRelativeTime = (dateString) => {
  if (!dateString) return 'Recently';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return 'Recently';
  }
};

// Format activity date for display
const formatActivityDate = (dateString) => {
  if (!dateString) return 'Unknown date';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch (e) {
    return 'Unknown date';
  }
};

// ========== RECENT ACTIVITY FETCHER ==========
const listenForRecentActivity = async () => {
  try {
    console.log('📊 Fetching recent activity data...');

    const authHeaders = (() => {
      if (typeof window === 'undefined') return {};

      const tokenKeys = ['admin_token', 'token', 'auth_token', 'jwt_token', 'access_token'];
      const deviceKeys = ['device_token', 'deviceToken'];

      const adminToken = tokenKeys
        .map(key => localStorage.getItem(key))
        .find(Boolean);
      const deviceToken = deviceKeys
        .map(key => localStorage.getItem(key))
        .find(Boolean);

      return adminToken && deviceToken
        ? { Authorization: `Bearer ${adminToken}`, 'x-device-token': deviceToken }
        : {};
    })();

    const noCacheHeaders = {
      'Cache-Control': 'no-cache',
      ...authHeaders
    };

    const [studentsRes, resultsRes, uploadsRes, guidanceRes] = await Promise.allSettled([
      fetch('/api/studentupload?limit=5&sortBy=updatedAt&sortOrder=desc', { headers: noCacheHeaders }),
      fetch('/api/results?limit=5&sortBy=updatedAt&sortOrder=desc', { headers: noCacheHeaders }),
      fetch('/api/studentupload?action=uploads&limit=3', { headers: noCacheHeaders }),
      fetch('/api/guidance?limit=3&sortBy=createdAt&sortOrder=desc', { headers: noCacheHeaders })
    ]);

    // Process recent students
    if (studentsRes.status === 'fulfilled' && studentsRes.value.ok) {
      try {
        const studentsData = await studentsRes.value.json();
        const students = studentsData.data?.students || studentsData.students || [];

        students.slice(0, 2).forEach(student => {
          if (!student?.id) return;

          const isNew = student.createdAt && student.updatedAt &&
                       new Date(student.createdAt).getTime() === new Date(student.updatedAt).getTime();

          const studentName = student.firstName || student.lastName ?
            `${student.firstName || ''} ${student.lastName || ''}`.trim() :
            `Student #${student.admissionNumber || student.id}`;

          const form = student.form || student.Form || 'Unknown Form';

          activities.push({
            id: `student-${student.id}-${Date.now()}`,
            action: isNew ? 'New student registered' : 'Student profile updated',
            target: `${studentName} - ${form}`,
            time: getRelativeTime(student.updatedAt || student.createdAt),
            formattedDate: formatActivityDate(student.updatedAt || student.createdAt),
            type: 'student',
            icon: isNew ? FiUserPlus : FiUser,
            color: isNew ? 'emerald' : 'blue',
            timestamp: new Date(student.updatedAt || student.createdAt || now),
            admissionNumber: student.admissionNumber,
            details: {
              name: studentName,
              form: form,
              isNew: isNew
            }
          });
        });
      } catch (error) {
        console.error('❌ Error processing students data:', error);
      }
    }

    // Process recent results
    if (resultsRes.status === 'fulfilled' && resultsRes.value.ok) {
      try {
        const resultsData = await resultsRes.value.json();
        const results = resultsData.data?.results || resultsData.results || [];

        results.slice(0, 2).forEach(result => {
          if (!result?.id) return;

          const term = result.term || result.Term || 'Unknown Term';
          const form = result.form || result.Form || 'Unknown Form';

          activities.push({
            id: `result-${result.id}-${Date.now()}`,
            action: 'Academic results updated',
            target: `${result.admissionNumber} - ${form} ${term}`,
            time: getRelativeTime(result.updatedAt || result.createdAt),
            formattedDate: formatActivityDate(result.updatedAt || result.createdAt),
            type: 'result',
            icon: FiAward,
            color: 'purple',
            timestamp: new Date(result.updatedAt || result.createdAt || now),
            admissionNumber: result.admissionNumber,
            details: {
              term: term,
              form: form,
              academicYear: result.academicYear || result.year || 'N/A'
            }
          });
        });
      } catch (error) {
        console.error('❌ Error processing results data:', error);
      }
    }

    // Process recent uploads
    if (uploadsRes.status === 'fulfilled' && uploadsRes.value.ok) {
      try {
        const uploadsData = await uploadsRes.value.json();
        const uploads = uploadsData.uploads || uploadsData.data?.uploads || [];

        uploads.slice(0, 2).forEach(upload => {
          if (!upload?.id) return;

          const uploadDate = upload.processedDate || upload.uploadDate || upload.createdAt;
          const fileName = upload.fileName || upload.originalName || 'Unknown file';
          const fileExt = fileName.split('.').pop().toUpperCase();

          const statusColors = {
            'completed': 'green',
            'processing': 'blue',
            'failed': 'red',
            'pending': 'yellow',
            'partial': 'orange'
          };

          activities.push({
            id: `upload-${upload.id}-${Date.now()}`,
            action: 'Bulk upload processed',
            target: `${fileName} (${fileExt})`,
            time: getRelativeTime(uploadDate),
            formattedDate: formatActivityDate(uploadDate),
            type: 'upload',
            icon: FiDownload,
            color: statusColors[upload.status?.toLowerCase()] || 'gray',
            timestamp: new Date(uploadDate || now),
            details: {
              fileName: fileName,
              fileType: fileExt,
              status: upload.status || 'unknown',
              rows: upload.totalRows || upload.validRows || 0,
              type: upload.uploadType || upload.type || 'unknown'
            }
          });
        });
      } catch (error) {
        console.error('❌ Error processing uploads data:', error);
      }
    }

    // Process recent guidance sessions - FIXED TIMELINE
    if (guidanceRes.status === 'fulfilled' && guidanceRes.value.ok) {
      try {
        const guidanceData = await guidanceRes.value.json();
        const sessions = guidanceData.events || guidanceData.sessions || guidanceData.data?.events || [];

        sessions.slice(0, 2).forEach(session => {
          if (!session?.id) return;

          const counselor = session.counselor || session.teacher || session.staffName || 'Counselor';
          const category = session.category || session.type || session.reason || 'Session';
          const studentName = session.studentName ||
            (session.student ? `${session.student.firstName || ''} ${session.student.lastName || ''}`.trim() : '');

          const displayTarget = studentName ?
            `${counselor} with ${studentName}` :
            `${counselor} - ${category}`;

          // Use correct date field: session.date, session.createdAt, or session.updatedAt
          const sessionDate = session.date || session.createdAt || session.updatedAt;

          activities.push({
            id: `guidance-${session.id}-${Date.now()}`,
            action: 'Guidance session conducted',
            target: displayTarget,
            time: getRelativeTime(sessionDate),
            formattedDate: formatActivityDate(sessionDate),
            type: 'guidance',
            icon: FiMessageCircle,
            color: 'teal',
            timestamp: new Date(sessionDate || now),
            details: {
              counselor: counselor,
              category: category,
              studentName: studentName,
              duration: session.duration || session.length || 'N/A',
              status: session.status || 'completed'
            }
          });
        });
      } catch (error) {
        console.error('❌ Error processing guidance data:', error);
      }
    }

    // Sort by timestamp (most recent first) and remove duplicates
    const uniqueActivities = Array.from(
      new Map(activities.map(activity => [activity.id, activity])).values()
    );

    const sortedActivities = uniqueActivities
      .filter(activity => activity.timestamp && !isNaN(activity.timestamp.getTime()))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);

    console.log(`✅ Loaded ${sortedActivities.length} recent activities`);

    return sortedActivities;

  } catch (error) {
    console.error('🚨 Critical error in listenForRecentActivity:', error);

    return [{
      id: 'fallback-activity',
      action: 'System online',
      target: 'Dashboard is monitoring activities',
      time: 'Just now',
      formattedDate: 'Today',
      type: 'system',
      icon: FiActivity,
      color: 'blue',
      timestamp: new Date(),
      details: {
        note: 'Activities will appear here as they occur'
      }
    }];
  }
};

// ========== DASHBOARD COMPONENT ==========
function ModernLoadingSpinner({ message = "Loading sessions from the database…", size = "medium" }) {
  const sizes = {
    small: { outer: 48, inner: 24 },
    medium: { outer: 64, inner: 32 },
    large: { outer: 80, inner: 40 }
  }

  const { outer, inner } = sizes[size] || sizes.medium;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative inline-block">
          {/* Main spinner */}
          <div className="relative">
            <CircularProgress
              size={outer}
              thickness={5}
              className="text-indigo-600"
            />
            {/* Pulsing inner circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full animate-ping opacity-25"
                   style={{ width: inner, height: inner }}></div>
            </div>
          </div>
          {/* Outer glow effect */}
          <div className="absolute -inset-6 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-full blur-xl opacity-30 animate-pulse"></div>
        </div>

        {/* Text content */}
        <div className="mt-6 space-y-3">
          <span className="block text-lg font-semibold text-gray-800">
            {message}
          </span>

          {/* Bouncing dots */}
          <div className="flex justify-center space-x-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                   style={{ animationDelay: `${i * 0.15}s` }}></div>
            ))}
          </div>

          {/* Optional subtitle */}
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we fetch school public data
          </p>
        </div>
      </div>
    </div>
  );
}

// Decode JWT token helper
const decodeJWTToken = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

// ========== SMS OVERVIEW CARD (replaces Student Engagement) ==========
const SmsOverviewCard = ({ smsStats, recentCampaigns }) => {
  const total = smsStats?.total || 0;
  const drafts = smsStats?.draft || 0;
  const sent = smsStats?.sent || 0;
  const campaigns = recentCampaigns || [];

  return (
    <div className="group relative bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]">

      {/* Top Glow Accent */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-colors" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">SMS Campaigns</h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Communication Hub</p>
        </div>
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm transition-transform group-hover:scale-100">
          <FiSend className="text-xl" />
        </div>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">{total}</span>
            <span className="text-xs font-bold text-slate-400">campaigns</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-100">
            <span className="text-[10px] font-black text-amber-600 uppercase">Draft</span>
            <p className="text-xl font-black text-amber-700 mt-1">{drafts}</p>
          </div>
          <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-100">
            <span className="text-[10px] font-black text-emerald-600 uppercase">Sent</span>
            <p className="text-xl font-black text-emerald-700 mt-1">{sent}</p>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="mb-4">
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Recent Campaigns</h4>
        <div className="space-y-3">
          {campaigns.length > 0 ? (
            campaigns.slice(0, 3).map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-1.5 rounded-lg ${campaign.status === 'sent' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    <FiSend className={`w-3 h-3 ${campaign.status === 'sent' ? 'text-emerald-600' : 'text-amber-600'}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 truncate">{campaign.title || 'Untitled'}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{campaign.recipientCount || 0} recipients</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">No recent campaigns</p>
          )}
        </div>
      </div>

    </div>
  );
};

// ========== MAIN DASHBOARD COMPONENT ==========
export default function DashboardOverview() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalSubscribers: 0,
    pendingEmails: 0,
    activeAssignments: 0,
    totalCareers: 0,
    galleryItems: 0,
    guidanceSessions: 0,
    totalNews: 0,
    totalDepartments: 0,
    totalAchievements: 0,
    featuredAchievements: 0
  });

  // New SMS stats
  const [smsStats, setSmsStats] = useState({
    total: 0,
    draft: 0,
    sent: 0,
    totalRecipients: 0,
    successRate: 0
  });
  const [recentSmsCampaigns, setRecentSmsCampaigns] = useState([]);

  const [recentActivity, setRecentActivity] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [quickStats, setQuickStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
const [growthMetrics, setGrowthMetrics] = useState({
  guidanceGrowth: 0,
  newsGrowth: 0,
  galleryGrowth: 0
});
  const [showQuickTour, setShowQuickTour] = useState(false);
  const [schoolVideo, setSchoolVideo] = useState(null);

  // New state for dynamic data
  const [staffDistribution, setStaffDistribution] = useState([]);
  const [assignmentsDistribution, setAssignmentsDistribution] = useState([]);
  const [resourcesDistribution, setResourcesDistribution] = useState([]);
  const [careers, setCareers] = useState([]);
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [schoolStats, setSchoolStats] = useState(null);
  const [achievementSummary, setAchievementSummary] = useState({
    total: 0,
    featured: 0,
    byCategory: [],
    byYear: []
  });




  // Student Population & Distribution state
  const [studentPopulation, setStudentPopulation] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byForm: { 'Form 1': 0, 'Form 2': 0, 'Form 3': 0, 'Form 4': 0 },
    byStream: {},
    byStatus: { active: 0, inactive: 0 }
  });

  // Calculate percentages for charts
  const calculatePercentages = (data, key) => {
    const counts = {};
    data.forEach(item => {
      const value = item[key] || 'Unknown';
      counts[value] = (counts[value] || 0) + 1;
    });

    const total = data.length;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  };

  // Authentication check
  const checkAuthentication = useCallback(() => {
    console.log('🔍 Checking localStorage for user data...');

    const possibleUserKeys = ['admin_user', 'user', 'currentUser', 'auth_user'];
    const possibleTokenKeys = ['admin_token', 'token', 'auth_token', 'jwt_token', 'access_token'];

    let userData = null;
    let token = null;
    let extractedUserFromToken = null;

    // Find token first
    for (const key of possibleTokenKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        token = data;
        extractedUserFromToken = decodeJWTToken(data);
        if (extractedUserFromToken) break;
      }
    }

    // Find user data
    for (const key of possibleUserKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        userData = data;
        break;
      }
    }

    // Priority: Use user from token if available
    let user = extractedUserFromToken;

    if (!user && userData) {
      try {
        user = JSON.parse(userData);
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
      }
    }

    if (!user) {
      console.log('❌ No user data found');
      window.location.href = '/pages/adminLogin';
      return null;
    }

    // Verify token is still valid
    if (token) {
      try {
        const tokenPayload = decodeJWTToken(token);
        if (!tokenPayload) {
          window.location.href = '/pages/adminLogin';
          return null;
        }

        const currentTime = Date.now() / 1000;
        if (tokenPayload.exp && tokenPayload.exp < currentTime) {
          possibleUserKeys.forEach(key => localStorage.removeItem(key));
          possibleTokenKeys.forEach(key => localStorage.removeItem(key));
          window.location.href = '/pages/adminLogin';
          return null;
        }

        // Update user data with token information
        if (tokenPayload) {
          user = {
            ...user,
            ...tokenPayload,
            id: tokenPayload.id || tokenPayload.userId || tokenPayload.sub || user.id,
            email: tokenPayload.email || user.email,
            name: tokenPayload.name || tokenPayload.fullName || user.name,
            role: tokenPayload.role || tokenPayload.scope || user.role
          };
        }
      } catch (tokenError) {
        console.log('⚠️ Token validation skipped:', tokenError.message);
      }
    }

    // Check if user has valid role
    const userRole = user.role;
    const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'TEACHER', 'PRINCIPAL', 'STAFF'];

    if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
      window.location.href = '/pages/adminLogin';
      return null;
    }

    return user;
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      const authenticatedUser = checkAuthentication();
      if (!authenticatedUser) return;

      setUser(authenticatedUser);

          const getAuthHeaders = () => {
        if (typeof window === 'undefined') return {};

        const tokenKeys = ['admin_token', 'token', 'auth_token', 'jwt_token', 'access_token'];
        const deviceKeys = ['device_token', 'deviceToken'];

        const adminToken = tokenKeys
          .map(key => localStorage.getItem(key))
          .find(Boolean);
        const deviceToken = deviceKeys
          .map(key => localStorage.getItem(key))
          .find(Boolean);

        return adminToken && deviceToken
          ? { Authorization: `Bearer ${adminToken}`, 'x-device-token': deviceToken }
          : {};
      };

      const authHeaders = getAuthHeaders();
      console.log('🔐 Dashboard auth headers:', Object.keys(authHeaders));

      // Fetch data from all endpoints
      const [
        studentsRes,
        staffRes,
        subscribersRes,
        assignmentsRes,
        careersRes,
        galleryRes,
        guidanceRes,
        newsRes,
        schoolInfoRes,
        adminsRes,
        resourcesRes,
        emailCampaignsRes,
        smsRes,
        achievementsRes,
        schoolStatsRes,
        departmentsRes
      ] = await Promise.allSettled([
        fetch('/api/studentupload?status=all&includeStats=true&limit=5000', { headers: authHeaders }),
        fetch('/api/staff', { headers: authHeaders }),
        fetch('/api/subscriber', { headers: authHeaders }),
        fetch('/api/assignment', { headers: authHeaders }),
        fetch('/api/career', { headers: authHeaders }),
        fetch('/api/gallery', { headers: authHeaders }),
        fetch('/api/guidance', { headers: authHeaders }),
        fetch('/api/news', { headers: authHeaders }),
        fetch('/api/school', { headers: authHeaders }),
        fetch('/api/register', { headers: authHeaders }),
        fetch('/api/resources', { headers: authHeaders }),
        fetch('/api/emails', { headers: authHeaders }),
        fetch('/api/sms', { headers: authHeaders }),
        fetch('/api/achievements', { headers: authHeaders }),
        fetch('/api/school-stats', { headers: authHeaders }),
        fetch('/api/staff/departments?grouped=1', { headers: authHeaders })
      ]);

      // Helper to safely parse responses with logging
      const parseResponse = async (response, name, fallback) => {
        if (response.status !== 'fulfilled') {
          console.warn(`⚠️ ${name} fetch failed:`, response.reason);
          return fallback;
        }
        if (!response.value.ok) {
          console.warn(`⚠️ ${name} returned status ${response.value.status}`);
          return fallback;
        }
        try {
          const data = await response.value.json();
          console.log(`✅ ${name}:`, data);
          return data;
        } catch (error) {
          console.error(`❌ ${name} parse error:`, error);
          return fallback;
        }
      };

      // Process all responses with logging
      const studentsData = await parseResponse(studentsRes, 'Students', { success: false, data: { students: [] } });
      const staff = await parseResponse(staffRes, 'Staff', { staff: [] });
      const subscribers = await parseResponse(subscribersRes, 'Subscribers', { subscribers: [] });
      const assignments = await parseResponse(assignmentsRes, 'Assignments', { assignments: [] });
      const careersData = await parseResponse(careersRes, 'Careers', { jobs: [] });
      const gallery = await parseResponse(galleryRes, 'Gallery', { galleries: [] });
      const guidance = await parseResponse(guidanceRes, 'Guidance', { events: [] });
// Process news - FIXED VERSION
let newsArticles = [];
let newsData = await parseResponse(newsRes, 'News', {});

if (newsData && Object.keys(newsData).length > 0) {
  // Handle different response structures
  if (newsData.success && newsData.data && Array.isArray(newsData.data)) {
    newsArticles = newsData.data;
  } else if (newsData.data && Array.isArray(newsData.data)) {
    newsArticles = newsData.data;
  } else if (newsData.news && Array.isArray(newsData.news)) {
    newsArticles = newsData.news;
  } else if (Array.isArray(newsData)) {
    newsArticles = newsData;
  }
  console.log(`📰 News articles count: ${newsArticles.length}`);
}

const schoolInfo = await parseResponse(schoolInfoRes, 'School Info', { school: {} });
const admins = await parseResponse(adminsRes, 'Admins', { users: [] });
const resources = await parseResponse(resourcesRes, 'Resources', { resources: [] });
const emailCampaignsData = await parseResponse(emailCampaignsRes, 'Email Campaigns', { campaigns: [] });

// Process SMS campaigns
const smsData = await parseResponse(smsRes, 'SMS', { campaigns: [] });
      let computedSmsStats = {
        total: 0,
        draft: 0,
        sent: 0,
        totalRecipients: 0,
        successRate: 0
      };
      if (smsData.success) {
        const campaigns = smsData.campaigns || [];
        const draftCount = campaigns.filter(c => c.status === 'draft').length;
        const sentCount = campaigns.filter(c => c.status === 'sent').length;
        const totalRecipients = campaigns.reduce((acc, c) => acc + (c.recipients ? c.recipients.split(',').length : 0), 0);
        const successRate = sentCount > 0 ? Math.round((sentCount / campaigns.length) * 100) : 0;

        computedSmsStats = {
          total: campaigns.length,
          draft: draftCount,
          sent: sentCount,
          totalRecipients,
          successRate
        };
        setSmsStats(computedSmsStats);
        console.log('📱 SMS Stats:', computedSmsStats);

        // Get recent campaigns for display
        const recent = campaigns
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 3)
          .map(c => ({
            ...c,
            recipientCount: c.recipients ? c.recipients.split(',').length : 0
          }));
        setRecentSmsCampaigns(recent);
      }

      const achievementsData = await parseResponse(achievementsRes, 'Achievements', { success: false, allAchievements: [] });
      const allAchievements = Array.isArray(achievementsData.allAchievements)
        ? achievementsData.allAchievements
        : Object.values(achievementsData.achievements || {}).flat().filter(Boolean);
      const achievementCategoryMap = allAchievements.reduce((acc, achievement) => {
        const category = achievement.category || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      const achievementYearMap = allAchievements.reduce((acc, achievement) => {
        const year = achievement.year || 'Unknown';
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {});
      const achievementSummaryData = {
        total: allAchievements.length,
        featured: allAchievements.filter(item => item.featured).length,
        byCategory: Object.entries(achievementCategoryMap).map(([name, value]) => ({ name, value })),
        byYear: Object.entries(achievementYearMap)
          .map(([year, value]) => ({ year: String(year), value }))
          .sort((a, b) => Number(a.year) - Number(b.year))
      };
      console.log('🏆 Achievements:', achievementSummaryData);
      setAchievementSummary(achievementSummaryData);

      const schoolStatsData = await parseResponse(schoolStatsRes, 'School Stats', { success: false, stats: null });
      const currentSchoolStats = schoolStatsData.success ? schoolStatsData.stats : null;
      console.log('🏫 School Stats:', currentSchoolStats);
      setSchoolStats(currentSchoolStats);

      const departmentsData = await parseResponse(departmentsRes, 'Departments', { success: false, departments: [] });
      const departmentsByCategory = departmentsData.departmentsByCategory || {};
      const departmentList = Array.isArray(departmentsData.departments)
        ? departmentsData.departments
        : Object.values(departmentsByCategory).flat().filter(Boolean);
      const totalDepartments = departmentList.filter(dept => dept?.isActive !== false).length;
      console.log('🏢 Departments:', totalDepartments);

      // Store school video for quick tour
      if (schoolInfo.school?.videoTour) {
        setSchoolVideo({
          url: schoolInfo.school.videoTour,
          type: schoolInfo.school.videoType,
          thumbnail: schoolInfo.school.videoThumbnail
        });
      }

      // Extract student data
      const studentList = studentsData.success ?
        (studentsData.data?.students || studentsData.students || []) : [];

      // Calculate student population and distribution
      if (studentList.length > 0) {
        const formDistribution = { 'Form 1': 0, 'Form 2': 0, 'Form 3': 0, 'Form 4': 0 };
        const streamDistribution = {};
        const statusDistribution = { active: 0, inactive: 0 };

        studentList.forEach(student => {
          const form = student.form || student.Form || '';
          if (formDistribution[form] !== undefined) {
            formDistribution[form]++;
          } else if (form) {
            formDistribution[form] = (formDistribution[form] || 0) + 1;
          }

          const stream = student.stream || student.Stream || '';
          if (stream) {
            streamDistribution[stream] = (streamDistribution[stream] || 0) + 1;
          }

          const status = student.status?.toLowerCase() || student.Status?.toLowerCase() || 'active';
          if (status === 'active') statusDistribution.active++;
          else statusDistribution.inactive++;
        });

        setStudentPopulation({
          total: studentList.length,
          active: statusDistribution.active,
          inactive: statusDistribution.inactive,
          byForm: formDistribution,
          byStream: streamDistribution,
          byStatus: statusDistribution
        });
      } else {
        setStudentPopulation({
          total: 0,
          active: 0,
          inactive: 0,
          byForm: { 'Form 1': 0, 'Form 2': 0, 'Form 3': 0, 'Form 4': 0 },
          byStream: {},
          byStatus: { active: 0, inactive: 0 }
        });
      }

      // Calculate staff distribution
      if (staff.staff && staff.staff.length > 0) {
        const staffDist = calculatePercentages(staff.staff, 'department');
        setStaffDistribution(staffDist);
      } else {
        setStaffDistribution([]);
      }

      // Calculate assignments distribution
      if (assignments.assignments && assignments.assignments.length > 0) {
        const assignDist = calculatePercentages(assignments.assignments, 'status');
        setAssignmentsDistribution(assignDist);
      } else {
        setAssignmentsDistribution([]);
      }

      // Calculate resources distribution
      if (resources.resources && resources.resources.length > 0) {
        const resourcesDist = calculatePercentages(resources.resources, 'category');
        setResourcesDistribution(resourcesDist);
      } else {
        setResourcesDistribution([]);
      }

      // Set careers data
      const totalCareers = careersData.jobs?.length || careersData.careers?.length || 0;
      if (careersData.jobs && careersData.jobs.length > 0) {
        setCareers(careersData.jobs.slice(0, 3));
      } else {
        setCareers([]);
      }

      // Set email campaigns
      if (emailCampaignsData.campaigns && emailCampaignsData.campaigns.length > 0) {
        setEmailCampaigns(emailCampaignsData.campaigns.slice(0, 2));
      } else {
        setEmailCampaigns([]);
      }

      // Calculate statistics
      const activeStudents = studentList.filter(s =>
        (s.status || s.Status || '').toLowerCase() === 'active'
      ).length || 0;

      const inactiveStudents = studentList.length - activeStudents;
      const exactStudentTotal = studentsData.data?.stats?.totalStudents || studentsData.data?.pagination?.total || studentList.length || 0;
      const activeAssignments = assignments.assignments?.filter(a =>
        (a.status || '').toLowerCase() === 'assigned'
      ).length || 0;

      const guidanceSessionsCount = guidance.events?.length || 0;
      const completedAssignments = assignments.assignments?.filter(a =>
        (a.status || '').toLowerCase() === 'completed'
      ).length || 0;

      const totalAssignments = assignments.assignments?.length || 1;

      // Update stats
      const updatedStats = {
        totalStudents: exactStudentTotal,
        activeStudents,
        inactiveStudents,
        totalStaff: staff.staff?.length || 0,
        totalSubscribers: subscribers.subscribers?.length || 0,
        pendingEmails: 0,
        activeAssignments,
        totalCareers,
        galleryItems: gallery.galleries?.length || 0,
        guidanceSessions: guidanceSessionsCount,
        totalNews: newsArticles.length || 0,
        completedAssignments,
        totalAssignments,
        totalDepartments,
        totalAchievements: achievementSummaryData.total,
        featuredAchievements: achievementSummaryData.featured
      };

      setStats(updatedStats);

      // Log all dashboard stats for debugging
      console.log('📊 ===== DASHBOARD STATS SUMMARY =====');
      console.log(`👥 Students: ${exactStudentTotal} (${activeStudents} active, ${inactiveStudents} inactive)`);
      console.log(`👨‍💼 Staff: ${staff.staff?.length || 0}`);
      console.log(`📧 Subscribers: ${subscribers.subscribers?.length || 0}`);
      console.log(`📝 Assignments: ${totalAssignments} (${activeAssignments} active, ${completedAssignments} completed)`);
      console.log(`🎓 Guidance Sessions: ${guidanceSessionsCount}`);
      console.log(`📰 News Articles: ${newsArticles.length}`);
      console.log(`🏫 School: Form 1-4, Departments: ${totalDepartments}`);
      console.log(`🎯 Achievements: ${achievementSummaryData.total} (${achievementSummaryData.featured} featured)`);
      console.log(`🏢 Careers: ${totalCareers}`);
      console.log(`📸 Gallery Items: ${gallery.galleries?.length || 0}`);
      console.log('=====================================');

      // Calculate growth metrics with safe defaults
      const guidanceEvents = guidance.events || guidance.sessions || [];
      const currentMonthGuidance = countRecordsByMonth(guidanceEvents, 0);
      const previousMonthGuidance = countRecordsByMonth(guidanceEvents, 1);
      const guidanceGrowth = calculateMonthOverMonthGrowth(currentMonthGuidance, previousMonthGuidance);

// Calculate news growth with safe defaults
const newsItems = newsArticles || [];
const currentMonthNews = countRecordsByMonth(newsItems, 0);
const previousMonthNews = countRecordsByMonth(newsItems, 1);
const newsGrowth = calculateMonthOverMonthGrowth(currentMonthNews, previousMonthNews);

// Calculate gallery growth with safe defaults
const galleryItems = gallery.galleries || gallery.items || [];
const currentMonthGallery = countRecordsByMonth(galleryItems, 0);
const previousMonthGallery = countRecordsByMonth(galleryItems, 1);
const galleryGrowth = calculateMonthOverMonthGrowth(currentMonthGallery, previousMonthGallery);

// Set growth metrics with proper fallback values
setGrowthMetrics({
  guidanceGrowth: isNaN(guidanceGrowth) ? 0 : (guidanceGrowth || 0),
  newsGrowth: isNaN(newsGrowth) ? 0 : (newsGrowth || 0),
  galleryGrowth: isNaN(galleryGrowth) ? 0 : (galleryGrowth || 0)
});



      // ========== RECENT ACTIVITY ==========
      const recentActivities = await listenForRecentActivity();
      setRecentActivity(recentActivities);

      // ========== PERFORMANCE METRICS (excluding engagement) ==========
      const studentGrowth = calculateMonthOverMonthGrowth(
        updatedStats.totalStudents,
        0
      );

      const assignmentGrowth = calculateMonthOverMonthGrowth(
        updatedStats.completedAssignments,
        0
      );

      const performanceMetrics = [
        {
          label: 'Assignment Completion',
          value: Math.round((completedAssignments / totalAssignments) * 100) || 0,
          change: assignmentGrowth,
          color: assignmentGrowth >= 0 ? 'blue' : 'red',
          description: 'Assignment completion rate'
        },
        {
          label: 'Guidance Sessions',
          value: Math.round((guidanceSessionsCount / (studentList.length || 1)) * 100) || 0,
          change: 0,
          color: 'indigo',
          description: 'Student support engagement'
        },
        {
          label: 'SMS Campaigns',
          value: computedSmsStats.total,
          change: 0,
          color: 'green',
          description: 'Total SMS campaigns created'
        }
      ];

      setPerformanceData(performanceMetrics);

      // ========== QUICK STATS ==========
      const quickStatsData = [
        {
          label: 'Mean Score',
          value: currentSchoolStats?.meanScore ? currentSchoolStats.meanScore.toFixed(2) : '—',
          change: currentSchoolStats?.lastYearMean && currentSchoolStats?.meanScore
            ? parseFloat((currentSchoolStats.meanScore - currentSchoolStats.lastYearMean).toFixed(1))
            : 0,
          icon: currentSchoolStats?.meanScore >= currentSchoolStats?.lastYearMean ? FiTrendingUp : FiTrendingDown,
          color: currentSchoolStats?.meanScore >= currentSchoolStats?.lastYearMean ? 'green' : 'red',
          calculation: 'Current academic mean'
        },
        {
          label: 'Assignment Completion',
          value: `${Math.round((completedAssignments / totalAssignments) * 100) || 0}%`,
          change: parseFloat(assignmentGrowth.toFixed(1)),
          icon: assignmentGrowth >= 0 ? FiTrendingUp : FiTrendingDown,
          color: assignmentGrowth >= 0 ? 'green' : 'red',
          calculation: 'Based on assignment completion'
        },
        {
          label: 'Achievements',
          value: `${achievementSummaryData.total}`,
          change: achievementSummaryData.featured,
          icon: achievementSummaryData.total > 0 ? FiAward : FiTrendingDown,
          color: achievementSummaryData.total > 0 ? 'purple' : 'red',
          calculation: `${achievementSummaryData.featured} featured`
        },
        {
          label: 'SMS Campaigns',
          value: `${computedSmsStats.total}`,
          change: 0,
          icon: computedSmsStats.total > 0 ? FiTrendingUp : FiTrendingDown,
          color: computedSmsStats.total > 0 ? 'blue' : 'red',
          calculation: 'Total campaigns'
        },
      ];

      setQuickStats(quickStatsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [checkAuthentication]);

  // Initialize dashboard
  useEffect(() => {
    fetchAllData();

    // Set up polling for recent activity (every 60 seconds)
    const intervalId = setInterval(async () => {
      if (!refreshing) {
        const newActivities = await listenForRecentActivity();
        if (newActivities.length > 0) {
          setRecentActivity(prev => {
            const merged = [...newActivities, ...prev];
            const unique = merged.filter((item, index, self) =>
              index === self.findIndex(t => t.id === item.id)
            );
            return unique.slice(0, 8);
          });
        }
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [fetchAllData, refreshing]);

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  // Quick Tour Modal Component
  const QuickTourModal = () => (
    showQuickTour && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg animate-in fade-in duration-300">
        <div className="relative w-full max-w-5xl mx-auto animate-in zoom-in-95 duration-300">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl">
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/50 py-1.5 pl-3 pr-5 backdrop-blur-md">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
                  <FiPlay className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">School Tour</span>
              </div>

              <button
                onClick={() => setShowQuickTour(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all hover:bg-white/20"
                aria-label="Close video tour"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {schoolVideo?.type === 'youtube' && schoolVideo?.url && extractYouTubeId(schoolVideo.url) ? (
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(schoolVideo.url)}?autoplay=1&rel=0&modestbranding=1`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="School Tour"
              />
            ) : schoolVideo?.url ? (
              isAudioFileUrl(schoolVideo.url) ? (
                <div className="flex h-full w-full items-center justify-center p-6">
                  <div className="w-full max-w-xl">
                    <p className="mb-3 text-center text-sm font-semibold text-white/80">Audio Tour</p>
                    <audio src={schoolVideo.url} className="w-full" autoPlay controls />
                  </div>
                </div>
              ) : (
                <video
                  src={schoolVideo.url}
                  className="h-full w-full object-cover"
                  autoPlay
                  controls
                  poster={schoolVideo.thumbnail}
                />
              )
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
                <FiPlay className="mb-4 h-16 w-16 text-white/30" />
                <p className="text-white/60">No tour video available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );

// StatCard Component
const StatCard = ({ icon: Icon, label, value, change, color, subtitle, trend }) => {
  // Safely handle change value - ensure it's a number and not NaN
  const safeChange = typeof change === 'number' && !isNaN(change) ? change : 0;
  const isPositive = trend === 'up' || safeChange > 0;

  // Safely handle value - ensure it's a number for toLocaleString
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;

  const colorMap = {
    blue: {
      gradient: 'from-blue-500/10 to-blue-500/5',
      text: 'text-blue-600',
      border: 'border-blue-100',
      iconBg: 'bg-blue-50',
      iconBorder: 'border-blue-100',
      iconText: 'text-blue-600'
    },
    green: {
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-50',
      iconBorder: 'border-emerald-100',
      iconText: 'text-emerald-600'
    },
    red: {
      gradient: 'from-rose-500/10 to-rose-500/5',
      text: 'text-rose-600',
      border: 'border-rose-100',
      iconBg: 'bg-rose-50',
      iconBorder: 'border-rose-100',
      iconText: 'text-rose-600'
    },
    purple: {
      gradient: 'from-purple-500/10 to-purple-500/5',
      text: 'text-purple-600',
      border: 'border-purple-100',
      iconBg: 'bg-purple-50',
      iconBorder: 'border-purple-100',
      iconText: 'text-purple-600'
    },
    orange: {
      gradient: 'from-orange-500/10 to-orange-500/5',
      text: 'text-orange-600',
      border: 'border-orange-100',
      iconBg: 'bg-orange-50',
      iconBorder: 'border-orange-100',
      iconText: 'text-orange-600'
    },
    yellow: {
      gradient: 'from-yellow-500/10 to-yellow-500/5',
      text: 'text-yellow-600',
      border: 'border-yellow-100',
      iconBg: 'bg-yellow-50',
      iconBorder: 'border-yellow-100',
      iconText: 'text-yellow-600'
    },
    indigo: {
      gradient: 'from-indigo-500/10 to-indigo-500/5',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-50',
      iconBorder: 'border-indigo-100',
      iconText: 'text-indigo-600'
    },
    teal: {
      gradient: 'from-teal-500/10 to-teal-500/5',
      text: 'text-teal-600',
      border: 'border-teal-100',
      iconBg: 'bg-teal-50',
      iconBorder: 'border-teal-100',
      iconText: 'text-teal-600'
    },
    pink: {
      gradient: 'from-pink-500/10 to-pink-500/5',
      text: 'text-pink-600',
      border: 'border-pink-100',
      iconBg: 'bg-pink-50',
      iconBorder: 'border-pink-100',
      iconText: 'text-pink-600'
    },
    amber: {
      gradient: 'from-amber-500/10 to-amber-500/5',
      text: 'text-amber-600',
      border: 'border-amber-100',
      iconBg: 'bg-amber-50',
      iconBorder: 'border-amber-100',
      iconText: 'text-amber-600'
    }
  };

  const selectedColorScheme = colorMap[color] || colorMap.blue;

  // Format the change display
  const formatChange = () => {
    if (safeChange === 0) return '0%';
    return `${safeChange > 0 ? '+' : ''}${safeChange.toFixed(1)}%`;
  };

  return (
    <div className="group relative bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:scale-[1.02] overflow-hidden">

      {/* Background Decorative Glow */}
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${selectedColorScheme.gradient} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />

      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-3">
          {/* Label Section */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
              {label}
            </span>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              {safeValue.toLocaleString()}
            </h3>
          </div>

          {/* Change & Subtitle Section */}
          <div className="flex flex-col gap-1.5">
            {change !== undefined && (
              <div className={`inline-flex items-center w-fit gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                {isPositive ? (
                  <FiTrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <FiTrendingDown className="w-3.5 h-3.5" />
                )}
                <span className="tabular-nums">{formatChange()}</span>
              </div>
            )}

            {subtitle && (
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Modern Icon Container */}
        <div className={`
          p-4 rounded-2xl bg-gradient-to-br border shadow-sm transition-all duration-300
          group-hover:scale-110 group-hover:rotate-3
          ${selectedColorScheme.iconBg} ${selectedColorScheme.iconBorder} ${selectedColorScheme.iconText}
        `}>
          <Icon className="text-2xl" />
        </div>
      </div>

      {/* Subtle Bottom Border Accent */}
      <div className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r from-transparent ${selectedColorScheme.text} to-transparent opacity-0 group-hover:opacity-30 transition-opacity`} />
    </div>
  );
};

  const PerformanceBar = ({ label, value, change, color, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <span className="font-medium text-gray-700 text-sm block mb-1">{label}</span>
        {description && <span className="text-xs text-gray-500">{description}</span>}
      </div>
      <div className="flex items-center gap-4 flex-1 max-w-xs">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            style={{ width: `${value}%` }}
            className={`bg-${color}-500 h-2 rounded-full shadow-sm`}
          />
        </div>
        <div className="flex items-center gap-1 w-16">
          <span className="text-sm font-bold text-gray-800">{value}%</span>
          {change > 0 ? (
            <FiTrendingUp className="text-green-500 text-sm" />
          ) : (
            <FiTrendingDown className="text-red-500 text-sm" />
          )}
        </div>
      </div>
    </div>
  );

  // Student Population Card Component
  const StudentPopulationCard = () => {
    const formData = Object.entries(studentPopulation.byForm).map(([form, count]) => ({
      name: form,
      students: count,
      fill: form === 'Form 1' ? '#3B82F6' :
             form === 'Form 2' ? '#10B981' :
             form === 'Form 3' ? '#F59E0B' : '#8B5CF6'
    }));

    const streamCount = Object.keys(studentPopulation.byStream || {}).length;

    return (
      <div className="group relative bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]">

        {/* Top Glow Accent */}
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-colors" />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Student Population</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Overview & Distribution</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm transition-transform group-hover:scale-100">
            <FiUsers className="text-xl" />
          </div>
        </div>

        {/* Population Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Students</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-900">{studentPopulation.total}</span>
              <span className="text-xs font-bold text-slate-400">enrolled</span>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Active</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-600">{studentPopulation.active}</span>
              <span className="text-xs font-bold text-slate-400">
                ({studentPopulation.total > 0 ? Math.round((studentPopulation.active / studentPopulation.total) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Form Distribution Chart */}
        <div className="mb-6">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Distribution by Form</h4>
          <div className="space-y-2">
            {formData.map((form, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{form.name}</span>
                  <span className="font-black text-slate-900">{form.students}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${studentPopulation.total > 0 ? (form.students / studentPopulation.total) * 100 : 0}%`,
                      backgroundColor: form.fill
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Register Scope */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Register Scope</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Forms', value: formData.filter(item => item.students > 0).length, color: 'bg-blue-500' },
              { label: 'Streams', value: streamCount, color: 'bg-emerald-500' },
              { label: 'Active', value: studentPopulation.active, color: 'bg-amber-500' }
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center">
                <div className={`mx-auto mb-1 h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="block text-xs font-black text-slate-900">{item.value}</span>
                <span className="text-[10px] font-bold uppercase text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Student Distribution Card Component
  const StudentDistributionCard = () => {
    const streamData = Object.entries(studentPopulation.byStream)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([stream, count]) => ({
        name: stream,
        students: count
      }));

    const formPercentages = Object.entries(studentPopulation.byForm).map(([form, count]) => ({
      form,
      percentage: studentPopulation.total > 0 ? (count / studentPopulation.total) * 100 : 0
    }));

    return (
      <div className="group relative bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]">

        {/* Top Glow Accent */}
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-colors" />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Student Distribution</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Detailed Analysis</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 shadow-sm transition-transform group-hover:scale-100">
            <FiBarChart2 className="text-xl" />
          </div>
        </div>

        {/* Form Distribution Pie Chart */}
        <div className="h-40 mb-6">
          {studentPopulation.total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formPercentages}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="percentage"
                  label={({ form, percentage }) => `${form}: ${percentage.toFixed(1)}%`}
                >
                  {formPercentages.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index % 4]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const form = props.payload?.form || '';
                    const count = studentPopulation.byForm[form] || 0;
                    return [`${value.toFixed(1)}% (${count} students)`, 'Percentage'];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              No student data available
            </div>
          )}
        </div>

        {/* Top Streams */}
        <div className="mb-4">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Top Streams</h4>
          <div className="space-y-2">
            {streamData.length > 0 ? (
              streamData.map((stream, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 truncate">{stream.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{stream.students}</span>
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${studentPopulation.total > 0 ? (stream.students / studentPopulation.total) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-2">No stream data available</p>
            )}
          </div>
        </div>

        {/* Status Summary */}
        <div className="pt-4 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Active</span>
              <div className="text-lg font-black text-emerald-700">{studentPopulation.active}</div>
            </div>
            <div className="text-center p-2 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Inactive</span>
              <div className="text-lg font-black text-rose-700">{studentPopulation.inactive}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AcademicPerformanceSummary = () => {
    const meanScore = Number(schoolStats?.meanScore) || 0;
    const lastYearMean = Number(schoolStats?.lastYearMean) || 0;
    const targetMean = Number(schoolStats?.targetMean) || 0;
    const targetProgress = targetMean > 0 ? Math.min(100, Math.round((meanScore / targetMean) * 100)) : 0;
    const meanChange = lastYearMean ? (meanScore - lastYearMean) : 0;
    const assignmentCompletion = stats.totalAssignments > 0
      ? Math.round((stats.completedAssignments / stats.totalAssignments) * 100)
      : 0;

    return (
      <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Academic Performance</p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">Mean Score Summary</h3>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700">
            <IoStatsChart className="text-xl" />
          </div>
        </div>

        <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Mean</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{meanScore ? meanScore.toFixed(2) : '—'}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Mean</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{targetMean ? targetMean.toFixed(2) : '—'}</p>
          </div>
        </div>

        <div className="relative z-10 mt-5 space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Target progress</span>
              <span>{targetProgress}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-600 transition-all duration-700" style={{ width: `${targetProgress}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Year Change</p>
              <p className={`mt-1 text-lg font-black ${meanChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {lastYearMean ? `${meanChange >= 0 ? '+' : ''}${meanChange.toFixed(2)}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assignments</p>
              <p className="mt-1 text-lg font-black text-slate-900">{assignmentCompletion}% complete</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AchievementInsightsCard = () => {
    const trendData = achievementSummary.byYear.length > 0
      ? achievementSummary.byYear
      : [{ year: 'No data', value: 0 }];

    return (
      <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Achievement Analytics</p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">Trends & Categories</h3>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-amber-700">
            <FiAward className="text-xl" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Honors</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{achievementSummary.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Featured</p>
            <p className="mt-1 text-3xl font-black text-amber-600">{achievementSummary.featured}</p>
          </div>
        </div>

        <div className="mt-5 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" fill="#d97706" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {achievementSummary.byCategory.length > 0 ? achievementSummary.byCategory.map((item) => (
            <span key={item.name} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
              {item.name}: {item.value}
            </span>
          )) : (
            <span className="text-xs font-bold text-slate-400">No achievement records yet</span>
          )}
        </div>
      </div>
    );
  };

  const SchoolPerformanceHighlights = () => {
    const highlights = [
      { label: 'Departments', value: stats.totalDepartments, icon: FiLayers, tone: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
      { label: 'Students', value: stats.totalStudents, icon: FiUsers, tone: 'text-blue-600 bg-blue-50 border-blue-100' },
      { label: 'Resources', value: resourcesDistribution.reduce((sum, item) => sum + item.value, 0), icon: FiBookOpen, tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
      { label: 'Careers', value: stats.totalCareers, icon: FiBriefcase, tone: 'text-amber-600 bg-amber-50 border-amber-100' }
    ];

    return (
      <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">School Highlights</p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">Operational Snapshot</h3>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
            <IoSchool className="text-xl" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {highlights.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className={`rounded-2xl border p-4 ${tone}`}>
              <Icon className="mb-3 h-5 w-5" />
              <p className="text-2xl font-black text-slate-950">{Number(value || 0).toLocaleString()}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Active student register</span>
            <span>{studentPopulation.total > 0 ? Math.round((studentPopulation.active / studentPopulation.total) * 100) : 0}% active</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${studentPopulation.total > 0 ? (studentPopulation.active / studentPopulation.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <ModernLoadingSpinner
        message="Loading dashboard data..."
        size="medium"
      />
    );
  }

  return (
    <>
      <QuickTourModal />

      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="group relative bg-[#0F172A] rounded-xl md:rounded-[2rem] p-5 md:p-8 text-white overflow-hidden shadow-2xl border border-white/5 transition-all duration-500 ">

          {/* Abstract Mesh Gradient Background */}
          <div className="absolute top-[-25%] right-[-10%] w-[250px] h-[250px] md:w-[420px] md:h-[420px] bg-blue-600/25 rounded-full blur-[100px] pointer-events-none  transition-transform duration-700" />
          <div className="absolute bottom-[-25%] left-[-10%] w-[200px] h-[200px] md:w-[340px] md:h-[340px] bg-purple-600/15 rounded-full blur-[80px] pointer-events-none  transition-transform duration-700" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
              <div>
                {/* Institutional Branding - Compact Version */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="h-6 w-1 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,99,235,0.4)]" />
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">
                      Katwanyaa Senior School
                    </h2>
                    <p className="text-[9px] italic font-medium text-white/50 tracking-widest uppercase">
                      "Education is light"
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  {/* Sparkle Icon with Zoom Effect */}
                  <div className="p-2 sm:p-2.5 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/10 w-fit transition-transform group-hover:rotate-12">
                    <IoSparkles className="text-xl sm:text-2xl text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.5)]" />
                  </div>
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-blue-200">{user?.name || 'Admin'}</span>!
                  </h1>
                </div>
              </div>

              {/* Modern Glass Refresh Button */}
              <button
                onClick={refreshDashboard}
                disabled={refreshing}
                className="flex items-center justify-center gap-2.5 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[12px] tracking-wide transition-all hover:bg-white/20 active:scale-95 disabled:opacity-50 w-full sm:w-fit"
              >
                <FiRefreshCw className={`text-base transition-transform ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'UPDATING...' : 'REFRESH DATA'}</span>
              </button>
            </div>

            {/* Summary Text */}
            <div className="mb-6">
              <p className="text-blue-100/70 text-sm sm:text-[15px] font-medium leading-relaxed max-w-3xl">
                Overseeing <span className="text-white font-bold underline decoration-blue-500/40 decoration-1 underline-offset-4">{stats.totalStudents} students</span> and <span className="text-white font-bold underline decoration-purple-500/40 decoration-1 underline-offset-4">{stats.totalStaff} staff</span>.
                You have <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-yellow-400/15 text-yellow-300 border border-yellow-400/10 mx-1 text-[11px]">{stats.activeAssignments} tasks</span>
                and <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-500/15 text-green-400 border border-green-500/10 mx-1 text-[11px]">{stats.totalCareers} careers</span> listed.
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={() => setShowQuickTour(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg sm:rounded-xl font-bold text-[12px] uppercase tracking-wider shadow-lg transition-all active:scale-95 w-full sm:w-auto"
              >
                <FiPlay className="text-xs" />
                Video Tour
              </button>

              <div className="hidden sm:block h-8 w-[1px] bg-white/10 mx-1" />

              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] text-center sm:text-left">
                Status: <span className="text-emerald-400/80">Operational</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => {
            const isPositive = stat.change >= 0;

            const colorStyles = {
              blue: 'bg-blue-50 border-blue-100 text-blue-600 glow-blue',
              green: 'bg-emerald-50 border-emerald-100 text-emerald-600 glow-emerald',
              emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600 glow-emerald',
              purple: 'bg-purple-50 border-purple-100 text-purple-600 glow-purple',
              amber: 'bg-amber-50 border-amber-100 text-amber-600 glow-amber',
              red: 'bg-rose-50 border-rose-100 text-rose-600 glow-rose',
              rose: 'bg-rose-50 border-rose-100 text-rose-600 glow-rose'
            };

            const style = colorStyles[stat.color] || colorStyles.blue;

            return (
              <div
                key={index}
                className="group relative bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]  overflow-hidden"
              >
                {/* Background Accent Blur */}
                <div className={`absolute -right-2 -top-2 h-20 w-20 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity ${style}`} />

                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                      {stat.label}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">
                        {stat.value}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 italic">
                        {stat.calculation}
                      </span>
                    </div>
                  </div>

                  {/* Modern Icon Pod */}
                  <div className={`p-3.5 rounded-2xl border shadow-sm transition-transform group-hover:scale-100 duration-500 ${style}`}>
                    <stat.icon className="text-xl" />
                  </div>
                </div>

                {/* Trend Footer */}
                <div className="mt-6 flex items-center justify-between relative z-10">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-tight border ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {isPositive ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
                    <span>{isPositive ? '+' : ''}{stat.change}%</span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    vs. Last Month
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Stats Grid - Updated with SMS Overview Card replacing Student Engagement */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* SMS Overview Card (replaces Student Engagement) */}
          <SmsOverviewCard smsStats={smsStats} recentCampaigns={recentSmsCampaigns} />

          {/* Staff Distribution Card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Staff Distribution</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Department Breakdown</p>
              </div>
              <FiUsers className="text-2xl text-blue-600" />
            </div>
            {staffDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={staffDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={4}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {staffDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6366F1'][index % 6]}
                          stroke="#fff"
                          strokeWidth={3}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => {
                        const total = staffDistribution.reduce((sum, item) => sum + item.value, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return [`${value} staff (${percentage}%)`, 'Department'];
                      }}
                      contentStyle={{
                        borderRadius: '12px',
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.97)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        border: '2px solid #e5e7eb',
                        fontSize: '8px',
                        fontWeight: 'bold'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Department breakdown */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {staffDistribution.map((dept, index) => {
                    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#F43F5E', '#6366F1'];
                    const currentColor = colors[index % colors.length];

                    return (
                      <div
                        key={index}
                        className="group/dept flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl transition-all duration-300 hover:shadow-md hover:border-slate-200 "
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: currentColor }}
                            />
                            <div
                              className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-0 group-hover/dept:opacity-40"
                              style={{ backgroundColor: currentColor }}
                            />
                          </div>

                          <span className="text-xs font-bold text-slate-600 truncate tracking-tight group-hover/dept:text-slate-900 transition-colors">
                            {dept.name}
                          </span>
                        </div>

                        {/* Counter Badge */}
                        <div
                          className="ml-2 px-2.5 py-1 rounded-lg text-[11px] font-black tabular-nums transition-all"
                          style={{
                            backgroundColor: `${currentColor}10`,
                            color: currentColor
                          }}
                        >
                          {dept.value.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center">
                <FiUsers className="text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No staff data available</p>
                <p className="text-gray-400 text-sm mt-1">Staff information will appear here</p>
              </div>
            )}
          </div>

          {/* Academic Content Card */}
          <div className="group relative bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* Decorative Glow */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Academic Content</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Distribution</p>
              </div>
              <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 shadow-sm transition-transform group-hover:scale-100">
                <FiBook className="text-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* Assignments Column */}
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white transition-colors">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  Assignments
                </h4>
                {assignmentsDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {assignmentsDistribution.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">{item.name}</span>
                          <span className="font-black text-slate-900 tabular-nums">{item.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic py-2">No assignment data available</p>
                )}
              </div>

              {/* Resources Column */}
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white transition-colors">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Resources
                </h4>
                {resourcesDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {resourcesDistribution.slice(0, 3).map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">{item.name}</span>
                          <span className="font-black text-slate-900 tabular-nums">{item.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic py-2">No resource data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Core School Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            icon={FiUsers}
            label="Students"
            value={stats.totalStudents}
            change={0}
            trend="up"
            color="blue"
            subtitle={`${stats.activeStudents || 0} active records`}
          />
          <StatCard
            icon={IoPeopleCircle}
            label="Staff"
            value={stats.totalStaff}
            change={0}
            trend="up"
            color="green"
            subtitle="Profiles from staff API"
          />
          <StatCard
            icon={FiLayers}
            label="Departments"
            value={stats.totalDepartments}
            change={0}
            trend="up"
            color="indigo"
            subtitle="Active department groups"
          />
          <StatCard
            icon={FiAward}
            label="Achievements"
            value={stats.totalAchievements}
            trend="up"
            color="amber"
            subtitle={`${stats.featuredAchievements || 0} featured honors`}
          />
        </div>

        {/* Academic, Achievement, and School Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <AcademicPerformanceSummary />
          <AchievementInsightsCard />
          <SchoolPerformanceHighlights />
        </div>

        {/* Additional Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={FiBriefcase}
            label="Total Careers"
            value={stats.totalCareers}
            change={0}
            trend="up"
            color="green"
            subtitle="Career opportunities"
          />
          <StatCard
            icon={FiMessageCircle}
            label="Guidance Sessions"
            value={stats.guidanceSessions}
            change={parseFloat(growthMetrics.guidanceGrowth)}
            trend={parseFloat(growthMetrics.guidanceGrowth) >= 0 ? "up" : "down"}
            color="teal"
            subtitle="Counseling sessions"
          />
          <StatCard
            icon={FiImage}
            label="Gallery Items"
            value={stats.galleryItems}
            change={parseFloat(growthMetrics.galleryGrowth)}
            trend={parseFloat(growthMetrics.galleryGrowth) >= 0 ? "up" : "down"}
            color="pink"
            subtitle="Media content"
          />

          <StatCard
            icon={IoNewspaper}
            label="News Articles"
            value={stats.totalNews}
            change={parseFloat(growthMetrics.newsGrowth)}
            trend={parseFloat(growthMetrics.newsGrowth) >= 0 ? "up" : "down"}
            color="amber"
            subtitle="Published news"
          />


        </div>

        {/* Email Campaigns with Student Population Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Campaigns Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group h-full">
              {/* Decorative Glow */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-red-500/10 to-transparent blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Email Campaigns</h3>
                  <p className="text-xs text-slate-400 font-medium">Recent marketing performance</p>
                </div>
                <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 shadow-sm">
                  <FiMail className="text-xl" />
                </div>
              </div>

              {emailCampaigns.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  {emailCampaigns.map((campaign) => {
                    const recipients = campaign.recipients ? campaign.recipients.split(',').length : 0;
                    const isPublished = campaign.status === 'published';

                    return (
                      <div key={campaign.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md hover:border-slate-200 transition-all duration-300 group/item">
                        <p className="font-bold text-sm text-slate-800 mb-3 truncate">{campaign.title}</p>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Recipients</span>
                            <span className="text-slate-900 font-black tabular-nums bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">
                              {recipients.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Status</span>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-black uppercase tracking-tighter ${
                              isPublished ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                              {campaign.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                  <FiMail className="text-3xl text-slate-200 mb-2" />
                  <p className="text-slate-400 text-sm font-medium">No active campaigns found</p>
                </div>
              )}
            </div>

          </div>

          {/* Student Population Card */}
          <StudentPopulationCard />
        </div>

        {/* Student Distribution and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudentDistributionCard />

          {/* Recent Activity Card */}
          <div className="group relative bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* Decorative Glow */}
            <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl opacity-50 transition-opacity group-hover:opacity-80" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    History Log
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mt-1">
                    Recent Activity
                  </h2>
                </div>
                <button
                  onClick={refreshDashboard}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 text-blue-600 font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm active:scale-95"
                >
                  Refresh
                  <FiRefreshCw className="text-sm" />
                </button>
              </div>

              {/* Timeline Content */}
              <div className="relative space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {/* The Timeline Track Line */}
                <div className="absolute left-6 top-2 bottom-2 w-[2px] bg-slate-100 hidden sm:block" />

                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="group/item flex flex-col sm:flex-row sm:items-center gap-4 relative transition-all duration-300 "
                    >
                      {/* Icon Container with Timeline Pulse */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-all duration-300 group-hover/item:shadow-md `}>
                          {/* Subtle Inner Tint */}
                          <div className={`absolute inset-1.5 rounded-xl opacity-10 bg-${activity.color}-500`} />
                          <activity.icon className={`text-xl text-${activity.color}-600 relative z-10`} />
                        </div>
                      </div>

                      {/* Action Text */}
                      <div className="flex-1 space-y-0.5">
                        <p className="font-bold text-slate-800 text-[15px] leading-tight group-hover/item:text-blue-600 transition-colors">
                          {activity.action}
                        </p>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">
                          {activity.target}
                        </p>
                      </div>

                      {/* Timestamp Badge */}
                      <div className="flex sm:block">
                        <span className="inline-block text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg group-hover/item:bg-white group-hover/item:border-slate-200 transition-all">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                    <FiStar className="text-4xl mb-2" />
                    <p className="font-bold uppercase tracking-widest text-xs">No Recent Activity</p>
                    <p className="text-xs text-slate-400 mt-1">Recent submissions will appear here</p>
                  </div>
                )}
              </div>

              {/* Auto-refresh notice */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center">
                  Updates automatically every few minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
