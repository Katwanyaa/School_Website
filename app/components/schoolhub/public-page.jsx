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
  FiRefreshCw,
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
    case 'CLUB':
      return 'Club';
    case 'SOCIETY':
      return 'Society';
    case 'STUDENT_COUNCIL':
      return 'Student Council';
    case 'COMPUTER_LAB':
      return 'Computer Lab';
    case 'BOARDING':
      return 'Boarding';
    case 'SECURITY':
      return 'Security';
    case 'DEPARTMENT':
      return 'Department';
    default:
      return 'School Hub';
  }
};

const getDepartmentCategoryLabel = (category) => {
  switch (category) {
    case 'CBC':
      return 'CBC Department';
    case 'EIGHT_FOUR_FOUR':
      return '8-4-4 Department';
    case 'TEACHING':
      return 'Teaching Department';
    case 'SUPPORT':
      return 'Support Department';
    default:
      return 'Department';
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
    try {
      social = JSON.parse(social);
    } catch {
      social = {};
    }
  }

  if (!social || typeof social !== 'object' || Array.isArray(social)) return [];

  return Object.entries(social)
    .filter(([, value]) => typeof value === 'string' && value.trim())
    .map(([label, href]) => ({ label, href: href.trim() }));
};

const InfoPill = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
    <Icon className="text-slate-400" />
    {children}
  </span>
);

