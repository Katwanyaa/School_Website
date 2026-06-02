'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiChevronDown,
  FiChevronRight,
  FiDollarSign,
  FiExternalLink,
  FiFileText,
  FiGrid,
  FiHeart,
  FiHome,
  FiImage,
  FiInfo,
  FiLayers,
  FiLock,
  FiMail,
  FiMenu,
  FiPhone,
  FiShield,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { SiFacebook, SiInstagram, SiYoutube } from 'react-icons/si';

// === Primary navigation links (always visible) ===
const primaryLinks = [
  { name: 'Home', href: '/', icon: FiHome, exact: true },
  { name: 'About', href: '/pages/AboutUs', icon: FiInfo },
  { name: 'Admissions', href: '/pages/admissions', icon: FiBookOpen },
  { name: 'Gallery', href: '/pages/gallery', icon: FiImage },
  { name: 'Events & News', href: '/pages/eventsandnews', icon: FiCalendar },
];

// === Top utility bar links (compact) ===
const utilityLinks = [
  { name: 'Student Portal', href: '/pages/StudentPortal', icon: FiFileText },
  { name: 'School Fees', href: '/pages/fees', icon: FiDollarSign },
  { name: 'Contact', href: '/pages/contact', icon: FiPhone },
  { name: 'Admin Login', href: '/pages/adminLogin', icon: FiLock, secure: true },
];

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://web.facebook.com/groups/414008468611340',
    icon: SiFacebook,
    className: 'bg-[#1877F2] hover:bg-[#0A5CD0]',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@A.I.C.-KATWANYAA-HIGH-SCHOOOL',
    icon: SiYoutube,
    className: 'bg-[#FF0000] hover:bg-[#CC0000]',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/katwanyaahigh',
    icon: SiInstagram,
    className: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:brightness-110',
  },
];

// === Academics mega dropdown (mirrors the “Academics” group from Matungulu, adapted for Katwanyaa) ===
const academicLinks = [
  {
    name: 'Staff Directory',
    href: '/pages/staff',
    icon: FiUsers,
    description: 'Meet our dedicated team',
  },
  {
    name: 'Departments',
    href: '/pages/Departments',
    icon: FiLayers,
    description: 'CBC, 8‑4‑4, teaching & support departments',
  },
  {
    name: 'Guidance & Counselling',
    href: '/pages/Guidance-and-Councelling',
    icon: FiHeart,
    description: 'Student wellness & counselling services',
  },
  {
    name: 'Achievements',
    href: '/pages/Achievements',
    icon: FiAward,
    description: 'Academic, arts, sports & leadership milestones',
  },
  {
    name: 'School Rules',
    href: '/pages/OurSchoolPolicies',
    icon: FiShield,
    description: 'Policies, rules & student expectations',
  },
  {
    name: 'Alumni Network',
    href: 'https://www.facebook.com/groups/414008468611340/',
    icon: FiExternalLink,
    description: 'Connect with former students',
    external: true,
  },
  {
    name: 'Zeraki Analytics',
    href: 'https://analytics.zeraki.app/',
    icon: FiExternalLink,
    description: 'External analytics platform',
    external: true,
  },
];

// === School Hub mega dropdown (renamed “Resources” for Katwanyaa, similar structure) ===
const schoolHubLinks = [
  {
    name: 'Clubs & Societies',
    href: '/pages/clubs',
    icon: FiUsers,
    description: 'Co‑curricular activities & student communities',
  },
  {
    name: 'Student Council',
    href: '/pages/student-council',
    icon: FiUsers,
    description: 'Student leadership and representation',
  },
  {
    name: 'Boarding',
    href: '/pages/Boarding',
    icon: FiHome,
    description: 'Boarding life, facilities & expectations',
  },
  {
    name: 'Security',
    href: '/pages/Security',
    icon: FiShield,
    description: 'Safety measures & security information',
  },
  {
    name: 'Careers',
    href: '/pages/careers',
    icon: FiBriefcase,
    description: 'Join the Katwanyaa family',
  },
];

