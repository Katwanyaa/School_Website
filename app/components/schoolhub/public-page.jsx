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
  FiGithub,
  FiCodepen,
  FiDribbble,
  FiBehance,
  FiFigma,
  FiSlack,
  FiDiscord,
  FiTwitch,
  FiTiktok,
  FiSnapchat,
  FiPinterest,
  FiReddit,
  FiMedium,
  FiBookmark,
  FiShare2,
  FiThumbsUp,
  FiMessageCircle,
  FiSend,
  FiMoreVertical,
  FiCopy,
  FiDownload,
  FiCloud,
  FiCloudLightning,
  FiCloudRain,
  FiCloudSnow,
  FiSun,
  FiMoon,
  FiWind,
  FiCompass,
  FiAnchor,
  FiArchive,
  FiBarChart,
  FiBattery,
  FiBell,
  FiBluetooth,
  FiBox,
  FiBriefcase as FiBriefcaseIcon,
  FiCamera,
  FiCast,
  FiChrome,
  FiCircle,
  FiClipboard,
  FiClock as FiClockIcon,
  FiCoffee,
  FiCompass as FiCompassIcon,
} from 'react-icons/fi';
import { 
  FaGraduationCap, 
  FaHome, 
  FaSchool, 
  FaBook, 
  FaChalkboardTeacher, 
  FaUsers as FaUsersIcon,
  FaRobot,
  FaBrain,
  FaMicrochip,
  FaRocket,
  FaGem,
  FaCrown,
  FaMedal,
  FaTrophy,
  FaUniversity,
  FaLandmark,
  FaTree,
  FaSeedling,
  FaHandsHelping,
  FaChild,
  FaApple,
  FaAndroid,
  FaWindows,
  FaLinux,
  FaCode,
  FaDatabase,
  FaCloud,
  FaLock,
  FaShieldAlt,
  FaDragon,
  FaFeather,
  FaFire,
  FaWater,
  FaEarth,
  FaWind as FaWindIcon,
  FaSun as FaSunIcon,
  FaMoon as FaMoonIcon,
  FaStar,
  FaHeart as FaHeartIcon,
  FaInfinity,
  FaPeace,
  FaDove,
  FaOwl,
  FaWolf,
  FaEagle,
} from 'react-icons/fa';
import { normalizeSchoolImages } from './image-upload-field';

