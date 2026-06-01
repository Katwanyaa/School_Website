'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Toaster, toast as sooner } from 'sonner';
import { CircularProgress, Modal, Box } from '@mui/material';
import * as XLSX from 'xlsx';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar
} from 'recharts';

import { IoSparkles } from 'react-icons/io5';

import { 
  FiAlertCircle,
  FiTrash2,
  FiXCircle,
  FiUpload,
  FiUser,
  FiX,
  FiBook,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiEdit,
  FiPieChart,
  FiBarChart2,
  FiTrendingUp,
  FiTarget,
  FiSave,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiChevronUp,
  FiChevronDown,
  FiSettings,
  FiDownload,
  FiEye,
  FiArrowLeft,
  FiArrowRight,
  FiInfo,
  FiFile,
  FiUsers,
  FiPercent,
  FiAward,
  FiTrendingUp as FiTrendingUpIcon,
  FiTrendingDown as FiTrendingDownIcon,
  FiHome,
  FiUserPlus,
  FiPercent as FiPercentIcon,
  FiGlobe,
  FiBookOpen,
  FiHeart,
  FiCpu,
  FiPlay,
  FiAward as FiAwardIcon,
  FiMessageCircle,
  FiImage,
  FiTrendingDown,
  FiActivity,
  FiDollarSign,
  FiCreditCard,
  FiShield,
  FiLock,
  FiUnlock,
  FiBell,
  FiPrinter,
  FiFileText,
  FiCheck,
  FiArchive,
  FiRepeat,
  FiMoreVertical,
  FiExternalLink,
  FiCopy,
  FiTag,
  FiCodesandbox,
  FiStar,
  FiBook as FiBookIcon,
  FiTarget as FiTargetIcon,
  FiPlus,
  FiCheckCircle,
  FiLayers, 
  FiDatabase,
  FiRefreshCw as FiRefreshCwIcon,
} from 'react-icons/fi';


import { IoSchool } from 'react-icons/io5';
import { IoDocumentText } from 'react-icons/io5';
import { IoPeopleCircle, IoNewspaper, IoClose, IoStatsChart } from 'react-icons/io5';

const GRADE_LEVELS = ['Grade 10', 'Grade 11', 'Grade 12', 'Form 3', 'Form 4'];
const GRADE_STAT_KEYS = {
  'Grade 10': 'grade10',
  'Grade 11': 'grade11',
  'Grade 12': 'grade12',
  'Form 3': 'form3',
  'Form 4': 'form4'
};
const GRADE_CHART_COLORS = {
  'Grade 10': '#3B82F6',
  'Grade 11': '#10B981',
  'Grade 12': '#8B5CF6',
  'Form 3': '#F59E0B',
  'Form 4': '#EF4444'
};
const STUDENT_TEMPLATE_HEADERS = ['Admission Number', 'Full Name', 'Grade/Class', 'Stream', 'Parent Email'];

const getGradeStatsTotal = (stats = {}) => GRADE_LEVELS.reduce(
  (sum, grade) => sum + (stats[GRADE_STAT_KEYS[grade]] || 0),
  0
);

const buildGradeDistribution = (stats = {}) => GRADE_LEVELS.reduce((acc, grade) => {
  acc[grade] = stats[GRADE_STAT_KEYS[grade]] || 0;
  return acc;
}, {});

const buildGradeChartData = (stats = {}) => GRADE_LEVELS.map((grade) => ({
  name: grade,
  value: stats[GRADE_STAT_KEYS[grade]] || 0,
  color: GRADE_CHART_COLORS[grade]
}));