const GalleryModal = ({ item, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [item?.id, item?.type]);

  if (!item) return null;

  const images = normalizeSchoolImages(item);
  const selectedImage = images[selectedIndex]?.url;
  const Icon = ICONS[item.type] || FiLayers;
  const theme = TYPE_THEMES[item.type] || TYPE_THEMES.DEPARTMENT;
  const socialLinks = getSocialLinks(item);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-0 backdrop-blur-sm sm:p-4">
      <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-[28px]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md"
          aria-label="Close gallery"
        >
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
              {item.description && (
                <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{item.description}</p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {images.length > 1 && (
                <div className="mb-6 grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={image.url}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={`h-20 overflow-hidden rounded-2xl border bg-slate-100 ${
                        selectedIndex === index ? 'border-slate-950 ring-2 ring-slate-950/10' : 'border-slate-200'
                      }`}
                    >
                      <img src={image.url} alt={image.altText || `${item.title} ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {(item.location || item.established || item.website) && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {item.location && <InfoPill icon={FiMapPin}>{item.location}</InfoPill>}
                  {item.established && <InfoPill icon={FiCalendar}>{item.established}</InfoPill>}
                  {item.website && (
                    <a href={item.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white">
                      <FiGlobe className="text-slate-400" /> Website <FiExternalLink className="text-[10px]" />
                    </a>
                  )}
                </div>
              )}

              {item.contactName && (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coordinator</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InfoPill icon={FiUserCheck}>{item.contactName}</InfoPill>
                  </div>
                </div>
              )}

              {socialLinks.length > 0 && (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Social Links</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <a
                        key={`${link.label}-${link.href}`}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`rounded-xl border px-3 py-2 text-xs font-black capitalize ${theme.bg} ${theme.text} ${theme.border}`}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(item.details) && item.details.length > 0 && (
                <div className="space-y-3">
                  {item.details.map((detail, index) => (
                    <div key={`${detail?.title || 'detail'}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-sm font-black text-slate-950">{detail?.title || `Detail ${index + 1}`}</p>
                      {detail?.content && <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">{detail.content}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-4">
              <button type="button" onClick={onClose} className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HubCard = ({ item, onView }) => {
  const images = normalizeSchoolImages(item);
  const image = images[0]?.url;
  const Icon = ICONS[item.type] || FiLayers;
  const theme = TYPE_THEMES[item.type] || TYPE_THEMES.DEPARTMENT;
  const detailCount = Array.isArray(item.details) ? item.details.length : 0;

  return (
    <button
      type="button"
      onClick={onView}
      className={`group relative block overflow-hidden rounded-[28px] border bg-white text-left shadow-sm ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${theme.border} ${theme.ring}`}
    >
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        {image ? (
          <img src={image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
            <Icon className="text-4xl text-white/75" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${theme.bg} ${theme.text} ${theme.border}`}>
            <Icon /> {getTypeLabel(item.type)}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 rounded-full bg-slate-950/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
          {images.length} {images.length === 1 ? 'image' : 'images'}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-black leading-tight text-slate-950 line-clamp-2">{item.title}</h3>
        {item.shortDescription && (
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 line-clamp-3">{item.shortDescription}</p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-tight text-slate-700">
            <FiImage className={theme.text} /> {images.length} photos
          </span>
          {item.location && (
            <span className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-tight text-slate-700">
              <FiMapPin className={theme.text} /> {item.location}
            </span>
          )}
          {detailCount > 0 && (
            <span className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-tight text-slate-700">
              <FiLayers className={theme.text} /> {detailCount} details
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">View Details</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
            <FiChevronRight />
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

        const merged = payloads.flatMap((data, index) =>
          Array.isArray(data.items)
            ? data.items.map((item) => ({ ...item, sectionTitle: sections[index].title }))
            : []
        );
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

  useEffect(() => {
    load(false);
  }, []);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [
        item.title,
        item.shortDescription,
        item.description,
        item.contactName,
        item.location,
        item.established,
        item.sectionTitle,
      ]
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

    return [{ title, type: singleType, items: visibleItems }];
  }, [departments, sections, singleType, title, visibleItems]);

  const totalImages = items.reduce((sum, item) => sum + normalizeSchoolImages(item).length, 0);
  const heroType = singleType || sections?.[0]?.type || 'DEPARTMENT';
  const HeroIcon = ICONS[heroType] || FiGrid;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <GalleryModal item={active} onClose={() => setActive(null)} />

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white">
                <Image src="/katz.png" alt="Katwanyaa Senior School logo" width={28} height={28} className="rounded-xl object-cover" />
              </div>
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">{title}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Katwanyaa Senior</p>
            </div>
          </Link>

          <Link href="/" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50">
            <FiArrowLeft /> Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="group relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f5b4c] via-[#0d3f39] to-[#18312f] p-7 text-white shadow-2xl md:p-10">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative z-10 flex flex-col gap-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-[8px] font-black text-white">MG</div>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/80">{eyebrow}</span>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">Live School Hub</span>
              </div>
            </div>

            <div className="max-w-3xl">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <HeroIcon className="text-2xl text-emerald-200" />
              </div>
              <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-6xl">
                <span className="text-white">{title}</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                  School Life
                </span>
              </h1>
              <div className="my-5 h-1 w-20 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
              <p className="text-sm font-medium leading-7 text-emerald-50/80 sm:text-base">{description}</p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <button
                type="button"
                onClick={() => load(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-[#0f5b4c] shadow-lg transition active:scale-95 disabled:opacity-60"
              >
                <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Updating...' : 'Refresh'}
              </button>

              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${title.toLowerCase()}...`}
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-11 pr-4 text-sm font-semibold text-white placeholder:text-white/45 outline-none backdrop-blur-md focus:border-emerald-200/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                  <p className="text-lg font-black">{items.length}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Items</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                  <p className="text-lg font-black">{totalImages}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/45">Images</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center text-sm font-bold text-slate-500 shadow-sm">
            Loading {title.toLowerCase()}...
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <FiLayers className="mx-auto text-4xl text-slate-300" />
            <h2 className="mt-4 text-xl font-black text-slate-950">{emptyText}</h2>
          </div>
        ) : (
          <div className="space-y-10">
            {renderedSections.map((section) => {
              if (!section.items.length) return null;
              const SectionIcon = section.icon || ICONS[section.type] || FiLayers;
              return (
                <section key={section.title}>
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f5b4c] text-white shadow-lg">
                        <SectionIcon />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-950">{section.title}</h2>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{section.items.length} items</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