// ============= ENHANCED ICONS CONFIGURATION =============
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
    lightGradient: 'from-purple-50 to-pink-50',
    bg: 'bg-purple-50/80', 
    text: 'text-purple-700', 
    border: 'border-purple-200', 
    ring: 'ring-purple-100',
    iconBg: 'bg-purple-600',
    badge: 'bg-purple-100 text-purple-800',
    hover: 'hover:border-purple-300 hover:shadow-purple-500/20'
  },
  SOCIETY: { 
    gradient: 'from-indigo-600 via-blue-600 to-cyan-500', 
    lightGradient: 'from-indigo-50 to-blue-50',
    bg: 'bg-indigo-50/80', 
    text: 'text-indigo-700', 
    border: 'border-indigo-200', 
    ring: 'ring-indigo-100',
    iconBg: 'bg-indigo-600',
    badge: 'bg-indigo-100 text-indigo-800',
    hover: 'hover:border-indigo-300 hover:shadow-indigo-500/20'
  },
  STUDENT_COUNCIL: { 
    gradient: 'from-fuchsia-600 via-rose-500 to-pink-500', 
    lightGradient: 'from-fuchsia-50 to-rose-50',
    bg: 'bg-fuchsia-50/80', 
    text: 'text-fuchsia-700', 
    border: 'border-fuchsia-200', 
    ring: 'ring-fuchsia-100',
    iconBg: 'bg-fuchsia-600',
    badge: 'bg-fuchsia-100 text-fuchsia-800',
    hover: 'hover:border-fuchsia-300 hover:shadow-fuchsia-500/20'
  },
  COMPUTER_LAB: { 
    gradient: 'from-sky-600 via-cyan-500 to-blue-500', 
    lightGradient: 'from-sky-50 to-cyan-50',
    bg: 'bg-sky-50/80', 
    text: 'text-sky-700', 
    border: 'border-sky-200', 
    ring: 'ring-sky-100',
    iconBg: 'bg-sky-600',
    badge: 'bg-sky-100 text-sky-800',
    hover: 'hover:border-sky-300 hover:shadow-sky-500/20'
  },
  BOARDING: { 
    gradient: 'from-amber-600 via-orange-500 to-yellow-500', 
    lightGradient: 'from-amber-50 to-orange-50',
    bg: 'bg-amber-50/80', 
    text: 'text-amber-700', 
    border: 'border-amber-200', 
    ring: 'ring-amber-100',
    iconBg: 'bg-amber-600',
    badge: 'bg-amber-100 text-amber-800',
    hover: 'hover:border-amber-300 hover:shadow-amber-500/20'
  },
  SECURITY: { 
    gradient: 'from-rose-600 via-red-500 to-pink-500', 
    lightGradient: 'from-rose-50 to-red-50',
    bg: 'bg-rose-50/80', 
    text: 'text-rose-700', 
    border: 'border-rose-200', 
    ring: 'ring-rose-100',
    iconBg: 'bg-rose-600',
    badge: 'bg-rose-100 text-rose-800',
    hover: 'hover:border-rose-300 hover:shadow-rose-500/20'
  },
  DEPARTMENT: { 
    gradient: 'from-cyan-600 via-blue-500 to-indigo-500', 
    lightGradient: 'from-cyan-50 to-blue-50',
    bg: 'bg-cyan-50/80', 
    text: 'text-cyan-700', 
    border: 'border-cyan-200', 
    ring: 'ring-cyan-100',
    iconBg: 'bg-cyan-600',
    badge: 'bg-cyan-100 text-cyan-800',
    hover: 'hover:border-cyan-300 hover:shadow-cyan-500/20'
  },
};

// ============= KATWANYAA SCHOOL INFORMATION =============
const KATWANYAA_INFO = {
  name: 'Katwanyaa Senior School',
  shortName: 'Katz',
  motto: 'Education is Light',
  vision: 'To be a center of academic excellence and holistic development in Africa',
  mission: 'To provide quality education that nurtures talent, builds character, and prepares students for global leadership',
  founded: 1985,
  principal: 'Dr. Sarah Mwangi',
  location: 'Kitui County, Kenya',
  email: 'info@katwanyaa.ac.ke',
  phone: '+254 712 345 678',
  website: 'www.katwanyaa.ac.ke',
  colors: ['Emerald Green', 'Royal Blue', 'Gold'],
  mascot: 'The Mighty Eagle',
  studentCount: 1850,
  staffCount: 120,
  departments_count: 12,
  clubs_count: 25,
  achievements: [
    'Top Performer in Kitui County (2023)',
    'National Science Congress Champions (2022)',
    'Best in Drama Festivals (2021, 2023)',
    'UNESCO Associated School',
  ],
  description: `Katwanyaa Senior School is a premier educational institution located in the heart of Kitui County, Kenya. 
    Established in 1985, we have consistently provided quality education that transforms lives and builds future leaders. 
    Our state-of-the-art facilities include modern science laboratories, a fully equipped computer lab, a well-stocked library, 
    sports fields, and comfortable boarding facilities. We pride ourselves on our strong academic performance, 
    vibrant co-curricular activities, and commitment to holistic student development.`
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

// ============= MODERN COMPONENTS =============

// Animated Gradient Border Component
const AnimatedBorder = ({ children, className = "" }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-pulse" />
    <div className="relative bg-white rounded-2xl">
      {children}
    </div>
  </div>
);

// Particle Background Component (no longer used on white bg)
const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const particleArray = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
    }));
    setParticles(particleArray);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-slate-200 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.speed}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// Gradient Text Component