const getStudentName = (student) => (
  student?.fullName ||
  [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(' ') ||
  'Unnamed Student'
);

// Helper function for form colors
// Add these functions right after the existing getFormColor function:

// Helper function for form colors
function getFormColor(form) {
  switch (form) {
    case 'Grade 10': return 'from-blue-500 to-blue-700';
    case 'Grade 11': return 'from-emerald-500 to-emerald-700';
    case 'Grade 12': return 'from-purple-500 to-purple-700';
    case 'Form 3': return 'from-amber-500 to-orange-600';
    case 'Form 4': return 'from-rose-500 to-red-700';
    default: return 'from-gray-400 to-gray-600';
  }
}

// Helper function for form badge colors (NEW - ADD THIS)
function getFormBadgeColor(form) {
  switch (form) {
    case 'Grade 10': return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
    case 'Grade 11': return 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white';
    case 'Grade 12': return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white';
    case 'Form 3': return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
    case 'Form 4': return 'bg-gradient-to-r from-rose-500 to-red-700 text-white';
    default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
  }
}

// Helper function for form text colors (NEW - ADD THIS)
function getFormTextColor(form) {
  switch (form) {
    case 'Grade 10': return 'text-blue-700';
    case 'Grade 11': return 'text-emerald-700';
    case 'Grade 12': return 'text-purple-700';
    case 'Form 3': return 'text-amber-700';
    case 'Form 4': return 'text-rose-700';
    default: return 'text-gray-700';
  }
}

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Custom Toaster with increased size
const CustomToaster = () => (
  <Toaster
    position="top-right"
    richColors
    expand={true}
    toastOptions={{
      style: {
        fontSize: '1.1rem',
        padding: '20px',
        margin: '10px',
        width: '140%',
        minHeight: '80px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
      },
      className: 'custom-toast'
    }}
  />
);

// Modern Loading Spinner

const Spinner = ({
  size = 20,
  color = "primary",
  variant = "indeterminate",
  value = 0,
  message = '',
  subtitle = 'Please wait while the records are prepared.'
}) => {
  if (message) {
    return (
      <div className="flex min-h-[280px] w-full items-center justify-center rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-xl shadow-blue-100/40 backdrop-blur">
        <div className="text-center">
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-purple-500/20 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-lg">
              <CircularProgress size={36} color={color} variant={variant} value={variant === "determinate" ? value : undefined} thickness={4.5} />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900">{message}</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">{subtitle}</p>
          <div className="mt-5 flex justify-center gap-1.5">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                style={{ animationDelay: `${dot * 0.12}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress
        size={size}
        color={color}
        variant={variant}
        value={variant === "determinate" ? value : undefined}
        thickness={4}
      />
    </Box>
  );
};


// Delete Confirmation Modal
function ModernDeleteModal({ 
  onClose, 
  onConfirm, 
  loading, 
  title = "Confirm Deletion",
  description = "This action cannot be undone",
  itemName = "",
  type = "student"
}) {
  const [confirmText, setConfirmText] = useState('')

  const getConfirmPhrase = () => {
    if (type === "batch") return "DELETE UPLOAD BATCH";
    if (type === "student") return "DELETE STUDENT";
    return "DELETE";
  }

  const handleConfirm = () => {
    const phrase = getConfirmPhrase();
    if (confirmText === phrase) {
      onConfirm()
    } else {
      sooner.error(`Please type "${phrase}" exactly to confirm deletion`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
              <FiAlertCircle className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-red-100 opacity-90 text-sm mt-1">{description}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
              <FiTrash2 className="text-red-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Delete {itemName ? `"${itemName}"` : `this ${type}`}?
            </h3>
            <p className="text-gray-600 text-sm">
              This will permanently delete the record and cannot be recovered.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">
              Type <span className="font-mono text-red-600 bg-red-50 px-3 py-1 rounded-lg text-xs border border-red-200">{getConfirmPhrase()}</span> to confirm:
            </label>
            <input 
              type="text" 
              value={confirmText} 
              onChange={(e) => setConfirmText(e.target.value)} 
              placeholder={`Type "${getConfirmPhrase()}" here`}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 text-base"
              autoFocus
            />
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-200">
            <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
              <FiAlertCircle className="text-red-600 text-sm" />
              What will happen:
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              {type === "batch" ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>All students from this upload batch will be deleted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>Upload record will be removed from history</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>Student record will be permanently deleted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>All associated data will be removed</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl transition-all duration-300 font-bold text-base disabled:opacity-50"
          >
            <FiXCircle className="text-base" /> Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={loading || confirmText !== getConfirmPhrase()}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-red-700 to-orange-600 text-white px-4 py-3 rounded-xl transition-all duration-300 font-bold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <CircularProgress size={14} className="text-white" />
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 className="text-base" /> Delete Forever
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// File Upload Component
function ModernFileUpload({ onFileSelect, file, onRemove, dragActive, onDrag }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const validExtensions = ['.csv', '.xlsx', '.xls', '.xlsm'];
    
    if (selectedFile) {
      const ext = selectedFile.name.toLowerCase();
      if (validExtensions.some(valid => ext.endsWith(valid))) {
        onFileSelect(selectedFile);
        sooner.success('File selected successfully');
      } else {
        sooner.error('Please upload a CSV or Excel file');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleDragEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      onDrag(true);
    } else if (e.type === 'dragleave') {
      if (e.currentTarget.contains(e.relatedTarget)) return;
      onDrag(false);
    }
  };

  return (
    <div
      className={`border-3 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
        dragActive 
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 ring-4 ring-blue-100' 
          : 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100'
      }`}
      onDragEnter={handleDragEvent}
      onDragLeave={handleDragEvent}
      onDragOver={handleDragEvent}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrag(false);
        const files = e.dataTransfer.files;
        if (files && files[0]) {
          handleFileChange({ target: { files } });
        }
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <FiUpload className={`mx-auto text-3xl mb-4 ${
        dragActive ? 'text-blue-600' : 'text-gray-400'
      }`} />
      <p className="text-gray-800 mb-2 font-bold text-lg">
        {dragActive ? '📁 Drop file here!' : file ? 'Click to replace file' : 'Drag & drop or click to upload'}
      </p>
      <p className="text-sm text-gray-600">
        CSV, Excel (.xlsx, .xls) • Max 10MB
      </p>
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".csv,.xlsx,.xls,.xlsm"
        onChange={handleFileChange}
        className="hidden" 
      />
    </div>
  );
}

// Student Detail Modal
// Student Detail Modal
function StudentDetailModal({ student, onClose, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = (id, name) => {
    // Close the detail modal first, then trigger the delete
    onDelete(id, name);
    setShowDeleteModal(false);
    onClose(); // Close the detail modal
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
  };

  if (!student) return null;

  return (
    <>
      <Modal open={true} onClose={onClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxWidth: '800px',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FiUser className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Student Details</h2>
                  <p className="text-blue-100 opacity-90">
                    Complete student information
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <FiX className="text-xl" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Profile Section */}
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <FiUser className="text-white text-3xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{getStudentName(student)}</h3>
                <p className="text-gray-600">Admission #{student.admissionNumber}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${getFormColor(student.form)}`}>
                    {student.form}
                  </span>
                  {student.stream && (
                    <span className="px-3 py-1 rounded-lg text-sm font-bold bg-purple-100 text-purple-700">
                      {student.stream}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    student.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {student.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academic Info */}
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiBook className="text-blue-600" />
                  Academic Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grade/Class</span>
                    <span className="font-semibold">{student.form}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stream</span>
                    <span className="font-semibold">{student.stream || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admission Date</span>
                    <span className="font-semibold">{formatDate(student.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiMail className="text-blue-600" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <p className="text-gray-600 mb-1">Parent Email</p>
                    <p className="font-semibold">{student.parentEmail || student.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

   
          </div>
        </Box>
      </Modal>

      {showDeleteModal && (
        <ModernDeleteModal
          onClose={handleDeleteClose}
          onConfirm={() => handleDeleteConfirm(student.id, getStudentName(student))}
          loading={false}
          type="student"
          itemName={getStudentName(student)}
        />
      )}
    </>
  );
}
// Student Edit Modal
function StudentEditModal({ student, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    fullName: getStudentName(student) === 'Unnamed Student' ? '' : getStudentName(student),
    admissionNumber: student?.admissionNumber || '',
    form: student?.form || 'Grade 10',
    stream: student?.stream || '',
    parentEmail: student?.parentEmail || student?.email || '',
    status: student?.status || 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(student.id, formData);
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '800px',
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <FiEdit className="text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Student</h2>
                <p className="text-blue-100 opacity-90">Update student information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Student Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admission Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.admissionNumber}
                    onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Academic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grade/Class *
                  </label>
                  <select
                    required
                    value={formData.form}
                    onChange={(e) => setFormData({...formData, form: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    {GRADE_LEVELS.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stream
                  </label>
                  <select
                    value={formData.stream}
                    onChange={(e) => setFormData({...formData, stream: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Stream</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="graduated">Graduated</option>
                    <option value="transferred">Transferred</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Parent Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all"
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} className="text-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}

// Student Statistics Card
function StudentStatisticsCard({ title, value, icon: Icon, color, trend = 0, prefix = '', suffix = '' }) {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      return prefix + val.toLocaleString() + suffix;
    }
    return prefix + val + suffix;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
          <Icon className="text-white text-2xl" />
        </div>
      </div>
      <h4 className="text-3xl font-bold text-gray-900 mb-2">{formatValue(value)}</h4>
      <p className="text-gray-600 text-sm font-semibold">{title}</p>
      
      {/* Performance bar */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Performance</span>
          <span className={`font-bold ${
            trend > 0 ? 'text-green-600' : 
            trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? 'Growing' : trend < 0 ? 'Declining' : 'Stable'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              trend > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              trend < 0 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}
            style={{ width: `${Math.min(Math.abs(trend) * 3, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Students Chart Component
function StudentsChart({ 
  data, 
  type = 'pie', 
  title, 
  colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', 
    '#6366F1', '#EC4899', '#14B8A6', '#F97316', '#8B5CF6'
  ],
  height = 400
}) {
  const chartColors = colors.slice(0, data.length);

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={5}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value, name, props) => {
                  const total = data.reduce((sum, item) => sum + item.value, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return [`${value} students (${percentage}%)`, 'Count'];
                }}
                contentStyle={{
                  borderRadius: '12px',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span style={{ color: '#374151', fontWeight: 600 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart 
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB" 
                vertical={false}
              />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                tick={{ fill: '#4B5563', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
              />
              <YAxis 
                stroke="#6B7280"
                tick={{ fill: '#4B5563', fontSize: 12 }}
                axisLine={{ stroke: '#D1D5DB' }}
                label={{ 
                  value: 'Students', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -10,
                  style: { fill: '#6B7280', fontSize: 12 }
                }}
              />
              <RechartsTooltip 
                formatter={(value) => [`${value} students`, 'Count']}
                labelFormatter={(label) => `Category: ${label}`}
                contentStyle={{
                  borderRadius: '12px',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255,255, 0.95)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                formatter={(value) => <span style={{ color: '#374151', fontWeight: 600 }}>{value}</span>}
              />
              <Bar 
                dataKey="value" 
                name={title.includes('Gender') ? "Students" : "Count"} 
                radius={[8, 8, 0, 0]}
                fill={chartColors[0]}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value) => [value, 'Students']}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-60 h-60 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full blur-3xl opacity-60" />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-2xl ring-4 ring-blue-100">
              {type === 'pie' && <FiPieChart className="text-white text-xl" />}
              {type === 'bar' && <FiBarChart2 className="text-white text-xl" />}
              {type === 'radial' && <FiTrendingUp className="text-white text-xl" />}
              {type === 'radar' && <FiTarget className="text-white text-xl" />}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h3>
              <p className="text-gray-600 text-sm">Visual distribution analysis</p>
            </div>
          </div>
        </div>

        <div className="h-96">
          {data && data.length > 0 ? (
            renderChart()
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FiBarChart2 className="text-gray-300 text-6xl mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No data available for chart</p>
              </div>
            </div>
          )}
        </div>

        {data && data.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div className="text-2xl font-bold text-blue-700">
                  {data.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
                </div>
                <div className="text-sm font-semibold text-blue-900">Total Students</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                <div className="text-2xl font-bold text-emerald-700">
                  {Math.max(...data.map(d => d.value)).toLocaleString()}
                </div>
                <div className="text-sm font-semibold text-emerald-900">Highest</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                <div className="text-2xl font-bold text-amber-700">
                  {Math.min(...data.map(d => d.value)).toLocaleString()}
                </div>
                <div className="text-sm font-semibold text-amber-900">Lowest</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                <div className="text-2xl font-bold text-purple-700">
                  {data.length}
                </div>
                <div className="text-sm font-semibold text-purple-900">Categories</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Statistics Summary Card Component
function StatisticsSummaryCard({ stats, demographics, onRefresh }) {
  const [timeAgo, setTimeAgo] = useState('');
  
  useEffect(() => {
    if (stats.globalStats?.updatedAt) {
      const updateTime = new Date(stats.globalStats.updatedAt);
      const now = new Date();
      const diffMs = now - updateTime;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) {
        setTimeAgo('Just now');
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins} minutes ago`);
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        setTimeAgo(`${hours} hours ago`);
      } else {
        const days = Math.floor(diffMins / 1440);
        setTimeAgo(`${days} days ago`);
      }
    }
  }, [stats.globalStats?.updatedAt]);
  
  const calculatePercentage = (value, total) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };
  
  const formDistribution = demographics.formDistribution || [];
  const totalStudents = stats.totalStudents || 0;
  
  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-300 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl">
            <FiBarChart2 className="text-blue-700 text-2xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Statistics Overview</h3>
            <p className="text-gray-600 text-sm">
              Real-time student analytics {timeAgo && `• Updated ${timeAgo}`}
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-bold flex items-center gap-3 text-sm hover:shadow-xl transition-all duration-300"
        >
          <FiRefreshCw className="text-sm" />
          Refresh Stats
        </button>
      </div>
      
      {/* Total Students Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-700 font-bold text-sm mb-2">TOTAL STUDENTS</p>
            <h4 className="text-4xl font-bold text-gray-900">
              {totalStudents.toLocaleString()}
            </h4>
          </div>
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg">
            <FiUsers className="text-blue-600 text-3xl" />
          </div>
        </div>
      </div>
      
      {/* Grade Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {formDistribution.map((form, index) => (
          <div key={index} className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-gray-900">{form.name}</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form.color }} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {form.value.toLocaleString()}
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: totalStudents > 0 ? `${(form.value / totalStudents) * 100}%` : '0%',
                  backgroundColor: form.color
                }}
              />
            </div>
            <div className="text-right text-sm text-gray-600 mt-1">
              {calculatePercentage(form.value, totalStudents)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl hover:shadow-lg transition-all duration-300">
          <div className="text-2xl font-bold text-emerald-700">
            {(demographics.statusDistribution?.find(s => s.name === 'Active')?.value || 0).toLocaleString()}
          </div>
          <div className="text-sm font-semibold text-emerald-900">Active Students</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition-all duration-300">
          <div className="text-2xl font-bold text-purple-700">
            {Object.keys(stats.streamStats || {}).length}
          </div>
          <div className="text-sm font-semibold text-purple-900">Streams</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl hover:shadow-lg transition-all duration-300">
          <div className="text-2xl font-bold text-amber-700">
            {GRADE_LEVELS.length}
          </div>
          <div className="text-sm font-semibold text-amber-900">Grades</div>
        </div>
      </div>
      
      {/* Validation Status */}
      {stats.globalStats && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-bold">Data Consistency Check</span>
            <span className={`px-3 py-1 rounded-lg font-bold text-sm ${
              stats.totalStudents === getGradeStatsTotal(stats.globalStats)
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {stats.totalStudents === getGradeStatsTotal(stats.globalStats)
                ? '✓ Consistent'
                : '⚠ Inconsistent'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Filter Component
function EnhancedFilterPanel({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  showAdvanced = false,
  onToggleAdvanced 
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters({ ...localFilters, [key]: value });
    onFilterChange(key, value);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      form: '',
      stream: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-xl mb-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <FiFilter className="text-blue-600" />
          Advanced Filters
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAdvanced}
            className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors"
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Search Students
          </label>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Name, admission, email..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Grade/Class
          </label>
          <select
            value={localFilters.form}
            onChange={(e) => handleFilterChange('form', e.target.value)}
            className="w-full px-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base"
          >
            <option value="">All Grades</option>
            {GRADE_LEVELS.map(form => (
              <option key={form} value={form}>{form}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Stream
          </label>
          <select
            value={localFilters.stream}
            onChange={(e) => handleFilterChange('stream', e.target.value)}
            className="w-full px-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base"
          >
            <option value="">All Streams</option>
            {['A', 'B', 'C', 'D', 'E', 'East', 'West', 'North', 'South', 'Science', 'Arts', 'Commercial'].map(stream => (
              <option key={stream} value={stream}>{stream}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Status
          </label>
          <select
            value={localFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base"
          >
            <option value="">All Status</option>
            {['active', 'inactive', 'graduated', 'transferred'].map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base"
            >
              <option value="createdAt">Date Created</option>
              <option value="admissionNumber">Admission Number</option>
              <option value="fullName">Full Name</option>
              <option value="form">Grade/Class</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// Upload Strategy Modal Component
function UploadStrategyModal({ open, onClose, onConfirm, loading }) {
  const [uploadType, setUploadType] = useState('new');
  const [selectedForms, setSelectedForms] = useState([]);
  const [targetForm, setTargetForm] = useState('');

  const handleFormToggle = (form) => {
    if (selectedForms.includes(form)) {
      setSelectedForms(selectedForms.filter(f => f !== form));
    } else {
      setSelectedForms([...selectedForms, form]);
    }
  };

  const handleConfirm = () => {
    if (uploadType === 'new' && selectedForms.length === 0) {
      sooner.error('Please select at least one grade for new upload');
      return;
    }
    
    if (uploadType === 'update' && !targetForm) {
      sooner.error('Please select a target grade for update');
      return;
    }
    
    onConfirm({
      uploadType,
      selectedForms,
      targetForm
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: {
            xs: '98vw',
            sm: '95vw',
            md: '650px',
            lg: '650px'
          },
          maxWidth: '650px',
          maxHeight: {
            xs: '85vh',
            sm: '90vh',
          },
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <FiUpload className="text-lg sm:text-xl" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Upload Strategy</h2>
                <p className="text-blue-100 opacity-90 text-sm sm:text-base">
                  Choose how you want to upload students
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <FiX className="text-lg sm:text-xl" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Upload Type Selection */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Select Upload Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div
                  onClick={() => setUploadType('new')}
                  className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    uploadType === 'new'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${uploadType === 'new' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <FiPlus className={`text-sm sm:text-lg ${uploadType === 'new' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">New Upload</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Add new students to selected grades</p>
                    </div>
                  </div>
                  {uploadType === 'new' && (
                    <div className="mt-2 text-xs sm:text-sm text-blue-700">
                      <FiCheckCircle className="inline mr-1" />
                      Prevents duplicates by admission number
                    </div>
                  )}
                </div>

                <div
                  onClick={() => setUploadType('update')}
                  className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    uploadType === 'update'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${uploadType === 'update' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <FiDatabase className={`text-sm sm:text-lg ${uploadType === 'update' ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">Update Upload</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Update existing grade with new data</p>
                    </div>
                  </div>
                  {uploadType === 'update' && (
                    <div className="mt-2 text-xs sm:text-sm text-blue-700">
                      <FiCheckCircle className="inline mr-1" />
                      Replaces entire grade batch safely
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Selection */}
            {uploadType === 'new' && (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  Select Grades to Upload <span className="text-xs sm:text-sm text-gray-500">(Choose one or more)</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {GRADE_LEVELS.map((form) => (
                    <div
                      key={form}
                      onClick={() => handleFormToggle(form)}
                      className={`p-2 sm:p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedForms.includes(form)
                          ? `border-blue-500 bg-gradient-to-r ${getFormColor(form)} text-white shadow-lg`
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm sm:text-base">{form}</span>
                        {selectedForms.includes(form) && (
                          <FiCheckCircle className="text-white text-sm sm:text-base" />
                        )}
                      </div>
                      <div className={`text-xs mt-0.5 sm:mt-1 ${selectedForms.includes(form) ? 'text-blue-100' : 'text-gray-500'}`}>
                        Students will be added to {form}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedForms.length > 0 && (
                  <div className="mt-2 text-xs sm:text-sm text-gray-600">
                    <FiInfo className="inline mr-1" />
                    Only students in selected grades will be processed
                  </div>
                )}
              </div>
            )}

            {uploadType === 'update' && (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Select Grade to Update</h3>
                <div className="space-y-2 sm:space-y-3">
                  {GRADE_LEVELS.map((form) => (
                    <div
                      key={form}
                      onClick={() => setTargetForm(form)}
                      className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                        targetForm === form
                          ? `border-blue-500 bg-gradient-to-r ${getFormColor(form)} text-white shadow-lg`
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`p-1.5 sm:p-2 rounded-lg ${targetForm === form ? 'bg-white/20' : 'bg-gray-100'}`}>
                            <IoSchool className={`text-sm sm:text-base ${targetForm === form ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm sm:text-base">{form}</h4>
                            <p className={`text-xs sm:text-sm ${targetForm === form ? 'text-blue-100' : 'text-gray-500'}`}>
                              Replace all students in {form}
                            </p>
                          </div>
                        </div>
                        {targetForm === form && <FiCheckCircle className="text-white text-sm sm:text-base" />}
                      </div>
                    </div>
                  ))}
                </div>
                {targetForm && (
                  <div className="mt-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <FiInfo className="text-blue-600 mt-0.5 text-sm sm:text-base" />
                      <div>
                        <p className="text-xs sm:text-sm text-blue-800 font-bold">Update Strategy:</p>
                        <ul className="text-xs text-blue-700 mt-1 space-y-0.5 sm:space-y-1">
                          <li>• Matches students by admission number</li>
                          <li>• Updates existing records</li>
                          <li>• Creates new students if not exists</li>
                          <li>• Marks missing students as inactive</li>
                          <li>• Preserves relational integrity</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom Buttons */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || (uploadType === 'new' && selectedForms.length === 0) || (uploadType === 'update' && !targetForm)}
              className="flex-1 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg transition-all text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <CircularProgress size={16} className="text-white" />
                  <span className="text-sm sm:text-base">Processing...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="text-sm sm:text-base" />
                  <span className="text-sm sm:text-base">Continue to File Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

// Duplicate Validation Modal
function DuplicateValidationModal({ open, onClose, duplicates, onProceed, loading, uploadType, targetForm }) {
  const [action, setAction] = useState('skip');

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: {
            xs: '98vw',
            sm: '95vw',
            md: '850px',
            lg: '850px'
          },
          maxWidth: '850px',
          maxHeight: {
            xs: '85vh',
            sm: '90vh',
          },
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <FiAlertCircle className="text-lg sm:text-xl" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Duplicate Detection</h2>
                <p className="text-amber-100 opacity-90 text-sm sm:text-base">
                  Found {duplicates.length} duplicate admission numbers
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <FiX className="text-lg sm:text-xl" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-500 rounded-full"></div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {uploadType === 'update' 
                    ? `Updating ${targetForm}: ${duplicates.length} existing students will be updated`
                    : `${duplicates.length} admission numbers already exist in the database`
                  }
                </h3>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-amber-800 text-xs sm:text-sm">
                  <strong>Note:</strong> Admission numbers must be unique. The system uses admission number as the primary identifier.
                </p>
              </div>
            </div>

            {/* Duplicate List */}
            <div className="mb-4 sm:mb-6">
              <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Duplicate Admission Numbers:</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-bold text-gray-700">Row #</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-bold text-gray-700">Admission</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-bold text-gray-700">Name</th>
                        <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-bold text-gray-700">Grade/Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {duplicates.slice(0, 50).map((dup, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600">{dup.row}</td>
                          <td className="px-3 sm:px-4 py-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                              {dup.admissionNumber}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">{dup.name}</td>
                          <td className="px-3 sm:px-4 py-2">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold bg-gradient-to-r ${getFormColor(dup.form)} text-white`}>
                              {dup.form}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {duplicates.length > 50 && (
                  <div className="px-4 py-2 text-xs sm:text-sm text-gray-500 text-center border-t border-gray-200 bg-gray-50">
                    ... and {duplicates.length - 50} more duplicates
                  </div>
                )}
              </div>
            </div>

            {/* Action Selection */}
            {uploadType === 'new' && (
              <div className="mb-4 sm:mb-6">
                <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">How should we handle duplicates?</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div
                    onClick={() => setAction('skip')}
                    className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      action === 'skip'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 rounded-lg ${action === 'skip' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <FiCheckCircle className={`text-sm sm:text-base ${action === 'skip' ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">Skip Duplicates</h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Keep existing records, skip duplicates in upload file
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setAction('replace')}
                    className={`p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      action === 'replace'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 rounded-lg ${action === 'replace' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <FiDatabase className={`text-sm sm:text-base ${action === 'replace' ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">Replace Existing</h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Update existing records with new data from upload file
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <h4 className="font-bold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">Summary:</h4>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-0.5 sm:space-y-1">
                {uploadType === 'new' ? (
                  <>
                    <li className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                      <span>Total students in file: {duplicates.length + (duplicates.length * 2)}</span>
                    </li>
                    <li className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></div>
                      <span>Duplicate admission numbers: {duplicates.length}</span>
                    </li>
                    <li className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                      <span>New students to add: {duplicates.length}</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                      <span>Updating grade: {targetForm}</span>
                    </li>
                    <li className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></div>
                      <span>Students to update: {duplicates.length}</span>
                    </li>
                    <li className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                      <span>Existing students not in file will be marked inactive</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Buttons */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={() => onProceed(action)}
              disabled={loading}
              className="flex-1 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <CircularProgress size={16} className="text-white" />
                  <span className="text-sm sm:text-base">Processing...</span>
                </>
              ) : uploadType === 'update' ? (
                <>
                  <FiCheckCircle className="text-sm sm:text-base" />
                  <span className="text-sm sm:text-base">Update Grade</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="text-sm sm:text-base" />
                  <span className="text-sm sm:text-base">{action === 'skip' ? 'Skip Duplicates' : 'Replace Existing'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

// Main Component
export default function ModernStudentBulkUpload() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [view, setView] = useState('upload');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: '', name: '' });
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [uploadStrategy, setUploadStrategy] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [validationLoading, setValidationLoading] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null); // <-- ADD THIS

  
  const [filters, setFilters] = useState({
    search: '',
    form: '',
    stream: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [stats, setStats] = useState({
    totalStudents: 0,
    formStats: {},
    streamStats: {},
    globalStats: { totalStudents: 0, grade10: 0, grade11: 0, grade12: 0, form3: 0, form4: 0 },
    validation: { isValid: true }
  });

  const [demographics, setDemographics] = useState({
    formDistribution: [],
    streamDistribution: [],
    statusDistribution: []
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });

  const fileInputRef = useRef(null);

  // Helper function to process API responses
  const processApiResponse = (data) => {
    if (data.data && data.data.stats) {
      return data.data.stats;
    } else if (data.stats) {
      return data.stats;
    } else if (data.data) {
      return data.data;
    } else {
      return data;
    }
  };



// Helper function for protected operations only
const getAuthTokensForProtectedOps = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    throw new Error('Cannot access localStorage on server side');
  }
  
  const adminToken = localStorage.getItem('admin_token');
  const deviceToken = localStorage.getItem('device_token');
  
  if (!adminToken || !deviceToken) {
    throw new Error('Authentication required for this action. Please login.');
  }
  
  return { adminToken, deviceToken };
};

// Helper function for protected operations
const getAuthHeaders = (isProtected = false) => {
  if (isProtected) {
    try {
      const { adminToken, deviceToken } = getAuthTokensForProtectedOps();
      return {
        'Authorization': `Bearer ${adminToken}`,
        'x-device-token': deviceToken,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  }
  return {
    'Content-Type': 'application/json'
  };
};

  // Enhanced loadStats function
  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/studentupload?action=stats');
      const result = await res.json();
      
      if (result.success) {
        const apiStats = processApiResponse(result) || {
          totalStudents: 0,
          grade10: 0,
          grade11: 0,
          grade12: 0,
          form3: 0,
          form4: 0,
          updatedAt: new Date()
        };
        
        const studentsRes = await fetch('/api/studentupload?limit=1000');
        const studentsData = await studentsRes.json();
        
        if (studentsData.success) {
          const allStudents = studentsData.data?.students || studentsData.students || [];
          const totalStudents = apiStats.totalStudents || allStudents.length;
          
          const streamDistribution = {};
          const statusDistribution = {};
          
          allStudents.forEach(student => {
            const stream = student.stream || 'Unassigned';
            streamDistribution[stream] = (streamDistribution[stream] || 0) + 1;
            
            const status = student.status || 'active';
            statusDistribution[status] = (statusDistribution[status] || 0) + 1;
          });
          
          const formDistribution = buildGradeDistribution(apiStats);
          const formChartData = buildGradeChartData(apiStats);
          
          const streamChartData = Object.entries(streamDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, value], index) => ({
              name: name.length > 10 ? name.substring(0, 10) + '...' : name,
              fullName: name,
              value,
              color: [
                '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444',
                '#6366F1', '#EC4899', '#14B8A6', '#F97316', '#8B5CF6'
              ][index % 10]
            }));
          
          const statusChartData = [
            { name: 'Active', value: statusDistribution.active || 0, color: '#10B981' },
            { name: 'Inactive', value: statusDistribution.inactive || 0, color: '#EF4444' },
            { name: 'Graduated', value: statusDistribution.graduated || 0, color: '#8B5CF6' },
            { name: 'Transferred', value: statusDistribution.transferred || 0, color: '#F59E0B' }
          ];
          
          setStats({
            totalStudents: totalStudents,
            globalStats: apiStats,
            formStats: formDistribution,
            streamStats: streamDistribution,
            statusStats: statusDistribution,
            validation: {
              isValid: totalStudents === getGradeStatsTotal(apiStats)
            }
          });
          
          setDemographics({
            formDistribution: formChartData,
            streamDistribution: streamChartData,
            statusDistribution: statusChartData
          });
          
        } else {
          sooner.error('Failed to load student data for demographics');
        }
      } else {
        sooner.error('Failed to load statistics');
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      sooner.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };
const handleAuthError = (error) => {
  console.error('Authentication error:', error);
  sooner.error('Session expired. Please login again.');
  
  // Optional: Clear tokens and redirect to login
  localStorage.removeItem('admin_token');
  localStorage.removeItem('device_token');
  
  // Optional: Redirect to login page or show login modal
  // window.location.href = '/login';
  
  // Optional: Show login modal instead of redirect
  // setShowLoginModal(true);
};

  const refreshStatistics = async () => {
    try {
      const res = await fetch('/api/studentupload?action=stats');
      const result = await res.json();
      
      if (result.success) {
        const apiStats = processApiResponse(result);
        
        if (apiStats) {
          setStats(prev => ({
            ...prev,
            globalStats: apiStats,
            totalStudents: apiStats.totalStudents || prev.totalStudents
          }));
          
          const formChartData = buildGradeChartData(apiStats);
          
          setDemographics(prev => ({
            ...prev,
            formDistribution: formChartData
          }));
          
          sooner.success('Statistics updated successfully!');
        }
      }
    } catch (error) {
      console.error('Failed to refresh statistics:', error);
      sooner.error('Failed to refresh statistics');
    }
  };

  const loadStudents = async (page = 1, nextFilters = filters) => {
    setLoading(true);
    try {
      let url = `/api/studentupload?page=${page}&limit=${pagination.limit}&includeStats=false`;
      
      if (nextFilters.search?.trim()) url += `&search=${encodeURIComponent(nextFilters.search.trim())}`;
      if (nextFilters.form) url += `&form=${encodeURIComponent(nextFilters.form)}`;
      if (nextFilters.stream) url += `&stream=${encodeURIComponent(nextFilters.stream)}`;
      if (nextFilters.status) url += `&status=${encodeURIComponent(nextFilters.status)}`;
      if (nextFilters.sortBy) url += `&sortBy=${encodeURIComponent(nextFilters.sortBy)}`;
      if (nextFilters.sortOrder) url += `&sortOrder=${encodeURIComponent(nextFilters.sortOrder)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to load students');
      
      if (data.success) {
        setStudents(data.data?.students || data.students || []);
        setPagination(data.data?.pagination || data.pagination || {
          page: page,
          limit: pagination.limit,
          total: 0,
          pages: 1
        });
      } else {
        sooner.error(data.message || 'Failed to load students');
      }
    } catch (error) {
      console.error('Failed to load students:', error);
      sooner.error(error.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

const loadUploadHistory = async (page = 1) => {
  setHistoryLoading(true);
  try {
    // Add status=completed to the API call
    const res = await fetch(`/api/studentupload?action=uploads&page=${page}&limit=30`);
    const data = await res.json();
    if (data.success) {
      setUploadHistory(data.uploads || []);
    } else {
      sooner.error('Failed to load upload history');
    }
  } catch (error) {
    console.error('Failed to load history:', error);
    sooner.error('Failed to load upload history');
  } finally {
    setHistoryLoading(false);
  }
};

  // Auto-refresh for demographics view
  useEffect(() => {
    let intervalId;
    
    if (view === 'demographics') {
      intervalId = setInterval(() => {
        refreshStatistics();
      }, 30000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [view]);

  // Initial load
  useEffect(() => {
    loadStats();
    loadStudents();
    loadUploadHistory();
  }, []);

  useEffect(() => {
    if (view !== 'students') return;

    const timeoutId = setTimeout(() => {
      loadStudents(1, filters);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [filters.search, view]);

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);

    if (key !== 'search') {
      loadStudents(1, nextFilters);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      form: '',
      stream: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    loadStudents(1, clearedFilters);
  };

  const handleSort = (field) => {
    const newSortOrder = filters.sortBy === field && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    const nextFilters = {
      ...filters,
      sortBy: field,
      sortOrder: newSortOrder
    };
    setFilters(nextFilters);
    loadStudents(pagination.page, nextFilters);
  };

  const handleDrag = useCallback((active) => {
    setDragActive(active);
  }, []);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
  };

const checkDuplicates = async () => {
  if (!file || !uploadStrategy) {
    sooner.error('Please select a file and upload strategy first');
    return;
  }

  setValidationLoading(true);
  try {
    // GET auth tokens for protected operation
    let authHeaders = {};
    try {
      const tokens = getAuthTokensForProtectedOps();
      authHeaders = {
        'Authorization': `Bearer ${tokens.adminToken}`,
        'x-device-token': tokens.deviceToken
      };
    } catch (authError) {
      sooner.error(authError.message);
      setValidationLoading(false);
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('checkDuplicates', 'true');
    
    if (uploadStrategy.uploadType === 'new') {
      formData.append('uploadType', 'new');
      formData.append('forms', JSON.stringify(uploadStrategy.selectedForms));
    } else {
      formData.append('uploadType', 'update');
      formData.append('targetForm', uploadStrategy.targetForm);
    }

    const response = await fetch('/api/studentupload', {
      method: 'POST',
      headers: authHeaders,
      body: formData
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication failed. Please login again.');
    }

    const data = await response.json();
    
    if (data.success) {
      if (data.duplicates && data.duplicates.length > 0) {
        setDuplicates(data.duplicates);
        setShowValidationModal(true);
      } else {
        // No duplicates, proceed with upload
        proceedWithUpload('skip');
      }
    } else {
      sooner.error(data.error || 'Failed to check for duplicates');
    }
  } catch (error) {
    console.error('Validation error:', error);
    
    if (error.message.includes('Authentication') || error.message.includes('login')) {
      sooner.error('Authentication failed. Please login again to continue.');
    } else {
      sooner.error('Failed to validate file');
    }
  } finally {
    setValidationLoading(false);
  }
};

const proceedWithUpload = async (duplicateAction = 'skip') => {
  setUploading(true);
  setShowValidationModal(false);
  
  // GET auth tokens for protected upload operation
  let authHeaders = {};
  try {
    const tokens = getAuthTokensForProtectedOps();
    authHeaders = {
      'Authorization': `Bearer ${tokens.adminToken}`,
      'x-device-token': tokens.deviceToken
    };
  } catch (authError) {
    sooner.error(authError.message);
    setUploading(false);
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadType', uploadStrategy.uploadType);
  
  if (uploadStrategy.uploadType === 'new') {
    formData.append('forms', JSON.stringify(uploadStrategy.selectedForms));
    formData.append('duplicateAction', duplicateAction);
  } else {
    formData.append('targetForm', uploadStrategy.targetForm);
  }

  try {
    const response = await fetch('/api/studentupload', {
      method: 'POST',
      headers: authHeaders,
      body: formData
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication failed. Please login again.');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    
    setResult(data);
    
    if (data.success) {
      let successMessage = '';
      if (uploadStrategy.uploadType === 'new') {
        successMessage = `✅ New upload successful! ${data.processingStats?.validRows || 0} students processed.`;
      } else {
        successMessage = `✅ Update successful! ${uploadStrategy.targetForm} updated: ${data.processingStats?.updatedRows || 0} updated, ${data.processingStats?.createdRows || 0} created.`;
      }
      
      sooner.success(successMessage);
      
      if (data.errors && data.errors.length > 0) {
        data.errors.slice(0, 3).forEach(error => {
          sooner.error(error, { duration: 5000 });
        });
        if (data.errors.length > 3) {
          sooner.error(`... and ${data.errors.length - 3} more errors`, { duration: 5000 });
        }
      }
      
      await Promise.all([loadStudents(1), loadUploadHistory(1), loadStats()]);
      setFile(null);
      setUploadStrategy(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      sooner.error(data.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle specific authentication errors
    if (error.message.includes('Authentication') || error.message.includes('login')) {
      sooner.error('Authentication failed. Please login again to continue.');
      // Optionally redirect to login or show login modal
    } else {
      sooner.error(error.message || 'Upload failed. Please try again.');
    }
  } finally {
    setUploading(false);
  }
};


  const handleDeleteBatch = async (batchId, batchName) => {
    setDeleteTarget({ type: 'batch', id: batchId, name: batchName });
    setShowDeleteModal(true);
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    setDeleteTarget({ type: 'student', id: studentId, name: studentName });
    setShowDeleteModal(true);
  };

const confirmDelete = async () => {
  try {
    // GET auth headers for protected operation
    const authHeaders = getAuthHeaders(true);
    
    let url;
    
    if (deleteTarget.type === 'batch') {
      url = `/api/studentupload?batchId=${deleteTarget.id}`;
    } else {
      // For student deletion, use the dynamic route with the student ID
      url = `/api/studentupload/${deleteTarget.id}`;
    }

    const res = await fetch(url, { 
      method: 'DELETE',
      headers: {
        ...authHeaders
      }
    });
    
    if (res.status === 401 || res.status === 403) {
      throw new Error('Authentication failed');
    }
    
    const data = await res.json();
    
    if (data.success) {
      sooner.success(data.message || 'Deleted successfully');
      await Promise.all([loadStudents(pagination.page), loadUploadHistory(1), loadStats()]);
      if (deleteTarget.type === 'student') {
        setSelectedStudent(null);
      }
    } else {
      sooner.error(data.message || 'Failed to delete');
    }
  } catch (error) {
    console.error('Delete failed:', error);
    if (error.message.includes('Authentication')) {
      handleAuthError(error);
    } else {
      sooner.error('Failed to delete');
    }
  } finally {
    setShowDeleteModal(false);
    setDeleteTarget({ type: '', id: '', name: '' });
  }
};

const updateStudent = async (studentId, studentData) => {
  setLoading(true);
  try {
    // GET auth headers for protected operation
    const authHeaders = getAuthHeaders(true);
    
    const res = await fetch(`/api/studentupload`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...authHeaders
      },
      body: JSON.stringify({ id: studentId, ...studentData })
    });
    
    if (res.status === 401 || res.status === 403) {
      throw new Error('Authentication failed');
    }
    
    const data = await res.json();
    
    if (data.success) {
      sooner.success('Student updated successfully');
      await loadStudents(pagination.page);
      setEditingStudent(null);
    } else {
      sooner.error(data.message || 'Failed to update student');
    }
  } catch (error) {
    console.error('Update failed:', error);
    if (error.message.includes('Authentication')) {
      handleAuthError(error);
    } else {
      sooner.error('Failed to update student');
    }
  } finally {
    setLoading(false);
  }
};

 const downloadCSVTemplate = () => {
  const rows = [
    STUDENT_TEMPLATE_HEADERS,
    ['ADM001', 'Jane Wanza Mutua', 'Grade 10', 'A', 'parent@example.com']
  ];
  const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'senior_school_students_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadExcelTemplate = () => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    STUDENT_TEMPLATE_HEADERS,
    ['ADM001', 'Jane Wanza Mutua', 'Grade 10', 'A', 'parent@example.com']
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  XLSX.writeFile(workbook, 'senior_school_students_template.xlsx');
};


  const exportStudentsToCSV = () => {
    if (students.length === 0) {
      sooner.error('No students to export');
      return;
    }

    const headers = STUDENT_TEMPLATE_HEADERS;
    const data = students.map(student => (
      [
        student.admissionNumber,
        getStudentName(student),
        student.form,
        student.stream || '',
        student.parentEmail || student.email || ''
      ]
    ));

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `students_export_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sooner.success(`Exported ${students.length} students to CSV`);
  };

  const exportStudentsToExcel = () => {
    if (!students || students.length === 0) {
      sooner.error('No students to export');
      return;
    }

    const worksheetData = [
      STUDENT_TEMPLATE_HEADERS,
      ...students.map(student => (
        [
          student.admissionNumber,
          getStudentName(student),
          student.form,
          student.stream || '',
          student.parentEmail || student.email || ''
        ]
      ))
    ];

    try {
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');
      XLSX.writeFile(wb, `students_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      sooner.success(`Exported ${students.length} students to Excel`);
    } catch (err) {
      console.error('Excel export failed', err);
      sooner.error('Failed to export to Excel');
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      loadStudents(1, filters);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      loadStudents(newPage);
    }
  };

  // Handle upload strategy confirmation
  const handleStrategyConfirm = (strategy) => {
    setUploadStrategy(strategy);
    setShowStrategyModal(false);
    sooner.success(`Strategy set: ${strategy.uploadType === 'new' ? 'New Upload' : 'Update Upload'} ${strategy.uploadType === 'new' ? `for ${strategy.selectedForms.join(', ')}` : `for ${strategy.targetForm}`}`);
  };

  // Handle file upload with strategy
  const handleUploadWithStrategy = () => {
    if (!uploadStrategy) {
      setShowStrategyModal(true);
      return;
    }
    
    if (!file) {
      sooner.error('Please select a file first');
      return;
    }
    
    // Check for duplicates before upload
    checkDuplicates();
  };

  const getFormBgColor = (form) => {
  const themes = {
    'Grade 10': 'bg-gradient-to-b from-emerald-500 to-green-500',
    'Grade 11': 'bg-gradient-to-b from-blue-500 to-indigo-500',
    'Grade 12': 'bg-gradient-to-b from-indigo-500 to-purple-500',
    'Form 3': 'bg-gradient-to-b from-amber-500 to-orange-500',
    'Form 4': 'bg-gradient-to-b from-rose-500 to-red-600',
  };
  return themes[form] || 'bg-gradient-to-b from-slate-500 to-gray-500';
};


  return (
    <div className="p-6 space-y-6">
      <CustomToaster />

      {/* Welcome Section */}
      <div className="relative bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 rounded-2xl p-8 text-white overflow-hidden shadow-2xl shadow-slate-900/20 border border-white/10">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/10 rounded-2xl border border-white/10">
              <IoSparkles className="text-2xl text-yellow-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Student Bulk Upload & Analytics</h1>
              <p className="text-slate-200 text-lg mt-2 max-w-2xl">
                Comprehensive student management with structured upload strategy, 
                duplicate prevention, and real-time analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => {
                setLoading(true);
                loadStats();
              }}
              disabled={loading}
              className="bg-white text-slate-950 px-6 py-3 rounded-xl font-bold text-base flex items-center gap-2 shadow-lg disabled:opacity-60 hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <CircularProgress size={16} color="inherit" thickness={6} />
              ) : (
                <FiRefreshCwIcon className="text-base" />
              )}
              {loading ? 'Syncing...' : 'Refresh Stats'}
            </button>

            <button
              onClick={exportStudentsToCSV}
              disabled={students.length === 0 || loading}
              className="text-white/80 hover:text-white px-6 py-3 rounded-xl font-bold text-base border border-white/20 flex items-center gap-2 disabled:opacity-50 hover:bg-white/10 transition-all duration-300"
            >
              <FiDownload className="text-base" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-3 border-2 border-gray-200 shadow-2xl">
        <div className="flex flex-wrap items-center gap-2 p-2">
          <button
            onClick={() => setView('upload')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 text-base transition-all duration-300 ${
              view === 'upload'
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <FiUpload className="text-sm" />
            Bulk Upload
          </button>
          <button
            onClick={() => {
              setView('students');
              loadStudents(1);
            }}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 text-base transition-all duration-300 ${
              view === 'students'
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <FiUsers className="text-sm" />
            Students ({stats.totalStudents || 0})
          </button>
          <button
            onClick={() => {
              setView('demographics');
              loadStats();
            }}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 text-base transition-all duration-300 ${
              view === 'demographics'
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <FiPieChart className="text-sm" />
            Demographics
          </button>
          <button
            onClick={() => {
              setView('history');
              loadUploadHistory(1);
            }}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 text-base transition-all duration-300 ${
              view === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <FiClock className="text-sm" />
            Upload History
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {view === 'upload' && (
          <div className="space-y-6">
            {/* Statistics Cards Row - Modern Version */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StudentStatisticsCard
                title="Total Students"
                value={stats.totalStudents}
                icon={FiUsers}
                color="from-purple-500 to-purple-700"
                trend={8.5}
              />
              <StudentStatisticsCard
                title="Grade/Class Records"
                value={getGradeStatsTotal(stats.globalStats)}
                icon={IoSchool}
                color="from-blue-500 to-blue-700"
                trend={5.2}
              />
              <StudentStatisticsCard
                title="Active Students"
                value={demographics.statusDistribution?.find(s => s.name === 'Active')?.value || 0}
                icon={FiAward}
                color="from-emerald-500 to-emerald-700"
                trend={12.3}
              />
              <StudentStatisticsCard
                title="Streams"
                value={Object.keys(stats.streamStats || {}).length}
                icon={FiLayers}
                color="from-indigo-500 to-indigo-700"
                trend={2.1}
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Upload Strategy Info */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-blue-900 flex items-center gap-3">
                      <FiLayers className="text-blue-700 text-2xl" />
                      Upload Strategy
                    </h3>
                    {uploadStrategy && (
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm">
                        {uploadStrategy.uploadType === 'new' 
                          ? `New Upload for ${uploadStrategy.selectedForms.join(', ')}`
                          : `Update Upload for ${uploadStrategy.targetForm}`
                        }
                      </span>
                    )}
                  </div>
                  
                  {!uploadStrategy ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FiUpload className="text-blue-600 text-2xl" />
                      </div>
                      <p className="text-blue-800 font-bold text-lg mb-4">
                        No upload strategy selected
                      </p>
                      <button
                        onClick={() => setShowStrategyModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-bold flex items-center gap-3 mx-auto hover:shadow-xl transition-all duration-300"
                      >
                        <FiSettings className="text-base" />
                        Select Upload Strategy
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-blue-200">
                          <h4 className="font-bold text-gray-900 mb-2">Upload Type</h4>
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${
                              uploadStrategy.uploadType === 'new' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {uploadStrategy.uploadType === 'new' ? <FiPlus /> : <FiDatabase />}
                            </div>
                            <span className="font-bold text-gray-900">
                              {uploadStrategy.uploadType === 'new' ? 'New Upload' : 'Update Upload'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 border border-blue-200">
                          <h4 className="font-bold text-gray-900 mb-2">Target Grades</h4>
                          <div className="flex flex-wrap gap-2">
                            {uploadStrategy.uploadType === 'new' 
                              ? uploadStrategy.selectedForms.map(form => (
                                  <span key={form} className={`px-3 py-1 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${getFormColor(form)}`}>
                                    {form}
                                  </span>
                                ))
                              : (
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${getFormColor(uploadStrategy.targetForm)}`}>
                                  {uploadStrategy.targetForm}
                                </span>
                              )
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-4 border border-blue-200">
                        <h4 className="font-bold text-gray-900 mb-2">Strategy Details</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {uploadStrategy.uploadType === 'new' ? (
                            <>
                              <li className="flex items-center gap-2">
                                <FiCheckCircle className="text-green-500" />
                                <span>Admission number is unique identifier</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <FiCheckCircle className="text-green-500" />
                                <span>Prevents duplicate admission numbers</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <FiCheckCircle className="text-green-500" />
                                <span>Only processes selected grades</span>
                              </li>
                            </>
                          ) : (
                            <>
                              <li className="flex items-center gap-2">
                                <FiCheckCircle className="text-green-500" />
                                <span>Replaces entire grade batch safely</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <FiCheckCircle className="text-green-500" />
                                <span>Matches students by admission number</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <FiCheckCircle className="text-green-500" />
                                <span>Preserves relational integrity</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowStrategyModal(true)}
                          className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                        >
                          Change Strategy
                        </button>
                        <button
                          onClick={() => setUploadStrategy(null)}
                          className="px-4 py-2 border-2 border-red-300 text-red-700 rounded-lg font-bold hover:border-red-500 hover:text-red-800 transition-all duration-300"
                        >
                          Clear Strategy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* File Upload Section */}
                <ModernFileUpload
                  onFileSelect={handleFileSelect}
                  file={file}
                  onRemove={() => setFile(null)}
                  dragActive={dragActive}
                  onDrag={handleDrag}
                />

                {file && (
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-300 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl">
                          {file.name.endsWith('.csv') ? (
                            <FiFile className="text-blue-700 text-3xl" />
                          ) : (
                            <IoDocumentText className="text-green-700 text-3xl" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg truncate max-w-[200px] md:max-w-none">{file.name}</p>
                          <div className="flex flex-col md:flex-row md:items-center gap-6 mt-2">
                            <span className="text-gray-600 font-semibold text-base">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <span className="px-3 py-1.5 bg-gray-100 rounded-lg font-bold text-gray-700 text-sm">
                              {file.name.split('.').pop().toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                 <div className="flex items-center gap-3">
  <button
    onClick={() => setFile(null)}
    className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
  >
    <FiX className="text-lg" />
  </button>
  <button
    onClick={handleUploadWithStrategy}
    disabled={uploading || validationLoading || !uploadStrategy}
    className="px-5 py-3 bg-gradient-to-r from-emerald-700 to-emerald-900 text-white rounded-xl font-bold flex items-center gap-2.5 text-sm shadow-lg disabled:opacity-70 hover:shadow-xl transition-all duration-300"
  >
    {uploading ? (
      <>
        <CircularProgress size={16} className="text-white"   style={{ color: 'white' }}
/>
        <span className="text-white/90">Processing...</span>
      </>
    ) : validationLoading ? (
      <>
        <CircularProgress size={16} className="text-white"    style={{ color: 'white' }}
/>
        <span className="text-white/90">Checking...</span>
      </>
    ) : (
      <>
        <FiUpload className="text-sm" />
        <span>Upload Now</span>
      </>
    )}
  </button>
</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                {/* Templates Section */}
                <div className="bg-white rounded-2xl border-2 border-gray-300 p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Download Templates</h3>
                  <div className="space-y-4">
                    <button
                      onClick={downloadCSVTemplate}
                      className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      <FiFile className="text-blue-600 text-2xl" />
                      <span className="font-bold text-gray-900 text-base">CSV Template</span>
                    </button>
                    <button
                      onClick={downloadExcelTemplate}
                      className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      <IoDocumentText className="text-green-600 text-2xl" />
                      <span className="font-bold text-gray-900 text-base">Excel Template</span>
                    </button>
                  </div>
                </div>

                {/* Guidelines Section */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-300 p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-blue-900 mb-6">Upload Guidelines</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-bold text-base">1</span>
                      </div>
                      <span className="text-blue-800 font-semibold text-base">Select upload strategy first (New or Update)</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-bold text-base">2</span>
                      </div>
                      <span className="text-blue-800 font-semibold text-base">Admission numbers must be unique (4-10 digits)</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-bold text-base">3</span>
                      </div>
                      <span className="text-blue-800 font-semibold text-base">For updates, only students in the selected grade will be processed</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-bold text-base">4</span>
                      </div>
                      <span className="text-blue-800 font-semibold text-base">System checks for duplicates before uploading</span>
                    </li>
                  </ul>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-300 p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-purple-900 mb-6">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-800 font-bold">Total Grades</span>
                      <span className="text-2xl font-bold text-purple-700">{GRADE_LEVELS.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-800 font-bold">Unique Identifier</span>
                      <span className="font-bold text-purple-700">Admission #</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-800 font-bold">Max File Size</span>
                      <span className="font-bold text-purple-700">10 MB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-800 font-bold">Supported Formats</span>
                      <span className="font-bold text-purple-700">CSV, Excel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'students' && (
          <div className="space-y-8">
            {showFilters && (
              <EnhancedFilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                showAdvanced={showFilters}
                onToggleAdvanced={() => setShowFilters(!showFilters)}
              />
            )}

            <div className="bg-white rounded-2xl p-6 border-2 border-gray-300 shadow-2xl">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="flex-1 w-full lg:w-auto">
                  <div className="relative max-w-full lg:max-w-lg">
                    <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      onKeyDown={handleSearch}
                      placeholder="Search students by name, admission number, or parent email"
                      className="w-full pl-14 pr-4 py-4 bg-white border-2 border-gray-400 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-600 transition-all duration-300 text-base"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex-1 lg:flex-none px-6 py-4 bg-white border-2 border-gray-400 rounded-2xl text-gray-700 font-bold flex items-center justify-center gap-3 text-base hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                  >
                    <FiFilter />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>

                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-2xl">
                    <button
                      onClick={() => setDisplayMode('grid')}
                      className={`p-3 rounded-xl transition-all duration-300 ${displayMode === 'grid' ? 'bg-white text-blue-700 shadow-lg' : 'text-gray-600 hover:text-blue-600'}`}
                    >
                      <FiGrid size={18} />
                    </button>
                    <button
                      onClick={() => setDisplayMode('list')}
                      className={`p-3 rounded-xl transition-all duration-300 ${displayMode === 'list' ? 'bg-white text-blue-700 shadow-lg' : 'text-gray-600 hover:text-blue-600'}`}
                    >
                      <FiList size={18} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleSearch({ type: 'click' })}
                    disabled={loading}
                    className="flex-1 lg:flex-none px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl font-bold flex items-center justify-center gap-3 text-base shadow-xl disabled:opacity-50 hover:shadow-2xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={18} className="text-white" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <FiSearch />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <Spinner message="Loading student records..." size="medium" />
              </div>
            ) : (
              <>
                {displayMode === 'grid' && students.length > 0 && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Student Records ({pagination.total})
                      </h3>
                      <div className="text-gray-600 font-bold text-base">
                        Page {pagination.page} of {pagination.pages}
                      </div>
                    </div>
                 <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
  {students.map(student => (
    <div
      key={student.id}
      className="group relative bg-white rounded-3xl sm:rounded-[2rem] p-5 border-0 shadow-lg hover:shadow-2xl hover:shadow-emerald-100/30 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Vertical Form Indicator */}
      <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-all duration-300 ${getFormBgColor(student.form)}`} />
      
      {/* Header: Avatar & Actions */}
      <div className="flex justify-between items-start mb-6 pl-3">
        <div className="relative">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-white flex items-center justify-center border border-slate-100 shadow-inner group-hover:border-emerald-200 group-hover:from-emerald-50/30 transition-all duration-300">
            <FiUser className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-[3px] border-white shadow-sm ${student.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        </div>
        
        <button 
          onClick={() => setEditingStudent && setEditingStudent(student)}
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all opacity-0 group-hover:opacity-100"
        >
          <FiSettings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Student Info */}
      <div className="pl-3 mb-6">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate leading-tight">
          {getStudentName(student)}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-full">
            #{student.admissionNumber}
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            {student.form}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 pl-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100/50 shadow-sm">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Stream</p>
          <p className="text-sm font-bold text-slate-800">{student.stream || '—'}</p>
        </div>
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100/50 shadow-sm">
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Joined</p>
          <p className="text-sm font-bold text-slate-800">{formatDate(student.createdAt)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-auto pl-3">
        <button
          onClick={() => setSelectedStudent && setSelectedStudent(student)}
          className="group/btn flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-slate-900 to-black hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-emerald-200/30"
        >
          <span className="text-xs font-bold tracking-wide">View Profile</span>
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover/btn:bg-white/20 transition-colors">
            <FiEye className="w-3 h-3" />
          </div>
        </button>
        
        <button
          onClick={() => setEditingStudent && setEditingStudent(student)}
          className="group/edit flex items-center justify-center w-12 py-3 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-emerald-100 hover:to-emerald-50 text-slate-600 hover:text-emerald-700 rounded-2xl transition-all duration-300 border border-slate-200 hover:border-emerald-200"
        >
          <FiEdit className="w-4 h-4 group-hover/edit:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  ))}
</div>
                  </>
                )}
{displayMode === 'list' && students.length > 0 && (
  <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
    {/* Header with glass effect */}
    <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <FiUsers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Student Records</h3>
            <p className="text-sm text-gray-500 mt-1">Manage and view all student information</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-black text-white rounded-2xl font-bold text-sm shadow-lg">
            <span className="text-emerald-300">{pagination.total}</span> total students
          </div>
          <button
            onClick={() => loadStudents(pagination.page)}
            disabled={loading}
            className="group px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold flex items-center gap-3 text-sm shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-300"
          >
            {loading ? (
              <CircularProgress size={16} className="text-white" />
            ) : (
              <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            )}
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>

    {/* Table Container */}
    <div className="overflow-x-auto rounded-b-3xl">
      <table className="w-full min-w-[800px]">
        <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
          <tr>
            {/* Student Column */}
            <th className="sticky top-0 z-10 px-6 py-5 text-left">
              <button
                onClick={() => handleSort('fullName')}
                className="group flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Student
                  {filters.sortBy === 'fullName' ? (
                    filters.sortOrder === 'asc' ? (
                      <FiChevronUp className="w-3 h-3 text-blue-500" />
                    ) : (
                      <FiChevronDown className="w-3 h-3 text-blue-500" />
                    )
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiChevronDown className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </button>
            </th>

            {/* Grade Column */}
            <th className="sticky top-0 z-10 px-6 py-5 text-left">
              <button
                onClick={() => handleSort('form')}
                className="group flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Grade/Class
                  {filters.sortBy === 'form' ? (
                    filters.sortOrder === 'asc' ? (
                      <FiChevronUp className="w-3 h-3 text-blue-500" />
                    ) : (
                      <FiChevronDown className="w-3 h-3 text-blue-500" />
                    )
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiChevronDown className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </button>
            </th>

            {/* Stream Column */}
            <th className="sticky top-0 z-10 px-6 py-5 text-left">
              <button
                onClick={() => handleSort('stream')}
                className="group flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Stream
                  {filters.sortBy === 'stream' ? (
                    filters.sortOrder === 'asc' ? (
                      <FiChevronUp className="w-3 h-3 text-blue-500" />
                    ) : (
                      <FiChevronDown className="w-3 h-3 text-blue-500" />
                    )
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiChevronDown className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </button>
            </th>

            {/* Status Column */}
            <th className="sticky top-0 z-10 px-6 py-5 text-left">
              <button
                onClick={() => handleSort('status')}
                className="group flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Status
                  {filters.sortBy === 'status' ? (
                    filters.sortOrder === 'asc' ? (
                      <FiChevronUp className="w-3 h-3 text-blue-500" />
                    ) : (
                      <FiChevronDown className="w-3 h-3 text-blue-500" />
                    )
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiChevronDown className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </button>
            </th>

            {/* Actions Column */}
            <th className="sticky top-0 z-10 px-6 py-5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {students.map((student, index) => (
            <tr
              key={student.id}
              className="group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-emerald-50/30 transition-all duration-300"
            >
              {/* Student Cell */}
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${student.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {getStudentName(student)}
                      </h4>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-full">
                        #{student.admissionNumber}
                      </span>
                    </div>
                    {(student.parentEmail || student.email) && (
                      <div className="text-sm text-gray-500 truncate max-w-[240px] mt-1 flex items-center gap-1">
                        <FiMail className="w-3 h-3" />
                        {student.parentEmail || student.email}
                      </div>
                    )}
                  </div>
                </div>
              </td>

              {/* Form Cell */}
              <td className="px-6 py-5">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getFormBadgeColor(student.form)}`}>
                  {student.form}
                </span>
              </td>

              {/* Stream Cell */}
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <span className="font-semibold text-gray-800">
                    {student.stream || <span className="text-gray-400">—</span>}
                  </span>
                </div>
              </td>

              {/* Status Cell */}
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <span className={`text-sm font-semibold ${student.status === 'active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {student.status}
                  </span>
                </div>
              </td>

              {/* Actions Cell */}
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="group/btn flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 hover:text-blue-800 font-semibold text-sm transition-all duration-300 shadow-sm hover:shadow"
                  >
                    <FiEye className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                    View
                  </button>
                  <button
                    onClick={() => setEditingStudent(student)}
                    className="group/btn flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 hover:text-emerald-800 font-semibold text-sm transition-all duration-300 shadow-sm hover:shadow"
                  >
                    <FiEdit className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Responsive Fallback */}
    <div className="lg:hidden p-6 space-y-4">
      {students.map(student => (
        <div key={student.id} className="bg-gradient-to-r from-slate-50 to-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${student.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">
                  {getStudentName(student)}
                </h4>
                <p className="text-xs text-gray-500">#{student.admissionNumber}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-gray-500 mb-1">Grade/Class</p>
              <span className={`text-sm font-bold ${getFormTextColor(student.form)}`}>
                {student.form}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-gray-500 mb-1">Stream</p>
              <span className="text-sm font-bold text-gray-800">
                {student.stream || '—'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStudent(student)}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-sm"
            >
              View Profile
            </button>
            <button
              onClick={() => setEditingStudent(student)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold text-sm"
            >
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

                {students.length === 0 && !loading && (
                  <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-300 shadow-xl">
                    <FiUsers className="text-6xl text-gray-300 mx-auto mb-6" />
                    <p className="text-gray-600 text-xl font-bold mb-4">No students found</p>
                    {(filters.search || filters.form || filters.stream) && (
                      <button
                        onClick={handleClearFilters}
                        className="text-blue-600 font-bold text-lg hover:text-blue-800 transition-colors"
                      >
                        Clear filters to see all students
                      </button>
                    )}
                  </div>
                )}

                {students.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t-2 border-gray-300">
                    <div className="text-gray-700 font-bold text-base">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="p-3 rounded-xl border-2 border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <FiArrowLeft className="text-base" />
                      </button>
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-12 h-12 rounded-xl font-bold text-sm transition-all duration-300 ${
                              pagination.page === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-2xl'
                                : 'border-2 border-gray-400 hover:border-blue-500 hover:text-blue-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="p-3 rounded-xl border-2 border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <FiArrowRight className="text-base" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === 'demographics' && (
          <div className="space-y-8">
            {/* Statistics Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StudentStatisticsCard
                title="Total Students"
                value={stats.totalStudents}
                icon={FiUsers}
                color="from-purple-500 to-purple-700"
                trend={8.5}
              />
              <StudentStatisticsCard
                title="Active Students"
                value={demographics.statusDistribution?.find(s => s.name === 'Active')?.value || 0}
                icon={FiAward}
                color="from-emerald-500 to-emerald-700"
                trend={12.3}
              />
              <StudentStatisticsCard
                title="Grade/Class Records"
                value={getGradeStatsTotal(stats.globalStats)}
                icon={IoSchool}
                color="from-blue-500 to-blue-700"
                trend={5.2}
              />
              <StudentStatisticsCard
                title="Streams"
                value={Object.keys(stats.streamStats || {}).length}
                icon={FiLayers}
                color="from-indigo-500 to-indigo-700"
                trend={7.8}
              />
            </div>
            
            {/* Statistics Summary Card */}
            <StatisticsSummaryCard 
              stats={stats}
              demographics={demographics}
              onRefresh={refreshStatistics}
            />
            
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <StudentsChart
                data={demographics.formDistribution}
                type="pie"
                title="Grade Distribution"
                colors={['#3B82F6', '#10B981', '#8B5CF6']}
                height={400}
              />
              <StudentsChart
                data={demographics.streamDistribution}
                type="bar"
                title="Stream Distribution"
                height={400}
              />
            </div>
            
            {/* Detailed Statistics Table */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-300 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Statistics Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Count</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Percentage</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {demographics.formDistribution.map((form, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form.color }} />
                            <span className="font-bold text-gray-900">{form.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">{form.value.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">
                            {stats.totalStudents > 0 ? `${((form.value / stats.totalStudents) * 100).toFixed(1)}%` : '0%'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {index % 2 === 0 ? (
                              <FiTrendingUp className="text-green-500" />
                            ) : (
                              <FiTrendingDown className="text-red-500" />
                            )}
                            <span className={`font-bold ${index % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {index % 2 === 0 ? '+2.5%' : '-1.2%'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Upload History</h3>
                <p className="text-gray-600 mt-2 text-base">Track all your bulk upload activities</p>
              </div>
              <button
                onClick={() => loadUploadHistory(1)}
                disabled={historyLoading}
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl font-bold flex items-center justify-center gap-3 text-base shadow-xl disabled:opacity-50 hover:shadow-2xl transition-all duration-300"
              >
                {historyLoading ? (
                  <>
                    <CircularProgress size={18} className="text-white" />
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <FiRefreshCw />
                    <span>Refresh History</span>
                  </>
                )}
              </button>
            </div>

            {uploadHistory.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-300 shadow-xl">
                <FiClock className="text-6xl text-gray-300 mx-auto mb-6" />
                <p className="text-gray-600 text-xl font-bold mb-4">No upload history found</p>
                <p className="text-gray-500 text-base">Upload your first file to see history here</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[768px]">
                    <thead className="bg-gradient-to-r from-gray-100 to-white">
                      <tr>
                        <th className="px-8 py-6 text-left text-base font-bold text-gray-700 uppercase tracking-wider">
                          Upload Details
                        </th>
                        <th className="px-8 py-6 text-left text-base font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-8 py-6 text-left text-base font-bold text-gray-700 uppercase tracking-wider">
                          Statistics
                        </th>
                        <th className="px-8 py-6 text-left text-base font-bold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-200">
                      {uploadHistory.map(upload => (
                        <tr key={upload.id} className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
                                <FiFile className="text-blue-700 text-xl" />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-base truncate max-w-[250px] lg:max-w-md">
                                  {upload.fileName}
                                </div>
                                <div className="text-gray-600 mt-2 font-semibold text-sm">
                                  {new Date(upload.uploadDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                {upload.metadata && (
                                  <div className="mt-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                      upload.metadata.uploadType === 'new' 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-purple-100 text-purple-700'
                                    }`}>
                                      {upload.metadata.uploadType === 'new' ? 'New Upload' : 'Update Upload'}
                                    </span>
                                    {upload.metadata.selectedForms && (
                                      <span className="ml-2 px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">
                                        {upload.metadata.selectedForms.length} grades
                                      </span>
                                    )}
                                    {upload.metadata.targetForm && (
                                      <span className="ml-2 px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">
                                        {upload.metadata.targetForm}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-5 py-2.5 rounded-xl text-sm font-bold ${
                              upload.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : upload.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {upload.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-2">
                              <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <span className="text-emerald-700 font-bold text-sm">{upload.validRows || 0} valid</span>
                                <span className="text-amber-700 font-bold text-sm">{upload.skippedRows || 0} skipped</span>
                                <span className="text-red-700 font-bold text-sm">{upload.errorRows || 0} errors</span>
                              </div>
                              <div className="text-gray-600 font-semibold text-sm">
                                Total: {upload.totalRows || 0} rows processed
                              </div>
                              {upload.metadata && (upload.metadata.updatedRows || upload.metadata.createdRows || upload.metadata.deactivatedRows) && (
                                <div className="text-gray-500 text-xs">
                                  {upload.metadata.updatedRows > 0 && `Updated: ${upload.metadata.updatedRows} `}
                                  {upload.metadata.createdRows > 0 && `Created: ${upload.metadata.createdRows} `}
                                  {upload.metadata.deactivatedRows > 0 && `Deactivated: ${upload.metadata.deactivatedRows}`}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <button
                              onClick={() => handleDeleteBatch(upload.id, upload.fileName)}
                              className="px-5 py-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onEdit={() => {
            setEditingStudent(selectedStudent);
            setSelectedStudent(null);
          }}
          onDelete={(id, name) => handleDeleteStudent(id, name)}
        />
      )}

      {editingStudent && (
        <StudentEditModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={updateStudent}
          loading={loading}
        />
      )}

      {showDeleteModal && (
        <ModernDeleteModal
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteTarget({ type: '', id: '', name: '' });
          }}
          onConfirm={confirmDelete}
          loading={loading}
          type={deleteTarget.type}
          itemName={deleteTarget.name}
        />
      )}

      <UploadStrategyModal
        open={showStrategyModal}
        onClose={() => setShowStrategyModal(false)}
        onConfirm={handleStrategyConfirm}
        loading={loading}
      />

      <DuplicateValidationModal
        open={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        duplicates={duplicates}
        onProceed={proceedWithUpload}
        loading={uploading}
        uploadType={uploadStrategy?.uploadType}
        targetForm={uploadStrategy?.targetForm}
      />
    </div>
  );
}
