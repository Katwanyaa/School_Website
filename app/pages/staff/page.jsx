'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiMail, 
  FiPhone, 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiChevronDown, 
  FiChevronRight, 
  FiBriefcase,
  FiCalendar, 
  FiUser,
  FiX,
  FiArrowLeft,
  FiArrowRight,
  FiMapPin,
  FiAward,
  FiStar,
  FiBook,
  FiTarget,
  FiUsers,
  FiBookOpen,
  FiRefreshCw,
  FiSettings,
  FiHeart,
  FiCpu,
  FiGlobe,
  FiActivity,
  FiLayers,
  FiShield,
  FiCrown,
  FiTrendingUp
} from 'react-icons/fi';
import { toast } from 'sonner';
import { SiGmail } from 'react-icons/si';

// ==========================================
// 1. ENHANCED CONFIGURATION WITH HIERARCHY
// ==========================================

const HIERARCHY_ICONS = {
  leadership: FiShield,
  teaching: FiBookOpen,
  support: FiSettings,
};

const DEPT_ICONS = {
  administration: FiShield,
  sciences: FiActivity,
  mathematics: FiTarget,
  languages: FiGlobe,
  humanities: FiBook,
  guidance: FiHeart,
  sports: FiAward,
  technical: FiCpu,
  support: FiSettings,
};

const STAFF_HIERARCHY = [
  {
    level: 'leadership',
    label: 'School Leadership',
    color: 'blue',
    positions: ['Principal', 'Deputy Principal']
  },
  {
    level: 'teaching',
    label: 'Teaching Staff',
    color: 'emerald',
    positions: ['Teacher', 'Subject Teacher', 'Class Teacher', 'Assistant Teacher', 'Senior Teacher', 'Head of Department']
  },
  {
    level: 'support',
    label: 'Support Staff',
    color: 'orange',
    positions: ['Librarian', 'Laboratory Technician', 'Accountant', 'Secretary', 'Support Staff']
  }
];

const DEPARTMENTS = [
  { id: 'administration', label: 'Administration', color: 'blue', hierarchy: 'leadership' },
  { id: 'sciences', label: 'Sciences', color: 'emerald', hierarchy: 'teaching' },
  { id: 'mathematics', label: 'Mathematics', color: 'orange', hierarchy: 'teaching' },
  { id: 'languages', label: 'Languages', color: 'violet', hierarchy: 'teaching' },
  { id: 'humanities', label: 'Humanities', color: 'amber', hierarchy: 'teaching' },
  { id: 'guidance', label: 'Guidance & Counseling', color: 'pink', hierarchy: 'support' },
  { id: 'sports', label: 'Sports & Athletics', color: 'teal', hierarchy: 'teaching' },
  { id: 'technical', label: 'Technical & IT', color: 'cyan', hierarchy: 'support' },
  { id: 'support', label: 'Support Staff', color: 'slate', hierarchy: 'support' }
];

const ITEMS_PER_PAGE = 12;

// ==========================================
// 2. ENHANCED UTILITY FUNCTIONS WITH HIERARCHY
// ==========================================

const generateSlug = (name, id) => {
  const cleanName = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  return `${cleanName}-${id}`;
};

const getBadgeColorStyles = (colorName) => {
  const map = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    pink: 'bg-pink-50 text-pink-700 border-pink-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return map[colorName] || map.slate;
};

const FILTER_BUTTON_STYLES = {
  all: {
    base: 'border-[#334155] bg-[#334155] text-white',
    active: 'border-[#0f172a] bg-[#0f172a] text-white shadow-[0_0_0_2px_rgba(255,255,255,0.9),0_0_0_6px_rgba(15,23,42,0.18)]',
    count: 'bg-white/20 text-white',
  },
  leadership: {
    base: 'border-[#1e3a5f] bg-[#1e3a5f] text-white',
    active: 'border-[#0f2743] bg-[#0f2743] text-white shadow-[0_0_0_2px_rgba(255,255,255,0.9),0_0_0_6px_rgba(30,58,95,0.24)]',
    count: 'bg-white/20 text-white',
  },
  teaching: {
    base: 'border-[#1f5f3a] bg-[#1f5f3a] text-white',
    active: 'border-[#154529] bg-[#154529] text-white shadow-[0_0_0_2px_rgba(255,255,255,0.9),0_0_0_6px_rgba(31,95,58,0.24)]',
    count: 'bg-white/20 text-white',
  },
  support: {
    base: 'border-[#6f1d3d] bg-[#6f1d3d] text-white',
    active: 'border-[#54122d] bg-[#54122d] text-white shadow-[0_0_0_2px_rgba(255,255,255,0.9),0_0_0_6px_rgba(111,29,61,0.24)]',
    count: 'bg-white/20 text-white',
  },
};