const GradientText = ({ children, className = "", from = "emerald", to = "teal" }) => (
  <span className={`bg-gradient-to-r from-${from}-400 via-${from}-500 to-${to}-500 bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

// Info Pill Component
const InfoPill = ({ icon: Icon, children, variant = "default" }) => {
  const variants = {
    default: "border-slate-200 bg-slate-50 text-slate-700",
    primary: "border-emerald-200 bg-emerald-50 text-emerald-700",
    secondary: "border-indigo-200 bg-indigo-50 text-indigo-700",
    dark: "border-slate-700 bg-slate-800 text-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${variants[variant]}`}>
      <Icon className="text-sm" />
      {children}
    </span>
  );
};

// Stats Counter Component (light version)
const StatCounter = ({ value, label, icon: Icon, suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white transition-all duration-300 group">
      <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mb-3 group-hover:scale-110 transition-transform">
        <Icon className="text-2xl text-emerald-600" />
      </div>
      <p className="text-2xl md:text-3xl font-black text-gray-900">
        {count}{suffix}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{label}</p>
    </div>
  );
};

// Feature Card Component (light version)
const FeatureCard = ({ icon: Icon, title, description, gradient }) => (
  <div className="group p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="text-xl text-white" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </div>
);

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

// Modern Loading Spinner
const ModernLoadingSpinner = ({ message = "Loading amazing content..." }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
      <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-emerald-600/20 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-bounce" />
      </div>
    </div>
    <p className="mt-6 text-sm font-bold text-gray-600">{message}</p>
    <div className="flex gap-1 mt-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  </div>
);

// Refresh Button with Spinner
const RefreshButton = ({ refreshing, onClick }) => (
  <button
    onClick={onClick}
    disabled={refreshing}
    className="group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition-all hover:shadow-xl active:scale-95 disabled:opacity-60"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
    {refreshing ? (
      <>
        <Spinner size="sm" color="white" />
        <span>Updating...</span>
      </>
    ) : (
      <>
        <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </>
    )}
  </button>
);

