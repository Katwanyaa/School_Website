'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiArrowLeft, FiBookOpen, FiCalendar, FiChevronRight, FiExternalLink,
  FiGlobe, FiGrid, FiImage, FiLayers, FiMapPin, FiMonitor, FiSearch,
  FiShield, FiUserCheck, FiUsers, FiX, FiStar, FiTrendingUp, FiClock,
  FiAward, FiBriefcase, FiHome, FiMail, FiPhone, FiChevronLeft,
  FiAlertTriangle,
} from 'react-icons/fi';
import { 
  FaGraduationCap, FaHome, FaSchool, FaBook, FaChalkboardTeacher,
  FaUsers as FaUsersIcon, FaSeedling, FaHeart, FaRobot,
} from 'react-icons/fa';
import { normalizeSchoolImages } from './image-upload-field';

// ============= ICONS & THEMES (unchanged) =============
const ICONS = {
  CLUB: FiUsers,
  SOCIETY: FaGraduationCap,
  STUDENT_COUNCIL: FiUserCheck,
  COMPUTER_LAB: FiMonitor,
  FARM: FaSeedling,
  BOARDING: FaHome,
  SECURITY: FiShield,
  DEPARTMENT: FiLayers,
  SPORTS: FiAward,
  ARTS: FaHeart,
  SCIENCE: FiBookOpen,
  TECHNOLOGY: FiMonitor,
  LEADERSHIP: FiStar,
};

const TYPE_THEMES = {
  CLUB: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-600' },
  SOCIETY: { bg: 'bg-indigo-50', text: 'text-indigo-700', iconBg: 'bg-indigo-600' },
  STUDENT_COUNCIL: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', iconBg: 'bg-fuchsia-600' },
  COMPUTER_LAB: { bg: 'bg-sky-50', text: 'text-sky-700', iconBg: 'bg-sky-600' },
  FARM: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-600' },
  BOARDING: { bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-600' },
  SECURITY: { bg: 'bg-rose-50', text: 'text-rose-700', iconBg: 'bg-rose-600' },
  DEPARTMENT: { bg: 'bg-cyan-50', text: 'text-cyan-700', iconBg: 'bg-cyan-600' },
};

// ============= SCHOOL INFO (Matungulu Girls) =============
const SCHOOL_INFO = {
  name: 'Matungulu Girls Senior School',
  shortName: 'Matungulu Girls',
  motto: 'Committed To Excellence',
  vision: 'To be a center of excellence for girls education, character formation, and leadership.',
  mission: 'To provide quality, girls-centered education that nurtures talent, discipline, confidence, and service.',
  location: 'Matungulu Sub-County, Machakos County, Kenya',
  email: 'matungulugirls@gmail.com',
  phone: '0734610130',
  website: 'matungulugirls.school',
  colors: ['Emerald Green', 'Navy Blue', 'White'],
  achievements: [
    'Focused girls boarding learning environment',
    'CBC senior school pathways and co-curricular development',
    'Active clubs, societies, student leadership, and welfare programs',
    'Strong community link in Matungulu, Machakos County',
  ],
  description: `Matungulu Girls Senior School is a public girls boarding senior school in Matungulu Sub-County, Machakos County. 
    The school supports learners through academics, boarding life, student leadership, guidance and counselling, clubs, societies, 
    practical learning, and a structured school environment built around discipline, confidence, and holistic growth.`
};

// ============= UTILITIES =============
const getTypeLabel = (type) => {
  const labels = {
    CLUB: 'Club', SOCIETY: 'Society', STUDENT_COUNCIL: 'Student Council',
    COMPUTER_LAB: 'Computer Lab', FARM: 'School Farm', BOARDING: 'Boarding', SECURITY: 'Security',
    DEPARTMENT: 'Department', SPORTS: 'Sports', ARTS: 'Arts', SCIENCE: 'Science',
    TECHNOLOGY: 'Technology', LEADERSHIP: 'Leadership'
  };
  return labels[type] || 'School Hub';
};

const getDepartmentCategoryLabel = (category) => {
  const labels = {
    CBC: 'CBC Department', EIGHT_FOUR_FOUR: '8-4-4 Department',
    TEACHING: 'Teaching Department', SUPPORT: 'Support Department'
  };
  return labels[category] || 'Department';
};

const buildDepartmentItem = (dept) => ({
  ...dept,
  type: 'DEPARTMENT',
  title: dept.name,
  shortDescription: dept.description,
  description: dept.description,
  contactName: dept.headName,
  details: [
    { title: 'Category', content: getDepartmentCategoryLabel(dept.category) },
    { title: 'Staffing', content: `${Number(dept.staffCount) || 0} staff members` },
  ].filter((item) => item.content),
});

const getSocialLinks = (item) => {
  let social = item?.socialMedia || {};
  if (typeof social === 'string') {
    try { social = JSON.parse(social); } catch { social = {}; }
  }
  if (!social || typeof social !== 'object' || Array.isArray(social)) return [];
  return Object.entries(social).filter(([, value]) => typeof value === 'string' && value.trim()).map(([label, href]) => ({ label, href: href.trim() }));
};

const renderGreenSchoolName = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.split(/(Matungulu Girls)/gi).map((part, index) =>
    part.toLowerCase() === 'matungulu girls'
      ? <span key={`${part}-${index}`} className="text-emerald-700">{part}</span>
      : part
  );
};

