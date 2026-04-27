'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiMail,
  FiPhone,
  FiUser,
  FiAward,
  FiBook,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown, // Added for the new select dropdowns
  FiFilter,
  FiX,
  FiMapPin,
  FiCalendar,
  FiBriefcase,
  FiEye,
  FiPhoneCall,
  FiRefreshCcw,
  FiStar,
  FiShield,
  FiRotateCw,
  FiRefreshCw, // Added for the Hero Gallery style
  FiUpload,
  FiCheck,
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiAlertCircle,
  FiTag,
  FiUsers,
  FiTarget,    // Added for Total Staff stat
  FiArchive    // Added for Archive stat
} from 'react-icons/fi';

import { 
  FaEdit, 
  FaUserPlus, 
  FaTimes, 
  FaCheck, 
  FaUser, 
  FaEnvelope, 
  FaUserCircle, 
  FaInfoCircle, 
  FaPhoneAlt, 
  FaUserTie, 
  FaBriefcase, 
  FaBuilding, 
  FaCalendarAlt, 
  FaUserCheck, 
  FaQuoteLeft, 
  FaQuoteRight, 
  FaStar, 
  FaExclamationCircle, 
  FaTrophy, 
  FaClipboardCheck, 
  FaSave,
  FaMale,
  FaFemale,
  FaUpload,
  FaGraduationCap,
  FaCrown,
  FaFolderOpen, 
  FaShieldAlt,
  FaUsers,
  FaBook,
  FaCheckCircle,
  FaCalendar,
  FaTimesCircle,
  FaHandsHelping,
  FaChalkboardTeacher,
  FaChevronRight // Used in the "Next Step" buttons
} from 'react-icons/fa';

// IONICONS (Io) - Used for specialized branding and sparkles
import { 
  IoPeopleCircle,
  IoRocketOutline,
  IoSchoolOutline,
  IoSparkles // Used for the "Gallery/New" sparkle effect
} from 'react-icons/io5';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

// Custom Spinner Component using Material-UI CircularProgress
const Spinner = ({ size = 40, color = 'inherit', thickness = 3.6, variant = 'indeterminate', value = 0 }) => {
  return (
    <div className="inline-flex items-center justify-center">
      <svg 
        className={`animate-spin ${variant === 'indeterminate' ? '' : ''}`} 
        width={size} 
        height={size} 
        viewBox="0 0 44 44"
      >
        {variant === 'determinate' ? (
          <>
            <circle 
              className="text-gray-200" 
              stroke="currentColor" 
              strokeWidth={thickness} 
              fill="none" 
              cx="22" 
              cy="22" 
              r="20"
            />
            <circle 
              className="text-blue-600" 
              stroke="currentColor" 
              strokeWidth={thickness} 
              strokeLinecap="round" 
              fill="none" 
              cx="22" 
              cy="22" 
              r="20" 
              strokeDasharray="125.6" 
              strokeDashoffset={125.6 - (125.6 * value) / 100}
              transform="rotate(-90 22 22)"
            />
          </>
        ) : (
          <circle 
            className="text-blue-600" 
            stroke="currentColor" 
            strokeWidth={thickness} 
            strokeLinecap="round" 
            fill="none" 
            cx="22" 
            cy="22" 
            r="20" 
            strokeDasharray="30 100"
          />
        )}
      </svg>
    </div>
  );
};

