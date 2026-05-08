'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiChevronRight,
  FiExternalLink,
  FiGlobe,
  FiGrid,
  FiImage,
  FiLayers,
  FiMapPin,
  FiMonitor,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiUsers,
  FiX,
  FiHeart,
  FiStar,
  FiTrendingUp,
  FiClock,
  FiAward,
  FiBriefcase,
  FiHome,
  FiMail,
  FiPhone,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiLinkedin,
  FiAlertTriangle,
  FiRefreshCw,
} from 'react-icons/fi';
import { 
  FaGraduationCap, 
  FaHome, 
  FaSchool, 
  FaBook, 
  FaChalkboardTeacher, 
  FaUsers as FaUsersIcon,
  FaRobot,
  FaHeart as FaHeartIcon,
  FaShieldAlt,
  FaTree,
  FaHandsHelping,
  FaCrown,
} from 'react-icons/fa';
import { normalizeSchoolImages } from './image-upload-field';

// ============= ICONS CONFIGURATION =============
const ICONS = {
  CLUB: FiUsers,
  SOCIETY: FaGraduationCap,
  STUDENT_COUNCIL: FiUserCheck,
  COMPUTER_LAB: FiMonitor,
  BOARDING: FaHome,
  SECURITY: FiShield,
  DEPARTMENT: FiLayers,
  SPORTS: FiAward,
  ARTS: FiHeart,
  SCIENCE: FiBookOpen,
  TECHNOLOGY: FiMonitor,
  LEADERSHIP: FiStar,
};

// ============= THEME CONFIGURATIONS =============
const TYPE_THEMES = {
  CLUB: { 
    gradient: 'from-purple-600 via-pink-600 to-rose-500', 
    bg: 'bg-purple-50', 
    text: 'text-purple-700', 
    border: 'border-purple-200', 
    ring: 'ring-purple-100',
  },
  SOCIETY: { 
    gradient: 'from-indigo-600 via-blue-600 to-cyan-500', 
    bg: 'bg-indigo-50', 
    text: 'text-indigo-700', 
    border: 'border-indigo-200', 
    ring: 'ring-indigo-100',
  },
  STUDENT_COUNCIL: { 
    gradient: 'from-fuchsia-600 via-rose-500 to-pink-500', 
    bg: 'bg-fuchsia-50', 
    text: 'text-fuchsia-700', 
    border: 'border-fuchsia-200', 
    ring: 'ring-fuchsia-100',
  },
  COMPUTER_LAB: { 
    gradient: 'from-sky-600 via-cyan-500 to-blue-500', 
    bg: 'bg-sky-50', 
    text: 'text-sky-700', 
    border: 'border-sky-200', 
    ring: 'ring-sky-100',
  },
  BOARDING: { 
    gradient: 'from-amber-600 via-orange-500 to-yellow-500', 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    border: 'border-amber-200', 
    ring: 'ring-amber-100',
  },
  SECURITY: { 
    gradient: 'from-rose-600 via-red-500 to-pink-500', 
    bg: 'bg-rose-50', 
    text: 'text-rose-700', 
    border: 'border-rose-200', 
    ring: 'ring-rose-100',
  },
  DEPARTMENT: { 
    gradient: 'from-cyan-600 via-blue-500 to-indigo-500', 
    bg: 'bg-cyan-50', 
    text: 'text-cyan-700', 
    border: 'border-cyan-200', 
    ring: 'ring-cyan-100',
  },
};

