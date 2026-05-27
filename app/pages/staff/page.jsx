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
  FiAward as FiCrown,      // Use FiAward as crown alternative
  FiTrendingUp,            // Valid icon
  FiBarChart2
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
    color: 'blue',
    positions: ['Teacher', 'Subject Teacher', 'Class Teacher', 'Assistant Teacher', 'Senior Teacher', 'Head of Department']
  },
  {
    level: 'support',
    label: 'Support Staff',
    color: 'indigo',
    positions: ['Librarian', 'Laboratory Technician', 'Accountant', 'Secretary', 'Support Staff']
  }
];

const DEPARTMENTS = [
  { id: 'administration', label: 'Administration', color: 'blue', hierarchy: 'leadership' },
  { id: 'sciences', label: 'Sciences', color: 'blue', hierarchy: 'teaching' },
  { id: 'mathematics', label: 'Mathematics', color: 'indigo', hierarchy: 'teaching' },
  { id: 'languages', label: 'Languages', color: 'blue', hierarchy: 'teaching' },
  { id: 'humanities', label: 'Humanities', color: 'sky', hierarchy: 'teaching' },
  { id: 'guidance', label: 'Guidance & Counseling', color: 'indigo', hierarchy: 'support' },
  { id: 'sports', label: 'Sports & Athletics', color: 'blue', hierarchy: 'teaching' },
  { id: 'technical', label: 'Technical & IT', color: 'sky', hierarchy: 'support' },
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
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
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

const getTeacherImage = (teacher) => {
  if (teacher?.image) return teacher.image;
  return teacher?.gender === 'female' ? '/female.png' : '/male.png';
};

const getDepartmentTeachers = (department) =>
  Array.isArray(department?.staff) ? department.staff : [];

const departmentSearchText = (department) => {
  const teachers = getDepartmentTeachers(department);
  return [
    department?.name,
    department?.description,
    department?.headName,
    department?.assistantHeadName,
    department?.category,
    ...teachers.flatMap((teacher) => [
      teacher?.name,
      teacher?.subjectOffered,
      teacher?.department,
    ]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const getStaffHierarchy = (staffOrPosition) => {
  const role =
    typeof staffOrPosition === 'object'
      ? staffOrPosition?.role || ''
      : '';
  const position =
    typeof staffOrPosition === 'object'
      ? staffOrPosition?.position || ''
      : staffOrPosition || '';
  const combined = `${role} ${position}`.toLowerCase();
  const positionLower = position.toLowerCase();

  if (
    combined.includes('principal') ||
    combined.includes('deputy principal') ||
    combined.includes('senior teacher') ||
    combined.includes('head of department') ||
    combined.includes('assistant head of department') ||
    /\bhod\b/.test(combined) ||
    /\bahod\b/.test(combined)
  ) {
    return 'leadership';
  }

  if (!positionLower && role.toLowerCase().includes('teacher')) return 'teaching';

  if (
    positionLower.includes('teacher') ||
    positionLower.includes('lecturer') ||
    positionLower.includes('tutor')
  ) {
    return 'teaching';
  }

  return 'support';
};

const sortStaffByHierarchy = (staff) => {
  const hierarchyOrder = { leadership: 1, teaching: 2, support: 3 };
  
  return [...staff].sort((a, b) => {
    const aHierarchy = getStaffHierarchy(a);
    const bHierarchy = getStaffHierarchy(b);
    
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
    if (getStaffHierarchy(staff) === 'leadership') return;
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
          departmentId: staff.departmentId || staff.staffDepartmentId || (staff.department || 'Administration').toLowerCase().replace(/\s+/g, '-'),
          staffType: staff.staffType || '',
          subjectOffered: staff.subjectOffered || '',
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
    const searchLower = searchQuery.trim().toLowerCase();

    return staffData.filter(staff => {
      const matchesSearch = 
        !searchLower ||
        (staff.name || '').toLowerCase().includes(searchLower) ||
        (staff.role || '').toLowerCase().includes(searchLower) ||
        (staff.position || '').toLowerCase().includes(searchLower) ||
        (staff.department || '').toLowerCase().includes(searchLower) ||
        (staff.subjectOffered || '').toLowerCase().includes(searchLower) ||
        (staff.bio || '').toLowerCase().includes(searchLower) ||
        staff.expertise.some(exp => (exp || '').toLowerCase().includes(searchLower));

      const staffHierarchy = getStaffHierarchy(staff);
      const matchesHierarchy = selectedHierarchy === 'all' || selectedHierarchy === staffHierarchy;

      return matchesSearch && matchesHierarchy;
    });
  }, [staffData, searchQuery, selectedHierarchy]);

  const staffByHierarchy = useMemo(() => {
    const leadership = filteredStaff.filter(staff => getStaffHierarchy(staff) === 'leadership');
    const teaching = filteredStaff.filter(staff => getStaffHierarchy(staff) === 'teaching');
    const support = filteredStaff.filter(staff => getStaffHierarchy(staff) === 'support');
    
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

  const filteredDepartmentsByCategory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return Object.entries(departmentsByCategory).reduce((acc, [category, departments]) => {
      acc[category] = (departments || []).filter((department) => {
        if (!query) return true;
        return departmentSearchText(department).includes(query);
      });
      return acc;
    }, {
      CBC: [],
      EIGHT_FOUR_FOUR: [],
      TEACHING: [],
      SUPPORT: [],
    });
  }, [departmentsByCategory, searchQuery]);

  const departmentResultCount = Object.values(filteredDepartmentsByCategory)
    .reduce((sum, departments) => sum + (departments?.length || 0), 0);
  const totalDepartmentCount = Object.values(departmentsByCategory)
    .reduce((sum, departments) => sum + (departments?.length || 0), 0);

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
            className="bg-[#071527] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#0f2743] transition-colors w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3 lg:flex-row lg:items-center lg:justify-between">
          
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#071527] via-[#0f2743] to-[#1d4ed8] p-[1px] shadow-sm">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white">
                <Image src="/katz.jpeg" alt="Logo" width={28} height={28} className="rounded-xl object-cover" />
              </div>
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-[#071527]">
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
                className="w-full rounded-lg sm:rounded-2xl border border-slate-200 bg-white py-2.5 sm:py-3 pl-10 sm:pl-11 pr-9 sm:pr-10 text-xs sm:text-sm font-bold shadow-sm outline-none transition-all focus:border-[#1d4ed8] focus:ring-4 focus:ring-blue-500/10"
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
                className="flex items-center gap-1 rounded-lg sm:rounded-xl border border-slate-200 px-2.5 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold text-slate-600 transition-all hover:border-[#1d4ed8] hover:text-[#071527] disabled:opacity-50 whitespace-nowrap"
              >
                <FiRefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
              
              <div className="flex rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 p-0.5 sm:p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md p-1.5 sm:p-2 transition-all ${viewMode === 'grid' ? 'bg-[#071527] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <FiGrid size={12} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-md p-1.5 sm:p-2 transition-all ${viewMode === 'list' ? 'bg-[#071527] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <FiList size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

    {/* ── Hero Banner - Dark Bluish Katwanyaa Staff Theme ── */}
<div className="relative overflow-hidden bg-[#071527]">
  {/* Decorative background */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(10,22,40,0.12),_transparent_35%)]" />

  <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#38bdf8]/30 blur-3xl" />
  <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-[#071527]/10 blur-3xl" />

  <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      
      {/* Left content */}
      <div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/10 px-4 py-2 shadow-sm backdrop-blur">
          <FiUsers className="h-4 w-4 text-sky-300" />
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-100/80">
            Katwanyaa School Staff
          </span>
        </div>

        <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          The people behind our learning community.
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100/75 sm:text-base">
          Meet the leadership, teachers, and support team working together to guide, support, and serve our students every day.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-[#1d4ed8] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-950/30">
            <FiShield className="h-4 w-4 text-[#38bdf8]" />
            Leadership Team
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-[#071527]/10 bg-white/10 px-5 py-3 text-xs font-bold text-blue-50 shadow-sm">
            <FiStar className="h-4 w-4 text-[#38bdf8]" />
            Dedicated Educators
          </div>
        </div>
      </div>

      {/* Right card */}
      {!loading ? (
        <div className="relative">
          <div className="absolute -inset-3 rounded-[2rem] bg-[#38bdf8]/30 blur-xl" />

          <div className="relative rounded-[2rem] border border-blue-200/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-100/55">
                  Staff Directory
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Overview
                </h2>
              </div>

              <div className="rounded-2xl bg-[#1d4ed8] px-4 py-2 text-center shadow-lg shadow-blue-950/30">
                <span className="block text-2xl font-black text-white">
                  {staffData.length}
                </span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Total
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-blue-200/15 bg-white/10 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d4ed8]">
                  <FiShield className="h-5 w-5 text-[#38bdf8]" />
                </div>
                <p className="text-3xl font-black text-white">
                  {staffByHierarchy.leadership.length}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100/55">
                  Leadership
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200/15 bg-white/10 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1d4ed8]">
                  <FiUsers className="h-5 w-5 text-[#38bdf8]" />
                </div>
                <p className="text-3xl font-black text-white">
                  {totalDepartmentCount}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100/55">
                  Departments
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-200/15 bg-white/10 p-4">
              <p className="text-sm font-semibold leading-relaxed text-blue-100/70">
                {`${staffData.length} staff members listed across leadership, teaching, and support departments.`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-blue-200/15 bg-white/10 p-8 shadow-xl backdrop-blur">
          <p className="text-sm font-semibold text-blue-100/60 animate-pulse">
            Loading Katwanyaa staff directory...
          </p>
        </div>
      )}
    </div>
  </div>
</div>

  {/* ── Staff Filter Panel - Modern Card Layout ── */}
<div className="sticky top-[140px] z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl sm:top-[82px] lg:top-[73px]">
  <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4">
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-2 shadow-sm">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {[
          {
            key: 'all',
            label: 'All Staff',
            shortLabel: 'All',
            Icon: FiUsers,
            count:
              staffByHierarchy.leadership.length +
              departmentResultCount,
          },
          {
            key: 'leadership',
            label: 'Leadership',
            shortLabel: 'Lead',
            Icon: FiShield,
            count: staffByHierarchy.leadership?.length || 0,
          },
          {
            key: 'teaching',
            label: 'Teaching Staff',
            shortLabel: 'Teach',
            Icon: FiBookOpen,
            count:
              (filteredDepartmentsByCategory.CBC?.length || 0) +
              (filteredDepartmentsByCategory.EIGHT_FOUR_FOUR?.length || 0) +
              (filteredDepartmentsByCategory.TEACHING?.length || 0),
          },
          {
            key: 'support',
            label: 'Support Staff',
            shortLabel: 'Support',
            Icon: FiSettings,
            count: filteredDepartmentsByCategory.SUPPORT?.length || 0,
          },
        ].map((item) => {
          const isActive = selectedHierarchy === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setSelectedHierarchy(item.key)}
              className={`group flex min-w-[130px] flex-shrink-0 items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200 sm:min-w-[165px] sm:px-4 ${
                isActive
                  ? 'border-[#071527] bg-[#071527] text-white shadow-lg shadow-slate-900/15'
                  : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? 'bg-[#38bdf8] text-[#071527]'
                      : 'bg-slate-100 text-[#071527] group-hover:bg-[#38bdf8]/25'
                  }`}
                >
                  <item.Icon size={16} />
                </div>

                <div className="min-w-0">
                  <span className="block truncate text-xs font-black sm:text-sm">
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden">{item.shortLabel}</span>
                  </span>
                  <span
                    className={`mt-0.5 block text-[9px] font-bold uppercase tracking-[0.14em] ${
                      isActive ? 'text-white/55' : 'text-slate-400'
                    }`}
                  >
                    Category
                  </span>
                </div>
              </div>

              <span
                className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[10px] font-black ${
                  isActive
                    ? 'bg-white/15 text-[#38bdf8]'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}

        {/* Clear Filters */}
        {(searchQuery || selectedHierarchy !== 'all') && (
          <button
            onClick={clearAllFilters}
            className="flex min-w-[105px] flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-black uppercase tracking-wider text-red-500 transition-all hover:border-red-200 hover:bg-red-100"
          >
            <FiX size={14} />
            Clear
          </button>
        )}
      </div>
    </div>
  </div>
</div>

<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
  <main className="w-full">
    {/* Page Summary Header */}
    <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            Staff Directory
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-[#071527] sm:text-3xl">
            {selectedHierarchy === 'leadership'
              ? 'School Leadership'
              : 'Our Staff & Departments'}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {loading || departmentsLoading ? (
              'Loading...'
            ) : selectedHierarchy === 'leadership' ? (
              <>
                Showing{' '}
                <span className="font-black text-[#071527]">
                  {filteredStaff.length}
                </span>{' '}
                leadership profiles
              </>
            ) : (
              <>
                Showing{' '}
                <span className="font-black text-[#071527]">
                  {staffByHierarchy.leadership.length}
                </span>{' '}
                leadership members and departments
              </>
            )}
          </p>
        </div>

        {!loading && !departmentsLoading && (
          <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
            <div className="rounded-2xl bg-[#071527] p-4 text-white">
              <p className="text-2xl font-black">{leadershipStaff.length}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                Leaders
              </p>
            </div>

            <div className="rounded-2xl bg-[#38bdf8] p-4 text-[#071527]">
              <p className="text-2xl font-black">
                {departmentResultCount}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#071527]/60">
                Departments
              </p>
            </div>
          </div>
        )}
      </div>
    </div>

    {loading || departmentsLoading ? (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          Loading staff directory...
        </p>
      </div>
    ) : staffByHierarchy.leadership.length > 0 ||
      Object.values(filteredDepartmentsByCategory).some((d) => d.length > 0) ? (
      <div className="space-y-12">
        {/* LEADERSHIP SECTION */}
        {(selectedHierarchy === 'all' || selectedHierarchy === 'leadership') && (
          <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071527] shadow-md">
                <FiCrown size={18} className="text-[#38bdf8]" />
              </div>

              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#071527]">
                  School Leadership
                </h2>
                <p className="text-xs font-semibold text-slate-400">
                  Principal and senior administration team
                </p>
              </div>

              <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                {leadershipStaff.length}
              </span>
            </div>

            {leadershipStaff.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-400 italic">
                  No leadership profiles found.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Principal Feature Card */}
                {principalStaff && (
                  <div className="relative overflow-hidden rounded-[2rem] bg-[#071527] p-6 text-white shadow-2xl">
                    <div className="absolute right-0 top-0 h-44 w-44 rounded-bl-full bg-[#38bdf8]/20" />
                    <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative z-10">
                      <div className="mb-6 flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#38bdf8] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#071527]">
                          <FiCrown size={12} />
                          Principal
                        </span>

                        <FiShield className="text-white/25" size={36} />
                      </div>

                      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-3xl ring-4 ring-[#38bdf8]/50 sm:h-44 sm:w-44">
                          <Image
                            src={getImageSrc(principalStaff)}
                            alt={principalStaff.name}
                            width={176}
                            height={176}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-3xl font-black tracking-tight">
                            {principalStaff.name}
                          </h3>

                          <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-[#38bdf8]">
                            {principalStaff.position || 'Principal'}
                          </p>

                          {principalStaff.bio && (
                            <p className="mt-4 line-clamp-4 text-sm leading-7 text-white/70">
                              {principalStaff.bio}
                            </p>
                          )}

                          <div className="mt-5 flex flex-wrap gap-3">
                            {principalStaff.email && (
                              <a
                                href={`mailto:${principalStaff.email}`}
                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/15"
                              >
                                <FiMail size={13} />
                                Email
                              </a>
                            )}

                            {principalStaff.phone && (
                              <a
                                href={`tel:${principalStaff.phone}`}
                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/15"
                              >
                                <FiPhone size={13} />
                                Call
                              </a>
                            )}

                            <Link
                              href={`/pages/staff/${principalStaff.id}/${generateSlug(
                                principalStaff.name,
                                principalStaff.id
                              )}`}
                              className="inline-flex items-center gap-2 rounded-full bg-[#38bdf8] px-5 py-2 text-xs font-black text-[#071527] transition hover:scale-[1.02]"
                            >
                              View Profile <FiChevronRight size={13} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Leadership Side Panel */}
                {otherLeadershipStaff.length > 0 && (
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <FiTrendingUp size={16} className="text-[#071527]" />
                      <h4 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                        Leadership Team
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {otherLeadershipStaff.map((staff) => (
                        <div
                          key={staff.id}
                          className="group rounded-2xl border border-slate-100 bg-slate-50 p-3 transition-all hover:border-[#38bdf8]/60 hover:bg-white hover:shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                              <Image
                                src={getImageSrc(staff)}
                                alt={staff.name}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-sm font-black text-[#071527]">
                                {staff.name}
                              </h3>

                              <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                {staff.position}
                              </p>

                              <Link
                                href={`/pages/staff/${staff.id}/${generateSlug(
                                  staff.name,
                                  staff.id
                                )}`}
                                className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#1d4ed8] transition-all group-hover:gap-2"
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
        {(selectedHierarchy === 'all' ||
          selectedHierarchy === 'teaching' ||
          selectedHierarchy === 'support') && (
          <section className="space-y-10">
            {[
              ['CBC', filteredDepartmentsByCategory.CBC],
              ['EIGHT_FOUR_FOUR', filteredDepartmentsByCategory.EIGHT_FOUR_FOUR],
              ['TEACHING', filteredDepartmentsByCategory.TEACHING],
              ['SUPPORT', filteredDepartmentsByCategory.SUPPORT],
            ].map(([category, depts]) =>
              depts && depts.length > 0 ? (
                <div key={category}>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#38bdf8]">
                      <FiLayers size={16} className="text-[#071527]" />
                    </div>

                    <div>
                      <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#071527]">
                        {category === 'CBC'
                          ? 'CBC'
                          : category === 'EIGHT_FOUR_FOUR'
                          ? '8-4-4'
                          : category}{' '}
                        Departments
                      </h2>
                      <p className="text-xs font-semibold text-slate-400">
                        Department groups and staff allocation
                      </p>
                    </div>

                    <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                      {depts.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {depts.map((dept) => {
                      const teachers = getDepartmentTeachers(dept);
                      const teacherCount = Number(dept.staffCount) || teachers.length;

                      return (
                        <Link
                          key={dept.id}
                          href={`/pages/staff/departments/${dept.id}`}
                          className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#38bdf8]/70 hover:shadow-xl"
                        >
                          <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-slate-50 transition group-hover:bg-[#38bdf8]/20" />

                          <div className="relative z-10">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071527] text-white shadow-md">
                              <FiBookOpen size={18} className="text-[#38bdf8]" />
                            </div>

                            <h3 className="text-lg font-black leading-tight text-[#071527]">
                              {dept.name}
                            </h3>

                            {dept.description && (
                              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                                {dept.description}
                              </p>
                            )}

                            <div className="mt-5 flex flex-wrap gap-2">
                              {dept.headName && (
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
                                  HOD: {dept.headName}
                                </span>
                              )}

                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-600">
                                {teacherCount} {teacherCount === 1 ? 'teacher' : 'teachers'}
                              </span>
                            </div>

                            {teachers.length > 0 && (
                              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-2">
                                    {teachers.slice(0, 4).map((teacher) => (
                                      <img
                                        key={teacher.id}
                                        src={getTeacherImage(teacher)}
                                        alt={teacher.name}
                                        className="h-8 w-8 rounded-full border-2 border-white object-cover object-top"
                                      />
                                    ))}
                                  </div>
                                  <p className="min-w-0 text-xs font-bold text-slate-600">
                                    {teachers.slice(0, 2).map((teacher) => teacher.name).join(', ')}
                                    {teachers.length > 2 ? ` +${teachers.length - 2} more` : ''}
                                  </p>
                                </div>
                              </div>
                            )}

                            <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1d4ed8]">
                              View teachers <FiChevronRight size={13} />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null
            )}
          </section>
        )}
      </div>
    ) : (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
        <p className="text-sm font-semibold text-slate-500">No staff found</p>
      </div>
    )}
  </main>
</div>

      {/* ── Footer ── */}
      <footer className="mt-12 border-t border-blue-950/10 bg-[#071527]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <Image src="/katz.jpeg" alt="Logo" width={24} height={24} className="opacity-80" />
              <span className="text-[10px] font-black text-blue-100/70 uppercase tracking-[0.2em]">Katwanyaa Senior School</span>
            </div>
            <p className="text-[10px] text-blue-100/45">
              Education is light &bull; Staff Directory &bull; &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