const getImageSrc = (staff) => {
  if (staff?.image) {
    if (staff.image.startsWith('/')) {
      return `${process.env.NEXT_PUBLIC_SITE_URL || ''}${staff.image}`;
    }
    if (staff.image.startsWith('http')) return staff.image;
  }
  return '/images/default-staff.jpg';
};

const getStaffHierarchy = (position) => {
  if (!position) return 'teaching';
  
  const positionLower = position.toLowerCase();
  if (positionLower.includes('senior teacher')) {
    return 'teaching';
  }
  if (
    (positionLower.includes('principal') || positionLower.includes('deputy principal')) &&
    !positionLower.includes('senior') &&
    !positionLower.includes('head')
  ) {
    return 'leadership';
  } else if (
    positionLower.includes('teacher') ||
    positionLower.includes('lecturer') ||
    positionLower.includes('tutor') ||
    positionLower.includes('senior') ||
    positionLower.includes('head')
  ) {
    return 'teaching';
  } else {
    return 'support';
  }
};

const sortStaffByHierarchy = (staff) => {
  const hierarchyOrder = { leadership: 1, teaching: 2, support: 3 };
  
  return [...staff].sort((a, b) => {
    const aHierarchy = getStaffHierarchy(a.position);
    const bHierarchy = getStaffHierarchy(b.position);
    
    if (hierarchyOrder[aHierarchy] !== hierarchyOrder[bHierarchy]) {
      return hierarchyOrder[aHierarchy] - hierarchyOrder[bHierarchy];
    }
    
    if (aHierarchy === 'leadership' && bHierarchy === 'leadership') {
      const aIsPrincipal =
        a.position?.toLowerCase().includes('principal') &&
        !a.position?.toLowerCase().includes('deputy');
      const bIsPrincipal =
        b.position?.toLowerCase().includes('principal') &&
        !b.position?.toLowerCase().includes('deputy');
      
      if (aIsPrincipal && !bIsPrincipal) return -1;
      if (!aIsPrincipal && bIsPrincipal) return 1;
      
      return (a.name || '').localeCompare(b.name || '');
    }
    
    return (a.name || '').localeCompare(b.name || '');
  });
};

const isPrincipalStaff = (staff) => {
  const role = (staff?.role || '').toLowerCase();
  const position = (staff?.position || '').toLowerCase();
  return (
    (role.includes('principal') || position.includes('principal')) &&
    !role.includes('deputy') &&
    !position.includes('deputy')
  );
};

