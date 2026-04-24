'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import {
  FiAward,
  FiStar,
  FiTrendingUp,
  FiTarget,
  FiBookOpen,
  FiUsers,
  FiGlobe,
  FiMapPin,
  FiArrowRight,
  FiSearch,
  FiFilter,
  FiRotateCw,
  FiGrid,
  FiList,
  FiX,
  FiEye,
  FiCalendar,
  FiChevronRight,
  FiChevronLeft,
  FiHeart,
  FiShield,
  FiBookmark,
  FiShare2
} from 'react-icons/fi';
import {
  IoCalendarClearOutline,
  IoSparkles,
  IoRibbonOutline,
  IoPeopleCircle,
  IoStatsChart,
  IoShareSocialOutline,
  IoClose,
  IoLocationOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoSchoolOutline,
  IoTrophyOutline,
  IoLeafOutline,
  IoMedalOutline
} from 'react-icons/io5';
import { GiLion, GiBaobab, GiSunrise, GiAfrica } from 'react-icons/gi';

import { CircularProgress, Box, Typography, Stack } from '@mui/material';
import { FaFacebookF, FaTwitter, FaWhatsapp, FaTelegram, FaEnvelope } from 'react-icons/fa';

// ========== KATWANYAA THEME CONSTANTS ==========
const KATWANYAA_THEME = {
  primary: '#C6893B',
  primaryDark: '#9B6B2E',
  primaryLight: '#E6C997',
  secondary: '#2D6A4F',
  secondaryLight: '#52B788',
  accent: '#D4A373',
  background: '#FAF6F0',
  text: '#3E2C1F',
  textLight: '#8B7355',
  border: '#E8DCC8',
  gradient: 'from-[#C6893B] to-[#D4A373]',
  gradientGreen: 'from-[#2D6A4F] to-[#52B788]',
};

