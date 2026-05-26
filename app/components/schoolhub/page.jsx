'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiX,
  FiLayers,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiImage,
  FiGrid,
  FiCheckCircle,
  FiAlertCircle,
  FiBookOpen,
  FiShield,
  FiChevronRight,
  FiTrendingUp,
  FiUploadCloud,
  FiUser,
  FiMail,
  FiPhone,
  FiClock,
  FiAlertTriangle,
  FiUserCheck,
  FiFilter,
  FiSave,
  FiMoreVertical,
  FiList,
  FiMapPin,
  FiInfo,
  FiShare2,
  FiMonitor,
} from 'react-icons/fi';
import { 
  FaUsers, 
  FaShieldAlt, 
  FaHome, 
  FaGraduationCap,
  FaFacebook,
  FaTwitter,
  FaInstagram,
} from 'react-icons/fa';

// ============= CONSTANTS & CONFIGURATION =============
const MAX_SCHOOL_IMAGE_SIZE = 4.5 * 1024 * 1024;
const MAX_BULK_UPLOAD = 20;

const TYPE_OPTIONS = [
  { value: 'CLUB', label: 'Clubs', icon: FaUsers, description: 'Student-led extracurricular groups', color: 'purple', gradient: 'from-purple-600 to-pink-600' },
  { value: 'SOCIETY', label: 'Societies', icon: FaGraduationCap, description: 'Academic and professional societies', color: 'indigo', gradient: 'from-slate-950 to-blue-600' },
  { value: 'STUDENT_COUNCIL', label: 'Student Council', icon: FiUserCheck, description: 'Student leadership and governance', color: 'fuchsia', gradient: 'from-fuchsia-600 to-rose-600' },
  { value: 'COMPUTER_LAB', label: 'Computer Lab', icon: FiMonitor, description: 'ICT labs and digital learning spaces', color: 'sky', gradient: 'from-sky-600 to-blue-900' },
  { value: 'BOARDING', label: 'Boarding', icon: FaHome, description: 'Boarding facilities and life', color: 'amber', gradient: 'from-amber-600 to-orange-600' },
  { value: 'SECURITY', label: 'Security', icon: FaShieldAlt, description: 'Campus security and safety', color: 'rose', gradient: 'from-rose-600 to-red-600' },
  { value: 'DEPARTMENT', label: 'Departments', icon: FiLayers, description: 'School departments and offices', color: 'cyan', gradient: 'from-blue-900 to-blue-600' },
];

const TYPE_THEMES = {
  CLUB: { 
    gradient: 'from-purple-600 via-pink-600 to-rose-500', 
    lightGradient: 'from-purple-50 to-pink-50',
    bg: 'bg-purple-50', 
    text: 'text-purple-700', 
    border: 'border-purple-200', 
    iconBg: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-800',
    glow: 'shadow-purple-500/20',
    hover: 'hover:border-purple-300 hover:shadow-purple-500/10'
  },
  SOCIETY: { 
    gradient: 'from-slate-950 via-blue-600 to-blue-900', 
    lightGradient: 'from-slate-950 to-blue-50',
    bg: 'bg-blue-900', 
    text: 'text-blue-900', 
    border: 'border-blue-900', 
    iconBg: 'bg-blue-900',
    badge: 'bg-blue-900 text-blue-900',
    glow: 'shadow-blue-900',
    hover: 'hover:border-blue-900 hover:shadow-blue-900'
  },
  STUDENT_COUNCIL: {
    gradient: 'from-fuchsia-600 via-rose-600 to-orange-500',
    lightGradient: 'from-fuchsia-50 to-rose-50',
    bg: 'bg-fuchsia-50',
    text: 'text-fuchsia-700',
    border: 'border-fuchsia-200',
    iconBg: 'bg-fuchsia-500',
    badge: 'bg-fuchsia-100 text-fuchsia-800',
    glow: 'shadow-fuchsia-500/20',
    hover: 'hover:border-fuchsia-300 hover:shadow-fuchsia-500/10'
  },
  COMPUTER_LAB: {
    gradient: 'from-sky-600 via-blue-900 to-teal-500',
    lightGradient: 'from-sky-50 to-blue-900',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    iconBg: 'bg-sky-500',
    badge: 'bg-sky-100 text-sky-800',
    glow: 'shadow-sky-500/20',
    hover: 'hover:border-sky-300 hover:shadow-sky-500/10'
  },
  BOARDING: { 
    gradient: 'from-amber-600 via-orange-600 to-yellow-500', 
    lightGradient: 'from-amber-50 to-orange-50',
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    border: 'border-amber-200', 
    iconBg: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800',
    glow: 'shadow-amber-500/20',
    hover: 'hover:border-amber-300 hover:shadow-amber-500/10'
  },
  SECURITY: { 
    gradient: 'from-rose-600 via-red-600 to-pink-500', 
    lightGradient: 'from-rose-50 to-red-50',
    bg: 'bg-rose-50', 
    text: 'text-rose-700', 
    border: 'border-rose-200', 
    iconBg: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800',
    glow: 'shadow-rose-500/20',
    hover: 'hover:border-rose-300 hover:shadow-rose-500/10'
  },
  DEPARTMENT: { 
    gradient: 'from-blue-900 via-blue-600 to-blue-900', 
    lightGradient: 'from-blue-900 to-blue-50',
    bg: 'bg-blue-900', 
    text: 'text-blue-900', 
    border: 'border-blue-900', 
    iconBg: 'bg-blue-900',
    badge: 'bg-blue-900 text-blue-900',
    glow: 'shadow-blue-900',
    hover: 'hover:border-blue-900 hover:shadow-blue-900'
  },
};

