'use client';

import { useEffect, useMemo, useState } from 'react';
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
} from 'react-icons/fi';
import { FaGraduationCap, FaHome } from 'react-icons/fa';
import { normalizeSchoolImages } from './image-upload-field';

const ICONS = {
  CLUB: FiUsers,
  SOCIETY: FaGraduationCap,
  STUDENT_COUNCIL: FiUserCheck,
  COMPUTER_LAB: FiMonitor,
  BOARDING: FaHome,
  SECURITY: FiShield,
  DEPARTMENT: FiLayers,
};

const TYPE_THEMES = {
  CLUB: { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', ring: 'ring-purple-100' },
  SOCIETY: { gradient: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', ring: 'ring-indigo-100' },
  STUDENT_COUNCIL: { gradient: 'from-fuchsia-500 to-rose-500', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', ring: 'ring-fuchsia-100' },
  COMPUTER_LAB: { gradient: 'from-sky-500 to-cyan-500', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', ring: 'ring-sky-100' },
  BOARDING: { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', ring: 'ring-amber-100' },
  SECURITY: { gradient: 'from-rose-500 to-red-500', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', ring: 'ring-rose-100' },
  DEPARTMENT: { gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', ring: 'ring-cyan-100' },
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'CLUB': return 'Club';
    case 'SOCIETY': return 'Society';
    case 'STUDENT_COUNCIL': return 'Student Council';
    case 'COMPUTER_LAB': return 'Computer Lab';
    case 'BOARDING': return 'Boarding';
    case 'SECURITY': return 'Security';
    case 'DEPARTMENT': return 'Department';
    default: return 'School Hub';
  }
};

const getDepartmentCategoryLabel = (category) => {
  switch (category) {
    case 'CBC': return 'CBC Department';
    case 'EIGHT_FOUR_FOUR': return '8-4-4 Department';
    case 'TEACHING': return 'Teaching Department';
    case 'SUPPORT': return 'Support Department';
    default: return 'Department';
  }
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

const InfoPill = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
    <Icon className="text-slate-400" />
    {children}
  </span>
);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-0 backdrop-blur-sm sm:p-4">
      <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-[28px]">
        <button onClick={onClose} className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md">
          <FiX />
        </button>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="relative min-h-[320px] bg-slate-950 sm:min-h-[520px]">
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

          <div className="flex min-h-0 flex-col bg-white">
            <div className="border-b border-slate-100 p-6">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${theme.bg} ${theme.text} ${theme.border}`}>
                <Icon /> {getTypeLabel(item.type)}
              </span>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{item.title}</h2>
              {item.description && <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{item.description}</p>}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {images.length > 1 && (
                <div className="mb-6 grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button key={image.url} onClick={() => setSelectedIndex(index)} className={`h-20 overflow-hidden rounded-2xl border bg-slate-100 ${selectedIndex === index ? 'border-slate-950 ring-2 ring-slate-950/10' : 'border-slate-200'}`}>
                      <img src={image.url} alt={image.altText || `${item.title} ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {(item.location || item.established || item.website) && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {item.location && <InfoPill icon={FiMapPin}>{item.location}</InfoPill>}
                  {item.established && <InfoPill icon={FiCalendar}>{item.established}</InfoPill>}
                  {item.website && <a href={item.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white"><FiGlobe className="text-slate-400" /> Website <FiExternalLink className="text-[10px]" /></a>}
                </div>
              )}

              {item.contactName && (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coordinator</p>
                  <div className="mt-3 flex flex-wrap gap-2"><InfoPill icon={FiUserCheck}>{item.contactName}</InfoPill></div>
                </div>
              )}

              {socialLinks.length > 0 && (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Social Links</p>
                  <div className="mt-3 flex flex-wrap gap-2">{socialLinks.map((link) => (<a key={`${link.label}-${link.href}`} href={link.href} target="_blank" rel="noopener noreferrer" className={`rounded-xl border px-3 py-2 text-xs font-black capitalize ${theme.bg} ${theme.text} ${theme.border}`}>{link.label}</a>))}</div>
                </div>
              )}

              {Array.isArray(item.details) && item.details.length > 0 && (
                <div className="space-y-3">{item.details.map((detail, index) => (<div key={`${detail?.title || 'detail'}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm font-black text-slate-950">{detail?.title || `Detail ${index + 1}`}</p>{detail?.content && <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">{detail.content}</p>}</div>))}</div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-4">
              <button onClick={onClose} className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Spinner Component
const Spinner = ({ size = "md", color = "white" }) => {
  const sizeClasses = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-${color}/20 border-t-${color} border-r-${color}`} />
      <div className={`absolute inset-0 ${sizeClasses[size]} animate-ping rounded-full border-2 border-${color}/20 opacity-30`} />
    </div>
  );
};

// Modern Loading Spinner for page
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
      <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-emerald-600/20 animate-pulse" />
    </div>
    <p className="mt-4 text-sm font-bold text-emerald-800">{message}</p>
  </div>
);

// Refresh Button with Spinner
const RefreshButton = ({ refreshing, onClick }) => (
  <button
    onClick={onClick}
    disabled={refreshing}
    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-[#0f5b4c] shadow-lg transition active:scale-95 disabled:opacity-60"
  >
    {refreshing ? (
      <>
        <Spinner size="sm" color="emerald-600" />
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

const HubCard = ({ item, onView }) => {
  const images = normalizeSchoolImages(item);
  const image = images[0]?.url;
  const Icon = ICONS[item.type] || FiLayers;
  const theme = TYPE_THEMES[item.type] || TYPE_THEMES.DEPARTMENT;
  const detailCount = Array.isArray(item.details) ? item.details.length : 0;

  return (
    <button
      onClick={onView}
      className={`group relative block overflow-hidden rounded-2xl border bg-white text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${theme.border} ${theme.ring}`}
    >
      {/* Reduced height image section */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        {image ? (
          <img src={image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
            <Icon className="text-3xl text-white/75" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${theme.bg} ${theme.text} ${theme.border}`}>
            <Icon className="text-[10px]" /> {getTypeLabel(item.type)}
          </span>
        </div>
        <div className="absolute bottom-2 right-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white backdrop-blur">
          {images.length} 📷
        </div>
      </div>

      {/* Compact content section */}
      <div className="p-3">
        <h3 className="text-base font-black leading-tight text-slate-950 line-clamp-1">{item.title}</h3>
        {item.shortDescription && (
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 line-clamp-2">{item.shortDescription}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-tight text-slate-700">
            <FiImage className={`text-[9px] ${theme.text}`} /> {images.length}
          </span>
          {item.location && (
            <span className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-tight text-slate-700">
              <FiMapPin className={`text-[9px] ${theme.text}`} /> {item.location}
            </span>
          )}
          {detailCount > 0 && (
            <span className="flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-tight text-slate-700">
              <FiLayers className={`text-[9px] ${theme.text}`} /> {detailCount}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">View</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-950 text-white">
            <FiChevronRight className="text-xs" />
          </span>
        </div>
      </div>
    </button>
  );
};

export default function PublicSchoolHubPage({
  title,
  eyebrow = 'School Hub',
  description,
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
        if (!res.ok || !data.success) throw new Error(data.error || `Failed to load departments (${res.status})`);
        setItems((data.departments || []).map(buildDepartmentItem));
      } else if (Array.isArray(sections) && sections.length > 0) {
        const responses = await Promise.all(sections.map((section) => fetch(`/api/schoolhub?type=${section.type}`)));
        const payloads = await Promise.all(responses.map((res) => res.json()));
        const failed = responses.findIndex((res, index) => !res.ok || !payloads[index].success);
        if (failed >= 0) throw new Error(payloads[failed].error || `Failed to load ${sections[failed].title}`);
        const merged = payloads.flatMap((data, index) => Array.isArray(data.items) ? data.items.map((item) => ({ ...item, sectionTitle: sections[index].title })) : []);
        setItems(merged);
      } else {
        const res = await fetch(`/api/schoolhub?type=${singleType}`);
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
    return items.filter((item) => [item.title, item.shortDescription, item.description, item.contactName, item.location, item.established, item.sectionTitle].filter(Boolean).some((value) => String(value).toLowerCase().includes(q)));
  }, [items, search]);

  const renderedSections = useMemo(() => {
    if (Array.isArray(sections) && sections.length > 0) {
      return sections.map((section) => ({ ...section, items: visibleItems.filter((item) => item.type === section.type) }));
    }
    if (departments) {
      return [
        { title: 'CBC Departments', type: 'DEPARTMENT', icon: FiLayers, items: visibleItems.filter((item) => item.category === 'CBC') },
        { title: '8-4-4 Departments', type: 'DEPARTMENT', icon: FiBookOpen, items: visibleItems.filter((item) => item.category === 'EIGHT_FOUR_FOUR') },
        { title: 'Teaching Departments', type: 'DEPARTMENT', icon: FiBookOpen, items: visibleItems.filter((item) => item.category === 'TEACHING') },
        { title: 'Support Departments', type: 'DEPARTMENT', icon: FiShield, items: visibleItems.filter((item) => item.category === 'SUPPORT') },
      ];
    }
    return [{ title, type: singleType, items: visibleItems }];
  }, [departments, sections, singleType, title, visibleItems]);

  const totalImages = items.reduce((sum, item) => sum + normalizeSchoolImages(item).length, 0);
  const heroType = singleType || sections?.[0]?.type || 'DEPARTMENT';
  const HeroIcon = ICONS[heroType] || FiGrid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0a0a2a] to-slate-900 text-slate-100">
      <GalleryModal item={active} onClose={() => setActive(null)} />

      {/* Dark Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-full px-6 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-white">
                <Image src="/katz.png" alt="Katwanyaa Senior School logo" width={24} height={24} className="rounded-lg object-cover" />
              </div>
            </div>
            <div>
              <p className="text-xs font-black tracking-tight text-white">{title}</p>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-400">Katwanyaa Senior</p>
            </div>
          </Link>

          <Link href="/" className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10">
            <FiArrowLeft /> Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-full px-6 py-8 sm:px-8 lg:px-12">
        {/* Hero Section - Dark Theme */}
        <div className="group relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-[#0a0a2a] to-slate-900 p-6 text-white shadow-2xl md:p-8 border border-white/10">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px]" />
          
          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-[8px] font-black text-white">K</div>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/80">{eyebrow}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[7px] font-bold uppercase tracking-wider text-white/60">Live</span>
              </div>
            </div>

            <div className="max-w-2xl">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                <HeroIcon className="text-xl text-emerald-400" />
              </div>
              <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl md:text-4xl">
                <span className="text-white">{title}</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500">
                  Experience
                </span>
              </h1>
              <div className="my-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              <p className="text-xs font-medium leading-6 text-white/70 sm:text-sm">{description}</p>
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <RefreshButton refreshing={refreshing} onClick={() => load(true)} />

              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${title.toLowerCase()}...`}
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 pl-9 pr-3 text-sm font-semibold text-white placeholder:text-white/40 outline-none backdrop-blur-md focus:border-emerald-400/50"
                />
              </div>

              <div className="flex gap-2">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                  <p className="text-base font-black">{items.length}</p>
                  <p className="text-[7px] font-bold uppercase tracking-widest text-white/40">Items</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                  <p className="text-base font-black">{totalImages}</p>
                  <p className="text-[7px] font-bold uppercase tracking-widest text-white/40">Images</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300">{error}</div>}

        {loading ? (
          <LoadingSpinner message={`Loading ${title.toLowerCase()}...`} />
        ) : visibleItems.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <FiLayers className="mx-auto text-3xl text-white/30" />
            <h2 className="mt-3 text-lg font-black text-white/70">{emptyText}</h2>
          </div>
        ) : (
          <div className="space-y-8">
            {renderedSections.map((section) => {
              if (!section.items.length) return null;
              const SectionIcon = section.icon || ICONS[section.type] || FiLayers;
              return (
                <section key={section.title}>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 shadow-lg">
                      <SectionIcon className="text-sm" />
                    </div>
                    <div>
                      <h2 className="text-base font-black tracking-tight text-white">{section.title}</h2>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-400/60">{section.items.length} items</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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