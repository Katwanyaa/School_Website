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
  FiMenu,
  FiArrowLeft,
  FiArrowRight,
  FiMapPin,
  FiAward,
  FiStar,
  FiBook,
  FiTarget,
  FiUsers,
  FiChevronUp,
  FiBookOpen,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'sonner';
import { SiGmail } from 'react-icons/si';

// ==========================================
// 1. ENHANCED CONFIGURATION WITH HIERARCHY
// ==========================================

const STAFF_HIERARCHY = [
  {
    level: 'leadership',
    label: 'School Leadership',
    color: 'blue',
    icon: '👑',
    positions: ['Principal', 'Deputy Principal']
  },
  {
    level: 'teaching',
    label: 'Teaching Staff',
    color: 'emerald',
    icon: '📚',
    positions: ['Teacher', 'Subject Teacher', 'Class Teacher', 'Assistant Teacher', 'Senior Teacher', 'Head of Department']
  },
  {
    level: 'support',
    label: 'Support Staff',
    color: 'orange',
    icon: '🛠️',
    positions: ['Librarian', 'Laboratory Technician', 'Accountant', 'Secretary', 'Support Staff']
  }
];

const DEPARTMENTS = [
  { id: 'administration', label: 'Administration', color: 'blue', icon: '👑', hierarchy: 'leadership' },
  { id: 'sciences', label: 'Sciences', color: 'emerald', icon: '🔬', hierarchy: 'teaching' },
  { id: 'mathematics', label: 'Mathematics', color: 'orange', icon: '📊', hierarchy: 'teaching' },
  { id: 'languages', label: 'Languages', color: 'violet', icon: '🌐', hierarchy: 'teaching' },
  { id: 'humanities', label: 'Humanities', color: 'amber', icon: '📚', hierarchy: 'teaching' },
  { id: 'guidance', label: 'Guidance & Counseling', color: 'pink', icon: '💝', hierarchy: 'support' },
  { id: 'sports', label: 'Sports & Athletics', color: 'teal', icon: '⚽', hierarchy: 'teaching' },
  { id: 'technical', label: 'Technical & IT', color: 'cyan', icon: '💻', hierarchy: 'support' },
  { id: 'support', label: 'Support Staff', color: 'slate', icon: '🛠️', hierarchy: 'support' }
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
  if ((positionLower.includes('principal') || positionLower.includes('deputy principal')) &&
      !positionLower.includes('senior') && !positionLower.includes('head')) {
    return 'leadership';
  } else if (positionLower.includes('teacher') || positionLower.includes('lecturer') || positionLower.includes('tutor') ||
             positionLower.includes('senior') || positionLower.includes('head')) {
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
      const aIsPrincipal = a.position?.toLowerCase().includes('principal') && !a.position?.toLowerCase().includes('deputy');
      const bIsPrincipal = b.position?.toLowerCase().includes('principal') && !b.position?.toLowerCase().includes('deputy');
      
      if (aIsPrincipal && !bIsPrincipal) return -1;
      if (!aIsPrincipal && bIsPrincipal) return 1;
      
      return (a.name || '').localeCompare(b.name || '');
    }
    
    return (a.name || '').localeCompare(b.name || '');
  });
};

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================

const Badge = ({ children, color = 'slate', className = '', icon }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getBadgeColorStyles(color)} ${className}`}>
    {icon && <span className="mr-1">{icon}</span>}
    {children}
  </span>
);

const StaffSkeleton = ({ viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex gap-4 p-4 border border-gray-200/50 rounded-xl bg-white/80 animate-pulse">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3" />
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4" />
          <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="border border-gray-200/50 rounded-2xl bg-white/80 p-4 space-y-4 animate-pulse">
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl" />
      <div className="space-y-2">
        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2" />
      </div>
    </div>
  );
};

const StatsPill = ({ icon, value, label, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    purple: 'bg-purple-50 text-purple-600 ring-purple-100',
  };

  const activeColor = colorMap[color] || colorMap.blue;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-100 shadow-sm group hover:border-slate-300 transition-all cursor-default">
      <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm ring-1 transition-transform group-hover:scale-101 ${activeColor}`}>
        {icon}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-black text-slate-900 tracking-tight">
          {value}
        </span>
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
    </div>
  );
};