const STATS_CONFIG = [
  { key: 'total', label: 'Total Items', icon: FiLayers, color: 'from-slate-950 to-blue-900', description: 'All managed records' },
  { key: 'active', label: 'Active Items', icon: FiCheckCircle, color: 'from-emerald-500 to-teal-600', description: 'Published content' },
  { key: 'images', label: 'Total Images', icon: FiImage, color: 'from-blue-500 to-blue-900', description: 'Media assets' },
  { key: 'categories', label: 'Categories', icon: FiGrid, color: 'from-amber-500 to-orange-600', description: 'Content groups' },
];

// ============= UTILITY FUNCTIONS =============
const normalizeSchoolImages = (item) => {
  const related = Array.isArray(item?.images)
    ? item.images.map((image) => ({
        url: image?.url || image,
        altText: image?.altText || item?.title || item?.name || 'School image',
        caption: image?.caption || '',
      }))
    : [];

  const legacy = item?.image
    ? [{ url: item.image, altText: item?.title || item?.name || 'School image', caption: '' }]
    : [];

  const seen = new Set();
  return [...related, ...legacy].filter((image) => {
    if (!image?.url || seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getAuthHeaders = () => {
  try {
    const adminToken = localStorage.getItem('admin_token');
    const deviceToken = localStorage.getItem('device_token');
    if (!adminToken || !deviceToken) return {};
    return {
      Authorization: `Bearer ${adminToken}`,
      'x-device-token': deviceToken,
    };
  } catch {
    return {};
  }
};

// ============= COMPONENTS =============

// Modern Loading Spinner
const ModernLoadingSpinner = ({ message = "Loading school hub data...", size = "medium" }) => {
  const sizes = { small: { outer: 48, inner: 24 }, medium: { outer: 64, inner: 32 }, large: { outer: 80, inner: 40 } };
  const { outer, inner } = sizes[size];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-900 to-emerald-50/20 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-900 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-950 to-blue-900 rounded-full animate-ping opacity-25" />
            </div>
          </div>
          <div className="absolute -inset-6 bg-gradient-to-r from-slate-950 to-blue-900 rounded-full blur-xl opacity-30 animate-pulse" />
        </div>
        <div className="mt-6 space-y-3">
          <span className="block text-lg font-bold text-slate-800">{message}</span>
          <div className="flex justify-center space-x-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-blue-900 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Image Upload Field Component
const ImageUploadField = ({ existingImages = [], files = [], removedImages = [], onChange, error, setError }) => {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    const newPreviews = files.map((file, idx) => ({
      file,
      url: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}-${idx}`,
    }));
    setPreviews(newPreviews);
    
    return () => {
      newPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  const visibleExisting = existingImages.filter((image) => !removedImages.includes(image.url));

  const validateAndAddFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    if (files.length + incoming.length > MAX_BULK_UPLOAD) {
      setError?.(`Maximum ${MAX_BULK_UPLOAD} images allowed. You have ${files.length} already.`);
      return;
    }

    const valid = [];
    const rejected = [];

    incoming.forEach((file) => {
      if (!file.type?.startsWith('image/')) {
        rejected.push(`${file.name} is not an image.`);
      } else if (file.size > MAX_SCHOOL_IMAGE_SIZE) {
        rejected.push(`${file.name} is ${formatFileSize(file.size)}. Max is 4.5MB.`);
      } else {
        valid.push(file);
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        simulateProgress(file.name);
      }
    });

    if (rejected.length) setError?.(rejected[0]);
    else setError?.('');

    if (valid.length) onChange?.({ files: [...files, ...valid], removedImages });
  };

  const simulateProgress = (fileName) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({ ...prev, [fileName]: Math.min(progress, 100) }));
      if (progress >= 100) clearInterval(interval);
    }, 100);
  };

  const removeNewFile = (index) => {
    const removedFile = files[index];
    if (removedFile) setUploadProgress(prev => { const newState = { ...prev }; delete newState[removedFile.name]; return newState; });
    onChange?.({ files: files.filter((_, i) => i !== index), removedImages });
  };

  const removeExistingImage = (url) => onChange?.({ files, removedImages: [...removedImages, url] });

  const getUploadStatus = (file) => {
    const progress = uploadProgress[file.name];
    if (!progress) return null;
    if (progress === 100) return { status: 'complete', message: 'Ready', color: 'text-emerald-600' };
    return { status: 'uploading', message: `${progress}%`, color: 'text-blue-600' };
  };

  const handleBulkUpload = (e) => {
    const files = Array.from(e.target.files);
    validateAndAddFiles(files);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 flex items-center gap-2">
            <FiImage /> Image Gallery
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Upload up to {MAX_BULK_UPLOAD} images. Each max 4.5MB. Supported: JPG, PNG, GIF, WebP
          </p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-950 to-blue-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:opacity-90 transition-all">
            <FiPlus /> Bulk Upload
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleBulkUpload} />
          </label>
          <button onClick={() => inputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <FiUploadCloud /> Browse
          </button>
        </div>
      </div>

      <div
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); validateAndAddFiles(e.dataTransfer.files); }}
        className={`cursor-pointer rounded-[28px] border-2 border-dashed p-8 text-center transition-all ${
          dragActive ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
        }`}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => validateAndAddFiles(e.target.files)} />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-emerald-100 text-slate-900 shadow-sm">
          <FiUploadCloud size={28} />
        </div>
        <p className="mt-4 text-sm font-black text-slate-900">{dragActive ? 'Drop images here' : 'Drag & drop images here'}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">or click to browse from your device</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError?.('')} className="text-red-500 hover:text-red-700"><FiX /></button>
        </div>
      )}

      {(visibleExisting.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleExisting.map((image, index) => (
            <div key={image.url} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
              <img src={image.url} alt={image.altText || `Image ${index + 1}`} className="h-28 w-full object-cover" />
              <button onClick={() => removeExistingImage(image.url)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-red-600 shadow-sm backdrop-blur transition-all hover:bg-white hover:scale-105">
                <FiTrash2 size={14} />
              </button>
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <FiCheckCircle size={10} className="text-emerald-500" /> Saved
              </div>
            </div>
          ))}
          {previews.map((preview, idx) => {
            const status = getUploadStatus(preview.file);
            return (
              <div key={preview.id} className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-white shadow-sm transition-all hover:shadow-md">
                <img src={preview.url} alt={preview.file.name} className="h-28 w-full object-cover" />
                <button onClick={() => removeNewFile(idx)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-red-600 shadow-sm backdrop-blur transition-all hover:bg-white hover:scale-105">
                  <FiX size={14} />
                </button>
                {status && (
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm ${status.status === 'complete' ? 'hidden' : ''}`}>
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                      <span className={`text-xs font-bold ${status.color}`}>{status.message}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  <FiImage /> New • {formatFileSize(preview.file.size)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Details Editor Component
const DetailsEditor = ({ value, onChange }) => {
  const details = Array.isArray(value) ? value : [];
  const [expandedSections, setExpandedSections] = useState({});

  const add = () => onChange([...(details || []), { title: '', content: '' }]);
  const remove = (idx) => onChange(details.filter((_, i) => i !== idx));
  const update = (idx, patch) => onChange(details.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  const toggleExpand = (idx) => setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500 flex items-center gap-2">
          <FiLayers /> Structured Details
        </p>
        <button onClick={add} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-100 transition-all">
          + Add Section
        </button>
      </div>

      {details.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <FiLayers className="mx-auto mb-3 text-3xl text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No detail sections yet.</p>
          <p className="text-xs text-slate-400 mt-1">Click "Add Section" to create structured content blocks.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {details.map((d, idx) => (
            <div key={idx} className="rounded-[22px] border border-slate-200 bg-white overflow-hidden transition-all hover:shadow-md">
              <div className="flex items-center justify-between gap-3 p-4 bg-slate-50/50 cursor-pointer" onClick={() => toggleExpand(idx)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center text-blue-900 font-bold text-sm">{idx + 1}</div>
                  <p className="text-sm font-bold text-slate-700">{d.title || `Section ${idx + 1}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); remove(idx); }} className="text-red-500 hover:text-red-700 p-1">
                    <FiTrash2 size={14} />
                  </button>
                  <FiChevronRight className={`text-slate-400 transition-transform ${expandedSections[idx] ? 'rotate-90' : ''}`} />
                </div>
              </div>
              {expandedSections[idx] && (
                <div className="p-4 border-t border-slate-100 space-y-3">
                  <input value={d.title || ''} onChange={(e) => update(idx, { title: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900" placeholder="Section title" />
                  <textarea value={d.content || ''} onChange={(e) => update(idx, { content: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900 resize-none" placeholder="Section content" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Form Panel Component
const FormPanel = ({ title, subtitle, icon: Icon, children, theme }) => {
  const themeGradient = theme?.lightGradient || 'from-slate-950 to-emerald-50';
  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-5 flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${themeGradient} text-slate-700 ring-1 ring-slate-100`}>
          <Icon className="text-lg" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-black tracking-tight text-slate-950">{title}</h4>
          {subtitle && <p className="mt-0.5 text-xs font-semibold text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color, description, trend, onClick }) => (
  <div onClick={onClick} className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
    <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl ${color}`} />
    <div className="relative z-10">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${color}`}>
        <Icon className="text-xl" />
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-black tracking-tight text-slate-950">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
        </div>
        {trend && (
          <div className="mb-2 flex items-center gap-1 text-emerald-500">
            <FiTrendingUp className="text-sm" />
            <span className="text-xs font-bold">{trend}</span>
          </div>
        )}
      </div>
      {description && <p className="mt-4 border-t border-slate-100 pt-4 text-xs font-semibold leading-5 text-slate-400">{description}</p>}
    </div>
  </div>
);

// Hub Item Modal Component
const HubItemModal = ({ open, onClose, onSave, initial, defaultType }) => {
  const [form, setForm] = useState({
    type: initial?.type || defaultType || 'CLUB',
    title: initial?.title || '',
    shortDescription: initial?.shortDescription || '',
    description: initial?.description || '',
    contactName: initial?.contactName || '',
    contactPhone: initial?.contactPhone || '',
    contactEmail: initial?.contactEmail || '',
    displayOrder: typeof initial?.displayOrder === 'number' ? String(initial.displayOrder) : '0',
    isActive: typeof initial?.isActive === 'boolean' ? initial.isActive : true,
    image: initial?.image || '',
    details: Array.isArray(initial?.details) ? initial.details : [],
    location: initial?.location || '',
    established: initial?.established || '',
    website: initial?.website || '',
    socialMedia: initial?.socialMedia || { facebook: '', twitter: '', instagram: '' },
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    setForm({
      type: initial?.type || defaultType || 'CLUB',
      title: initial?.title || '',
      shortDescription: initial?.shortDescription || '',
      description: initial?.description || '',
      contactName: initial?.contactName || '',
      contactPhone: initial?.contactPhone || '',
      contactEmail: initial?.contactEmail || '',
      displayOrder: typeof initial?.displayOrder === 'number' ? String(initial.displayOrder) : '0',
      isActive: typeof initial?.isActive === 'boolean' ? initial.isActive : true,
      image: initial?.image || '',
      details: Array.isArray(initial?.details) ? initial.details : [],
      location: initial?.location || '',
      established: initial?.established || '',
      website: initial?.website || '',
      socialMedia: initial?.socialMedia || { facebook: '', twitter: '', instagram: '' },
    });
    setImageFiles([]);
    setRemovedImages([]);
    setUploadError('');
    setSaving(false);
    setError('');
    setActiveTab('basic');
  }, [open, initial, defaultType]);

  if (!open) return null;

  const submit = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required.'); return; }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('type', form.type);
      fd.append('title', form.title.trim());
      fd.append('shortDescription', form.shortDescription.trim());
      fd.append('description', form.description.trim());
      fd.append('contactName', form.contactName.trim());
      fd.append('contactPhone', form.contactPhone.trim());
      fd.append('contactEmail', form.contactEmail.trim());
      fd.append('displayOrder', String(form.displayOrder || '0'));
      fd.append('isActive', form.isActive ? 'true' : 'false');
      fd.append('details', JSON.stringify(Array.isArray(form.details) ? form.details : []));
      fd.append('location', form.location || '');
      fd.append('established', form.established || '');
      fd.append('website', form.website || '');
      fd.append('socialMedia', JSON.stringify(form.socialMedia || {}));

      imageFiles.forEach((file) => fd.append('images', file));
      removedImages.forEach((url) => fd.append('imagesToRemove', url));
      if (!imageFiles.length && form.image) fd.append('image', form.image);

      await onSave(fd);
      onClose();
    } catch (e) {
      setError(e?.message || 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  };

  const typeTheme = TYPE_THEMES[form.type] || TYPE_THEMES.CLUB;
  const typeMeta = TYPE_OPTIONS.find(t => t.value === form.type);
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FiInfo },
    { id: 'details', label: 'Details', icon: FiLayers },
    { id: 'contact', label: 'Contact', icon: FiUser },
    { id: 'media', label: 'Images', icon: FiImage },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-white/40 bg-white shadow-2xl">
        <div className={`relative overflow-hidden bg-gradient-to-br ${typeTheme.gradient} px-6 py-6 text-white sm:px-8`}>
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
<div className="relative flex items-center justify-between gap-4 py-4 px-2">
  <div className="flex min-w-0 items-center gap-4">
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
      {typeMeta?.icon ? <typeMeta.icon className="text-2xl text-white" /> : <FiLayers className="text-2xl text-white" />}
    </div>
    <div className="min-w-0 space-y-1.5">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/55">Katwanyaa Senior School</p>
      <h3 className="truncate text-xl font-black tracking-tight sm:text-2xl leading-tight">
        {initial?.id ? 'Edit Hub Item' : 'Create Hub Item'}
      </h3>
      <p className="text-xs font-semibold text-white/60 leading-relaxed">Manage content, images, visibility and public page details.</p>
    </div>
  </div>
  <button 
    onClick={onClose} 
    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 transition-all hover:scale-105 active:scale-95"
  >
    <FiX />
  </button>
</div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === tab.id ? `border-blue-900 text-blue-900` : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <tab.icon className="text-sm" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
          {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

          {activeTab === 'basic' && (
            <div className="space-y-5">
              <FormPanel title="Content Identity" subtitle="Public page title, type and summary" icon={FiBookOpen} theme={typeTheme}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Type</label>
                    <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900">
                      {TYPE_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label} - {opt.description}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Title</label>
                    <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" placeholder="e.g. Debate Club, Student Council, Computer Lab" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Short Description</label>
                  <textarea value={form.shortDescription} onChange={(e) => setForm(p => ({ ...p, shortDescription: e.target.value }))} className="min-h-[92px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" placeholder="Short overview shown on public cards (max 160 characters)" maxLength={200} />
                  <p className="text-right text-[10px] text-slate-400">{form.shortDescription.length}/200 characters</p>
                </div>
                <div className="mt-4 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Full Description</label>
                  <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={5} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" placeholder="Full details for the item modal/page view" />
                </div>
              </FormPanel>

              <FormPanel title="Additional Information" subtitle="Location, establishment date and website" icon={FiMapPin} theme={typeTheme}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Location</label>
                    <input value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" placeholder="e.g. Main Campus, Room 203" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Established</label>
                    <input value={form.established} onChange={(e) => setForm(p => ({ ...p, established: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" placeholder="e.g. 2010, Founded in 2005" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Website</label>
                    <input value={form.website} onChange={(e) => setForm(p => ({ ...p, website: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" placeholder="https://..." />
                  </div>
                </div>
              </FormPanel>
            </div>
          )}

          {activeTab === 'details' && (
            <FormPanel title="Structured Details" subtitle="Reusable detail blocks for public pages" icon={FiLayers} theme={typeTheme}>
              <DetailsEditor value={form.details} onChange={(next) => setForm(p => ({ ...p, details: next }))} />
            </FormPanel>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-5">
              <FormPanel title="Contact Information" subtitle="Optional patron, leader or office details" icon={FaUsers} theme={typeTheme}>
                <div className="space-y-4">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Contact Name</label><div className="relative"><FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={form.contactName} onChange={(e) => setForm(p => ({ ...p, contactName: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" placeholder="Patron / Leader / Director" /></div></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Contact Phone</label><div className="relative"><FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={form.contactPhone} onChange={(e) => setForm(p => ({ ...p, contactPhone: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" placeholder="+254 XXX XXX XXX" /></div></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Contact Email</label><div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={form.contactEmail} onChange={(e) => setForm(p => ({ ...p, contactEmail: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" placeholder="contact@school.ac.ke" /></div></div>
                </div>
              </FormPanel>

              <FormPanel title="Social Media" subtitle="Connect with social platforms" icon={FiShare2} theme={typeTheme}>
                <div className="space-y-4">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Facebook</label><div className="relative"><FaFacebook className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" /><input value={form.socialMedia?.facebook || ''} onChange={(e) => setForm(p => ({ ...p, socialMedia: { ...p.socialMedia, facebook: e.target.value } }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" placeholder="Facebook URL" /></div></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Twitter/X</label><div className="relative"><FaTwitter className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500" /><input value={form.socialMedia?.twitter || ''} onChange={(e) => setForm(p => ({ ...p, socialMedia: { ...p.socialMedia, twitter: e.target.value } }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" placeholder="Twitter URL" /></div></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Instagram</label><div className="relative"><FaInstagram className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-600" /><input value={form.socialMedia?.instagram || ''} onChange={(e) => setForm(p => ({ ...p, socialMedia: { ...p.socialMedia, instagram: e.target.value } }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" placeholder="Instagram URL" /></div></div>
                </div>
              </FormPanel>
            </div>
          )}

          {activeTab === 'media' && (
            <FormPanel title="Image Gallery" subtitle="Multiple images, previews and removals" icon={FiImage} theme={typeTheme}>
              <ImageUploadField existingImages={normalizeSchoolImages(initial)} files={imageFiles} removedImages={removedImages} error={uploadError} setError={setUploadError} onChange={({ files, removedImages: nextRemoved }) => { setImageFiles(files); setRemovedImages(nextRemoved); }} />
            </FormPanel>
          )}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
          <button onClick={onClose} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-800 hover:bg-slate-100 transition-all" disabled={saving}>Cancel</button>
          <button onClick={submit} className={`rounded-2xl bg-gradient-to-r ${typeTheme.gradient} px-6 py-3 text-sm font-black text-white shadow-lg hover:opacity-95 disabled:opacity-60 transition-all flex items-center gap-2`} disabled={saving}>
            {saving ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</> : <><FiSave /> Save Item</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ open, onClose, onConfirm, itemName, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="relative bg-gradient-to-r from-red-600 to-rose-600 p-6 text-white">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"><FiAlertCircle className="text-2xl" /></div>
            <div><h3 className="text-xl font-black tracking-tight">Confirm Deletion</h3><p className="text-white/70 text-sm">This action cannot be undone</p></div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4"><FiTrash2 className="w-8 h-8 text-red-600" /></div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Delete "{itemName}"?</h4>
            <p className="text-gray-600 text-sm">All associated data will be permanently removed.</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"><div className="flex items-start gap-3"><FiAlertTriangle className="text-red-600 mt-0.5" /><p className="text-sm font-medium text-red-800">Warning: This action is irreversible</p></div></div>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Deleting...</> : <><FiTrash2 /> Delete</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Item Card Component
const ItemCard = ({ item, onEdit, onDelete, theme, typeMeta, images }) => {
  const [showMenu, setShowMenu] = useState(false);
  const detailsCount = item.details?.length || 0;

  return (
    <div className={`group relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${theme.hover}`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
      <div className="relative z-10 bg-white rounded-3xl p-5 m-[1px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-white shadow-lg`}>
              {typeMeta?.icon ? <typeMeta.icon className="text-lg" /> : <FiLayers className="text-lg" />}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-base font-black tracking-tight text-slate-950">{item.title}</h4>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{typeMeta?.label || item.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${item.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
              {item.isActive ? <FiEye className="text-[11px]" /> : <FiEyeOff className="text-[11px]" />}
              {item.isActive ? 'Published' : 'Draft'}
            </span>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><FiMoreVertical size={16} /></button>
              {showMenu && (<div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20"><button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><FiEdit size={14} /> Edit</button><button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"><FiTrash2 size={14} /> Delete</button></div>)}
            </div>
          </div>
        </div>

        {/* Images */}
        {images.length > 0 ? (
          <div className="mt-5">
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((image, index) => (
                <div key={image.url} className="relative aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-sm group/image">
                  <img src={image.url} alt={image.altText || `${item.title} ${index + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover/image:scale-110" />
                  {index === 3 && images.length > 4 && (<div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 text-xs font-black text-white backdrop-blur-sm">+{images.length - 4}</div>)}
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-1"><FiImage /> {images.length} image{images.length !== 1 ? 's' : ''}</p>
          </div>
        ) : (
          <div className="mt-5 flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-400"><FiImage className="mr-2" /> No Images</div>
        )}

        {/* Description */}
        {item.shortDescription && (<p className="mt-4 text-sm font-semibold text-slate-600 leading-relaxed line-clamp-2">{item.shortDescription}</p>)}

        {/* Contact Badge */}
        {(item.contactName || item.contactPhone || item.contactEmail) && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {item.contactName && (<span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${theme.bg} ${theme.text}`}><FiUser size={10} /> {item.contactName}</span>)}
            {item.contactPhone && (<span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold"><FiPhone size={10} /> {item.contactPhone}</span>)}
          </div>
        )}

        {/* Location & Details */}
        <div className="mt-4 flex items-center justify-between">
          {item.location && (<span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><FiMapPin /> {item.location}</span>)}
          {detailsCount > 0 && (<span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><FiLayers /> {detailsCount} section{detailsCount !== 1 ? 's' : ''}</span>)}
          {item.displayOrder && Number(item.displayOrder) > 0 && (<span className="text-[10px] font-bold text-slate-400">Order: #{item.displayOrder}</span>)}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-2 pt-2">
          <button onClick={onEdit} className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-black transition-all ${theme.border} ${theme.bg} ${theme.text} hover:opacity-80`}><FiEdit size={14} /> Edit</button>
          <button onClick={onDelete} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-black text-red-600 hover:bg-red-100 transition-all"><FiTrash2 size={14} /> Delete</button>
        </div>
      </div>
    </div>
  );
};

// Main School Hub Manager Component
export default function SchoolHubManager() {
  const [activeType, setActiveType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('order');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, itemId: null, itemName: '', loading: false });

  const fetchItems = async (isRefresh = false) => {
    try {
      setError('');
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const headers = getAuthHeaders();
      const res = await fetch('/api/schoolhub?includeInactive=1', { headers });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `Failed to fetch items (${res.status})`);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setItems([]);
      setError(e?.message || 'Failed to fetch items.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchItems(false); }, []);

  const sortedItems = useMemo(() => {
    let filtered = activeType === 'ALL' ? items : items.filter(i => i.type === activeType);
    const query = searchTerm.trim().toLowerCase();
    if (query) filtered = filtered.filter(item => [item.title, item.shortDescription, item.description, item.contactName, item.contactEmail, item.contactPhone, item.type].filter(Boolean).some(v => String(v).toLowerCase().includes(query)));
    
    if (sortBy === 'order') return [...filtered].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    if (sortBy === 'title') return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'date') return [...filtered].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    if (sortBy === 'type') return [...filtered].sort((a, b) => a.type.localeCompare(b.type));
    return filtered;
  }, [items, activeType, searchTerm, sortBy]);

  const groupedCounts = useMemo(() => TYPE_OPTIONS.reduce((acc, opt) => { acc[opt.value] = items.filter(i => i.type === opt.value).length; return acc; }, {}), [items]);
  const activeCount = useMemo(() => items.filter(item => item.isActive).length, [items]);
  const imageCount = useMemo(() => items.reduce((sum, item) => sum + normalizeSchoolImages(item).length, 0), [items]);
  const totalItems = items.length;

  const saveItem = async (formData) => {
    const headers = getAuthHeaders();
    const url = editing?.id ? `/api/schoolhub/${editing.id}` : '/api/schoolhub';
    const method = editing?.id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers, body: formData });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || `Failed to save item (${res.status})`);
    await fetchItems(true);
  };

  const handleDeleteClick = (item) => setDeleteModal({ open: true, itemId: item.id, itemName: item.title, loading: false });
  const confirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/schoolhub/${deleteModal.itemId}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `Failed to delete (${res.status})`);
      await fetchItems(true);
      setDeleteModal({ open: false, itemId: null, itemName: '', loading: false });
    } catch (e) {
      setError(e?.message || 'Failed to delete item.');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const getTypeTheme = (type) => TYPE_THEMES[type] || TYPE_THEMES.CLUB;
  const getTypeMeta = (type) => TYPE_OPTIONS.find(t => t.value === type);
  const trendPercentage = activeCount ? Math.floor((activeCount / totalItems) * 100) : 0;

  if (loading && !items.length) return <ModernLoadingSpinner message="Loading School Hub data..." size="large" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-900 to-emerald-50/20 p-4 md:p-6">
      <DeleteConfirmationModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, itemId: null, itemName: '', loading: false })} onConfirm={confirmDelete} itemName={deleteModal.itemName} loading={deleteModal.loading} />
      <HubItemModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={saveItem} initial={editing} defaultType={activeType !== 'ALL' ? activeType : 'CLUB'} />

      {/* Hero Header */}
      <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0C4A6E] p-7 text-white shadow-2xl md:rounded-[2.5rem] md:p-10 mb-8">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '42px 42px' }} />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-900 blur-[90px]" />
        <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-emerald-300/10 blur-[90px]" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full blur-[80px] animate-pulse" />
        
        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-7 flex items-center gap-5">
              <div className="h-12 w-1.5 rounded-full bg-gradient-to-b from-amber-300 via-yellow-300 to-emerald-300 shadow-[0_0_24px_rgba(245,158,11,0.55)]" />
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-amber-200">Katwanyaa Senior School</p>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />School Hub Administration Portal</p>
              </div>
            </div>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 shadow-xl backdrop-blur-xl"><FiLayers className="text-3xl text-amber-200" /></div>
              <h2 className="text-3xl font-black leading-none tracking-tight md:text-5xl">School <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-emerald-200">Hub</span> Manager</h2>
            </div>
            <p className="mt-5 max-w-2xl rounded-2xl bg-white/[0.03] px-4 py-3 text-sm font-semibold leading-7 text-white/65 backdrop-blur-sm">Centralized management for clubs, societies, student council, computer lab, boarding facilities, security services, and school departments. Upload multiple images, manage structured content, and control public visibility from a single interface.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-100 backdrop-blur-sm"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />{activeCount} Active Items</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/60 backdrop-blur-sm"><FiImage className="text-amber-400" />{imageCount} Images Managed</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/60 backdrop-blur-sm"><FiGrid className="text-amber-400" />{totalItems} Total Records</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
            <button onClick={() => fetchItems(true)} className="group/btn relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white/15 disabled:opacity-50 backdrop-blur-sm" disabled={refreshing}><FiRefreshCw className={refreshing ? 'animate-spin text-base' : 'text-base transition-transform group-hover/btn:rotate-180'} />{refreshing ? 'Refreshing' : 'Refresh Data'}</button>
            <button onClick={() => { setEditing(null); setModalOpen(true); }} className="group/btn relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg hover:shadow-xl transition-all"><FiPlus className="text-base transition-transform group-hover/btn:rotate-90" />Create New Item</button>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider"><div className="flex items-center gap-4"><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="text-white/40">Status:</span><span className="text-emerald-400">Operational</span></div><div className="flex items-center gap-2"><FiShield className="text-amber-400" /><span className="text-white/40">Security:</span><span className="text-amber-400">Encrypted</span></div></div><div className="flex items-center gap-2"><FiClock className="text-white/30" /><span className="text-white/40">Last Updated: {new Date().toLocaleTimeString()}</span></div></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Items" value={totalItems} icon={FiLayers} color="bg-gradient-to-br from-slate-950 to-blue-900" description="All managed records" trend={`+${Math.floor(totalItems * 0.12)}%`} />
        <StatCard label="Active Items" value={activeCount} icon={FiCheckCircle} color="bg-gradient-to-br from-emerald-500 to-teal-600" description="Published content" trend={`${trendPercentage}%`} />
        <StatCard label="Total Images" value={imageCount} icon={FiImage} color="bg-gradient-to-br from-blue-500 to-blue-900" description="Media assets" trend={`+${Math.floor(imageCount * 0.08)}`} />
        <StatCard label="Categories" value={TYPE_OPTIONS.length} icon={FiGrid} color="bg-gradient-to-br from-amber-500 to-orange-600" description="Content groups" />
      </div>

      {/* Filter Section */}
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white/80 backdrop-blur-sm p-5 shadow-xl shadow-slate-200/40 mb-8">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-900 blur-3xl" />
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400 flex items-center gap-2"><FiFilter className="text-emerald-500" /> Filter & Sort</p><h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">Browse Records</h3></div>
            <div className="flex gap-3">
              <div className="relative w-full lg:w-64"><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white focus:ring-4 focus:ring-blue-900" /></div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-900 focus:bg-white"><option value="order">Sort by Order</option><option value="title">Sort by Title</option><option value="date">Sort by Date</option><option value="type">Sort by Type</option></select>
              <div className="flex rounded-2xl border border-slate-200 overflow-hidden"><button onClick={() => setViewMode('grid')} className={`px-4 py-2.5 ${viewMode === 'grid' ? 'bg-blue-900 text-white' : 'bg-white text-slate-600'}`}><FiGrid /></button><button onClick={() => setViewMode('list')} className={`px-4 py-2.5 ${viewMode === 'list' ? 'bg-blue-900 text-white' : 'bg-white text-slate-600'}`}><FiList /></button></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveType('ALL')} className={`rounded-2xl border px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${activeType === 'ALL' ? 'border-slate-950 bg-slate-950 text-white shadow-lg' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}><FiLayers className="mr-2 inline-block" /> All ({totalItems})</button>
            {TYPE_OPTIONS.map(opt => { const Icon = opt.icon; const count = groupedCounts[opt.value] || 0; return (<button key={opt.value} onClick={() => setActiveType(opt.value)} className={`rounded-2xl border px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${activeType === opt.value ? 'border-slate-950 bg-slate-950 text-white shadow-lg' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}><Icon className={`mr-2 inline-block text-[11px] ${activeType === opt.value ? 'text-white' : ''}`} />{opt.label} ({count})</button>); })}
          </div>
          {(searchTerm || activeType !== 'ALL') && (<div className="flex items-center gap-2 pt-2 text-xs text-slate-500"><span className="font-bold">Active Filters:</span>{activeType !== 'ALL' && <span className="px-2 py-1 rounded-lg bg-blue-900 text-blue-900 font-semibold">{TYPE_OPTIONS.find(o => o.value === activeType)?.label}</span>}{searchTerm && <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">Search: "{searchTerm}"</span>}<button onClick={() => { setSearchTerm(''); setActiveType('ALL'); }} className="ml-auto text-red-500 hover:text-red-600 font-bold">Clear All</button></div>)}
        </div>
      </div>

      {error && (<div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 mb-6 flex items-center justify-between"><span>{error}</span><button onClick={() => setError('')} className="text-red-500 hover:text-red-700"><FiX /></button></div>)}

      {sortedItems.length === 0 ? (
        <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-white p-16 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-5"><FiLayers className="text-3xl text-slate-400" /></div>
          <h3 className="text-xl font-black text-slate-800 mb-2">No Items Found</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">{searchTerm || activeType !== 'ALL' ? 'No items match your current filters.' : 'Your School Hub is empty. Click "Create New Item" to add your first record.'}</p>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-slate-950 to-blue-900 text-white font-bold shadow-lg hover:shadow-xl transition-all"><FiPlus /> Create Your First Item</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sortedItems.map(item => { const theme = getTypeTheme(item.type); const typeMeta = getTypeMeta(item.type); const images = normalizeSchoolImages(item); return (<ItemCard key={item.id} item={item} theme={theme} typeMeta={typeMeta} images={images} onEdit={() => { setEditing(item); setModalOpen(true); }} onDelete={() => handleDeleteClick(item)} />); })}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedItems.map(item => { const theme = getTypeTheme(item.type); const typeMeta = getTypeMeta(item.type); const images = normalizeSchoolImages(item); return (<div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border ${theme.border} bg-white hover:shadow-md transition-all`}><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-md`}>{typeMeta?.icon ? <typeMeta.icon className="text-lg" /> : <FiLayers />}</div><div><h4 className="font-black text-slate-900">{item.title}</h4><p className="text-xs text-slate-500">{typeMeta?.label} • {images.length} images</p></div></div><div className="flex items-center gap-2"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.isActive ? 'Active' : 'Draft'}</span><button onClick={() => { setEditing(item); setModalOpen(true); }} className="p-2 hover:bg-slate-100 rounded-lg"><FiEdit size={16} /></button><button onClick={() => handleDeleteClick(item)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><FiTrash2 size={16} /></button></div></div>); })}
        </div>
      )}
      
      {sortedItems.length > 0 && (<div className="mt-6 text-center text-xs text-slate-400 font-semibold">Showing {sortedItems.length} of {totalItems} items{searchTerm && ` matching "${searchTerm}"`}{activeType !== 'ALL' && ` in ${TYPE_OPTIONS.find(o => o.value === activeType)?.label}`}</div>)}
    </div>
  );
}