// ============= UTILITY FUNCTIONS =============
const getTypeLabel = (type) => {
  const labels = {
    CLUB: 'Club', SOCIETY: 'Society', STUDENT_COUNCIL: 'Student Council',
    COMPUTER_LAB: 'Computer Lab', BOARDING: 'Boarding', SECURITY: 'Security',
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

// ============= COMPONENTS =============

// Spinner Component
const Spinner = ({ size = "md", color = "emerald" }) => {
  const sizeClasses = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  const colorClasses = {
    emerald: "border-emerald-200 border-t-emerald-600",
    white: "border-white/20 border-t-white",
  };
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 ${colorClasses[color]}`} />
  );
};

// Info Pill Component
const InfoPill = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
    <Icon className="text-slate-400" />
    {children}
  </span>
);

// Gallery Modal Component
const GalleryModal = ({ item, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => { setSelectedIndex(0); }, [item?.id, item?.type]);
  if (!item) return null;

  const images = normalizeSchoolImages(item);
  const selectedImage = images[selectedIndex]?.url;
  const Icon = ICONS[item.type] || FiLayers;
  const theme = TYPE_THEMES[item.type] || TYPE_THEMES.DEPARTMENT;
  const socialLinks = getSocialLinks(item);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" onClick={onClose}>
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white rounded-2xl shadow-2xl sm:h-auto sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all">
          <FiX />
        </button>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="relative min-h-[320px] bg-slate-900 sm:min-h-[500px]">
            {selectedImage ? (
              <img src={selectedImage} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
                <Icon className="text-5xl text-white/75" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
              <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-col bg-white overflow-y-auto">
            <div className="border-b border-slate-100 p-5">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${theme.bg} ${theme.text} ${theme.border}`}>
                <Icon /> {getTypeLabel(item.type)}
              </span>
              <h2 className="mt-3 text-xl font-black tracking-tight text-slate-900">{item.title}</h2>
              {item.description && <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{item.description}</p>}
            </div>

            <div className="flex-1 p-5 space-y-4">
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((image, index) => (
                    <button key={image.url} onClick={() => setSelectedIndex(index)} className={`h-16 overflow-hidden rounded-lg border ${selectedIndex === index ? 'border-slate-900 ring-2 ring-slate-200' : 'border-slate-200'}`}>
                      <img src={image.url} alt={image.altText || `${item.title} ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {(item.location || item.established || item.website) && (
                <div className="flex flex-wrap gap-2">
                  {item.location && <InfoPill icon={FiMapPin}>{item.location}</InfoPill>}
                  {item.established && <InfoPill icon={FiCalendar}>{item.established}</InfoPill>}
                  {item.website && (
                    <a href={item.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white">
                      <FiGlobe /> Website
                    </a>
                  )}
                </div>
              )}

              {item.contactName && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coordinator</p>
                  <p className="mt-1 font-bold text-slate-900">{item.contactName}</p>
                </div>
              )}

              {socialLinks.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Social Links</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={`rounded-lg border px-3 py-1.5 text-xs font-bold capitalize ${theme.bg} ${theme.text} ${theme.border}`}>
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(item.details) && item.details.length > 0 && (
                <div className="space-y-3">
                  {item.details.map((detail, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-black text-slate-900">{detail.title}</p>
                      {detail.content && <p className="mt-1 text-sm text-slate-600">{detail.content}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-4">
              <button onClick={onClose} className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hub Card Component - COMPACT
const HubCard = ({ item, onView }) => {
  const images = normalizeSchoolImages(item);
  const image = images[0]?.url;
  const Icon = ICONS[item.type] || FiLayers;
  const theme = TYPE_THEMES[item.type] || TYPE_THEMES.DEPARTMENT;

  return (
    <button
      onClick={onView}
      className={`group relative overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${theme.border}`}
    >
      <div className="relative h-32 w-full overflow-hidden bg-slate-100">
        {image ? (
          <img src={image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
            <Icon className="text-2xl text-white/75" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute left-2 top-2">
          <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${theme.bg} ${theme.text} ${theme.border}`}>
            <Icon className="text-[8px]" /> {getTypeLabel(item.type)}
          </span>
        </div>
        <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[7px] font-black text-white">
          {images.length} 📷
        </div>
      </div>

      <div className="p-2.5">
        <h3 className="text-xs font-black leading-tight text-slate-900 line-clamp-1">{item.title}</h3>
        {item.shortDescription && (
          <p className="mt-1 text-[9px] font-medium leading-3 text-slate-500 line-clamp-2">{item.shortDescription}</p>
        )}
        <div className="mt-2 flex items-center justify-end border-t border-slate-100 pt-1.5">
          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">View</span>
          <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-md bg-slate-900 text-white">
            <FiChevronRight className="text-[8px]" />
          </span>
        </div>
      </div>
    </button>
  );
};

// Main Component
export default function PublicSchoolHubPage({
  title = "School Hub",
  eyebrow = "Katwanyaa Senior",
  description = "Explore the vibrant life and opportunities at Katwanyaa Senior School.",
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
        const res = await fetch('/api/staff/departments?grouped=1');
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || `Failed to load departments`);
        setItems((data.departments || []).map(buildDepartmentItem));
      } else if (Array.isArray(sections) && sections.length > 0) {
        const responses = await Promise.all(sections.map((section) => fetch(`/api/schoolhub?type=${section.type}`)));
        const payloads = await Promise.all(responses.map((res) => res.json()));
        const merged = payloads.flatMap((data, index) =>
          Array.isArray(data.items) ? data.items.map((item) => ({ ...item, sectionTitle: sections[index].title })) : []
        );
        setItems(merged);
      } else {
        const res = await fetch(`/api/schoolhub?type=${singleType || 'CLUB'}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || `Failed to load ${title}`);
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
      [item.title, item.shortDescription, item.description, item.contactName, item.location, item.established]
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
  const HeroIcon = ICONS[singleType || 'CLUB'] || FiGrid;

  return (
    // WHITE BACKGROUND FOR MAIN CONTENT
    <div className="min-h-screen bg-white">
      <GalleryModal item={active} onClose={() => setActive(null)} />

      {/* DARK HEADER ONLY */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-white">
                  <Image src="/katz.png" alt="Logo" width={24} height={24} className="rounded-lg object-cover" />
                </div>
              </div>
              <div>
                <p className="text-xs font-black tracking-tight text-white">Katwanyaa Senior</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-400">Education is Light</p>
              </div>
            </Link>

            <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/80 hover:bg-white/20 transition-all">
              <FiArrowLeft /> Back
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - WHITE BACKGROUND, PROPER SPACING FROM LEFT/RIGHT */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section - COMPACT with Katwanyaa colors */}
        <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 p-5 text-white shadow-lg">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                <HeroIcon className="text-base" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/80">{eyebrow}</span>
            </div>

            <div>
              <h1 className="text-xl font-black leading-tight tracking-tight sm:text-2xl">
                <span className="text-white">{title}</span>
              </h1>
              <p className="mt-1 text-xs font-medium text-white/80 max-w-2xl">{description}</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={() => load(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-xs font-black text-white hover:bg-white/30 transition-all disabled:opacity-50"
              >
                {refreshing ? <Spinner size="sm" color="white" /> : <FiRefreshCw className="text-xs" />}
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              {/* SEARCH - LIMITED WIDTH, DOESN'T STRETCH */}
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-xs" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded-lg border border-white/20 bg-white/10 py-1.5 pl-8 pr-3 text-xs font-medium text-white placeholder:text-white/50 outline-none focus:border-white/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row - COMPACT */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-lg font-black text-slate-800">{items.length}</p>
            <p className="text-[8px] font-bold uppercase text-slate-400">Items</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-lg font-black text-slate-800">{totalImages}</p>
            <p className="text-[8px] font-bold uppercase text-slate-400">Images</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-lg font-black text-slate-800">{visibleItems.length}</p>
            <p className="text-[8px] font-bold uppercase text-slate-400">Showing</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-lg font-black text-slate-800">{sections?.length || 1}</p>
            <p className="text-[8px] font-bold uppercase text-slate-400">Sections</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" color="emerald" />
            <span className="ml-3 text-sm text-slate-500">Loading...</span>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <FiLayers className="mx-auto text-3xl text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">{emptyText}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {renderedSections.map((section) => {
              if (!section.items.length) return null;
              const SectionIcon = section.icon || ICONS[section.type] || FiLayers;
              return (
                <section key={section.title}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <SectionIcon className="text-sm" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black tracking-tight text-slate-800">{section.title}</h2>
                      <p className="text-[8px] font-bold uppercase text-slate-400">{section.items.length} items</p>
                    </div>
                  </div>

                  {/* GRID - PROPERLY SPACED FROM LEFT AND RIGHT EDGES */}
                  {/* Items fill the container naturally without excess gaps */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {section.items.map((item) => (
                      <HubCard key={`${item.type}-${item.id}`} item={item} onView={() => setActive(item)} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}