// Group definitions for the mega dropdowns
const navGroups = [
  { id: 'academics', label: 'Academics', icon: FiBookOpen, links: academicLinks },
  { id: 'schoolHub', label: 'Resources', icon: FiGrid, links: schoolHubLinks },
];

// Helper to normalise hrefs for active state
const normalizeHref = (href) => {
  if (!href || !href.startsWith('/')) return '';
  return href.split('#')[0].split('?')[0];
};

export default function ModernNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navRef = useRef(null);
  const pathname = usePathname();

  // Scroll & resize handlers
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const isActiveLink = (href, exact = false) => {
    const normalizedHref = normalizeHref(href);
    if (!pathname || !normalizedHref) return false;
    if (normalizedHref === '/') return pathname === '/';
    return exact ? pathname === normalizedHref : pathname.startsWith(normalizedHref);
  };

  const isGroupActive = (links) => links.some((link) => isActiveLink(link.href));

  const closeAll = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const SocialLink = ({ item, mobile = false }) => {
    const Icon = item.icon;

    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Katwanyaa Senior School on ${item.name}`}
        title={item.name}
        className={`inline-flex shrink-0 items-center justify-center rounded-full text-white shadow-sm ring-1 ring-white/20 transition-all hover:-translate-y-0.5 hover:shadow-md ${item.className} ${
          mobile ? 'h-10 w-10 text-lg' : 'h-7 w-7 text-sm'
        }`}
      >
        <Icon />
      </a>
    );
  };

  // Reusable link component (shared by top bar & main nav)
  const NavLink = ({ item, compact = false }) => {
    const Icon = item.icon;
    const active = isActiveLink(item.href, item.exact);
    const externalProps = item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

    return (
      <a
        href={item.href}
        onClick={closeAll}
        className={`group inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-extrabold transition-all ${
          active
            ? 'border-blue-200 bg-blue-50 text-blue-800'
            : compact
              ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
              : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50'
        }`}
        {...externalProps}
      >
        <Icon className="shrink-0 text-sm" />
        <span className="whitespace-nowrap">{item.name}</span>
        {item.external && <FiExternalLink className="text-[11px] opacity-60" />}
      </a>
    );
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'shadow-xl shadow-indigo-950/20' : 'shadow-lg shadow-indigo-950/10'
        }`}
      >
        {/* ---------- TOP UTILITY BAR (compact) ---------- */}
        <div className="hidden border-b py-2 border-white/10 bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 text-white lg:block">
          <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-5 text-[13px] font-black uppercase tracking-[0.2em] text-blue-100/80">
              <span>KATZ </span>
              <span className="h-1 w-1 rounded-full bg-blue-300" />
              <span>GOD FIRST</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border-r border-white/10 pr-3">
                <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-white/45 xl:inline">
                  Follow uS
                </span>
                {socialLinks.map((item) => (
                  <SocialLink key={item.name} item={item} />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {utilityLinks.map((item) => (
                  <NavLink key={item.name} item={item} compact />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- MAIN NAVBAR ---------- */}
        <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            {/* Logo */}
            <a href="/" onClick={closeAll} className="flex min-w-0 items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-md bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-400 p-[1px] shadow-lg">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white">
                  <Image
                    src="/katz.jpeg"
                    alt="Katwanyaa Senior School Logo"
                    width={34}
                    height={34}
                    className="rounded-xl object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-black  text-slate-950 sm:text-lg">
                  Katz
                </p>
                <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 sm:text-[11px]">
                  Katwanyaa Senior
                </p>
              </div>
            </a>

            {/* Desktop primary links + mega dropdowns */}
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
              {primaryLinks.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}

              {navGroups.map((group) => {
                const Icon = group.icon;
                const open = activeDropdown === group.id;
                const active = isGroupActive(group.links);

                return (
                  <div
                    key={group.id}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(group.id)}
                  >
                    <button
                      onClick={() => setActiveDropdown(open ? null : group.id)}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-extrabold transition-all ${
                        open || active
                          ? 'border-blue-200 bg-blue-50 text-blue-800'
                          : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                      aria-expanded={open}
                      aria-haspopup="true"
                    >
                      <Icon className="text-sm" />
                      <span>{group.label}</span>
                      <FiChevronDown className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>

                    {open && (
                      <div
                        className="absolute left-1/2 top-full z-50 mt-3 w-[540px] -translate-x-1/2 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-indigo-950/15"
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        {/* Dropdown header */}
                        <div className="bg-gradient-to-br from-blue-800 via-indigo-800 to-purple-900 px-5 py-4 text-white">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                              <Icon />
                            </div>
                            <div>
                              <h3 className="text-sm font-black uppercase tracking-[0.18em]">
                                {group.label}
                              </h3>
                              <p className="mt-1 text-xs font-semibold text-white/60">
                                Organized links for quick navigation
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Two‑column link grid */}
                        <div className="grid grid-cols-2 gap-2 p-3">
                          {group.links.map((item) => {
                            const LinkIcon = item.icon;
                            const itemActive = isActiveLink(item.href);
                            const externalProps = item.external
                              ? { target: '_blank', rel: 'noopener noreferrer' }
                              : {};

                            return (
                              <a
                                key={item.name}
                                href={item.href}
                                onClick={closeAll}
                                className={`group/link flex items-start gap-3 rounded-2xl p-3 transition-all ${
                                  itemActive ? 'bg-blue-50' : 'hover:bg-slate-50'
                                }`}
                                {...externalProps}
                              >
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                                    itemActive
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-slate-100 text-slate-600 group-hover/link:bg-blue-100 group-hover/link:text-blue-700'
                                  }`}
                                >
                                  <LinkIcon />
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-sm font-black ${itemActive ? 'text-blue-900' : 'text-slate-900'}`}>
                                    {item.name}
                                  </p>
                                  <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                                    {item.description}
                                  </p>
                                </div>
                                <FiChevronRight className="ml-auto mt-3 shrink-0 text-xs text-slate-300 opacity-0 transition group-hover/link:opacity-100" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm lg:hidden"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* ---------- MOBILE MENU ---------- */}
        {isOpen && (
          <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-b border-slate-200 bg-white shadow-2xl lg:hidden">
            <div className="space-y-5 px-4 py-5 sm:px-6">
              {/* Compact utility links on mobile */}
              <div className="grid grid-cols-2 gap-2">
                {utilityLinks.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Follow Us
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-slate-600">
                    Katwanyaa Senior School updates
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {socialLinks.map((item) => (
                    <SocialLink key={item.name} item={item} mobile />
                  ))}
                </div>
              </div>

              <MobileSection title="Main Navigation" links={primaryLinks} isActiveLink={isActiveLink} onClose={closeAll} />
              <MobileSection title="Academics" links={academicLinks} isActiveLink={isActiveLink} onClose={closeAll} />
              <MobileSection title="Resources" links={schoolHubLinks} isActiveLink={isActiveLink} onClose={closeAll} />

              <div className="rounded-[24px]  bg-gradient-to-br from-blue-800 via-indigo-800 to-purple-900 p-4 text-center text-white">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-100/80">
                  Katwanyaa Senior School
                </p>
                <p className="mt-1 text-sm font-semibold text-white/65">
                  GOD First
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar (height matches top bar + main bar) */}
      <div className="h-[72px] lg:h-[112px]" />
    </>
  );
}

// ---------- Mobile section component (reused for each link group) ----------
function MobileSection({ title, links, isActiveLink, onClose }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
          {title}
        </h2>
      </div>
      <div className="space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          const active = isActiveLink(item.href, item.exact);
          const externalProps = item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

          return (
            <a
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                active
                  ? 'border-blue-200 bg-blue-50 text-blue-900'
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
              }`}
              {...externalProps}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black">{item.name}</p>
                {item.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-slate-500">
                    {item.description}
                  </p>
                )}
              </div>
              {item.external ? (
                <FiExternalLink className="text-xs text-slate-400" />
              ) : (
                <FiChevronRight className="text-xs text-slate-400" />
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}