// Gallery Modal Component (unchanged, still works for dark overlay)
const GalleryModal = ({ item, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-0 backdrop-blur-xl sm:p-4" onClick={onClose}>
      <div className="relative flex h-full w-full max-w-7xl flex-col overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all hover:scale-110">
          <FiX className="text-lg" />
        </button>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.4fr_0.9fr]">
          {/* Image Gallery Section */}
          <div className="relative bg-black">
            <div className="relative h-[400px] sm:h-[500px] overflow-hidden">
              <img 
                src={selectedImage} 
                alt={item.title} 
                className={`h-full w-full object-contain transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
              />
              {!selectedImage && (
                <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
                  <Icon className="text-6xl text-white/50" />
                </div>
              )}
            </div>
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hover:scale-110">
                  <FiChevronRight className="rotate-180 text-xl" />
                </button>
                <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hover:scale-110">
                  <FiChevronRight className="text-xl" />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex min-h-0 flex-col bg-white dark:bg-slate-900">
            <div className="border-b border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${theme.bg} ${theme.text} ${theme.border}`}>
                  <Icon className="text-xs" /> {getTypeLabel(item.type)}
                </span>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <FiShare2 />
                </button>
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{item.title}</h2>
              {item.description && (
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-400">{item.description}</p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-lg font-black text-slate-900 dark:text-white">{images.length}</p>
                  <p className="text-[9px] font-bold uppercase text-slate-500">Photos</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-lg font-black text-slate-900 dark:text-white">{item.details?.length || 0}</p>
                  <p className="text-[9px] font-bold uppercase text-slate-500">Details</p>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">All Photos</p>
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 8).map((image, index) => (
                      <button
                        key={image.url}
                        onClick={() => setSelectedIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                          selectedIndex === index ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={image.url} alt={image.altText || `${item.title} ${index + 1}`} className="h-full w-full object-cover" />
                        {index === 7 && images.length > 8 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs font-bold">
                            +{images.length - 8}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Location & Info */}
              {(item.location || item.established || item.website) && (
                <div className="flex flex-wrap gap-2">
                  {item.location && <InfoPill icon={FiMapPin}>{item.location}</InfoPill>}
                  {item.established && <InfoPill icon={FiCalendar}>{item.established}</InfoPill>}
                  {item.website && (
                    <a href={item.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white">
                      <FiGlobe /> Website <FiExternalLink className="text-[10px]" />
                    </a>
                  )}
                </div>
              )}

              {/* Contact Info */}
              {item.contactName && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Contact Person</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white`}>
                      <FiUserCheck />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.contactName}</p>
                      {item.contactEmail && <p className="text-xs text-slate-500">{item.contactEmail}</p>}
                      {item.contactPhone && <p className="text-xs text-slate-500">{item.contactPhone}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Connect With Us</p>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <a key={`${link.label}-${link.href}`} href={link.href} target="_blank" rel="noopener noreferrer" className={`rounded-lg border px-3 py-1.5 text-xs font-bold capitalize transition-all hover:scale-105 ${theme.bg} ${theme.text} ${theme.border}`}>
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Details Sections */}
              {Array.isArray(item.details) && item.details.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Additional Information</p>
                  {item.details.map((detail, index) => (
                    <div key={`${detail?.title || 'detail'}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                      <p className="text-sm font-black text-slate-900">{detail?.title || `Detail ${index + 1}`}</p>
                      {detail?.content && <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{detail.content}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="border-t border-slate-200 bg-slate-50 p-4 flex gap-2">
              <button onClick={onClose} className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800 transition-all">
                Close
              </button>
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 transition-all">
                <FiExternalLink /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hub Card Component (existing, already white bg, works great)
const HubCard = ({ item, onView }) => {
  const images = normalizeSchoolImages(item);
  const image = images[0]?.url;
  const Icon = ICONS[item.type] || FiLayers;
  const theme = TYPE_THEMES[item.type] || TYPE_THEMES.DEPARTMENT;
  const detailCount = Array.isArray(item.details) ? item.details.length : 0;

  return (
    <div className="group relative">
      {/* Animated gradient border on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
      
      <button
        onClick={onView}
        className={`relative w-full group overflow-hidden rounded-xl border bg-white text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${theme.border} ${theme.ring}`}
      >
        {/* Image Section - Compact */}
        <div className="relative h-36 w-full overflow-hidden bg-slate-100">
          {image ? (
            <img src={image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${theme.gradient}`}>
              <Icon className="text-3xl text-white/75" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Type Badge */}
          <div className="absolute left-2 top-2">
            <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest backdrop-blur-sm ${theme.bg} ${theme.text} ${theme.border}`}>
              <Icon className="text-[8px]" /> {getTypeLabel(item.type)}
            </span>
          </div>
          
          {/* Image Count */}
          <div className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
            {images.length} 📷
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3">
          <h3 className="text-sm font-black leading-tight text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {item.title}
          </h3>
          
          {item.shortDescription && (
            <p className="mt-1 text-[10px] font-medium leading-4 text-slate-500 line-clamp-2">
              {item.shortDescription}
            </p>
          )}

          {/* Stats Row */}
          <div className="mt-2 flex flex-wrap gap-1">
            {detailCount > 0 && (
              <span className="flex items-center gap-0.5 rounded-lg bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-600">
                <FiLayers className="text-[8px]" /> {detailCount}
              </span>
            )}
            {item.location && (
              <span className="flex items-center gap-0.5 rounded-lg bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-600">
                <FiMapPin className="text-[8px]" /> {item.location.length > 20 ? item.location.slice(0, 20) + '...' : item.location}
              </span>
            )}
          </div>

          {/* View Action */}
          <div className="mt-2 flex items-center justify-end border-t border-slate-100 pt-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Explore</span>
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-lg bg-slate-900 text-white transition-transform group-hover:translate-x-1">
              <FiChevronRight className="text-[10px]" />
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

// Main Component
export default function PublicSchoolHubPage({
  title = "School Hub",
  eyebrow = "Welcome to Katwanyaa",
  description = "Explore the vibrant life and opportunities at Katwanyaa Senior School. Discover our clubs, departments, facilities, and student activities.",
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
  const [showStats, setShowStats] = useState(true);

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
          Array.isArray(data.items) ? data.items.map((item) => ({ ...item, sectionTitle: sections[index].title })) : []
        );
        setItems(merged);
      } else {
        const res = await fetch(`/api/schoolhub?type=${singleType || 'CLUB'}`);
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
        { title: '📚 CBC Departments', type: 'DEPARTMENT', icon: FiLayers, items: visibleItems.filter((item) => item.category === 'CBC') },
        { title: '📖 8-4-4 Departments', type: 'DEPARTMENT', icon: FiBookOpen, items: visibleItems.filter((item) => item.category === 'EIGHT_FOUR_FOUR') },
        { title: '👨‍🏫 Teaching Departments', type: 'DEPARTMENT', icon: FiBookOpen, items: visibleItems.filter((item) => item.category === 'TEACHING') },
        { title: '🤝 Support Departments', type: 'DEPARTMENT', icon: FiShield, items: visibleItems.filter((item) => item.category === 'SUPPORT') },
      ];
    }
    return [{ title, type: singleType || 'CLUB', items: visibleItems }];
  }, [departments, sections, singleType, title, visibleItems]);

  const totalImages = items.reduce((sum, item) => sum + normalizeSchoolImages(item).length, 0);
  const heroType = singleType || sections?.[0]?.type || 'DEPARTMENT';
  const HeroIcon = ICONS[heroType] || FiGrid;

  // Features data
  const features = [
    { icon: FaGraduationCap, title: "Academic Excellence", description: "Consistently top-performing in national examinations with a 98% pass rate.", gradient: "from-emerald-500 to-teal-500" },
    { icon: FaRobot, title: "STEM Innovation", description: "State-of-the-art computer labs and robotics club for future innovators.", gradient: "from-blue-500 to-cyan-500" },
    { icon: FaHeart, title: "Holistic Development", description: "Over 25 clubs and societies for talents and skill development.", gradient: "from-rose-500 to-pink-500" },
    { icon: FaShieldAlt, title: "Safe Environment", description: "24/7 security, CCTV surveillance, and trained counselors for student welfare.", gradient: "from-purple-500 to-indigo-500" },
    { icon: FaTree, title: "Green Campus", description: "Eco-friendly initiatives, gardening projects, and environmental awareness.", gradient: "from-green-500 to-emerald-500" },
    { icon: FaHandsHelping, title: "Community Focus", description: "Strong ties with local community and outreach programs.", gradient: "from-orange-500 to-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header stays dark slate */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-6 py-3 sm:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px]">
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-white">
                    <Image src="/katz.png" alt="Katwanyaa Senior School logo" width={24} height={24} className="rounded-lg object-cover" />
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-black tracking-tight text-white">Katwanyaa Senior</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-400">Education is Light</p>
              </div>
            </Link>

            {/* School Motto */}
            <div className="hidden md:block text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">Motto</p>
              <p className="text-xs font-bold text-white/80">"{KATWANYAA_INFO.motto}"</p>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10 transition-all">
                <FiArrowLeft /> Back Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with max-width */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Light Hero Section */}
        <div className="group relative mb-10 overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg p-6 md:p-8">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
          
          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 opacity-10">
            <FaCrown className="text-4xl text-emerald-500" />
          </div>
          
          <div className="relative z-10 flex flex-col gap-6">
            {/* Header Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500">
                  <span className="text-[8px] font-black text-white">K</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-700">{eyebrow}</span>
              </div>
              
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[7px] font-bold uppercase tracking-wider text-gray-600">Live Platform</span>
              </div>
            </div>

            {/* Title Section */}
            <div className="max-w-3xl">
              <div className="relative inline-block mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                  <HeroIcon className="text-2xl text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-30" />
              </div>
              
              <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl md:text-5xl text-gray-900">
                Welcome to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600">
                  Katwanyaa Senior School
                </span>
              </h1>
              
              <div className="my-3 flex gap-2">
                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="h-1 w-6 rounded-full bg-emerald-500/50" />
                <div className="h-1 w-3 rounded-full bg-teal-500/30" />
              </div>
              
              <p className="text-sm font-medium leading-6 text-gray-600 max-w-2xl">
                {description || KATWANYAA_INFO.description}
              </p>
            </div>

            {/* Stats Row */}
            {showStats && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 mt-2">
                <StatCounter value={KATWANYAA_INFO.studentCount} label="Students" icon={FaUsersIcon} />
                <StatCounter value={KATWANYAA_INFO.staffCount} label="Staff" icon={FaChalkboardTeacher} />
                <StatCounter value={2024 - KATWANYAA_INFO.founded} label="Years" icon={FiCalendar} suffix="+" />
                <StatCounter value={KATWANYAA_INFO.clubs_count} label="Clubs" icon={FiUsers} />
                <StatCounter value={KATWANYAA_INFO.departments_count} label="Depts" icon={FiLayers} />
                <StatCounter value={totalImages} label="Images" icon={FiImage} />
                <StatCounter value={items.length} label="Items" icon={FiGrid} />
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center mt-4">
              <RefreshButton refreshing={refreshing} onClick={() => load(true)} />

              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${title.toLowerCase()}...`}
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setShowStats(!showStats)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all"
                >
                  {showStats ? "Hide Stats" : "Show Stats"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid - Katwanyaa Highlights */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
            <div>
              <h2 className="text-base font-black tracking-tight text-gray-900">Why Choose Katwanyaa?</h2>
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Our Core Strengths</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 flex items-center justify-between">
            <span className="flex items-center gap-2"><FiAlertTriangle /> {error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <FiX />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <ModernLoadingSpinner message={`Loading amazing ${title.toLowerCase()} content...`} />
        ) : visibleItems.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-gray-50 mb-4">
              <FiLayers className="text-4xl text-gray-300" />
            </div>
            <h2 className="text-xl font-black text-gray-500">{emptyText}</h2>
            <p className="text-sm text-gray-400 mt-2">Check back soon for updates!</p>
          </div>
        ) : (
          <div className="space-y-10">
            {renderedSections.map((section) => {
              if (!section.items.length) return null;
              const SectionIcon = section.icon || ICONS[section.type] || FiLayers;
              return (
                <section key={section.title}>
                  {/* Section Header */}
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg">
                      <SectionIcon className="text-base" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-gray-900">{section.title}</h2>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                        {section.items.length} {section.items.length === 1 ? 'item' : 'items'} available
                      </p>
                    </div>
                  </div>

                  {/* Items Grid - Responsive */}
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
        
        {/* Footer Note */}
        {!loading && visibleItems.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Katwanyaa Senior School — {KATWANYAA_INFO.motto}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-3">
              <a href={`mailto:${KATWANYAA_INFO.email}`} className="inline-flex items-center gap-1 text-[9px] text-gray-400 hover:text-gray-600 transition-colors">
                <FiMail className="text-[10px]" /> {KATWANYAA_INFO.email}
              </a>
              <a href={`tel:${KATWANYAA_INFO.phone}`} className="inline-flex items-center gap-1 text-[9px] text-gray-400 hover:text-gray-600 transition-colors">
                <FiPhone className="text-[10px]" /> {KATWANYAA_INFO.phone}
              </a>
              <span className="inline-flex items-center gap-1 text-[9px] text-gray-400">
                <FiMapPin className="text-[10px]" /> {KATWANYAA_INFO.location}
              </span>
            </div>
          </div>
        )}
      </main>
      
      {/* Custom Animation Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.1; }
          25% { transform: translateY(-15px) translateX(10px); opacity: 0.3; }
          50% { transform: translateY(10px) translateX(-15px); opacity: 0.2; }
          75% { transform: translateY(-5px) translateX(15px); opacity: 0.25; }
        }
        .animate-float {
          animation: float 8s infinite ease-in-out;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}