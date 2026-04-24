'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import {
  FiCalendar,
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
  FiChevronRight,
  FiChevronLeft,
  FiBookmark,
  FiShare2,
  FiDownload,
  FiExternalLink,
  FiZap,
  FiHeart,
  FiShield
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
  IoTrophyOutline
} from 'react-icons/io5';
import { CircularProgress, Box, Typography, Stack } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

// ------------------------------
// Modern UI Components (reused from counseling page)
// ------------------------------

const ModernModal = ({ children, open, onClose, maxWidth = '800px', blur = true }) => {
  if (!open) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${blur ? 'backdrop-blur-md' : 'bg-black/50'}`}>
      <div
        className="relative bg-white/95 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-emerald-100/40"
        style={{
          width: '90%',
          maxWidth: maxWidth,
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)'
        }}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white cursor-pointer border border-emerald-100 shadow-sm"
          >
            <FiX className="text-emerald-700 w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 ${className}`}>
    {children}
  </div>
);

const ModernStatCard = ({ stat }) => {
  const iconMap = {
    trophy: IoTrophyOutline,
    trending: FiTrendingUp,
    target: FiTarget,
    award: FiAward
  };
  
  const Icon = iconMap[stat.iconKey] || FiAward;
  
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#d9d0c3] bg-white p-4 md:p-6 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.4)]">
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#fcfaf6] text-[#172033] ring-1 ring-[#e8dfd3]">
          <Icon className="text-lg md:text-xl" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
          {stat.label}
        </p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            {stat.number}
          </h3>
        </div>
        <p className="text-[10px] md:text-xs font-medium text-slate-500 leading-tight line-clamp-1">
          {stat.sublabel}
        </p>
      </div>
    </div>
  );
};

// ------------------------------
// Achievement Card (Grid & List)
// ------------------------------