// ============= GALLERY MODAL (unchanged, working) =============
const GalleryModal = ({ item, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  
  useEffect(() => { setSelectedIndex(0); }, [item?.id, item?.type]);
  if (!item) return null;

  const images = normalizeSchoolImages(item);
  const selectedImage = images[selectedIndex]?.url;
  const Icon = ICONS[item.type] || FiLayers;
  const theme = TYPE_THEMES[item.type] || TYPE_THEMES.DEPARTMENT;
  const socialLinks = getSocialLinks(item);

  const handlePrev = () => {
    setIsAnimating(true);
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleNext = () => {
    setIsAnimating(true);
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: item.title || 'School Hub',
      text: item.shortDescription || item.description || `View ${item.title || 'this School Hub item'}`,
      url: shareUrl,
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        setShareStatus('Shared');
      } else if (typeof navigator !== 'undefined' && navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('Link copied');
      } else {
        setShareStatus('Share unavailable');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setShareStatus('Unable to share');
    } finally {
      setTimeout(() => setShareStatus(''), 2200);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-2 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div className="relative flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-lg" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-lg transition hover:bg-slate-100">
          <FiX className="text-lg" />
        </button>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.35fr_0.8fr]">
          <div className="relative bg-slate-100">
            <div className="relative h-[240px] sm:h-[420px] lg:h-[520px]">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={item.title} 
                  className={`h-full w-full object-contain transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
                />
              ) : (
                <div className={`flex h-full w-full items-center justify-center ${theme.bg}`}>
                  <Icon className={`text-6xl ${theme.text}`} />
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <>
                <button onClick={handlePrev} className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-white/95 text-slate-800 shadow-lg transition hover:bg-white">
                  <FiChevronRight className="rotate-180 text-xl" />
                </button>
                <button onClick={handleNext} className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-white/95 text-slate-800 shadow-lg transition hover:bg-white">
                  <FiChevronRight className="text-xl" />
                </button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/80 px-4 py-1.5 text-xs font-bold text-white">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>

          <div className="flex min-h-0 flex-col bg-white">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${theme.bg} ${theme.text}`}>
                  <Icon className="text-xs" /> {getTypeLabel(item.type)}
                </span>
                <button onClick={handleShare} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                  <FiShare2 />
                </button>
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{item.title}</h2>
              {item.description && <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{item.description}</p>}
              {shareStatus && <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-emerald-700">{shareStatus}</p>}
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-lg font-black text-slate-950">{images.length}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Photos</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-lg font-black text-slate-950">{item.details?.length || 0}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Details</p>
                </div>
              </div>

              {images.length > 1 && (
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">All Photos</p>
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 8).map((image, index) => (
                      <button
                        key={image.url}
                        onClick={() => setSelectedIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded-lg ${selectedIndex === index ? 'ring-2 ring-slate-700' : ''}`}
                      >
                        <img src={image.url} alt={image.altText || `${item.title} ${index + 1}`} className="h-full w-full object-cover" />
                        {index === 7 && images.length > 8 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-white">
                            +{images.length - 8}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(item.location || item.established || item.website) && (
                <div className="flex flex-wrap gap-2">
                  {item.location && <InfoPill icon={FiMapPin}>{item.location}</InfoPill>}
                  {item.established && <InfoPill icon={FiCalendar}>{item.established}</InfoPill>}
                  {item.website && (
                    <a href={item.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                      <FiGlobe /> Website <FiExternalLink className="text-[10px]" />
                    </a>
                  )}
                </div>
              )}

              {item.contactName && (
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Contact Person</p>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${theme.iconBg} text-white`}>
                      <FiUserCheck />
                    </div>
                    <div>
                      <p className="font-bold text-slate-950">{item.contactName}</p>
                      {item.contactEmail && <p className="text-xs text-slate-500">{item.contactEmail}</p>}
                      {item.contactPhone && <p className="text-xs text-slate-500">{item.contactPhone}</p>}
                    </div>
                  </div>
                </div>
              )}

              {socialLinks.length > 0 && (
                <div className="rounded-lg border border-slate-100 bg-white p-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">Connect With Us</p>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <a key={`${link.label}-${link.href}`} href={link.href} target="_blank" rel="noopener noreferrer" className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${theme.bg} ${theme.text}`}>
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(item.details) && item.details.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Additional Information</p>
                  {item.details.map((detail, index) => (
                    <div key={`${detail?.title || 'detail'}-${index}`} className="rounded-lg border border-slate-100 bg-white p-4">
                      <p className="text-sm font-bold text-slate-950">{detail?.title || `Detail ${index + 1}`}</p>
                      {detail?.content && <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{detail.content}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row">
              <button onClick={onClose} className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
                Close
              </button>
              <button onClick={handleShare} type="button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                <FiExternalLink /> {shareStatus || 'Share'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= SIMPLE INFO PILL =============
const InfoPill = ({ icon: Icon, children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-emerald-100 text-emerald-700",
    secondary: "bg-indigo-100 text-indigo-700",
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium ${variants[variant]}`}>
      <Icon className="text-sm" />
      {children}
    </span>
  );
};

// ============= SPINNER & REFRESH BUTTON =============
const Spinner = ({ size = "md", color = "gray" }) => {
  const sizeClasses = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  const colorClasses = { gray: "border-gray-600", white: "border-white" };
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 ${colorClasses[color]} border-t-transparent`} />
  );
};

const ModernLoadingSpinner = ({ message = "Loading content..." }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-20">
    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-900 text-white">
      <Spinner size="lg" color="white" />
    </div>
    <p className="mt-6 text-sm font-semibold text-slate-700">{message}</p>
    <div className="mt-3 flex gap-1">
      {[0, 1, 2].map(i => (
        <div key={i} className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  </div>
);

const RefreshButton = ({ refreshing, onClick }) => (
  <button
    onClick={onClick}
    disabled={refreshing}
    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60"
  >
    {refreshing ? (
      <>
        <Spinner size="sm" color="white" />
        <span>Updating...</span>
      </>
    ) : (
      <>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </>
    )}
  </button>
);

// ============= MODERN CAROUSEL CARD (for items) =============
const CarouselCard = ({ item, onClick }) => {
  const images = normalizeSchoolImages(item);
  const image = images[0]?.url;
  const Icon = ICONS[item.type] || FiLayers;
  const theme = TYPE_THEMES[item.type] || TYPE_THEMES.DEPARTMENT;
  
  return (
    <div 
      onClick={() => onClick(item)}
      className="snap-start shrink-0 w-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {image ? (
          <img src={image} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${theme.bg}`}>
            <Icon className={`text-4xl ${theme.text}`} />
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <span className={`inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${theme.text} shadow-sm`}>
            <Icon className="text-xs" /> {getTypeLabel(item.type)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-base font-black leading-tight text-slate-950 line-clamp-1">
          {item.title}
        </h3>
        {item.shortDescription && (
          <p className="mt-2 text-xs font-medium text-slate-600 line-clamp-2">
            {item.shortDescription}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {images.length} photo{images.length !== 1 ? 's' : ''}
          </span>
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${theme.iconBg} text-white`}>
            <FiChevronRight className="text-xs" />
          </span>
        </div>
      </div>
    </div>
  );
};

// ============= AUTO-SCROLL HORIZONTAL CAROUSEL =============
const AutoScrollCarousel = ({ items, onItemClick, title, icon: Icon }) => {
  const scrollRef = useRef(null);
  const autoScrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const scrollBy = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  };

  // Auto-scroll every 4.5 seconds
  useEffect(() => {
    if (!items.length || isHovered) return;
    autoScrollRef.current = window.setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
      const nextPosition = scrollLeft + clientWidth * 0.9;
      if (nextPosition + clientWidth >= scrollWidth - 2) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollTo({ left: nextPosition, behavior: "smooth" });
      }
    }, 4500);
    return () => window.clearInterval(autoScrollRef.current);
  }, [items.length, isHovered]);

  if (!items.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
            <Icon className="text-base" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">{title}</h2>
            <p className="text-xs font-bold uppercase text-slate-500">
              {items.length} {items.length === 1 ? "item" : "items"} available
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollBy(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="Scroll left"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="Scroll right"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3 touch-pan-x scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300/80"
      >
        {items.map((item) => (
          <CarouselCard key={`${item.type}-${item.id}`} item={item} onClick={onItemClick} />
        ))}
      </div>
    </div>
  );
};

// ============= MAIN PUBLIC SCHOOL HUB PAGE =============
export default function PublicSchoolHubPage({
  title = "School Hub",
  eyebrow = "Matungulu Girls Senior School",
  description = SCHOOL_INFO.description,
  singleType,
  sections,
  departments = false,
  emptyText = 'No information available yet.',
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);

  const load = async (isRefresh = false) => {
    try {
      setError('');
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      if (departments) {
        const res = await fetch('/api/staff/departments?grouped=1', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || `Failed to load departments (${res.status})`);
        setItems((data.departments || []).map(buildDepartmentItem));
      } else if (Array.isArray(sections) && sections.length > 0) {
        const responses = await Promise.all(sections.map((section) => fetch(`/api/schoolhub?type=${section.type}`, { cache: 'no-store' })));
        const payloads = await Promise.all(responses.map((res) => res.json()));
        const failed = responses.findIndex((res, index) => !res.ok || !payloads[index].success);
        if (failed >= 0) throw new Error(payloads[failed].error || `Failed to load ${sections[failed].title}`);
        const merged = payloads.flatMap((data, index) =>
          Array.isArray(data.items) ? data.items.map((item) => ({ ...item, sectionTitle: sections[index].title })) : []
        );
        setItems(merged);
      } else {
        const res = await fetch(`/api/schoolhub?type=${singleType || 'CLUB'}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || `Failed to load ${title} (${res.status})`);
        setItems(Array.isArray(data.items) ? data.items : []);
      }
    } catch (e) {
      setItems([]);
      setError(e?.message || `Failed to load ${title}.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(false); }, []);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.title, item.shortDescription, item.description, item.contactName, item.location, item.established, item.sectionTitle]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [items, search]);

  const renderedSections = useMemo(() => {
    if (Array.isArray(sections) && sections.length > 0) {
      return sections.map((section) => ({
        ...section,
        items: visibleItems.filter((item) => item.type === section.type),
      }));
    }
    if (departments) {
      return [
        { title: 'CBC Departments', type: 'DEPARTMENT', icon: FiLayers, items: visibleItems.filter((item) => item.category === 'CBC') },
        { title: '8-4-4 Departments', type: 'DEPARTMENT', icon: FiBookOpen, items: visibleItems.filter((item) => item.category === 'EIGHT_FOUR_FOUR') },
        { title: 'Teaching Departments', type: 'DEPARTMENT', icon: FiBookOpen, items: visibleItems.filter((item) => item.category === 'TEACHING') },
        { title: 'Support Departments', type: 'DEPARTMENT', icon: FiShield, items: visibleItems.filter((item) => item.category === 'SUPPORT') },
      ];
    }
    return [{ title, type: singleType || 'CLUB', items: visibleItems }];
  }, [departments, sections, singleType, title, visibleItems]);

  const totalImages = items.reduce((sum, item) => sum + normalizeSchoolImages(item).length, 0);
  const activeSectionCount = renderedSections.filter((section) => section.items.length > 0).length;
  const heroType = singleType || sections?.[0]?.type || 'DEPARTMENT';
  const HeroIcon = ICONS[heroType] || FiGrid;
  const heroStats = [
    { label: 'Published Items', value: items.length, icon: FiLayers },
    { label: 'Gallery Photos', value: totalImages, icon: FiImage },
    { label: 'Active Sections', value: activeSectionCount || renderedSections.length, icon: FiGrid },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <GalleryModal item={active} onClose={() => setActive(null)} />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* ========== ORIGINAL HERO SECTION (EXACTLY AS BEFORE) ========== */}
        <section className="overflow-hidden rounded-2xl bg-white text-slate-950 shadow-sm">
          <div className="flex flex-col items-center justify-center px-5 py-10 text-center sm:px-8 sm:py-12 lg:px-12">
            <div className="inline-flex max-w-full items-center gap-3 rounded-full bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                <Image
                  src="/MatG.jpg"
                  alt="Matungulu Girls Logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </span>
              {renderGreenSchoolName(eyebrow)}
            </div>

            <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <HeroIcon className="text-3xl" />
            </div>

            <div className="mx-auto mt-8 max-w-4xl">
              <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                {title}
                <span className="block text-slate-700">
                  {renderGreenSchoolName(SCHOOL_INFO.name)}
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
                {description || SCHOOL_INFO.description}
              </p>
            </div>

            <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {heroStats.map(({ label, value, icon: StatIcon }) => (
                <div key={label} className="rounded-2xl bg-slate-50 px-5 py-4 text-center">
                  <StatIcon className="mx-auto mb-3 text-xl text-slate-500" />
                  <p className="text-2xl font-black text-slate-950">{value}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 w-full max-w-3xl rounded-2xl bg-white p-5 text-slate-900 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                {renderGreenSchoolName(SCHOOL_INFO.shortName)}
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">{SCHOOL_INFO.motto}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: FiMapPin, label: SCHOOL_INFO.location },
                  { icon: FiPhone, label: SCHOOL_INFO.phone },
                  { icon: FiMail, label: SCHOOL_INFO.email },
                ].map(({ icon: InfoIcon, label }) => (
                  <div key={label} className="flex flex-col items-center rounded-xl bg-slate-50 p-4 text-center">
                    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <InfoIcon />
                    </span>
                    <span className="text-sm font-bold leading-6 text-slate-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== SEARCH & REFRESH SECTION (unchanged) ========== */}
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-center lg:text-left">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Browse School Life
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                Find the right information faster
              </h2>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-2xl">
              <div className="relative flex-1">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${title.toLowerCase()}...`}
                  className="h-12 w-full rounded-xl bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-500/10"
                />
              </div>
              <RefreshButton refreshing={refreshing} onClick={() => load(true)} />
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <span className="flex items-center gap-2"><FiAlertTriangle /> {error}</span>
            <button onClick={() => setError("")} className="rounded-lg p-2 text-red-600 transition hover:bg-red-100 hover:text-red-800">
              <FiX />
            </button>
          </div>
        )}

        {/* ========== MODERN AUTO-SCROLL CAROUSELS (replaces HubCarousel) ========== */}
        <section className="mt-8">
          {loading ? (
            <ModernLoadingSpinner message={`Loading ${title.toLowerCase()} content...`} />
          ) : visibleItems.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <FiLayers className="text-4xl text-slate-400" />
              </div>
              <h2 className="text-xl font-black text-slate-800">{emptyText}</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">Check back soon for updates.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {renderedSections.map((section) => {
                if (!section.items.length) return null;
                const SectionIcon = section.icon || ICONS[section.type] || FiLayers;
                return (
                  <AutoScrollCarousel
                    key={section.title}
                    title={section.title}
                    icon={SectionIcon}
                    items={section.items}
                    onItemClick={setActive}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Animation Styles (unchanged) */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce { animation: bounce 0.8s infinite ease-in-out; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .scrollbar-thin::-webkit-scrollbar { height: 6px; }
        .scrollbar-track-slate-100::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .scrollbar-thumb-slate-300\/80::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
}