// Sort other leadership: Administration Deputy first, then Academic Deputy, then others by name
const sortOtherLeadership = (leadershipArray) => {
  return [...leadershipArray].sort((a, b) => {
    const aPos = a.position?.toLowerCase() || '';
    const bPos = b.position?.toLowerCase() || '';
    
    const aIsAdminDep = aPos.includes('administration') && aPos.includes('deputy');
    const bIsAdminDep = bPos.includes('administration') && bPos.includes('deputy');
    if (aIsAdminDep && !bIsAdminDep) return -1;
    if (!aIsAdminDep && bIsAdminDep) return 1;
    
    const aIsAcademicDep = aPos.includes('academic') && aPos.includes('deputy');
    const bIsAcademicDep = bPos.includes('academic') && bPos.includes('deputy');
    if (aIsAcademicDep && !bIsAcademicDep) return -1;
    if (!aIsAcademicDep && bIsAcademicDep) return 1;
    
    // If both are deputy principals but not specifically admin/academic, sort by name
    return (a.name || '').localeCompare(b.name || '');
  });
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export default function StaffDirectory() {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHierarchy, setSelectedHierarchy] = useState('all');

  // Department groupings (public, privacy-safe)
  const [departmentsByCategory, setDepartmentsByCategory] = useState({
    CBC: [],
    EIGHT_FOUR_FOUR: [],
    TEACHING: [],
    SUPPORT: []
  });
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);

  const [showConsultModal, setShowConsultModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [consultForm, setConsultForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    subject: '',
    inquiryType: 'general',
    contactMethod: 'email',
    studentGrade: '',
    staffId: '',
    staffName: '',
    staffEmail: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleContactClick = (staff) => {
    if (getStaffHierarchy(staff?.position) === 'leadership') return;
    setSelectedStaff(staff);
    setConsultForm((previous) => ({
      ...previous,
      staffId: staff.id,
      staffName: staff.name,
      staffEmail: staff.email,
      subject: `Inquiry for ${staff.name}`
    }));
    setShowConsultModal(true);
  };

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: consultForm.name,
        email: consultForm.email,
        phone: consultForm.phone,
        message: consultForm.message,
        subject: consultForm.subject || `Consultation with ${selectedStaff.name}`,
        studentDetails: consultForm.studentGrade,
        inquiryType: consultForm.inquiryType,
        contactMethod: consultForm.contactMethod,
        teacherId: selectedStaff.id,
        teacherName: selectedStaff.name,
        teacherEmail: selectedStaff.email,
        teacherPosition: selectedStaff.position
      };

      const response = await fetch('/api/contactTeacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Your inquiry has been received. The teacher will respond shortly.');
        setShowConsultModal(false);
        setConsultForm({
          name: '',
          email: '',
          phone: '',
          message: '',
          subject: '',
          inquiryType: 'general',
          contactMethod: 'email',
          studentGrade: '',
          staffId: '',
          staffName: '',
          staffEmail: ''
        });
      } else {
        throw new Error(data.error || 'Failed to send consultation request');
      }
    } catch (error) {
      console.error('Error sending consultation:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch staff data: ${response.status}`);
      }
      
      if (data.success && data.staff) {
        const mappedStaff = data.staff.map(staff => ({
          id: staff.id,
          name: staff.name,
          role: staff.role,
          position: staff.position || staff.role || '',
          department: staff.department || 'Administration',
          departmentId: (staff.department || 'Administration').toLowerCase().replace(/\s+/g, '-'),
          email: staff.email || '',
          phone: staff.phone || '',
          image: staff.image,
          expertise: Array.isArray(staff.expertise) ? staff.expertise : [],
          bio: staff.bio,
          responsibilities: Array.isArray(staff.responsibilities) ? staff.responsibilities : [],
          achievements: Array.isArray(staff.achievements) ? staff.achievements : [],
          location: 'Katwanyaa Senior School',
          joinDate: '2020'
        }));
        
        const sortedStaff = sortStaffByHierarchy(mappedStaff);
        setStaffData(sortedStaff);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err) {
      console.error('Error fetching staff data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
    fetchDepartmentsData();
  }, []);

  async function fetchDepartmentsData() {
    try {
      setDepartmentsLoading(true);
      const response = await fetch('/api/staff/departments?grouped=1', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch departments: ${response.status}`);
      }
      if (data.success) {
        const grouped = data.departmentsByCategory || {};
        setDepartmentsByCategory({
          CBC: grouped.CBC || [],
          EIGHT_FOUR_FOUR: grouped.EIGHT_FOUR_FOUR || [],
          TEACHING: grouped.TEACHING || [],
          SUPPORT: grouped.SUPPORT || []
        });
      } else {
        throw new Error(data.error || 'Invalid departments response');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartmentsByCategory({ CBC: [], EIGHT_FOUR_FOUR: [], TEACHING: [], SUPPORT: [] });
    } finally {
      setDepartmentsLoading(false);
    }
  }

  const filteredStaff = useMemo(() => {
    return staffData.filter(staff => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        staff.name.toLowerCase().includes(searchLower) ||
        staff.role.toLowerCase().includes(searchLower) ||
        (staff.position || '').toLowerCase().includes(searchLower) ||
        (staff.bio && staff.bio.toLowerCase().includes(searchLower)) ||
        staff.expertise.some(exp => exp.toLowerCase().includes(searchLower));

      const staffHierarchy = getStaffHierarchy(staff.position);
      const matchesHierarchy = selectedHierarchy === 'all' || selectedHierarchy === staffHierarchy;

      return matchesSearch && matchesHierarchy;
    });
  }, [staffData, searchQuery, selectedHierarchy]);

  const staffByHierarchy = useMemo(() => {
    const leadership = filteredStaff.filter(staff => getStaffHierarchy(staff.position) === 'leadership');
    const teaching = filteredStaff.filter(staff => getStaffHierarchy(staff.position) === 'teaching');
    const support = filteredStaff.filter(staff => getStaffHierarchy(staff.position) === 'support');
    
    // Sort leadership with principal first
    const sortedLeadership = [...leadership].sort((a, b) => {
      const aIsPrincipal =
        a.position?.toLowerCase().includes('principal') &&
        !a.position?.toLowerCase().includes('deputy');
      const bIsPrincipal =
        b.position?.toLowerCase().includes('principal') &&
        !b.position?.toLowerCase().includes('deputy');
      
      if (aIsPrincipal && !bIsPrincipal) return -1;
      if (!aIsPrincipal && bIsPrincipal) return 1;
      
      return (a.name || '').localeCompare(b.name || '');
    });
    
    return {
      leadership: sortedLeadership,
      teaching: [...teaching].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
      support: [...support].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    };
  }, [filteredStaff]);

  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStaff.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStaff, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedHierarchy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedHierarchy('all');
  };

  // Extract principal and other leadership for special rendering
  const leadershipStaff = staffByHierarchy.leadership;
  const principalStaff = leadershipStaff.find(staff => isPrincipalStaff(staff));
  const otherLeadershipStaff = sortOtherLeadership(leadershipStaff.filter(staff => !isPrincipalStaff(staff)));

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <FiUser className="text-xl text-red-500" />
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-2">Error Loading Directory</h2>
          <p className="text-sm text-slate-500 mb-5">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#1a1a2e] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#2d2d44] transition-colors w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3 lg:flex-row lg:items-center lg:justify-between">
          
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#244863] to-[#d7a73d] p-[1px] shadow-sm">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white">
                <Image src="/katz.jpeg" alt="Logo" width={28} height={28} className="rounded-xl object-cover" />
              </div>
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-[#1a1a2e]">
                Katwanyaa Senior School
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Staff Directory</p>
            </div>
          </Link>

          <div className="flex flex-1 flex-col gap-3 lg:max-w-3xl lg:flex-row lg:items-center lg:justify-end">
            <div className="relative w-full lg:max-w-md">
              <FiSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search names, subjects..."
                className="w-full rounded-lg sm:rounded-2xl border border-slate-200 bg-white py-2.5 sm:py-3 pl-10 sm:pl-11 pr-9 sm:pr-10 text-xs sm:text-sm font-bold shadow-sm outline-none transition-all focus:border-[#1a1a2e] focus:ring-4 focus:ring-[#1a1a2e]/5"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <FiX size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={fetchStaffData}
                disabled={loading}
                className="flex items-center gap-1 rounded-lg sm:rounded-xl border border-slate-200 px-2.5 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold text-slate-600 transition-all hover:border-[#1a1a2e] hover:text-[#1a1a2e] disabled:opacity-50 whitespace-nowrap"
              >
                <FiRefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
              
              <div className="flex rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 p-0.5 sm:p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md p-1.5 sm:p-2 transition-all ${viewMode === 'grid' ? 'bg-[#1a1a2e] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <FiGrid size={12} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-md p-1.5 sm:p-2 transition-all ${viewMode === 'list' ? 'bg-[#1a1a2e] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <FiList size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Banner - Dark Blue Theme ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0c1a2f] to-[#0f1f3a]">
        {/* Premium dark blue gradient overlay with subtle pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.15),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(37,99,235,0.12),_transparent_55%),linear-gradient(145deg,_rgba(255,255,255,0.02)_0%,_transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="white" stroke-width="0.5"/%3E%3C/svg%3E")', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 mb-4 backdrop-blur-sm">
                <FiStar className="text-[#f8c95f] w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/90">Excellence in Education</span>
              </div>
              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-6xl">
                Meet the dedicated team shaping the next generation.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-blue-100/85 sm:text-base sm:leading-relaxed">
                Explore school leadership and browse each department to see the teachers mapped to that learning area.
              </p>
              <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                <div className="rounded-full border border-white/15 bg-white/8 px-5 py-2 text-xs font-semibold text-white/85 backdrop-blur-sm">
                  Departments first, leadership preserved
                </div>
                <div className="rounded-full border border-white/15 bg-white/8 px-5 py-2 text-xs font-semibold text-white/85 backdrop-blur-sm">
                  Teachers grouped under valid departments
                </div>
              </div>
            </div>

            {!loading ? (
              <div className="rounded-2xl border border-white/15 bg-white/8 p-5 shadow-2xl backdrop-blur-md sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-200/50">Directory Snapshot</p>
                    <p className="mt-1 text-xl font-black text-white">Staff overview</p>
                  </div>
                  <div className="rounded-full bg-[#f8c95f] px-4 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#0a1628] shadow-lg">
                    {staffData.length} Total
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/15 bg-white/6 px-3 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <FiShield size={14} className="text-[#f8c95f]" />
                      <div className="min-w-0">
                        <span className="block text-xl font-black text-white">{staffByHierarchy.leadership.length}</span>
                        <span className="block text-[8px] font-semibold uppercase tracking-[0.2em] text-blue-200/50">Leadership</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/6 px-3 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <FiUsers size={14} className="text-[#f8c95f]" />
                      <div className="min-w-0">
                        <span className="block text-xl font-black text-white">
                          {(departmentsByCategory.CBC?.length || 0) +
                           (departmentsByCategory.EIGHT_FOUR_FOUR?.length || 0) +
                           (departmentsByCategory.TEACHING?.length || 0) +
                           (departmentsByCategory.SUPPORT?.length || 0)}
                        </span>
                        <span className="block text-[8px] font-semibold uppercase tracking-[0.2em] text-blue-200/50">Departments</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-blue-200/60">
                  {`${staffData.length} dedicated professionals shaping the future`}
                </p>
              </div>
            ) : (
              <p className="max-w-md text-sm text-blue-200/50 animate-pulse">
                Discovering our talented educators...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Top Filter Bar ── */}
      <div className="sticky top-[140px] z-20 border-b border-slate-100 bg-slate-50/88 backdrop-blur-sm sm:top-[82px] lg:top-[73px]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-1.5 py-2.5 sm:gap-2 sm:py-3.5 overflow-x-auto scrollbar-hide -mx-0.5 px-0.5 sm:-mx-1 sm:px-1">
            {[
              {
                key: 'all',
                label: 'All',
                Icon: FiUsers,
                count:
                  staffByHierarchy.leadership.length +
                  (departmentsByCategory.CBC?.length || 0) +
                  (departmentsByCategory.EIGHT_FOUR_FOUR?.length || 0) +
                  (departmentsByCategory.TEACHING?.length || 0) +
                  (departmentsByCategory.SUPPORT?.length || 0),
              },
              { key: 'leadership', label: 'Leadership', Icon: FiShield, count: staffByHierarchy.leadership?.length || 0 },
              {
                key: 'teaching',
                label: 'Teaching',
                Icon: FiBookOpen,
                count:
                  (departmentsByCategory.CBC?.length || 0) +
                  (departmentsByCategory.EIGHT_FOUR_FOUR?.length || 0) +
                  (departmentsByCategory.TEACHING?.length || 0),
              },
              { key: 'support', label: 'Support', Icon: FiSettings, count: departmentsByCategory.SUPPORT?.length || 0 },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setSelectedHierarchy(item.key)}
                className={`flex-shrink-0 flex items-center gap-1 sm:gap-2 rounded-full border px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-black transition-[box-shadow,filter] whitespace-nowrap ${
                  selectedHierarchy === item.key
                    ? FILTER_BUTTON_STYLES[item.key].active
                    : `${FILTER_BUTTON_STYLES[item.key].base} opacity-95 hover:opacity-100`
                }`}
              >
                <item.Icon size={14} />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.label.charAt(0)}</span>
                <span className={`rounded-full px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-black ${FILTER_BUTTON_STYLES[item.key].count}`}>
                  {item.count}
                </span>
              </button>
            ))}

            {/* Clear Filters */}
            {(searchQuery || selectedHierarchy !== 'all') && (
              <>
                <div className="w-px h-4 sm:h-5 bg-slate-200 mx-0.5 sm:mx-1 flex-shrink-0" />
                <button
                  onClick={clearAllFilters}
                  className="flex-shrink-0 flex items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg text-[8px] sm:text-[10px] font-black text-red-500 hover:bg-red-50 transition-colors uppercase tracking-wider"
                >
                  <FiX size={10} /> <span className="hidden sm:inline">Clear</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <main className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div>
              <p className="text-xs sm:text-sm text-slate-500">
                {loading || departmentsLoading ? 'Loading...' : (
                  selectedHierarchy === 'leadership' ? (
                    <>Showing <span className="font-bold text-slate-900">{filteredStaff.length}</span> leadership profiles</>
                  ) : (
                    <>Showing <span className="font-bold text-slate-900">{staffByHierarchy.leadership.length}</span> leadership and departments</>
                  )
                )}
              </p>
            </div>
          </div>

          {loading || departmentsLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading staff directory...</p>
            </div>
          ) : staffByHierarchy.leadership.length > 0 || Object.values(departmentsByCategory).some(d => d.length > 0) ? (
            <div className="space-y-10">

              {/* LEADERSHIP SECTION - Principal Card Special + Others in Grid */}
              {(selectedHierarchy === 'all' || selectedHierarchy === 'leadership') && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#244863] flex items-center justify-center shadow-md">
                      <FiCrown size={16} className="text-[#f8c95f]" />
                    </div>
                    <h2 className="text-sm font-black text-[#1a1a2e] uppercase tracking-[0.15em]">
                      School Leadership
                    </h2>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {leadershipStaff.length}
                    </span>
                    <div className="flex-1 h-px bg-slate-100 ml-2" />
                  </div>
                  
                  {leadershipStaff.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No leadership profiles found.</p>
                  ) : (
                    <div className="space-y-8">
                      {/* ✨ SPECIAL PRINCIPAL CARD ✨ */}
                      {principalStaff && (
                        <div className="relative group">
                          {/* Decorative glow behind principal card */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1e3a8a] via-[#f8c95f]/40 to-[#1e3a8a] rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500"></div>
                          <div className="relative bg-white rounded-2xl overflow-hidden border-2 border-[#f8c95f]/60 shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f8c95f]/10 to-transparent rounded-bl-full pointer-events-none"></div>
                            <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
                              {/* Large image area */}
                              <div className="flex-shrink-0">
                                <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden ring-4 ring-[#f8c95f]/40 shadow-xl">
                                  <Image
                                    src={getImageSrc(principalStaff)}
                                    alt={principalStaff.name}
                                    width={176}
                                    height={176}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="mt-3 flex justify-center">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1a1a2e] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                                    <FiCrown size={10} /> Principal
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex-1 space-y-3">
                                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{principalStaff.name}</h3>
                                <p className="text-base font-bold text-[#1e3a8a] uppercase tracking-wide">{principalStaff.position || 'Principal'}</p>
                                
                                {principalStaff.bio && (
                                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 md:line-clamp-none">
                                    {principalStaff.bio}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap gap-3 pt-2">
                                  {principalStaff.email && (
                                    <a href={`mailto:${principalStaff.email}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1e3a8a] transition-colors">
                                      <FiMail size={14} /> {principalStaff.email}
                                    </a>
                                  )}
                                  {principalStaff.phone && (
                                    <a href={`tel:${principalStaff.phone}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1e3a8a] transition-colors">
                                      <FiPhone size={14} /> {principalStaff.phone}
                                    </a>
                                  )}
                                </div>
                                
                                <div className="pt-2">
                                  <Link
                                    href={`/pages/SchoolTeam/${principalStaff.id}/${generateSlug(principalStaff.name, principalStaff.id)}`}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#1a1a2e] to-[#244863] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                                  >
                                    View Full Profile <FiChevronRight size={14} />
                                  </Link>
                                </div>
                              </div>
                            </div>
                            {/* Subtle accent bar */}
                            <div className="h-1 w-full bg-gradient-to-r from-[#f8c95f] via-[#1a1a2e] to-[#f8c95f]"></div>
                          </div>
                        </div>
                      )}

                      {/* OTHER LEADERSHIP: Deputy Principals in ordered grid (Admin Deputy first, then Academic Deputy, then others) */}
                      {otherLeadershipStaff.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center gap-2 mb-4">
                            <FiTrendingUp size={14} className="text-slate-400" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Leadership Team</h4>
                            <div className="flex-1 h-px bg-slate-100"></div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {otherLeadershipStaff.map((staff) => (
                              <div key={staff.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
                                <div className="flex items-start gap-4">
                                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 ring-1 ring-slate-200 group-hover:ring-[#f8c95f]/50 transition-all">
                                    <Image
                                      src={getImageSrc(staff)}
                                      alt={staff.name}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-black text-slate-900 truncate">{staff.name}</h3>
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-0.5">
                                      {staff.position}
                                    </p>
                                    {staff.bio && (
                                      <p className="mt-2 text-xs text-slate-500 line-clamp-2">{staff.bio}</p>
                                    )}
                                    <Link
                                      href={`/pages/SchoolTeam/${staff.id}/${generateSlug(staff.name, staff.id)}`}
                                      className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-[#1e3a8a] hover:gap-2 transition-all"
                                    >
                                      View profile <FiChevronRight size={12} />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* DEPARTMENTS SECTION */}
              {(selectedHierarchy === 'all' || selectedHierarchy === 'teaching' || selectedHierarchy === 'support') && (
                <>
                  {[
                    ['CBC', departmentsByCategory.CBC],
                    ['EIGHT_FOUR_FOUR', departmentsByCategory.EIGHT_FOUR_FOUR],
                    ['TEACHING', departmentsByCategory.TEACHING],
                    ['SUPPORT', departmentsByCategory.SUPPORT],
                  ].map(([category, depts]) =>
                    depts && depts.length > 0 ? (
                      <section key={category}>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-8 h-8 rounded-lg bg-[#1a1a2e] flex items-center justify-center">
                            <FiLayers size={14} className="text-white" />
                          </div>
                          <h2 className="text-sm font-black text-[#1a1a2e] uppercase tracking-[0.15em]">
                            {category === 'CBC'
                              ? 'CBC'
                              : category === 'EIGHT_FOUR_FOUR'
                              ? '8-4-4'
                              : category}{' '}
                            Departments
                          </h2>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {depts.length}
                          </span>
                          <div className="flex-1 h-px bg-slate-100 ml-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {depts.map((dept) => (
                            <div key={dept.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all">
                              <h3 className="text-lg font-black text-slate-900">{dept.name}</h3>
                              {dept.description && (
                                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{dept.description}</p>
                              )}
                              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                {dept.headName && (
                                  <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                                    HOD: {dept.headName}
                                  </span>
                                )}
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                                  {dept.staffCount || 0} staff
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    ) : null
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">No staff found</p>
            </div>
          )}
        </main>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <Image src="/katz.jpeg" alt="Logo" width={24} height={24} className="opacity-40" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Katwanyaa Senior School</span>
            </div>
            <p className="text-[10px] text-slate-300">
              Committed to Excellence &bull; Staff Directory &bull; &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}