// Item Input Component for array fields
const ItemInput = ({ 
  label, 
  value = [], 
  onChange, 
  placeholder = "Add item...",
  type = "text",
  icon: Icon = FiTag,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleAddItem = () => {
    if (!inputValue.trim()) return;
    
    const trimmedValue = inputValue.trim();
    if (!value.includes(trimmedValue)) {
      onChange([...value, trimmedValue]);
      setInputValue('');
    }
  };

  const handleRemoveItem = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      handleRemoveItem(value.length - 1);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-800 mb-2">
        {label} ({value.length} items)
      </label>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type={type}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          disabled={!inputValue.trim() || disabled}
          className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
        >
          Add
        </button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[60px]">
          {value.map((item, index) => (
            <div
              key={index}
              className="group flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:border-red-300 transition-colors"
            >
              <span className="text-gray-800 font-medium">{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={disabled}
                className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <FiX className="text-sm" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Delete Confirmation Modal
function DeleteConfirmationModal({ 
  open, 
  onClose, 
  onConfirm, 
  type = 'single',
  count = 1,
  staffName = '',
  loading = false 
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
                <FiAlertTriangle className="text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Confirm Deletion</h2>
                <p className="text-red-100 opacity-90 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>
            {!loading && (
              <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl cursor-pointer">
                <FiX className="text-xl" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
              <FiAlertTriangle className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {type === 'bulk' 
                  ? `Delete ${count} staff ${count === 1 ? 'member' : 'members'}?`
                  : `Delete "${staffName}"?`
                }
              </h3>
              <p className="text-gray-600">
                {type === 'bulk'
                  ? `You are about to delete ${count} staff ${count === 1 ? 'member' : 'members'}. All associated data will be permanently removed.`
                  : 'This staff member will be permanently deleted. All associated data will be removed.'
                }
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">
                <span className="font-bold">Warning:</span> This action cannot be undone. Please make sure you want to proceed.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            
            <button 
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner size={16} color="white" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FiTrash2 />
                  {type === 'bulk' ? `Delete ${count} Staff` : 'Delete Staff Member'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification Component
function Notification({ 
  open, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  duration = 5000 
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (open) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        
        if (elapsed >= duration) {
          clearInterval(interval);
          onClose();
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [open, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-50 to-emerald-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          iconBg: 'bg-green-100',
          progress: 'bg-green-500',
          title: 'text-green-800'
        };
      case 'error':
        return {
          bg: 'from-red-50 to-orange-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          progress: 'bg-red-500',
          title: 'text-red-800'
        };
      case 'warning':
        return {
          bg: 'from-yellow-50 to-orange-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          progress: 'bg-yellow-500',
          title: 'text-yellow-800'
        };
      case 'info':
        return {
          bg: 'from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          progress: 'bg-blue-500',
          title: 'text-blue-800'
        };
      default:
        return {
          bg: 'from-gray-50 to-gray-100',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          iconBg: 'bg-gray-100',
          progress: 'bg-gray-500',
          title: 'text-gray-800'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <FiCheckCircle className="text-xl" />;
      case 'error': return <FiAlertCircle className="text-xl" />;
      case 'warning': return <FiAlertTriangle className="text-xl" />;
      case 'info': return <FiInfo className="text-xl" />;
      default: return <FiInfo className="text-xl" />;
    }
  };

  const styles = getTypeStyles();

  if (!open) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-md animate-slide-in">
      <div className={`bg-gradient-to-r ${styles.bg} border-2 ${styles.border} rounded-2xl shadow-xl overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 ${styles.iconBg} rounded-xl ${styles.icon}`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <h4 className={`font-bold ${styles.title} mb-1`}>{title}</h4>
              <p className="text-gray-700 text-sm">{message}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-200 hover:bg-opacity-50 rounded-lg cursor-pointer text-gray-500"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>
        <div className="h-1 bg-gray-200">
          <div 
            className={`h-full ${styles.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Modern Staff Detail Modal
function ModernStaffDetailModal({ staff, onClose, onEdit }) {
  if (!staff) return null;

  const getImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') {
      return staff?.gender === 'female' ? '/female.png' : '/male.png';
    }
    if (imagePath.startsWith('http') || imagePath.startsWith('/') || imagePath.startsWith('data:image')) {
      return imagePath;
    }
    return `/${imagePath}`;
  };

  const imageUrl = getImageUrl(staff.image);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-4">
      {/* Animated Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Main Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* Sticky Header: Profile Summary */}
        <div className="relative bg-slate-900 p-5 md:p-8 shrink-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 blur-[80px] rounded-full -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 to-pink-600 rounded-[2rem] blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
              <img
                src={imageUrl}
                alt={staff.name}
                className="relative w-24 h-24 md:w-32 md:h-32 rounded-[1.8rem] object-cover border-2 border-white/10 shadow-2xl"
                onError={(e) => { e.target.src = '/male.png'; }}
              />
            </div>

            <div className="flex-1 space-y-2">
<div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
  <span className="bg-orange-600 text-[10px] font-black uppercase tracking-widest text-white px-3 py-1 rounded-full">
    {staff.role}
  </span>
  {staff.role === 'Deputy Principal' && staff.position && (
    <span className={`text-[10px] font-black uppercase tracking-widest text-white px-3 py-1 rounded-full ${
      staff.position.includes('Academics') ? 'bg-emerald-600' : 'bg-amber-600'
    }`}>
      {staff.position.replace('Deputy Principal ', '')}
    </span>
  )}
  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
    staff.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
  }`}>
    {staff.status || 'active'}
  </span>
</div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none italic">
                {staff.name}
              </h1>
              <p className="text-slate-400 font-bold text-sm md:text-base uppercase tracking-tight">
                {staff.position} <span className="mx-2 opacity-30 text-white">|</span> <span className="text-orange-500">{staff.department}</span>
              </p>
            </div>

            <button 
              onClick={onClose} 
              className="absolute top-0 right-0 p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content: Bento Grid Style */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8 scrollbar-hide">
          
          {/* Quick Contact Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-600">
                <FiMail size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Email</p>
                <p className="text-sm font-bold text-slate-700 truncate">{staff.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                <FiPhone size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Line</p>
                <p className="text-sm font-bold text-slate-700 truncate">{staff.phone}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bio Section */}
            {staff.bio && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-6 h-[2px] bg-orange-600" /> Professional Bio
                </h3>
                <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 shadow-sm">
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium italic">
                    "{staff.bio}"
                  </p>
                </div>
              </div>
            )}

            {/* Expertise Section */}
            {staff.expertise?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-6 h-[2px] bg-purple-600" /> Core Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {staff.expertise.map((exp, i) => (
                    <span key={i} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tight">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Responsibilities & Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {staff.responsibilities?.length > 0 && (
              <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100">
                <h3 className="font-black text-emerald-900 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-600" /> Key Roles
                </h3>
                <ul className="space-y-3">
                  {staff.responsibilities.map((resp, i) => (
                    <li key={i} className="text-xs font-bold text-emerald-800 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {staff.achievements?.length > 0 && (
              <div className="p-6 bg-orange-50/50 rounded-[2rem] border border-orange-100">
                <h3 className="font-black text-orange-900 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FiAward className="text-orange-600" /> Milestones
                </h3>
                <ul className="space-y-3">
                  {staff.achievements.map((ach, i) => (
                    <li key={i} className="text-xs font-bold text-orange-800 flex items-start gap-2">
                      <FiStar className="text-orange-400 shrink-0 mt-0.5" />
                      {ach}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="p-5 md:p-8 bg-white border-t border-slate-100 flex gap-3 shrink-0">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
          >
            Return
          </button>
          <button 
            onClick={() => { onClose(); onEdit(staff); }} 
            className="flex-[2] py-4 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all group"
          >
            <FiEdit className="group-hover:rotate-12 transition-transform" /> 
            Modify Records
          </button>
        </div>
      </div>
    </div>
  );
}

function ModernStaffCard({ staff, onEdit, onDelete, onView, selected, onSelect, actionLoading }) {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') {
      return staff?.gender === 'female' ? '/female.png' : '/male.png';
    }
    if (imagePath.startsWith('http') || imagePath.startsWith('/')) return imagePath;
    if (imagePath.startsWith('data:image')) return imagePath;
    return `/${imagePath}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-600 border-emerald-100';
      case 'on-leave': return 'bg-amber-500/10 text-amber-600 border-amber-100';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const imageUrl = getImageUrl(staff.image);
  const isDefaultImage = !staff.image || staff.image === '';

  return (
    <div className={`bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-2 ${
      selected ? 'border-blue-600 ring-4 ring-blue-600/5' : 'border-transparent'
    } w-full max-w-md overflow-hidden flex flex-col`}>
      
      {/* Image Section - Increased Height for Profile Impact */}
      <div className="relative h-72 w-full bg-slate-50 overflow-hidden">
        <div className="relative h-full w-full">
          {!imageError ? (
            <img 
              src={imageUrl} 
              alt={staff.name} 
              onClick={() => onView(staff)}
              className="w-full h-full object-cover object-top cursor-pointer"
              onError={() => setImageError(true)} 
            />
          ) : (
            <div 
              onClick={() => onView(staff)} 
              className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-300 cursor-pointer"
            >
              <FiUser className="text-6xl" />
              <span className="text-[10px] font-black uppercase tracking-widest mt-3">Identity Pending</span>
            </div>
          )}
        </div>

        {/* Floating UI Elements */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start pointer-events-none">
          <div className="bg-white p-2.5 rounded-2xl shadow-xl pointer-events-auto border border-slate-100">
            <input 
              type="checkbox" 
              checked={selected} 
              onChange={(e) => onSelect(staff.id, e.target.checked)}
              className="w-5 h-5 text-blue-600 border-slate-200 rounded-lg focus:ring-0 cursor-pointer" 
            />
          </div>
          
          <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md border shadow-lg pointer-events-auto ${getStatusColor(staff.status)}`}>
            {staff.status || 'active'}
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="p-8">
        <div className="mb-8">
          <h3 
            onClick={() => onView(staff)} 
            className="text-3xl font-serif font-medium text-slate-900 leading-none tracking-tight cursor-pointer truncate"
          >
            {staff.name}
          </h3>
          <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest flex items-center gap-2">
            <FiMail className="text-blue-500" />
            {staff.email || 'not-assigned@matungulugirls.sc.ke'}
          </p>
        </div>
        
        {/* Modern Bento Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Department */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="block text-[8px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Department</span>
            <span className="text-xs font-bold text-slate-800">{staff.department}</span>
          </div>
          
          {/* Role */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="block text-[8px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Position</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800 truncate leading-none">
                {staff.role === 'Deputy Principal' ? 'Dep. Principal' : staff.role}
              </span>
              {staff.position && (
                <span className="text-[9px] font-black text-blue-600 mt-1 uppercase tracking-tight">
                  {staff.position.replace('Deputy Principal ', '')}
                </span>
              )}
            </div>
          </div>

          {/* Contact Row */}
          <div className="col-span-2 p-4 bg-slate-900 rounded-2xl flex items-center justify-between shadow-lg shadow-slate-900/10">
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">Contact Primary</span>
              <span className="text-xs font-bold text-white tracking-widest">{staff.phone}</span>
            </div>
            <FiPhoneCall className="text-blue-400 text-lg" />
          </div>
        </div>

        {/* Expertise - Styled as Mini-Tags */}
        {staff.expertise && staff.expertise.length > 0 && (
          <div className="mb-8">
            <span className="block text-[8px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3 px-1">Core Expertise</span>
            <div className="flex flex-wrap gap-2">
              {staff.expertise.slice(0, 3).map((exp, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight">
                  {exp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Static Action Bar */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onView(staff)} 
            className="h-14 px-6 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-100"
          >
            Details
          </button>
          
          <button 
            onClick={() => onEdit(staff)} 
            disabled={actionLoading}
            className="h-14 flex-1 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 disabled:opacity-50"
          >
            Manage Profile
          </button>
          
          <button 
            onClick={() => onDelete(staff)} 
            disabled={actionLoading}
            className="h-14 w-14 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl border border-red-100 disabled:opacity-50"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// REPLACE YOUR ModernStaffModal WITH THIS - SAME STYLING AS ModernSchoolModal
// REPLACE YOUR ModernStaffModal WITH THIS - EXACT SAME STYLE AS ModernSchoolModal
function ModernStaffModal({ onClose, onSave, staff, loading, existingDeputyCounts }) {
  const isUpdateMode = !!staff && staff.id;
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    role: staff?.role || 'Teacher',
    position: staff?.position || '',
    department: staff?.department || 'Sciences',
    email: staff?.email || '',
    phone: staff?.phone || '',
    image: staff?.image || '',
    gender: staff?.gender || 'male',
    bio: staff?.bio || '',
    responsibilities: Array.isArray(staff?.responsibilities) ? staff.responsibilities : [],
    expertise: Array.isArray(staff?.expertise) ? staff.expertise : [],
    achievements: Array.isArray(staff?.achievements) ? staff.achievements : [],
    status: staff?.status || 'active',
    quote: staff?.quote || '',
    joinDate: staff?.joinDate || new Date().toISOString().split('T')[0],
    education: staff?.education || '',
    experience: staff?.experience || ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(staff?.image || '');
  const [imageError, setImageError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const steps = [
    { id: 'basic', label: 'Basic Info', icon: FaUser },
    { id: 'contact', label: 'Contact', icon: FaEnvelope },
    { id: 'profile', label: 'Profile', icon: FaUserCircle },
    { id: 'details', label: 'Details', icon: FaInfoCircle }
  ];

  const ROLES = [
    { value: 'Teacher', label: 'Teacher', icon: FaChalkboardTeacher, color: 'text-blue-600' },
    { value: 'Principal', label: 'Principal', icon: FaCrown, color: 'text-purple-600' },
    { value: 'Deputy Principal', label: 'Deputy Principal', icon: FaShieldAlt, color: 'text-emerald-600' },
    { value: 'BOM Member', label: 'BOM Member', icon: FaShieldAlt, color: 'text-red-600' },
    { value: 'Support Staff', label: 'Support Staff', icon: FaUsers, color: 'text-yellow-600' },
    { value: 'Librarian', label: 'Librarian', icon: FaBook, color: 'text-indigo-600' },
    { value: 'Counselor', label: 'Counselor', icon: FaHandsHelping, color: 'text-pink-600' }
  ];

  const DEPUTY_PRINCIPAL_TYPES = [
    { 
      value: 'Deputy Principal (Academics)', 
      label: 'Deputy Principal (Academics)', 
      icon: FaGraduationCap, 
      color: 'text-emerald-600',
      description: 'Oversees curriculum, academics, and examinations'
    },
    { 
      value: 'Deputy Principal (Administration)', 
      label: 'Deputy Principal (Administration)', 
      icon: FaBuilding, 
      color: 'text-amber-600',
      description: 'Oversees discipline, facilities, and student affairs'
    }
  ];

  const DEPARTMENTS = [
    'Sciences', 'Mathematics', 'Languages', 'Humanities', 
    'Administration', 'Sports', 'Guidance', 'Arts', 'Technology'
  ];

  const STATUS_OPTIONS = [
    { value: 'active', label: 'Active', icon: FaCheckCircle, color: 'text-green-600' },
    { value: 'on-leave', label: 'On Leave', icon: FaCalendar, color: 'text-yellow-600' },
    { value: 'inactive', label: 'Inactive', icon: FaTimesCircle, color: 'text-red-600' }
  ];

  useEffect(() => {
    if (staff?.image && typeof staff.image === 'string') {
      const formattedImage = staff.image.startsWith('/') ? staff.image : `/${staff.image}`;
      setImagePreview(formattedImage);
    }
  }, [staff]);

  const validateDeputyPrincipal = () => {
    if (formData.role === 'Deputy Principal') {
      if (!formData.position) {
        setCurrentStep(0);
        throw new Error('Please select Deputy Principal type (Academics or Administration)');
      }
      if (!formData.position.includes('Academics') && !formData.position.includes('Administration')) {
        throw new Error('Deputy Principal must be either Academics or Administration');
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) return;

    try {
      setActionLoading(true);
      validateDeputyPrincipal();
      
      if (!imageFile && !staff?.image && !imagePreview) {
        setImageError('Staff image is required.');
        setCurrentStep(2);
        return;
      }

      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (Array.isArray(formData[key])) {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else if (key !== 'image') {
            formDataToSend.append(key, formData[key].toString());
          }
        }
      });
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (staff?.image && typeof staff.image === 'string' && staff.image.trim() !== '') {
        formDataToSend.append('image', staff.image);
      } else {
        formDataToSend.append('image', '');
      }
      
      await onSave(formDataToSend, staff?.id);
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (currentStep < steps.length - 1 && isStepValid()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = (e) => {
    e.preventDefault();
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleImageChange = (file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setImageError('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      setImageError('');
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview('');
    setImageError('');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, items) => {
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleGenderChange = (gender) => {
    setFormData(prev => ({ ...prev, gender }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.name.trim() && formData.role.trim();
      case 1: return formData.email.trim() && formData.phone.trim();
      case 2: return (imageFile || staff?.image || imagePreview) && !imageError;
      case 3: return true;
      default: return true;
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95vw',
        maxWidth: '1200px',
        maxHeight: '95vh',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        {/* DYNAMIC HEADER - Green for CREATE, Blue for UPDATE */}
        <div className={`p-4 text-white ${isUpdateMode ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700' : 'bg-gradient-to-r from-green-600 via-emerald-700 to-teal-700'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                {isUpdateMode ? <FaEdit className="text-lg" /> : <FaUserPlus className="text-lg" />}
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold">
                  {isUpdateMode ? 'Update Staff Information' : 'Add New Staff Member'}
                </h2>
                <p className="text-white/80 text-xs mt-0.5">
                  {isUpdateMode ? 'Modify existing staff details' : 'Add a new staff member to the directory'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition">
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white border-b border-gray-200 p-3">
          <div className="flex flex-wrap justify-center items-center gap-2 md:space-x-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-bold ${
                    index === currentStep 
                      ? isUpdateMode 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-green-500 text-white shadow-lg'
                      : index < currentStep
                      ? isUpdateMode
                        ? 'bg-blue-400 text-white'
                        : 'bg-green-400 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <step.icon className="text-xs" />
                  <span className="font-bold">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-4 h-0.5 mx-1.5 md:w-6 ${
                    index < currentStep 
                      ? isUpdateMode ? 'bg-blue-400' : 'bg-green-400'
                      : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-h-[calc(95vh-160px)] overflow-y-auto p-4 md:p-6">
          <form 
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              // Prevent form submission on Enter key in input fields
              // Allow individual input handlers (like StyledTagInput) to handle Enter
              if (e.key === 'Enter' && 
                  e.target.tagName === 'INPUT' && 
                  ['text', 'email', 'tel', 'url', 'search', 'number'].includes(e.target.type)) {
                e.preventDefault();
              }
            }}
            className="space-y-6"
          >
            {/* Step 1: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                      <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaUser className="text-blue-600" /> Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter full name..."
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base font-bold"
                        required
                      />
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
                      <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaUserTie className="text-purple-600" /> Role <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {ROLES.map((role) => (
                          <div 
                            key={role.value} 
                            onClick={() => handleChange('role', role.value)}
                            className={`p-3 rounded-xl cursor-pointer transition-all ${
                              formData.role === role.value 
                                ? 'bg-purple-600 text-white shadow-lg' 
                                : 'bg-white border-2 border-purple-200 hover:border-purple-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <role.icon className={`text-sm ${formData.role === role.value ? 'text-white' : role.color}`} />
                              <span className="text-sm font-bold">{role.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
                      <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaBuilding className="text-orange-600" /> Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-base font-bold"
                      >
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
                      <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaCalendarAlt className="text-emerald-600" /> Join Date
                      </label>
                      <input
                        type="date"
                        value={formData.joinDate}
                        onChange={(e) => handleChange('joinDate', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-base font-bold"
                      />
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200">
                      <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaUserCheck className="text-red-600" /> Status
                      </label>
                      <div className="flex gap-3">
                        {STATUS_OPTIONS.map((status) => (
                          <div 
                            key={status.value} 
                            onClick={() => handleChange('status', status.value)}
                            className={`flex-1 p-3 rounded-xl cursor-pointer text-center transition-all ${
                              formData.status === status.value 
                                ? 'bg-red-600 text-white shadow-lg' 
                                : 'bg-white border-2 border-red-200 hover:border-red-400'
                            }`}
                          >
                            <status.icon className={`text-sm mx-auto ${formData.status === status.value ? 'text-white' : status.color}`} />
                            <span className="text-xs font-bold block mt-1">{status.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deputy Principal Section */}
                    {formData.role === 'Deputy Principal' && (
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 border border-amber-200">
                        <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <FaShieldAlt className="text-amber-600" /> Deputy Principal Type <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {DEPUTY_PRINCIPAL_TYPES.map((type) => (
                            <div 
                              key={type.value}
                              onClick={() => {
                                handleChange('position', type.value);
                                handleChange('department', type.value.includes('Administration') ? 'Administration' : 'Sciences');
                              }}
                              className={`p-3 rounded-xl cursor-pointer transition-all ${
                                formData.position === type.value 
                                  ? 'bg-amber-600 text-white shadow-lg' 
                                  : 'bg-white border-2 border-amber-200 hover:border-amber-400'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <type.icon className={`text-lg ${formData.position === type.value ? 'text-white' : type.color}`} />
                                <div>
                                  <span className="text-sm font-bold block">{type.label}</span>
                                  <p className={`text-xs ${formData.position === type.value ? 'text-white/80' : 'text-gray-600'}`}>
                                    {type.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.role !== 'Deputy Principal' && (
                      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-5 border border-cyan-200">
                        <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <FaBriefcase className="text-cyan-600" /> Position
                        </label>
                        <select
                          value={formData.position}
                          onChange={(e) => handleChange('position', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-base font-bold"
                        >
                          <option value="">Select a position...</option>
                          <optgroup label="Administration">
                            <option value="Chief Principal">Chief Principal</option>
                            <option value="Senior Teacher">Senior Teacher</option>
                            <option value="Head of Department">Head of Department</option>
                          </optgroup>
                          <optgroup label="Teaching Staff">
                            <option value="Teacher">Teacher</option>
                            <option value="Subject Teacher">Subject Teacher</option>
                            <option value="Class Teacher">Class Teacher</option>
                          </optgroup>
                          <optgroup label="Support">
                            <option value="Librarian">Librarian</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Secretary">Secretary</option>
                            <option value="Support Staff">Support Staff</option>
                          </optgroup>
                        </select>
                      </div>
                    )}

                    {existingDeputyCounts && (
                      <div className="bg-gray-100 rounded-xl p-3 text-sm text-gray-700">
                        <span className="font-bold">Current Deputy Principals:</span> Academics: {existingDeputyCounts.academics || 0}/1 | Admin: {existingDeputyCounts.administration || 0}/1 | Total: {existingDeputyCounts.total || 0}/2
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                    <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FaEnvelope className="text-blue-600" /> Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="staff@school.edu"
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base font-bold"
                      required
                    />
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
                    <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FaPhoneAlt className="text-green-600" /> Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+254 700 000 000"
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-base font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
                  <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaGraduationCap className="text-purple-600" /> Education
                  </label>
                  <textarea
                    value={formData.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    placeholder="Educational background, degrees, certifications..."
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none bg-white text-base font-bold"
                  />
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
                  <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaBriefcase className="text-orange-600" /> Experience
                  </label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
                    placeholder="Previous experience, years of service..."
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none bg-white text-base font-bold"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Profile & Bio */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-5 border border-pink-200">
                  <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaUserCircle className="text-pink-600" /> Gender
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleGenderChange('male')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                        formData.gender === 'male'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white border-2 border-pink-200 text-gray-700 hover:border-pink-400'
                      }`}
                    >
                      <FaMale className="text-sm" /> Male
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange('female')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                        formData.gender === 'female'
                          ? 'bg-pink-600 text-white shadow-lg'
                          : 'bg-white border-2 border-pink-200 text-gray-700 hover:border-pink-400'
                      }`}
                    >
                      <FaFemale className="text-sm" /> Female
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-5 border border-cyan-200">
                  <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaUpload className="text-cyan-600" /> Profile Image <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {imagePreview && (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-xl object-cover border-2 border-cyan-300" />
                        <button
                          type="button"
                          onClick={handleImageRemove}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg text-xs"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files[0])}
                        className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200"
                      />
                      {imageError && <p className="text-sm text-red-600 mt-2">{imageError}</p>}
                      <p className="text-xs text-gray-500 mt-2">Max size: 5MB. JPG, PNG, WEBP</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-5 border border-indigo-200">
                  <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaQuoteLeft className="text-indigo-600" /> Biography
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Professional background..."
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-white text-base font-bold"
                  />
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 border border-amber-200">
                  <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaQuoteRight className="text-amber-600" /> Personal Quote
                  </label>
                  <textarea
                    value={formData.quote}
                    onChange={(e) => handleChange('quote', e.target.value)}
                    placeholder="Motto or favorite quote..."
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none bg-white text-base font-bold"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                  <StyledTagInput
                    label="Expertise Areas"
                    value={formData.expertise}
                    onChange={(items) => handleArrayChange('expertise', items)}
                    placeholder="e.g., Data Analysis"
                    disabled={actionLoading}
                    color="blue"
                  />
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
                  <StyledTagInput
                    label="Core Responsibilities"
                    value={formData.responsibilities}
                    onChange={(items) => handleArrayChange('responsibilities', items)}
                    placeholder="e.g., Team Lead"
                    disabled={actionLoading}
                    color="green"
                  />
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
                  <StyledTagInput
                    label="Key Achievements"
                    value={formData.achievements}
                    onChange={(items) => handleArrayChange('achievements', items)}
                    placeholder="e.g., Award Winner"
                    disabled={actionLoading}
                    color="orange"
                  />
                </div>

                {/* Summary Section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaClipboardCheck className="text-gray-600" /> Staff Summary
                  </h3>
                  <div className="space-y-2 text-sm bg-white p-4 rounded-xl">
                    <p><span className="font-bold">Name:</span> {formData.name || '—'}</p>
                    <p><span className="font-bold">Role:</span> {formData.role || '—'}</p>
                    <p><span className="font-bold">Position:</span> {formData.position || '—'}</p>
                    <p><span className="font-bold">Department:</span> {formData.department || '—'}</p>
                    <p><span className="font-bold">Email:</span> {formData.email || '—'}</p>
                    <p><span className="font-bold">Phone:</span> {formData.phone || '—'}</p>
                    <p><span className="font-bold">Gender:</span> {formData.gender || '—'}</p>
                    <p><span className="font-bold">Status:</span> {formData.status || '—'}</p>
                    {formData.expertise.length > 0 && (
                      <p><span className="font-bold">Expertise:</span> {formData.expertise.join(', ')}</p>
                    )}
                    {formData.responsibilities.length > 0 && (
                      <p><span className="font-bold">Responsibilities:</span> {formData.responsibilities.join(', ')}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isUpdateMode ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                  <span className="font-bold">Step {currentStep + 1} of {steps.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {currentStep > 0 && (
                  <button 
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition duration-200 font-bold text-base w-full sm:w-auto"
                  >
                    ← Previous
                  </button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <button 
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isStepValid()}
                    className={`px-8 py-3 rounded-xl transition duration-200 font-bold shadow disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-base w-full sm:w-auto ${
                      isUpdateMode 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    }`}
                  >
                    Continue →
                  </button>
                ) : (
                  <button 
                    type="submit"
                    disabled={actionLoading || !isStepValid()}
                    className={`px-8 py-3 rounded-xl transition duration-200 font-bold shadow disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-base w-full sm:w-auto ${
                      isUpdateMode 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                        : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700'
                    }`}
                  >
                    {actionLoading ? (
                      <>
                        <CircularProgress size={16} className="text-white" />
                        <span>{isUpdateMode ? 'Updating...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="text-sm" />
                        <span>{isUpdateMode ? 'Update Staff' : 'Save Staff'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}

// Styled Tag Input Component - ADD THIS AFTER ModernStaffModal
function StyledTagInput({ label, value, onChange, placeholder, disabled, color = 'blue' }) {
  const [inputValue, setInputValue] = useState('');

  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', focus: 'focus:ring-blue-500', tagBg: 'bg-blue-100', tagText: 'text-blue-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', focus: 'focus:ring-green-500', tagBg: 'bg-green-100', tagText: 'text-green-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', focus: 'focus:ring-orange-500', tagBg: 'bg-orange-100', tagText: 'text-orange-700' }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  const addItem = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeItem = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div>
      <label className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
        {label} ({value.length})
      </label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 px-4 py-3 border-2 ${colors.border} rounded-xl focus:ring-2 ${colors.focus} focus:border-transparent bg-white text-base font-bold`}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={addItem}
          disabled={disabled || !inputValue.trim()}
          className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${
            color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
            color === 'green' ? 'bg-green-600 hover:bg-green-700' :
            'bg-orange-600 hover:bg-orange-700'
          } disabled:opacity-50`}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((item, index) => (
          <div key={index} className={`flex items-center gap-2 ${colors.tagBg} ${colors.tagText} px-3 py-2 rounded-xl font-bold`}>
            <span>{item}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="hover:text-red-600 transition-colors"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Staff Manager Component
export default function StaffManager() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [stats, setStats] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
 const [refreshing, setRefreshing] = useState(false);

  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState('single');
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    type: 'success',
    title: '',
    message: ''
  });

  const roles = ['Principal', 'Deputy Principal', 'Teacher', 'BOM Member', 'Support Staff', 'Librarian', 'Counselor'];
  const departments = ['Sciences', 'Mathematics', 'Languages', 'Humanities', 'Administration', 'Sports', 'Guidance'];



    // Add this function after your imports but before the StaffManager component
const getStaffHierarchy = (staff) => {
  const hierarchyOrder = {
    'Principal': 1,
    'Deputy Principal': 2,
    'Teacher': 3,
    'BOM Member': 4,
    'Support Staff': 5,
    'Librarian': 6,
    'Counselor': 7
  };

  return [...staff].sort((a, b) => {
    // First sort by hierarchy order
    const orderA = hierarchyOrder[a.role] || 999;
    const orderB = hierarchyOrder[b.role] || 999;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // If same role, sort Deputy Principals by type (Academics first, then Administration)
    if (a.role === 'Deputy Principal' && b.role === 'Deputy Principal') {
      const deputyOrder = {
        'Deputy Principal (Academics)': 1,
        'Deputy Principal (Administration)': 2
      };
      const deputyA = deputyOrder[a.position] || 999;
      const deputyB = deputyOrder[b.position] || 999;
      return deputyA - deputyB;
    }
    
    // If same role and not Deputy Principal, sort by name
    return a.name.localeCompare(b.name);
  });
};


// In StaffManager component, add this to your stats calculation
useEffect(() => {
  const calculatedStats = {
    total: staff.length,
    teaching: staff.filter(s => s.role === 'Teacher').length,
    administration: staff.filter(s => s.role === 'Principal' || s.role === 'Deputy Principal').length,
    bom: staff.filter(s => s.role === 'BOM Member').length,
    active: staff.filter(s => s.status === 'active').length,
    onLeave: staff.filter(s => s.status === 'on-leave').length,
    // Add deputy counts
    deputyAcademics: staff.filter(s => 
      s.role === 'Deputy Principal' && 
      s.position?.includes('Academics')
    ).length,
    deputyAdmin: staff.filter(s => 
      s.role === 'Deputy Principal' && 
      s.position?.includes('Administration')
    ).length,
    deputyTotal: staff.filter(s => s.role === 'Deputy Principal').length
  };
  setStats(calculatedStats);
}, [staff]);

  useEffect(() => {
  // Check authentication on component mount
  const checkAuth = () => {
    const adminToken = localStorage.getItem('admin_token');
    const deviceToken = localStorage.getItem('device_token');
    
    console.log('Staff Manager Auth check:', {
      hasAdminToken: !!adminToken,
      hasDeviceToken: !!deviceToken
    });
    
    // You can optionally hide action buttons if not authenticated
    // or show a login prompt
  };
  
  checkAuth();
  fetchStaff();
}, []);





// Helper function to get authentication headers
const getAuthHeaders = () => {
  const adminToken = localStorage.getItem('admin_token');
  const deviceToken = localStorage.getItem('device_token');
  
  if (!adminToken || !deviceToken) {
    throw new Error('Authentication required');
  }
  
  return {
    'Authorization': `Bearer ${adminToken}`,
    'x-device-token': deviceToken
  };
};

const fetchStaff = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    // ✅ PUBLIC ENDPOINT - No authentication needed
    const response = await fetch('/api/staff');
    
    const data = await response.json();
    
    if (data.success) {
      const sortedStaff = getStaffHierarchy(data.staff || []);
      setStaff(sortedStaff);
      setFilteredStaff(sortedStaff);
    } else {
      console.error('Failed to fetch staff:', data.error);
      setStaff([]);
      setFilteredStaff([]);
      showNotification('error', 'Fetch Failed', 'Failed to fetch staff data');
    }
  } catch (error) {
    console.error('Error fetching staff:', error);
    showNotification('error', 'Error', 'Error fetching staff data');
    setStaff([]);
    setFilteredStaff([]);
  } finally {
    if (isRefresh) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }
  }
};



  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    let filtered = staff;

    if (searchTerm) {
      filtered = filtered.filter(staffMember =>
        staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(staffMember => staffMember.department === selectedDepartment);
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(staffMember => staffMember.role === selectedRole);
    }

    setFilteredStaff(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedRole, staff]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const showNotification = (type, title, message) => {
    setNotification({
      open: true,
      type,
      title,
      message
    });
  };

  const handleCreate = () => {
    setEditingStaff(null);
    setShowModal(true);
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setShowModal(true);
  };

  const handleViewDetails = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowDetailModal(true);
  };

  const handleDelete = (staffMember) => {
    setStaffToDelete(staffMember);
    setDeleteType('single');
    setShowDeleteModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedPosts.size === 0) {
      showNotification('warning', 'No Selection', 'No staff members selected for deletion');
      return;
    }
    setDeleteType('bulk');
    setShowDeleteModal(true);
  };

const confirmDelete = async () => {
  try {
    // Add authentication headers
    const headers = getAuthHeaders();
    
    if (deleteType === 'single' && staffToDelete) {
      setBulkDeleting(true);
      const response = await fetch(`/api/staff/${staffToDelete.id}`, {
        method: 'DELETE',
        headers: headers, // Add authentication headers
      });
      
      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        throw new Error('Session expired. Please login again.');
      }
      
      const result = await response.json();
      
      if (result.success) {
        await fetchStaff();
        showNotification('success', 'Deleted', `Staff member "${staffToDelete.name}" deleted successfully!`);
      } else {
        showNotification('error', 'Delete Failed', result.error || 'Failed to delete staff member');
      }
    } else if (deleteType === 'bulk') {
      setBulkDeleting(true);
      const deletedIds = [];
      const failedIds = [];
      
      for (const staffId of selectedPosts) {
        try {
          const response = await fetch(`/api/staff/${staffId}`, {
            method: 'DELETE',
            headers: headers, // Add authentication headers
          });
          
          // Handle authentication errors
          if (response.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            throw new Error('Session expired. Please login again.');
          }
          
          const result = await response.json();
          
          if (result.success) {
            deletedIds.push(staffId);
          } else {
            console.error(`Failed to delete staff member ${staffId}:`, result.error);
            failedIds.push(staffId);
          }
        } catch (error) {
          console.error(`Error deleting staff member ${staffId}:`, error);
          failedIds.push(staffId);
        }
      }
      
      await fetchStaff();
      setSelectedPosts(new Set());
      
      if (deletedIds.length > 0 && failedIds.length === 0) {
        showNotification('success', 'Bulk Delete Successful', `Successfully deleted ${deletedIds.length} staff member(s)`);
      } else if (deletedIds.length > 0 && failedIds.length > 0) {
        showNotification('warning', 'Partial Success', `Deleted ${deletedIds.length} staff member(s), failed to delete ${failedIds.length}`);
      } else {
        showNotification('error', 'Delete Failed', 'Failed to delete selected staff members');
      }
    }
  } catch (error) {
    console.error('Error during deletion:', error);
    
    // Handle authentication errors
    if (error.message.includes('Authentication required') || 
        error.message.includes('Session expired')) {
      showNotification('error', 'Authentication Required', 'Please login to continue');
      setTimeout(() => {
        window.location.href = '/pages/adminLogin';
      }, 2000);
    } else {
      showNotification('error', 'Error', 'Error during deletion');
    }
  } finally {
    setBulkDeleting(false);
    setShowDeleteModal(false);
    setStaffToDelete(null);
  }
};

  const handlePostSelect = (staffId, selected) => {
    setSelectedPosts(prev => { 
      const newSet = new Set(prev); 
      selected ? newSet.add(staffId) : newSet.delete(staffId); 
      return newSet; 
    });
  };
const handleSubmit = async (formData, id) => {
  setSaving(true);
  try {
    // Add authentication headers
    const headers = getAuthHeaders();
    
    let response;
    if (id) {
      response = await fetch(`/api/staff/${id}`, {
        method: 'PUT',
        headers: headers, // Add authentication headers
        body: formData,
      });
    } else {
      response = await fetch('/api/staff', {
        method: 'POST',
        headers: headers, // Add authentication headers
        body: formData,
      });
    }

    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      throw new Error('Session expired. Please login again.');
    }

    const result = await response.json();

    if (result.success) {
      await fetchStaff();
      setShowModal(false);
      showNotification('success', id ? 'Updated' : 'Created', 
        `Staff member ${id ? 'updated' : 'created'} successfully!`);
    } else {
      // Handle specific error for missing image
      if (result.error?.includes('image') || result.error?.includes('Image')) {
        showNotification('error', 'Image Required', 
          'Staff image is required. Please upload an image.');
      } else {
        showNotification('error', 'Save Failed', 
          result.error || `Failed to ${id ? 'update' : 'create'} staff member`);
      }
    }
  } catch (error) {
    console.error('Error saving staff member:', error);
    
    // Handle authentication errors
    if (error.message.includes('Authentication required') || 
        error.message.includes('Session expired')) {
      showNotification('error', 'Authentication Required', 'Please login to continue');
      setTimeout(() => {
        window.location.href = '/pages/adminLogin';
      }, 2000);
    } else {
      showNotification('error', 'Error', 'Error saving staff member');
    }
  } finally {
    setSaving(false);
  }
};




  useEffect(() => {
    const calculatedStats = {
      total: staff.length,
      teaching: staff.filter(s => s.role === 'Teacher').length,
      administration: staff.filter(s => s.role === 'Principal' || s.role === 'Deputy Principal').length,
      bom: staff.filter(s => s.role === 'BOM Member').length,
      active: staff.filter(s => s.status === 'active').length,
      onLeave: staff.filter(s => s.status === 'on-leave').length,
    };
    setStats(calculatedStats);
  }, [staff]);

  const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <p className="text-sm text-gray-700 font-medium">
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStaff.length)} of {filteredStaff.length} staff members
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <FiChevronLeft className="text-lg" />
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => 
            page === 1 || 
            page === totalPages || 
            (page >= currentPage - 1 && page <= currentPage + 1)
          )
          .map((page, index, array) => (
            <div key={page} className="flex items-center">
              {index > 0 && array[index - 1] !== page - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => paginate(page)}
                className={`px-3 py-2 rounded-xl font-bold ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                    : 'text-gray-700'
                }`}
              >
                {page}
              </button>
            </div>
          ))
        }

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <FiChevronRight className="text-lg" />
        </button>
      </div>
    </div>
  );

  if (loading && staff.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <Spinner size={48} />
          <p className="text-gray-700 text-lg mt-4 font-medium">
            Loading Staff…
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Please wait while we fetch staff data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      <Notification
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />

      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={() => !bulkDeleting && setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        type={deleteType}
        count={deleteType === 'bulk' ? selectedPosts.size : 1}
        staffName={deleteType === 'single' ? staffToDelete?.name : ''}
        loading={bulkDeleting}
      />



      

<div className="relative bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#0F172A] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm transition-all duration-500 mb-8">
  
  {/* Animated Gradient Orbs */}
  <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-gradient-to-br from-blue-600/30 via-cyan-500/20 to-transparent rounded-full blur-[130px] animate-pulse pointer-events-none" />
  <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-tr from-orange-500/20 via-amber-500/10 to-transparent rounded-full blur-[110px] animate-pulse delay-1000 pointer-events-none" />
  <div className="absolute top-[40%] left-[20%] w-[200px] h-[200px] bg-purple-600/10 rounded-full blur-[80px] animate-pulse delay-700 pointer-events-none" />

  {/* Glass Card Overlay */}
  <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] rounded-[inherit] pointer-events-none" />

  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
    <div className="space-y-7">
      {/* Institutional Branding with animated bar */}
      <div className="group flex items-center gap-5">
        <div className="h-12 w-1.5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse" />
        <div className="space-y-1.5">
          <h2 className="text-[11px] md:text-xs font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
            Matungulu Girls Senior School 
          </h2>
          <p className="text-[10px] italic font-bold text-white/50 tracking-[0.2em] uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            "Strive to Excel"
          </p>
        </div>
      </div>

      {/* Title Area with enhanced icon */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="p-3.5 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl border border-white/15 shadow-xl group-hover:scale-105 transition-transform duration-300 w-fit">
          <FiUsers className="text-3xl text-orange-400 drop-shadow-lg" />
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter leading-none">
          STAFF{" "}
          <span className="bg-gradient-to-r from-blue-200 via-white to-blue-300 bg-clip-text text-transparent relative">
            DIRECTORY
            <svg className="absolute -bottom-2 left-0 w-full h-[2px]" viewBox="0 0 200 2" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="200" y2="0" stroke="url(#gradient)" strokeWidth="2" />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#F59E0B" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>
      </div>

      {/* Enhanced Summary Sentence */}
      <div className="max-w-2xl space-y-2">
        <p className="text-gray-300 text-sm md:text-base font-medium leading-relaxed backdrop-blur-sm bg-white/[0.02] px-4 py-2 rounded-xl inline-block">
          Managing{" "}
          <span className="text-white font-black text-lg border-b-2 border-orange-500/60 pb-0.5 inline-block transition-all hover:border-orange-500">
            {stats?.total || 0} Professional Profiles
          </span>
          .
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-400 text-sm">Current Status:</span>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 text-xs font-black uppercase tracking-wider">
              {stats?.active || 0} Active on School
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Enhanced Action Group */}
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={() => fetchStaff(true)}
        disabled={refreshing}
        className="group relative flex items-center justify-center gap-3 bg-white/5 backdrop-blur-xl border border-white/15 px-8 py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        {refreshing ? (
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : (
          <FiRotateCw className="text-base group-hover:rotate-180 transition-transform duration-500" />
        )}
        REFRESH
      </button>
      
      <button
        onClick={handleCreate}
        className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-white to-gray-100 text-[#0F172A] px-8 py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-transparent to-orange-400/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
        ADD STAFF
      </button>
    </div>
  </div>
</div>
{/* --- ENLARGED SEARCH & FILTER ENGINE --- */}
<div className="bg-gradient-to-br from-white via-gray-50/30 to-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 border border-gray-100/80 backdrop-blur-sm mb-8 transition-all duration-500 hover:shadow-3xl">
  
  {/* Animated background accent */}
  <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
    <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
  </div>

  <div className="relative z-10 flex flex-col gap-6">
    {/* Enhanced Header */}
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full shadow-lg shadow-orange-500/30" />
          <div className="w-1.5 h-6 bg-orange-400/60 rounded-full" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-400 uppercase tracking-[0.3em]">
            Filter Engine & Search
          </span>
          <p className="text-[10px] text-gray-400 font-medium tracking-wide">Refine your staff directory results</p>
        </div>
      </div>
      
      {/* Quick stats chip */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Live Results</span>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Enhanced Search Bar */}
      <div className="lg:col-span-6 relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
          <FiSearch className="text-2xl text-gray-400 group-focus-within:text-orange-500 transition-all duration-300 group-focus-within:scale-110" />
        </div>
        <input
          type="text"
          placeholder="Search by name, department or expertise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-16 pr-8 py-6 bg-gradient-to-br from-gray-50 to-gray-50/50 border-2 border-gray-100 rounded-2xl text-base font-semibold placeholder:text-gray-400 focus:bg-white focus:border-orange-400/30 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 outline-none shadow-sm hover:shadow-md"
        />
        {/* Animated underline effect on focus */}
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 group-focus-within:w-full rounded-full" />
      </div>

      {/* Enhanced Department Filter */}
      <div className="lg:col-span-3 relative group">
        <label className="absolute -top-3 left-5 px-2.5 bg-white text-[9px] font-black text-gray-500 uppercase tracking-widest z-10 group-hover:text-orange-500 transition-colors">
          Department
        </label>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="w-full px-6 py-6 bg-gradient-to-br from-gray-50 to-gray-50/50 border-2 border-gray-100 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 focus:bg-white focus:border-orange-400/30 transition-all duration-300 appearance-none outline-none shadow-sm"
        >
          <option value="all">🎯 All Departments</option>
          {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
        </select>
        <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-orange-500 transition-colors group-hover:rotate-180 duration-300" />
      </div>

      {/* Enhanced Role Filter */}
      <div className="lg:col-span-3 relative group">
        <label className="absolute -top-3 left-5 px-2.5 bg-white text-[9px] font-black text-gray-500 uppercase tracking-widest z-10 group-hover:text-orange-500 transition-colors">
          Staff Role
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full px-6 py-6 bg-gradient-to-br from-gray-50 to-gray-50/50 border-2 border-gray-100 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 focus:bg-white focus:border-orange-400/30 transition-all duration-300 appearance-none outline-none shadow-sm"
        >
          <option value="all">👥 All Roles</option>
          {roles.map(role => <option key={role} value={role}>{role}</option>)}
        </select>
        <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-orange-500 transition-colors group-hover:rotate-180 duration-300" />
      </div>

      {/* Enhanced Reset Section */}
      <div className="lg:col-span-12">
        <div className="border-t border-gray-100/80 pt-5 flex items-center justify-between">
          <div 
            onClick={() => {
              setSearchTerm('');
              setSelectedDepartment('all');
              setSelectedRole('all');
            }}
            className="group flex items-center gap-2.5 text-xs font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-orange-500 transition-all duration-300"
          >
            <div className="p-1.5 rounded-full bg-gray-50 group-hover:bg-orange-50 transition-colors duration-300">
              <FiRefreshCcw className="text-sm group-hover:rotate-180 transition-transform duration-500" />
            </div>
            <span className="group-hover:tracking-[0.25em] transition-all duration-300">RESET FILTERS</span>
          </div>
          
          {/* Active filters indicator */}
          {(searchTerm || selectedDepartment !== 'all' || selectedRole !== 'all') && (
            <div className="flex items-center gap-2 text-[9px] font-black text-orange-500 uppercase tracking-wider">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              <span>Active Filters Applied</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>

{/* --- ENHANCED STATS GRID --- */}
{stats && (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-12">
    {[
      { label: "Teaching Staff", val: stats.teaching, icon: FiBook, color: "from-blue-500 to-indigo-600", gradient: "via-blue-400", description: "Faculty Members" },
      { label: "Administration", val: stats.administration, icon: FiAward, color: "from-emerald-500 to-teal-600", gradient: "via-emerald-400", description: "Management Team" },
      { label: "BOM Hub", val: stats.bom, icon: FiShield, color: "from-purple-500 to-pink-600", gradient: "via-purple-400", description: "Board Members" },
      { label: "Total Strength", val: stats.total, icon: FiTarget, color: "from-orange-500 to-red-600", gradient: "via-orange-400", description: "Complete Roster" },
      { label: "On Leave", val: stats.onLeave, icon: FiCalendar, color: "from-amber-400 to-orange-600", gradient: "via-amber-400", description: "Temporary Absence" },
      { label: "Active Now", val: stats.active, icon: FiCheckCircle, color: "from-green-400 to-emerald-600", gradient: "via-green-400", description: "Currently Serving" },
    ].map((item, i) => (
      <div key={i} className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
        {/* Animated gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
        
        {/* Glossy effect */}
        <div className="absolute -inset-full group-hover:inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-all duration-1000 pointer-events-none" />
        
        <div className="relative z-10">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 group-hover:rotate-3`}>
            <item.icon className="text-xl" />
          </div>
          <div className="space-y-1.5">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider group-hover:text-gray-500 transition-colors">
                {item.label}
              </p>
              <p className="text-[8px] text-gray-300 font-medium uppercase tracking-wider mt-0.5">
                {item.description}
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-black bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {item.val}
              </p>
              {item.label === "Active Now" && (
                <div className="flex items-center gap-1 ml-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[7px] font-black text-green-500 uppercase">Live</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom accent bar */}
        <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${item.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full`} />
      </div>
    ))}
  </div>
)}

      {/* Bulk Actions */}
      {selectedPosts.size > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <FiTrash2 className="text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 text-lg">
                  {selectedPosts.size} staff {selectedPosts.size === 1 ? 'member' : 'members'} selected
                </h3>
                <p className="text-red-700 text-sm">
                  You can perform bulk actions on selected items
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedPosts(new Set())}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg cursor-pointer text-sm"
              >
                Clear Selection
              </button>
              <button 
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-2 text-sm"
              >
                {bulkDeleting ? (
                  <>
                    <Spinner size={16} color="white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 />
                    Delete Selected ({selectedPosts.size})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {currentStaff.map((staffMember) => (
          <ModernStaffCard 
            key={staffMember.id} 
            staff={staffMember} 
            onEdit={handleEdit} 
            onDelete={() => handleDelete(staffMember)} 
            onView={handleViewDetails} 
            selected={selectedPosts.has(staffMember.id)} 
            onSelect={handlePostSelect} 
            actionLoading={saving}
          />
        ))}
      </div>

      {/* Empty State */}
      {currentStaff.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
          <FiUser className="text-4xl lg:text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
            {searchTerm ? 'No staff members found' : 'No staff members available'}
          </h3>
          <p className="text-gray-600 text-sm lg:text-base mb-6 max-w-md mx-auto">
            {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first staff member'}
          </p>
          <button 
            onClick={handleCreate} 
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-bold shadow-lg flex items-center gap-2 mx-auto text-sm lg:text-base cursor-pointer"
          >
            <FiPlus /> Add Your First Staff Member
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredStaff.length > 0 && (
        <Pagination />
      )}

      {/* Modals */}
{showModal && (
  <ModernStaffModal 
    onClose={() => setShowModal(false)} 
    onSave={handleSubmit} 
    staff={editingStaff} 
    loading={saving}
    existingDeputyCounts={{
      academics: stats?.deputyAcademics || 0,
      administration: stats?.deputyAdmin || 0,
      total: stats?.deputyTotal || 0
    }}
  />
)}

      {showDetailModal && selectedStaff && (
        <ModernStaffDetailModal 
          staff={selectedStaff} 
          onClose={() => setShowDetailModal(false)} 
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}