// Modern Modal Component
const ModernModal = ({ children, open, onClose, maxWidth = '800px', blur = true }) => {
  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${blur ? 'backdrop-blur-md' : 'bg-black/50'}`}>
      <div
        className="relative bg-[#FDF8F0]/95 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-[#E8DCC8]/60"
        style={{
          width: '90%',
          maxWidth: maxWidth,
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, rgba(253,248,240,0.98) 0%, rgba(248,244,235,0.98) 100%)'
        }}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-[#FDF8F0]/90 backdrop-blur-sm rounded-full hover:bg-[#E8DCC8] cursor-pointer border border-[#D4C4A8] shadow-sm transition-colors"
          >
            <FiX className="text-[#8B7355] w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Modern Achievement Card - Matching Events Card Style
const ModernAchievementCard = ({ achievement, onView, onBookmark, viewMode = 'grid' }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getCategoryStyle = (category) => {
    const styles = {
      Academic: {
        gradient: KATWANYAA_THEME.gradientGreen,
        bg: 'bg-[#E8F5E9]',
        text: 'text-[#2D6A4F]',
        border: 'border-[#C8E6C9]',
        iconBg: 'bg-[#2D6A4F]/10',
        iconColor: 'text-[#2D6A4F]'
      },
      Sports: {
        gradient: 'from-[#E85D04] to-[#F48C06]',
        bg: 'bg-[#FFF4E6]',
        text: 'text-[#E85D04]',
        border: 'border-[#FFE8CC]',
        iconBg: 'bg-[#E85D04]/10',
        iconColor: 'text-[#E85D04]'
      },
      Arts: {
        gradient: 'from-[#C6893B] to-[#D4A373]',
        bg: 'bg-[#FFF3E0]',
        text: 'text-[#C6893B]',
        border: 'border-[#FFE0B2]',
        iconBg: 'bg-[#C6893B]/10',
        iconColor: 'text-[#C6893B]'
      },
      Leadership: {
        gradient: 'from-[#0F4C5C] to-[#1B6B7A]',
        bg: 'bg-[#E6F3F5]',
        text: 'text-[#0F4C5C]',
        border: 'border-[#CCE5E8]',
        iconBg: 'bg-[#0F4C5C]/10',
        iconColor: 'text-[#0F4C5C]'
      },
      Other: {
        gradient: KATWANYAA_THEME.gradient,
        bg: 'bg-[#FAF6F0]',
        text: 'text-[#C6893B]',
        border: 'border-[#E8DCC8]',
        iconBg: 'bg-[#C6893B]/10',
        iconColor: 'text-[#C6893B]'
      }
    };
    return styles[category] || styles.Other;
  };

  const formatYear = (dateString) => {
    try {
      if (dateString) return new Date(dateString).getFullYear();
      return achievement.year || '2024';
    } catch {
      return achievement.year || '2024';
    }
  };

  const theme = getCategoryStyle(achievement.category);
  const year = formatYear(achievement.achievedDate);

  if (viewMode === 'grid') {
    return (
      <div
        onClick={() => onView(achievement)}
        className="relative bg-[#FDF8F0] rounded-2xl sm:rounded-[28px] border border-[#E8DCC8] shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 duration-300"
      >
        {/* Image Header */}
        <div className="relative h-40 sm:h-48 w-full shrink-0">
          <img
            src={achievement.images?.[0]?.url || '/achievement-placeholder.jpg'}
            alt={achievement.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F0] via-transparent to-black/10" />

          {/* Category Badge */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1.5">
            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-sm border ${theme.bg} ${theme.text} ${theme.border}`}>
              {achievement.category || 'Achievement'}
            </span>
            {achievement.featured && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#C6893B] text-white rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <IoSparkles className="text-[#F4D03F] text-[10px]" /> Featured
              </span>
            )}
          </div>

          {/* Year Badge Bottom */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-0.5 bg-black/50 backdrop-blur text-white rounded-full text-[9px] font-bold">
              {year}
            </span>
          </div>

          {/* Bookmark Button */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(achievement);
              }}
              className={`p-1.5 sm:p-2 rounded-lg backdrop-blur-md border shadow-sm transition-all ${
                isBookmarked
                  ? 'bg-[#C6893B] border-[#C6893B] text-white'
                  : 'bg-[#FDF8F0]/90 border-[#E8DCC8] text-[#8B7355]'
              }`}
            >
              <FiBookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 md:p-6">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#3E2C1F] mb-2 line-clamp-2 leading-tight">
            {achievement.title}
          </h3>

          <p className="text-[#8B7355] text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2 leading-relaxed">
            {achievement.description || 'A proud achievement celebrated at Katwanyaa Senior School.'}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#FAF6F0] border border-[#E8DCC8]">
              <div className={`p-1 rounded-lg ${theme.iconBg}`}>
                <IoMedalOutline className={`${theme.iconColor} w-3 h-3`} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#3E2C1F] uppercase tracking-tight truncate">
                {achievement.awardingBody || 'School Award'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#FAF6F0] border border-[#E8DCC8]">
              <div className={`p-1 rounded-lg ${theme.iconBg}`}>
                <FiUsers className={`${theme.iconColor} w-3 h-3`} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#3E2C1F] uppercase tracking-tight">
                {achievement.recipients?.length || 1} Recipient(s)
              </span>
            </div>
          </div>

          <button className="w-full py-2.5 sm:py-3 bg-[#C6893B] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
            View Details
            <FiArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      onClick={() => onView(achievement)}
      className="group relative bg-[#FDF8F0] rounded-xl border border-[#E8DCC8] p-3 sm:p-4 transition-all cursor-pointer hover:shadow-md"
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0">
          <img
            src={achievement.images?.[0]?.url || '/achievement-placeholder.jpg'}
            alt={achievement.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 right-0 bg-[#C6893B] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-tl-lg">
            {year}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${theme.bg} ${theme.text} ${theme.border}`}>
                {achievement.category}
              </span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onBookmark(achievement); }} className="p-1">
              <FiBookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'text-[#C6893B] fill-current' : 'text-[#D4C4A8]'}`} />
            </button>
          </div>
          <h3 className="text-sm font-bold text-[#3E2C1F] line-clamp-1 mb-1">{achievement.title}</h3>
          <p className="text-[#8B7355] text-[10px] line-clamp-1 mb-1">{achievement.awardingBody}</p>
          <div className="flex items-center gap-3 text-[10px] text-[#8B7355]">
            <span className="flex items-center gap-1"><FiCalendar size={10} />{year}</span>
            {achievement.recipients?.length > 0 && (
              <span className="flex items-center gap-1"><FiUsers size={10} />{achievement.recipients.length}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Achievement Detail Modal
const AchievementDetailModal = ({ achievement, onClose, onShare }) => {
  if (!achievement) return null;

  const getCategoryStyle = (category) => {
    const styles = {
      Academic: { gradient: KATWANYAA_THEME.gradientGreen, icon: FiBookOpen },
      Sports: { gradient: 'from-[#E85D04] to-[#F48C06]', icon: FiAward },
      Arts: { gradient: 'from-[#C6893B] to-[#D4A373]', icon: FiStar },
      Leadership: { gradient: 'from-[#0F4C5C] to-[#1B6B7A]', icon: FiUsers },
      Other: { gradient: KATWANYAA_THEME.gradient, icon: IoTrophyOutline }
    };
    return styles[category] || styles.Other;
  };

  const categoryStyle = getCategoryStyle(achievement.category);
  const CategoryIcon = categoryStyle.icon;
  const year = achievement.achievedDate ? new Date(achievement.achievedDate).getFullYear() : achievement.year;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl bg-[#FDF8F0] sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/20 backdrop-blur text-white rounded-full"><IoClose size={18} /></button>

        <div className="relative h-[30vh] sm:h-64 w-full shrink-0">
          <img src={achievement.images?.[0]?.url || '/achievement-placeholder.jpg'} alt={achievement.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDF8F0] via-transparent to-black/20" />
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${categoryStyle.gradient === KATWANYAA_THEME.gradientGreen ? 'bg-[#2D6A4F]' : 'bg-[#C6893B]'} text-white`}>
              {achievement.category}
            </span>
            {achievement.featured && (
              <span className="px-3 py-1 bg-[#C6893B] text-white rounded-full text-[10px] font-bold flex items-center gap-1">
                <IoSparkles className="text-[#F4D03F]" /> Featured
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#3E2C1F] leading-tight">{achievement.title}</h2>
              <p className="text-[#8B7355] text-sm mt-1">{achievement.awardingBody}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-[#8B7355]">
              <div className="flex items-center gap-1.5"><FiCalendar size={14} />{year}</div>
              {achievement.recipients?.length > 0 && (
                <div className="flex items-center gap-1.5"><FiUsers size={14} />{achievement.recipients.length} Recipient(s)</div>
              )}
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C6893B] mb-2">About this achievement</h3>
              <p className="text-[#3E2C1F] leading-relaxed">{achievement.description || 'No description provided.'}</p>
            </div>

            {achievement.recipients && achievement.recipients.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C6893B] mb-2">Recipients</h3>
                <div className="flex flex-wrap gap-2">
                  {achievement.recipients.map((rec, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-[#FAF6F0] border border-[#E8DCC8] rounded-full text-xs font-medium text-[#3E2C1F]">
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {achievement.images && achievement.images.length > 1 && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C6893B] mb-2">Gallery</h3>
                <div className="grid grid-cols-3 gap-2">
                  {achievement.images.slice(1).map((img, idx) => (
                    <img key={idx} src={img.url} alt="" className="w-full h-20 object-cover rounded-lg border border-[#E8DCC8]" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 p-4 sm:p-6 bg-[#FDF8F0] border-t border-[#E8DCC8]">
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-[#C6893B] text-white rounded-xl font-bold text-sm">Close</button>
            <button onClick={onShare} className="flex-1 py-3 bg-[#FAF6F0] border border-[#E8DCC8] text-[#3E2C1F] rounded-xl font-bold text-sm flex items-center justify-center gap-2">
              <FiShare2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Share Modal
const ShareModal = ({ achievement, onClose }) => {
  const [copied, setCopied] = useState(false);

  const socialPlatforms = [
    { name: 'WhatsApp', icon: FaWhatsapp, color: 'bg-green-500', action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${achievement.title}\n\n${window.location.href}`)}`, '_blank') },
    { name: 'Facebook', icon: FaFacebookF, color: 'bg-blue-600', action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank') },
    { name: 'Twitter', icon: FaTwitter, color: 'bg-sky-500', action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(achievement.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank') },
    { name: 'Telegram', icon: FaTelegram, color: 'bg-blue-500', action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(achievement.title)}`, '_blank') },
    { name: 'Email', icon: FaEnvelope, color: 'bg-gray-600', action: () => window.location.href = `mailto:?subject=${encodeURIComponent(achievement.title)}&body=${encodeURIComponent(window.location.href)}` }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModernModal open={true} onClose={onClose} maxWidth="480px">
      <div className="bg-[#C6893B] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-3">
            <IoShareSocialOutline className="text-xl" />
          </div>
          <h2 className="text-xl font-black">Share Achievement</h2>
          <p className="text-white/80 text-sm mt-1">{achievement.title}</p>
        </div>
      </div>
      <div className="p-6 bg-[#FDF8F0]">
        <div className="grid grid-cols-5 gap-3 mb-6">
          {socialPlatforms.map((platform, idx) => {
            const Icon = platform.icon;
            return (
              <button key={idx} onClick={platform.action} className="flex flex-col items-center gap-1.5 group">
                <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#C6893B] border border-[#E8DCC8] group-active:scale-95 transition-all">
                  <Icon className="text-base" />
                </div>
                <span className="text-[8px] font-black uppercase text-[#8B7355]">{platform.name}</span>
              </button>
            );
          })}
        </div>
        <div className="relative">
          <div className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-[#E8DCC8] pr-20">
            <p className="text-[10px] font-mono text-[#8B7355] truncate">{window.location.href}</p>
          </div>
          <button onClick={copyToClipboard} className={`absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg font-bold text-[10px] transition-all ${copied ? 'bg-[#2D6A4F] text-white' : 'bg-[#C6893B] text-white'}`}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </ModernModal>
  );
};

// Modern Pagination
const ModernPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) { start = 2; end = 4; }
      else if (currentPage >= totalPages - 2) { start = totalPages - 3; end = totalPages - 1; }
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-[#E8DCC8]">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-xl bg-[#FDF8F0] border border-[#E8DCC8] disabled:opacity-50">
        <FiChevronLeft className="w-4 h-4 text-[#8B7355]" />
      </button>
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, idx) => (
          <button key={idx} onClick={() => typeof page === 'number' && onPageChange(page)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${page === '...' ? 'text-[#8B7355]' : currentPage === page ? 'bg-[#C6893B] text-white shadow-md' : 'text-[#3E2C1F] hover:bg-[#FAF6F0]'}`} disabled={page === '...'}>
            {page}
          </button>
        ))}
      </div>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-[#FDF8F0] border border-[#E8DCC8] disabled:opacity-50">
        <FiChevronRight className="w-4 h-4 text-[#8B7355]" />
      </button>
    </div>
  );
};

// ========== MAIN COMPONENT ==========
export default function KatwanyaaAchievementsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [achievementsData, setAchievementsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const itemsPerPage = 9;

  const categories = [
    { id: 'all', name: 'All Achievements', icon: IoTrophyOutline },
    { id: 'Academic', name: 'Academic', icon: FiBookOpen },
    { id: 'Sports', name: 'Sports', icon: FiAward },
    { id: 'Arts', name: 'Arts', icon: FiStar },
    { id: 'Leadership', name: 'Leadership', icon: FiUsers }
  ];

  // Stats for the grid
  const stats = [
    { label: 'Total Achievements', value: achievementsData.length, icon: IoTrophyOutline, color: '#C6893B' },
    { label: 'Featured Honors', value: achievementsData.filter(a => a.featured).length, icon: IoSparkles, color: '#D4A373' },
    { label: 'Categories', value: categories.length - 1, icon: FiGrid, color: '#2D6A4F' },
    { label: 'Students Honored', value: achievementsData.reduce((sum, a) => sum + (a.recipients?.length || 1), 0), icon: FiUsers, color: '#E85D04' }
  ];

  // Sample data for Katwanyaa
  const getSampleAchievements = () => [
    { id: 1, title: 'Top in Machakos County - KCSE 2024', category: 'Academic', year: '2024', awardingBody: 'Ministry of Education', description: 'Katwanyaa Senior School produced the best candidate in Machakos County with an A plain.', featured: true, recipients: ['Mwangi K.', 'Wanjiku M.'], images: [{ url: '/hero/st.jpeg' }] },
    { id: 2, title: 'National Rugby 7s Champions', category: 'Sports', year: '2024', awardingBody: 'KSSSA', description: 'Our rugby team emerged champions at the national level.', featured: true, recipients: ['Team Captain: J. Otieno'], images: [{ url: '/hero/sports.jpeg' }] },
    { id: 3, title: 'Best School in Creative Arts', category: 'Arts', year: '2023', awardingBody: 'Kenya Cultural Centre', description: 'Recognized for outstanding performances in music and drama.', featured: false, recipients: ['Drama Club'], images: [{ url: '/hero/st.jpeg' }] },
    { id: 4, title: 'ICT Innovation Award', category: 'Academic', year: '2023', awardingBody: 'Angaza Centre', description: 'Selected as the only school in Machakos County for ICT donation.', featured: true, recipients: ['ICT Department'], images: [{ url: '/hero/student.jpeg' }] }
  ];

  const fetchAchievements = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();
      if (data.success && data.achievements) {
        const allAchievements = Object.values(data.achievements).flat();
        setAchievementsData(allAchievements.length ? allAchievements : getSampleAchievements());
      } else {
        setAchievementsData(getSampleAchievements());
      }
    } catch {
      setAchievementsData(getSampleAchievements());
    } finally {
      if (showRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAchievements();
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredAchievements = achievementsData.filter(ach => {
    const matchesSearch = searchTerm === '' || ach.title?.toLowerCase().includes(searchTerm.toLowerCase()) || ach.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || ach.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const paginatedAchievements = filteredAchievements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAchievements.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <Stack spacing={2} alignItems="center">
          <div className="relative">
            <CircularProgress variant="determinate" value={100} size={48} thickness={4} sx={{ color: '#E8DCC8' }} />
            <CircularProgress variant="indeterminate" disableShrink size={48} thickness={4} sx={{ color: '#C6893B', animationDuration: '800ms', position: 'absolute', left: 0 }} />
            <div className="absolute inset-0 flex items-center justify-center"><GiLion className="text-[#C6893B] text-lg animate-pulse" /></div>
          </div>
          <p className="text-[#3E2C1F] font-bold text-sm">Loading achievements...</p>
        </Stack>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6">

        {/* ===== DARK HERO BANNER - Matching Events Page Style ===== */}
        <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl sm:rounded-[32px] overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6893B]/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4A373]/10 rounded-full blur-[100px]" />

          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(255,255,255,0.1) 2%, transparent 2.5%)', backgroundSize: '30px 30px' }} />

          <div className="relative z-10 p-6 sm:p-8 md:p-10">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
                  <GiLion className="text-[#D4A373] text-sm" />
                  <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">Katwanyaa Senior School</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                  Achievements & <span className="text-[#D4A373]">Honors</span>
                </h1>
                <p className="text-white/70 text-sm max-w-lg leading-relaxed">
                  Celebrating excellence across academics, sports, arts, and leadership. Proud moments that define our legacy at Katwanyaa.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-[#C6893B] flex items-center justify-center">
                      <GiBaobab className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="text-white text-[10px] font-bold uppercase tracking-wider">Est. 1985</p>
                      <p className="text-white/50 text-[8px]">Strive to Excel</p>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-[#D4A373]/20 flex items-center justify-center">
                      <GiSunrise className="text-[#D4A373] text-sm" />
                    </div>
                    <div>
                      <p className="text-white text-[10px] font-bold uppercase tracking-wider">Matungulu</p>
                      <p className="text-white/50 text-[8px]">Machakos County</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchAchievements(true)}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur rounded-xl border border-white/20 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-white/20 transition-all"
                >
                  {refreshing ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <FiRotateCw size={12} />}
                  REFRESH
                </button>
                <div className="flex bg-white/10 backdrop-blur rounded-xl p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#C6893B] text-white' : 'text-white/60'}`}>
                    <FiGrid size={14} />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#C6893B] text-white' : 'text-white/60'}`}>
                    <FiList size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#C6893B] via-[#D4A373] to-[#2D6A4F]" />
        </div>

        {/* ===== STATS GRID ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-[#FDF8F0] border border-[#E8DCC8] rounded-xl p-3 md:p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg`} style={{ backgroundColor: `${stat.color}15` }}>
                    <Icon className={`text-[${stat.color}] text-base md:text-lg`} style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-black text-[#3E2C1F]">{stat.value}</p>
                <p className="text-[8px] md:text-[10px] font-bold text-[#8B7355] uppercase tracking-wider">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* ===== SEARCH & FILTERS ===== */}
        <div className="bg-[#FDF8F0] border border-[#E8DCC8] rounded-xl p-3 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C6893B] text-sm" />
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6F0] border border-[#E8DCC8] rounded-lg text-sm focus:outline-none focus:border-[#C6893B] transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={activeCategory}
                onChange={(e) => { setActiveCategory(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2.5 bg-[#FAF6F0] border border-[#E8DCC8] rounded-lg text-sm font-medium text-[#3E2C1F] cursor-pointer"
              >
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <button
                onClick={() => { setSearchTerm(''); setActiveCategory('all'); setCurrentPage(1); }}
                className="px-4 py-2.5 bg-[#C6893B] text-white rounded-lg font-bold text-xs flex items-center gap-1.5"
              >
                <FiFilter size={12} /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* ===== ACHIEVEMENTS GRID ===== */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#C6893B] rounded-full" />
            <h2 className="text-lg font-black text-[#3E2C1F]">Honor Roll</h2>
            <span className="text-[10px] font-bold text-[#8B7355] bg-[#FAF6F0] px-2 py-0.5 rounded-full">{filteredAchievements.length} achievements</span>
          </div>

          {paginatedAchievements.length === 0 ? (
            <div className="bg-[#FDF8F0] border border-[#E8DCC8] rounded-2xl py-12 text-center">
              <div className="w-12 h-12 bg-[#FAF6F0] rounded-full flex items-center justify-center mx-auto mb-3">
                <IoTrophyOutline className="text-[#C6893B] text-xl" />
              </div>
              <h3 className="font-bold text-[#3E2C1F]">No achievements found</h3>
              <button onClick={() => { setSearchTerm(''); setActiveCategory('all'); }} className="mt-3 text-[#C6893B] text-xs font-bold">Reset filters</button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {paginatedAchievements.map(achievement => (
                <ModernAchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onView={setSelectedAchievement}
                  onBookmark={() => {}}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && <ModernPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </div>

        {/* ===== MOTTO FOOTER BANNER ===== */}
        <div className="relative bg-gradient-to-r from-[#C6893B] to-[#D4A373] rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <GiLion className="text-white text-2xl" />
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">School Motto</p>
              <p className="text-white text-xl md:text-2xl font-black italic">"Strive to Excel"</p>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <FiHeart className="text-rose-300" />
              <span>Katwanyaa Senior School • Since 1985</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && !showShareModal && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
          onShare={() => setShowShareModal(true)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && selectedAchievement && (
        <ShareModal achievement={selectedAchievement} onClose={() => { setShowShareModal(false); setSelectedAchievement(null); }} />
      )}
    </div>
  );
}