const HierarchySection = ({ title, icon, staff, viewMode, isFirst = false, onContactClick }) => {
  if (!staff?.length) return null;

  return (
    <section className={isFirst ? "animate-in fade-in slide-in-from-bottom-4 duration-700" : "mt-12"}>
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="relative shrink-0 w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/10 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative text-lg">{icon}</span>
        </div>
        
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none mb-0.5">
            {title}
          </h2>
          <p className="text-[10px] sm:text-xs font-bold text-blue-600 tracking-widest uppercase">
            {staff.length} {staff.length === 1 ? 'Expert' : 'Professionals'}
          </p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-2 hidden sm:block" />
      </div>
      
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 sm:gap-6" 
          : "flex flex-col gap-3"
      }>
        {staff.map((member) => (
          <div key={member.id} className="transition-all duration-300">
            {viewMode === 'grid' 
              ? <StaffCard staff={member} onContactClick={onContactClick} /> 
              : <StaffListCard staff={member} onContactClick={onContactClick} />
            }
          </div>
        ))}
      </div>
    </section>
  );
};

// StaffCard Component with fixed button layout
const StaffCard = ({ staff, onContactClick }) => {
  const deptConfig = DEPARTMENTS.find(d => d.id === staff.departmentId);
  const hierarchy = getStaffHierarchy(staff.position);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden shadow-sm flex flex-col h-full">
      
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
        <Image
          src={getImageSrc(staff)}
          alt={staff.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={hierarchy === 'leadership'}
          onError={(e) => { e.target.src = '/images/default-staff.jpg'; }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-md">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-medium text-gray-700">Active</span>
          </div>
        </div>

        <div className="absolute bottom-2 left-2">
          <Badge color={deptConfig?.color} icon={deptConfig?.icon} className="text-[10px] font-medium px-2 py-1 bg-white/90 backdrop-blur-sm shadow-md">
            {staff.department}
          </Badge>
        </div>

        {hierarchy === 'leadership' && (
          <div className="absolute top-2 left-2 bg-amber-400 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1">
            <span>👑</span>
            <span>LEAD</span>
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        
        <div className="mb-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight mb-0.5">
            {staff.name}
          </h3>
          <p className="text-xs font-medium text-blue-600">
            {staff.position}
          </p>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
          "{staff.quote || staff.bio}"
        </p>

        {staff.expertise && staff.expertise.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {staff.expertise.slice(0, 2).map((tag, idx) => (
              <span 
                key={idx} 
                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
            {staff.expertise.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full">
                +{staff.expertise.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Buttons in flex row */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onContactClick(staff)}
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            <FiMail size={12} />
            <span>Contact</span>
          </button>
          
          <Link
            href={`/pages/staff/${staff.id}/${generateSlug(staff.name, staff.id)}`}
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg"
          >
            <FiUser size={12} />
            <span>Profile</span>
            <FiArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

// StaffListCard Component
const StaffListCard = ({ staff, onContactClick }) => {
  const deptConfig = DEPARTMENTS.find(d => d.id === staff.departmentId);
  const hierarchy = getStaffHierarchy(staff.position);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200/50 p-3 flex flex-col sm:flex-row gap-3 items-center relative">
      <div className="relative">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 shadow">
          <Image
            src={getImageSrc(staff)}
            alt={staff.name}
            fill
            className="object-cover"
            sizes="64px"
            onError={(e) => {
              e.target.src = '/images/default-staff.jpg';
            }}
          />
        </div>
        {hierarchy === 'leadership' && (
          <div className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-sm border border-white">
            <span className="text-white text-[10px]">⭐</span>
          </div>
        )}
      </div>

      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
          <h3 className="text-sm font-bold text-gray-900">
            <Link href={`/pages/staff/${staff.id}/${generateSlug(staff.name, staff.id)}`} className="text-gray-900">
              {staff.name}
            </Link>
          </h3>
          <Badge color={deptConfig?.color} icon={deptConfig?.icon} className="text-[10px] px-2 py-0.5">
            {staff.department}
          </Badge>
        </div>
        <p className="text-blue-600 font-semibold text-xs mb-1">{staff.position}</p>
        <p className="text-gray-600 text-xs leading-relaxed line-clamp-1">{staff.bio}</p>
      </div>

      <div className="flex flex-row gap-2 shrink-0 w-full sm:w-auto">
        <button
          onClick={() => onContactClick(staff)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-semibold hover:from-blue-100 hover:to-blue-200 transition-colors"
        >
          <FiMail size={12} /> <span>Contact</span>
        </button>
        <Link
          href={`/pages/staff/${staff.id}/${generateSlug(staff.name, staff.id)}`}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold"
        >
          <FiUser size={12} /> <span>Profile</span>
        </Link>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN COMPONENT
// ==========================================

export default function StaffDirectory() {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [selectedHierarchy, setSelectedHierarchy] = useState('all');
  
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Consultation Modal States
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

  // Handle Contact Click
  const handleContactClick = (staff) => {
    setSelectedStaff(staff);
    setConsultForm({
      ...consultForm,
      staffId: staff.id,
      staffName: staff.name,
      staffEmail: staff.email,
      subject: `Inquiry for ${staff.name}`
    });
    setShowConsultModal(true);
  };

  // Handle Consultation Submit
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
        contactMethod: consultForm.contactMethod,
        teacherId: selectedStaff.id,
        teacherName: selectedStaff.name,
        teacherEmail: selectedStaff.email,
        teacherPosition: selectedStaff.position
      };

      const response = await fetch('/api/teacher-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Consultation request sent! Reference: ${data.referenceNumber}`);
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
      const response = await fetch('/api/staff');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch staff data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.staff) {
        const mappedStaff = data.staff.map(staff => ({
          id: staff.id,
          name: staff.name,
          role: staff.role,
          position: staff.position,
          department: staff.department,
          departmentId: staff.department.toLowerCase().replace(/\s+/g, '-'),
          email: staff.email,
          phone: staff.phone,
          image: staff.image,
          expertise: staff.expertise || [],
          bio: staff.bio,
          responsibilities: staff.responsibilities || [],
          achievements: staff.achievements || [],
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
  }, []);

  const filteredStaff = useMemo(() => {
    return staffData.filter(staff => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        staff.name.toLowerCase().includes(searchLower) ||
        staff.role.toLowerCase().includes(searchLower) ||
        staff.position.toLowerCase().includes(searchLower) ||
        (staff.bio && staff.bio.toLowerCase().includes(searchLower)) ||
        staff.expertise.some(exp => exp.toLowerCase().includes(searchLower));

      const matchesDept = selectedDepts.length === 0 || selectedDepts.includes(staff.departmentId);

      const staffHierarchy = getStaffHierarchy(staff.position);
      const matchesHierarchy = selectedHierarchy === 'all' || selectedHierarchy === staffHierarchy;

      return matchesSearch && matchesDept && matchesHierarchy;
    });
  }, [staffData, searchQuery, selectedDepts, selectedHierarchy]);

  const staffByHierarchy = useMemo(() => {
    const leadership = filteredStaff.filter(staff => getStaffHierarchy(staff.position) === 'leadership');
    const teaching = filteredStaff.filter(staff => getStaffHierarchy(staff.position) === 'teaching');
    const support = filteredStaff.filter(staff => getStaffHierarchy(staff.position) === 'support');
    
    const sortedLeadership = [...leadership].sort((a, b) => {
      const aIsPrincipal = a.position?.toLowerCase().includes('principal') && !a.position?.toLowerCase().includes('deputy');
      const bIsPrincipal = b.position?.toLowerCase().includes('principal') && !b.position?.toLowerCase().includes('deputy');
      
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
  }, [searchQuery, selectedDepts, selectedHierarchy]);

  const toggleDept = (id) => {
    setSelectedDepts(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedDepts([]);
    setSelectedHierarchy('all');
  };

  const getDeptCount = (id) => staffData.filter(s => s.departmentId === id).length;

  const departmentStats = useMemo(() => [
    { icon: '👑', value: staffByHierarchy.leadership.length, label: 'Leadership', color: 'blue' },
    { icon: '📚', value: staffByHierarchy.teaching.length, label: 'Teachers', color: 'emerald' },
    { icon: '🛠️', value: staffByHierarchy.support.length, label: 'Support Staff', color: 'orange' },
    { icon: '🏢', value: DEPARTMENTS.length, label: 'Departments', color: 'violet' }
  ], [staffByHierarchy]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full mx-auto p-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiUser className="text-2xl text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Staff Directory</h2>
          <p className="text-gray-600 mb-4 leading-relaxed text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg w-full sm:w-auto"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-gray-900">
      
      {/* Mobile Filter Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200/50 sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 -ml-2"
            >
              <FiMenu size={20} />
            </button>
            
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <img 
                  src="/katz.jpeg" 
                  alt="School Logo" 
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  Katz Staff Faculty
                </span>
                <p className="text-[10px] text-gray-500 mt-0.5">Prayer, Discipline and Hardwork</p>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, expertise..."
                className="block w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStaffData}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all text-xs font-semibold shadow-sm"
              title="Refresh staff data"
            >
              <FiRefreshCw size={12} className={loading ? 'animate-spin text-blue-500' : ''} />
              <span className="hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
            
            <div className="hidden sm:flex bg-white p-1 rounded-lg border border-gray-200/50 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md' 
                    : 'text-gray-500'
                }`}
                aria-label="Grid View"
              >
                <FiGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md' 
                    : 'text-gray-500'
                }`}
                aria-label="List View"
              >
                <FiList size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-5">
          
          {/* Sidebar */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 w-72 bg-white transform transition-transform duration-300 ease-in-out shadow-xl z-50 lg:z-auto lg:shadow-none overflow-y-auto border-r lg:border-r-0 border-gray-200/50
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          >
            <div className="p-4 lg:p-0 lg:sticky lg:top-20 space-y-5">
              <div className="flex items-center justify-between lg:hidden pb-3 border-b border-gray-100 bg-white sticky top-0 z-10">
                <h2 className="text-base font-black text-gray-900 tracking-tight">FILTERS</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                  aria-label="Close filters"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="lg:hidden">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search staff members..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
                <div className="p-3 bg-slate-900 border-b border-slate-800">
                  <h3 className="font-black text-white flex items-center gap-2 text-xs uppercase tracking-widest">
                    <FiUsers className="text-blue-400" size={14} />
                    Staff Hierarchy
                  </h3>
                </div>

                <div className="p-2 space-y-1">
                  <button
                    onClick={() => setSelectedHierarchy('all')}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                      selectedHierarchy === 'all'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-tight">ALL STAFF</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                        selectedHierarchy === 'all' ? 'bg-white/20' : 'bg-gray-100'
                      }`}
                    >
                      {staffData.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedHierarchy('leadership')}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                      selectedHierarchy === 'leadership'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">👑</span>
                      <span className="text-xs font-black uppercase tracking-tight">
                        SCHOOL LEADERSHIP
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                        selectedHierarchy === 'leadership' ? 'bg-white/20' : 'bg-gray-100'
                      }`}
                    >
                      {staffByHierarchy.leadership?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedHierarchy('teaching')}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                      selectedHierarchy === 'teaching'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">📚</span>
                      <span className="text-xs font-black uppercase tracking-tight">
                        TEACHING STAFF
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                        selectedHierarchy === 'teaching' ? 'bg-white/20' : 'bg-gray-100'
                      }`}
                    >
                      {staffByHierarchy.teaching?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedHierarchy('support')}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                      selectedHierarchy === 'support'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🛠️</span>
                      <span className="text-xs font-black uppercase tracking-tight">
                        SUPPORT STAFF
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                        selectedHierarchy === 'support' ? 'bg-white/20' : 'bg-gray-100'
                      }`}
                    >
                      {staffByHierarchy.support?.length || 0}
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
                <div className="p-3 bg-white border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-black text-gray-900 flex items-center gap-2 text-xs uppercase tracking-widest">
                    <FiBriefcase className="text-blue-600" size={14} />
                    Departments
                  </h3>
                  {selectedDepts.length > 0 && (
                    <button
                      onClick={() => setSelectedDepts([])}
                      className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-tighter bg-red-50 px-2 py-0.5 rounded-md"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="p-2 space-y-1 max-h-[280px] overflow-y-auto">
                  {DEPARTMENTS.map((dept) => (
                    <div
                      key={dept.id}
                      onClick={() => toggleDept(dept.id)}
                      className={`cursor-pointer flex items-center justify-between p-2 rounded-lg border transition-all ${
                        selectedDepts.includes(dept.id)
                          ? 'border-blue-500 bg-blue-50/50'
                          : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`p-1 rounded-md ${
                            selectedDepts.includes(dept.id)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {dept.icon}
                        </span>
                        <span className="text-xs font-bold text-gray-700 truncate">
                          {dept.label}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-gray-400 ml-2">
                        {getDeptCount(dept.id)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {(selectedDepts.length > 0 || searchQuery || selectedHierarchy !== 'all') && (
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2 rounded-xl bg-white border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <FiX size={12} />
                  Reset All
                </button>
              )}
            </div>
          </aside>

          <main className="flex-1 min-w-0 relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-5">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-1">
                  Meet Our Team
                </h1>
                <p className="text-gray-600 text-sm">
                  {loading
                    ? 'Discovering our talented educators...'
                    : `Showing ${filteredStaff.length} dedicated professionals`}
                  {!loading && filteredStaff.length !== staffData.length && (
                    <span className="text-blue-600 font-semibold">
                      {' '}
                      • Filtered from {staffData.length}
                    </span>
                  )}
                </p>
              </div>

              <div className="relative group w-full lg:w-64">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10">
                  <FiFilter size={14} />
                </div>
                <select
                  className="
                    appearance-none w-full
                    bg-white/80 backdrop-blur-md
                    border border-slate-200 hover:border-blue-400
                    pl-8 pr-8 py-2.5
                    rounded-xl
                    text-xs font-black uppercase tracking-widest text-slate-700
                    focus:outline-none focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600
                    shadow-sm
                    cursor-pointer transition-all
                  "
                >
                  <option value="hierarchy" className="font-sans font-semibold">
                    Hierarchy View
                  </option>
                  <option value="alphabetical" className="font-sans font-semibold">
                    Alphabetical (A-Z)
                  </option>
                  <option value="department" className="font-sans font-semibold">
                    By Department
                  </option>
                  <option value="expertise" className="font-sans font-semibold">
                    Top Expertise
                  </option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                  <FiChevronUp size={10} className="text-slate-900 -mb-0.5" />
                  <FiChevronDown size={10} className="text-slate-900" />
                </div>
              </div>
            </div>

            {!loading && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
                {departmentStats.map((stat, index) => (
                  <StatsPill
                    key={index}
                    icon={stat.icon}
                    value={stat.value}
                    label={stat.label}
                    color={stat.color}
                  />
                ))}
              </div>
            )}

            {/* Consultation Modal */}
            {showConsultModal && selectedStaff && (
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 z-[200] animate-in fade-in duration-200"
                onClick={() => setShowConsultModal(false)}
              >
                <div 
                  className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-4 duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
                          <FiMail className="text-xl" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Contact {selectedStaff.name}</h2>
                          <p className="text-blue-100 text-xs">Send inquiry to {selectedStaff.position}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowConsultModal(false)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleConsultSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-5">
                    {/* Staff Info Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {selectedStaff.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Consultation with:</p>
                          <p className="font-semibold text-gray-800 text-sm">{selectedStaff.name}</p>
                          <p className="text-xs text-gray-600">{selectedStaff.position} • {selectedStaff.department}</p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={consultForm.name}
                          onChange={(e) => setConsultForm({...consultForm, name: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={consultForm.email}
                          onChange={(e) => setConsultForm({...consultForm, email: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={consultForm.phone}
                          onChange={(e) => setConsultForm({...consultForm, phone: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="+254700000000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Inquiry Type</label>
                        <select
                          value={consultForm.inquiryType}
                          onChange={(e) => setConsultForm({...consultForm, inquiryType: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="academic">Academic Consultation</option>
                          <option value="guidance">Guidance & Counseling</option>
                          <option value="complaint">Feedback / Complaint</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Student Details */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Student Details (if applicable)</label>
                      <input
                        type="text"
                        value={consultForm.studentGrade}
                        onChange={(e) => setConsultForm({...consultForm, studentGrade: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Student name, grade, class (optional)"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Subject *</label>
                      <input
                        type="text"
                        required
                        value={consultForm.subject}
                        onChange={(e) => setConsultForm({...consultForm, subject: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Brief subject of your inquiry"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Message *</label>
                      <textarea
                        required
                        rows={4}
                        value={consultForm.message}
                        onChange={(e) => setConsultForm({...consultForm, message: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Type your message here..."
                      />
                    </div>

                    {/* Contact Preference */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Preferred Contact Method</label>
                      <div className="flex gap-3">
                        {['email', 'phone', 'whatsapp'].map(method => (
                          <label key={method} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="contactMethod"
                              value={method}
                              checked={consultForm.contactMethod === method}
                              onChange={(e) => setConsultForm({...consultForm, contactMethod: e.target.value})}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm capitalize">{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowConsultModal(false)}
                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <FiMail size={16} />
                            Send Message
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {loading ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'space-y-3'
                }
              >
                {[...Array(6)].map((_, i) => (
                  <StaffSkeleton key={i} viewMode={viewMode} />
                ))}
              </div>
            ) : filteredStaff.length > 0 ? (
              <>
                {selectedHierarchy === 'all' ? (
                  <div className="space-y-8">
                    <HierarchySection
                      title="School Leadership"
                      icon="👑"
                      staff={staffByHierarchy.leadership}
                      viewMode={viewMode}
                      isFirst={true}
                      onContactClick={handleContactClick}
                    />
                    <HierarchySection
                      title="Teaching Staff"
                      icon="📚"
                      staff={staffByHierarchy.teaching}
                      viewMode={viewMode}
                      onContactClick={handleContactClick}
                    />
                    <HierarchySection
                      title="Support Staff"
                      icon="🛠️"
                      staff={staffByHierarchy.support}
                      viewMode={viewMode}
                      onContactClick={handleContactClick}
                    />
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {paginatedStaff.map((staff) => (
                      <StaffCard 
                        key={staff.id} 
                        staff={staff} 
                        onContactClick={handleContactClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedStaff.map((staff) => (
                      <StaffListCard 
                        key={staff.id} 
                        staff={staff} 
                        onContactClick={handleContactClick}
                      />
                    ))}
                  </div>
                )}

                {totalPages > 1 && selectedHierarchy !== 'all' && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200/50 pt-5">
                    <div className="text-xs text-gray-500 font-medium">
                      Page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
                      <span className="font-bold text-gray-900">{totalPages}</span>
                      <span className="text-blue-600 ml-2">
                        • {filteredStaff.length} total staff
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <FiArrowLeft size={12} />
                        <span className="hidden sm:inline">Previous</span>
                      </button>

                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                          let pageNum = i + 1;
                          if (totalPages > 3 && currentPage > 2) {
                            pageNum = currentPage - 1 + i;
                          }
                          if (pageNum > totalPages) return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-7 h-7 rounded-md text-xs font-semibold ${
                                currentPage === pageNum
                                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md'
                                  : 'text-gray-600'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <FiArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <FiSearch className="text-2xl text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No staff members found</h3>
                <p className="text-gray-600 max-w-md text-sm mb-4 leading-relaxed">
                  We couldn't find anyone matching your current search criteria. Try
                  adjusting your filters or search terms to discover our talented team
                  members.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-sm shadow-md"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}