const AchievementCard = ({ achievement, onView, viewMode = 'grid' }) => {
  const getCategoryStyle = (category) => {
    const styles = {
      Academic: {
        gradient: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600'
      },
      Sports: {
        gradient: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600'
      },
      Arts: {
        gradient: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600'
      },
      Leadership: {
        gradient: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600'
      },
      Other: {
        gradient: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600'
      }
    };
    return styles[category] || styles.Other;
  };

  const theme = getCategoryStyle(achievement.category);
  const firstImage = achievement.images?.[0]?.url;

  if (viewMode === 'grid') {
    return (
      <div
        onClick={() => onView(achievement)}
        className="relative bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 duration-300"
      >
        <div className="relative h-48 w-full shrink-0">
          {firstImage ? (
            <img src={firstImage} alt={achievement.title} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${theme.gradient}`} />
          )}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${theme.bg} ${theme.text} ${theme.border}`}>
              {achievement.category}
            </span>
            {achievement.featured && (
              <span className="px-3 py-1 bg-emerald-900/90 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <IoSparkles className="text-emerald-400" /> Featured
              </span>
            )}
          </div>
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {achievement.year}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-black text-slate-900 mb-2 line-clamp-2 leading-tight tracking-tight">
            {achievement.title}
          </h3>
          <p className="text-slate-500 text-xs mb-6 line-clamp-2 leading-relaxed">
            {achievement.description || 'Proud achievement by Matungulu Girls.'}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className={`p-1.5 rounded-lg ${theme.iconBg}`}>
                <FiAward className={theme.iconColor} size={14} />
              </div>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight whitespace-nowrap">
                {achievement.awardingBody || 'School Award'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className={`p-1.5 rounded-lg ${theme.iconBg}`}>
                <FiCalendar className={theme.iconColor} size={14} />
              </div>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight whitespace-nowrap">
                {achievement.achievedDate
                  ? new Date(achievement.achievedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : achievement.year}
              </span>
            </div>
          </div>

          <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-emerald-900/20">
            View Details
            <FiArrowRight size={12} className="text-emerald-200" />
          </button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      onClick={() => onView(achievement)}
      className="relative bg-white rounded-[2rem] border border-slate-100 p-4 shadow-xl shadow-slate-900/5 cursor-pointer transition-colors active:bg-slate-50"
    >
      <div className="flex gap-5">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm">
          {firstImage ? (
            <img src={firstImage} alt={achievement.title} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${getCategoryStyle(achievement.category).gradient}`} />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                  getCategoryStyle(achievement.category).bg
                } ${getCategoryStyle(achievement.category).text} ${
                  getCategoryStyle(achievement.category).border
                }`}>
                  {achievement.category}
                </span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                  {achievement.year}
                </span>
              </div>
            </div>
            <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-1 mb-1 tracking-tight">
              {achievement.title}
            </h3>
            <p className="text-slate-500 text-[10px] line-clamp-1 mb-2">
              {achievement.awardingBody}
            </p>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              {achievement.recipients?.length > 0 && (
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <FiUsers className="text-slate-400" size={10} />
                  <span className="font-semibold">{achievement.recipients.length} recipient(s)</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-black text-[8px] uppercase tracking-wider">
              View
              <FiArrowRight size={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------
// Achievement Detail Modal
// ------------------------------

const AchievementDetailModal = ({ achievement, onClose }) => {
  if (!achievement) return null;

  const getCategoryStyle = (category) => {
    const styles = {
      Academic: { gradient: 'from-emerald-500 to-emerald-600', icon: FiBookOpen },
      Sports: { gradient: 'from-emerald-500 to-emerald-600', icon: FiAward },
      Arts: { gradient: 'from-emerald-500 to-emerald-600', icon: FiStar },
      Leadership: { gradient: 'from-emerald-500 to-emerald-600', icon: FiUsers },
      Other: { gradient: 'from-emerald-500 to-emerald-600', icon: FiAward }
    };
    return styles[achievement.category] || styles.Other;
  };

  const categoryStyle = getCategoryStyle(achievement.category);
  const CategoryIcon = categoryStyle.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-[#172033]/80 backdrop-blur-md">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#fcfaf6] shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-[2.5rem] sm:border sm:border-[#d9d0c3]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-50 p-2 bg-[#172033]/70 backdrop-blur-md text-white rounded-full border border-white/20 transition-all active:scale-90"
        >
          <IoClose size={18} className="sm:size-[22px]" />
        </button>

        <div className="relative h-[30vh] sm:h-[300px] w-full shrink-0">
          {achievement.images?.[0]?.url ? (
            <img
              src={achievement.images[0].url}
              alt={achievement.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-r ${categoryStyle.gradient}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf6] via-transparent to-black/10" />
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-wrap gap-2">
            <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-white shadow-xl rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#172033] border border-[#d9d0c3]">
              {achievement.category}
            </span>
            {achievement.featured && (
              <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-[#172033] text-white rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <IoSparkles className="text-[#f2c357]" size={12} /> Featured
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#fcfaf6]">
          <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
            <section className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl sm:rounded-2xl border border-[#e8dfd3] bg-white p-2 sm:p-3 shadow-sm">
                  <CategoryIcon className="text-[#172033] text-xl sm:text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                    {achievement.title}
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm">{achievement.awardingBody}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-y-2 gap-x-4 sm:gap-x-6 text-[10px] sm:text-xs font-black text-slate-500">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <IoCalendarClearOutline className="text-[#172033] text-sm sm:text-base" />
                  {achievement.achievedDate
                    ? new Date(achievement.achievedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : achievement.year}
                </div>
                {achievement.recipients?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <IoPeopleCircle className="text-[#172033] text-sm sm:text-base" />
                    {achievement.recipients.length} recipient(s)
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-3 sm:space-y-4">
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">About this achievement</h3>
              <div className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                {achievement.description || 'No description provided.'}
              </div>
            </section>

            {achievement.recipients && achievement.recipients.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Recipients</h3>
                <div className="flex flex-wrap gap-2">
                  {achievement.recipients.map((rec, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-white border border-[#e8dfd3] rounded-full text-xs font-bold text-slate-700">
                      {rec}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {achievement.images && achievement.images.length > 1 && (
              <section className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Gallery</h3>
                <div className="grid grid-cols-3 gap-3">
                  {achievement.images.slice(1).map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={img.caption || ''}
                      className="w-full h-24 object-cover rounded-xl border border-[#e8dfd3]"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="shrink-0 p-4 sm:p-6 bg-white/80 backdrop-blur-md border-t border-[#e8dfd3]">
          <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-12 sm:h-14 bg-[#172033] text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"
            >
              <IoClose size={16} />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------
// Main Component
// ------------------------------

export default function StudentAchievements() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schoolStats, setSchoolStats] = useState(null);
  const [achievementsByCategory, setAchievementsByCategory] = useState({
    Academic: [],
    Sports: [],
    Arts: [],
    Leadership: [],
    Other: []
  });
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Achievements', icon: FiAward },
    { id: 'Academic', name: 'Academic', icon: FiBookOpen },
    { id: 'Sports', name: 'Sports', icon: FiAward },
    { id: 'Arts', name: 'Arts', icon: FiStar },
    { id: 'Leadership', name: 'Leadership', icon: FiUsers },
    { id: 'Other', name: 'Other', icon: FiAward }
  ];

  const loadData = async () => {
    try {
      // Fetch achievements
      const achRes = await fetch('/api/achievements');
      const achData = await achRes.json();
      let categorized = { Academic: [], Sports: [], Arts: [], Leadership: [], Other: [] };
      if (achData.success && achData.achievements) {
        Object.entries(achData.achievements).forEach(([cat, items]) => {
          if (categorized.hasOwnProperty(cat)) {
            categorized[cat] = items;
          }
        });
      }
      setAchievementsByCategory(categorized);

      // Fetch school stats
      const statsRes = await fetch('/api/school-stats');
      const statsData = await statsRes.json();
      if (statsData.success && statsData.stats) {
        setSchoolStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Data refreshed!');
  };

  const getAllAchievements = () => {
    return Object.values(achievementsByCategory).flat();
  };

  const filteredAchievements = getAllAchievements().filter(ach => {
    const matchesCat = activeCategory === 'all' || ach.category === activeCategory;
    const matchesSearch = searchTerm === '' ||
      ach.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ach.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ach.awardingBody?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalAchievements = getAllAchievements().length;
  const featuredCount = getAllAchievements().filter(a => a.featured).length;

  const statsCards = [
    {
      iconKey: 'trophy',
      number: totalAchievements.toString(),
      label: 'Total Achievements',
      sublabel: `${featuredCount} featured`
    },
    {
      iconKey: 'trending',
      number: schoolStats?.meanScore ? schoolStats.meanScore.toFixed(2) : '—',
      label: 'Current Mean Score',
      sublabel: schoolStats?.lastYearMean && schoolStats?.meanScore
        ? `${schoolStats.meanScore > schoolStats.lastYearMean ? '↑' : '↓'} ${Math.abs(schoolStats.meanScore - schoolStats.lastYearMean).toFixed(2)} from last year`
        : 'Academic excellence'
    },
    {
      iconKey: 'target',
      number: schoolStats?.targetMean ? schoolStats.targetMean.toFixed(2) : '—',
      label: 'Target Mean',
      sublabel: schoolStats?.meanScore && schoolStats?.targetMean
        ? `${((schoolStats.meanScore / schoolStats.targetMean) * 100).toFixed(1)}% achieved`
        : 'Goal for the year'
    },
    {
      iconKey: 'award',
      number: Object.keys(achievementsByCategory).length.toString(),
      label: 'Categories',
      sublabel: 'Diverse excellence'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f2ea] flex items-center justify-center">
        <Stack spacing={2} alignItems="center" className="mx-auto flex min-h-[70vh] w-full max-w-sm justify-center rounded-[30px] border px-10 py-12 shadow-[0_28px_70px_-52px_rgba(15,23,42,0.48)]">
          <Box className="relative flex items-center justify-center scale-75 sm:scale-100 transition-transform">
            <CircularProgress variant="determinate" value={100} size={56} thickness={4} sx={{ color: '#efe6d8' }} />
            <CircularProgress
              variant="indeterminate"
              disableShrink
              size={56}
              thickness={4}
              sx={{ color: '#172033', animationDuration: '800ms', position: 'absolute', left: 0 }}
            />
            <Box className="absolute">
              <IoTrophyOutline className="text-[#b68424] text-lg animate-pulse" />
            </Box>
          </Box>
          <div className="text-center space-y-1">
            <h3 className="text-slate-900 font-black text-sm sm:text-base tracking-tight">Loading achievements...</h3>
            <p className="text-slate-500 text-[10px] sm:text-xs font-medium">Fetching latest honors and stats</p>
          </div>
        </Stack>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f2ea] p-4 md:p-6">
      <Toaster position="top-right" richColors />

      <div className="w-full md:w-[90%] lg:w-[90%] xl:w-[80%] mx-auto space-y-6">
        {/* Hero Header */}
        <div className="relative mb-8 overflow-hidden rounded-lg border border-[#d9d0c3] bg-[#172033] p-6 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.82)] md:p-10">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#f2c357]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute inset-y-0 right-[36%] hidden w-px bg-white/10 lg:block" />

          <div className="relative z-10 grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-0 lg:pr-10">
              <div className="flex flex-col justify-between gap-6 lg:min-h-[320px]">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-1 rounded-full bg-[#f2c357] shadow-[0_0_15px_rgba(242,195,87,0.5)]" />
                    <div>
                      <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#f2c357]">
                        Matungulu Girls Senior School
                      </h2>
                      <p className="text-[8px] sm:text-[10px] italic font-medium text-white/45 tracking-widest uppercase">
                        "Strive to Excel"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/10 p-2 backdrop-blur-md">
                      <IoTrophyOutline className="text-xl sm:text-2xl md:text-3xl text-[#f2c357]" />
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
                      Achievements & <span className="bg-gradient-to-r from-[#f2c357] to-[#fff3c4] bg-clip-text text-transparent">Honors</span>
                    </h1>
                  </div>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                    Celebrating excellence across academics, sports, arts, and leadership. Proud moments that define our legacy.
                  </p>
                </div>

                <div className="flex flex-nowrap items-center gap-2 sm:gap-3">
                  <button
                    onClick={refreshData}
                    disabled={refreshing}
                    className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 h-10 px-4 sm:px-5 rounded-xl font-bold text-[10px] sm:text-xs tracking-widest text-white hover:bg-white/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
                  >
                    {refreshing ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>REFRESHING...</span>
                      </>
                    ) : (
                      <>
                        <FiRotateCw className="text-sm sm:text-base" />
                        <span>REFRESH</span>
                      </>
                    )}
                  </button>

                  <div className="flex bg-white/10 backdrop-blur-xl rounded-xl p-1 border border-white/20 h-12 items-center">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${
                        viewMode === 'grid' ? 'bg-white text-[#172033] shadow-lg' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <FiGrid size={14} className="sm:size-[16px]" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all ${
                        viewMode === 'list' ? 'bg-white text-[#172033] shadow-lg' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <FiList size={14} className="sm:size-[16px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 p-0 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="mb-4 sm:mb-6 px-1">
                <p className="text-white/75 text-xs sm:text-base font-medium leading-relaxed sm:leading-loose">
                  <span className="text-white font-black text-base sm:text-xl md:text-2xl underline decoration-[#f2c357]/50 underline-offset-4 mr-1">
                    {totalAchievements}
                  </span>
                  <span className="tracking-tight sm:tracking-normal">achievements across</span>
                  <span className="text-white font-black text-base sm:text-xl md:text-2xl underline decoration-[#fff3c4]/40 underline-offset-4 ml-1 mr-1">
                    {Object.keys(achievementsByCategory).length}
                  </span>
                  <span className="tracking-tight sm:tracking-normal">categories</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Total</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-black text-white">{totalAchievements}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Featured</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-black text-white">{featuredCount}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Mean Score</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-black text-white">{schoolStats?.meanScore?.toFixed(2) || '—'}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Target</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-black text-white">{schoolStats?.targetMean?.toFixed(2) || '—'}</p>
                </div>
              </div>

              {schoolStats?.slogan && (
                <div className="mt-4 text-xs sm:text-sm text-white/70">
                  <span className="inline-flex items-center gap-1">
                    <IoSparkles className="text-[#f2c357]" size={14} />
                    "{schoolStats?.slogan}" — {schoolStats?.sloganAuthor || 'School Motto'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 mb-10">
          {statsCards.map((stat, index) => (
            <ModernStatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Achievements */}
          <div className="flex-1 min-w-0 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#172033] p-3 shadow-lg">
                  <FiAward className="text-[#f2c357] text-xl" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Honor Roll</h2>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {filteredAchievements.length} Achievements
                  </p>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="rounded-[30px] border border-[#d9d0c3] bg-white p-4 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.38)]">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative w-full flex-1">
                  <div className="relative flex items-center rounded-2xl border border-[#e8dfd3] bg-[#fcfaf6] transition-all focus-within:border-[#172033]">
                    <div className="pl-4 pr-2 flex items-center justify-center pointer-events-none">
                      <FiSearch className="text-slate-400" size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search achievements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-3 bg-transparent text-[#172033] placeholder:text-slate-400 font-medium text-xs focus:outline-none"
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="pr-3 text-slate-400 hover:text-slate-600">
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative w-full md:w-44">
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-[#e8dfd3] bg-[#fcfaf6] px-4 py-3 font-semibold text-[#172033] text-xs uppercase tracking-[0.12em] cursor-pointer transition-all focus:border-[#172033]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                <button
                  onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                  className="px-4 sm:px-5 py-3 bg-[#172033] text-white rounded-2xl font-black text-[9px] uppercase tracking-wider shadow-lg hover:bg-[#101827] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <FiFilter size={12} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Achievements Display */}
            {filteredAchievements.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-[#d9d0c3] bg-white py-16 text-center shadow-[0_24px_60px_-48px_rgba(15,23,42,0.38)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fcfaf6] shadow-sm ring-1 ring-[#e8dfd3]">
                  <FiAward className="text-slate-300 text-xl" />
                </div>
                <h3 className="text-base font-black text-slate-900">No achievements found</h3>
                <p className="text-slate-500 text-xs mt-1 mb-4">Try adjusting your filters or search.</p>
                <button
                  onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                  className="rounded-full border border-[#d9d0c3] bg-[#fcfaf6] px-5 py-2.5 font-black text-[#172033] transition-all text-[10px] uppercase tracking-wider"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                {filteredAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    onView={setSelectedAchievement}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Quick Actions & Motto */}
          <div className="lg:w-[320px] space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="rounded-[30px] border border-[#d9d0c3] bg-white p-6 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.38)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-2xl bg-[#172033] p-2.5">
                    <FiZap className="text-[#f2c357] text-lg" />
                  </div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">Quick Facts</h2>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3.5 bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3]">
                    <span className="text-xs font-bold">Total Achievements</span>
                    <span className="font-black text-emerald-700">{totalAchievements}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3]">
                    <span className="text-xs font-bold">Featured Honors</span>
                    <span className="font-black text-emerald-700">{featuredCount}</span>
                  </div>
                  {schoolStats?.lastYearMean && (
                    <div className="flex items-center justify-between p-3.5 bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3]">
                      <span className="text-xs font-bold">Current Year Mean</span>
                      <span className="font-black text-emerald-700">{schoolStats?.currentYearMean?.toFixed(2) || '—'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Motto / Slogan Card */}
              <div className="relative overflow-hidden rounded-[30px] border border-[#1f2a40] bg-[#172033] p-6 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.82)]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-[50px]" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <IoTrophyOutline className="text-white text-xl" />
                  </div>
                  <h4 className="text-base font-black mb-2 tracking-tight">Our Slogan</h4>
                  <p className="text-xs text-white/70 mb-4 leading-relaxed italic">
                    "{schoolStats?.slogan || 'Strive to Excel'}"
                  </p>
                  {schoolStats?.sloganDescription && (
                    <p className="text-[10px] text-white/50 mb-2">{schoolStats.sloganDescription}</p>
                  )}
                  {schoolStats?.sloganAuthor && (
                    <p className="text-[10px] font-black text-[#f2c357] uppercase tracking-wider">— {schoolStats.sloganAuthor}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Banner */}
        <div className="relative overflow-hidden rounded-[34px] border border-[#1f2a40] bg-[#172033] p-6 md:p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.82)]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[80px] rounded-full -mr-24 -mt-24" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#f2c357]/10 blur-[80px] rounded-full -ml-24 -mb-24" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="shrink-0">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <FiHeart className="text-[#172033] text-2xl md:text-3xl" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg md:text-xl font-black text-white mb-2 tracking-tight">
                Excellence in Every Endeavor
              </h3>
              <p className="text-emerald-200 text-xs md:text-sm leading-relaxed max-w-xl mx-auto md:mx-0">
                Each achievement represents the dedication of our students and staff. We celebrate every milestone on our journey to greatness.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <AchievementDetailModal achievement={selectedAchievement} onClose={() => setSelectedAchievement(null)} />
      )}

      <style jsx global>{`
        input, select, textarea { font-size: 16px !important; }
        button, a { min-height: 44px; min-width: 44px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 640px) {
          .rounded-[2.5rem] { border-radius: 1.5rem !important; }
          .rounded-[2rem] { border-radius: 1.25rem !important; }
        }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation-duration: 0.3s; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .zoom-in { animation-name: zoom-in; }
      `}</style>
    </div>
  );
}