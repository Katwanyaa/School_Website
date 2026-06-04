'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FiSearch, FiFilter, FiEye, FiFileText, FiX, FiBookOpen, FiTag, FiSchool,
  FiCheckCircle, FiRefreshCw, FiInfo
} from 'react-icons/fi';
import {
  IoDocumentsOutline, IoFolderOpen, IoDocumentAttach, IoClose, IoFilter,
  IoSchool, IoTime, IoCheckmarkCircle, IoWarning, IoInformation,
  IoArrowDown, IoArrowUp, IoCloudDownload, IoEye, IoCalendar, IoPerson,
  IoDocument, IoImages, IoVideocam, IoMusicalNotes, IoColorPalette,
  IoCalculator
} from 'react-icons/io5';
import { CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== HELPER FUNCTIONS ====================

const extractFileInfoFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const pathParts = pathname.split('/');
    let fileName = pathParts[pathParts.length - 1];
    fileName = decodeURIComponent(fileName);
    const extension = fileName.includes('.') 
      ? fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
      : '';
    const getFileType = (ext) => {
      const typeMap = {
        '.pdf': 'PDF Document', '.doc': 'Word Document', '.docx': 'Word Document',
        '.txt': 'Text File', '.jpg': 'Image', '.jpeg': 'Image', '.png': 'Image',
        '.gif': 'Image', '.webp': 'Image', '.bmp': 'Image', '.svg': 'Image',
        '.mp4': 'Video', '.mov': 'Video', '.avi': 'Video', '.wmv': 'Video',
        '.flv': 'Video', '.webm': 'Video', '.mkv': 'Video', '.mp3': 'Audio',
        '.wav': 'Audio', '.m4a': 'Audio', '.ogg': 'Audio', '.flac': 'Audio',
        '.xls': 'Excel Spreadsheet', '.xlsx': 'Excel Spreadsheet', '.csv': 'Spreadsheet',
        '.ppt': 'Presentation', '.pptx': 'Presentation', '.zip': 'Archive',
        '.rar': 'Archive', '.7z': 'Archive', '.tar': 'Archive', '.gz': 'Archive'
      };
      return typeMap[ext] || 'File';
    };
    return {
      url,
      fileName: fileName || 'download',
      extension,
      fileType: getFileType(extension),
      storageType: 'cloudinary'
    };
  } catch (error) {
    return {
      url,
      fileName: 'download',
      extension: '',
      fileType: 'File',
      storageType: 'cloudinary'
    };
  }
};

const getFileIcon = (fileType, extension, size = 20) => {
  const type = fileType?.toLowerCase() || extension?.toLowerCase() || '';
  if (type.includes('pdf')) return <FiFileText className="text-red-500" size={size} />;
  if (type.includes('word') || ['doc', 'docx'].includes(type)) return <IoDocument className="text-blue-500" size={size} />;
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(type)) return <IoImages className="text-pink-500" size={size} />;
  if (type.includes('video') || ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'].includes(type)) return <IoVideocam className="text-blue-900" size={size} />;
  if (type.includes('audio') || ['mp3', 'wav', 'm4a', 'ogg', 'flac'].includes(type)) return <IoMusicalNotes className="text-blue-900" size={size} />;
  if (type.includes('excel') || ['xls', 'xlsx', 'csv'].includes(type)) return <IoCalculator className="text-emerald-500" size={size} />;
  if (type.includes('powerpoint') || ['ppt', 'pptx'].includes(type)) return <IoColorPalette className="text-orange-500" size={size} />;
  if (type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar')) return <IoFolderOpen className="text-amber-500" size={size} />;
  return <IoDocument className="text-gray-600" size={size} />;
};

const downloadFile = (fileUrl, fileName) => {
  if (!fileUrl) {
    alert('No file available for download');
    return;
  }
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName || 'download';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadMultipleFiles = async (files) => {
  if (!files || files.length === 0) {
    alert('No files available for download');
    return;
  }
  const loadingAlert = document.createElement('div');
  loadingAlert.className = 'fixed bottom-4 left-4 bg-gradient-to-r from-blue-950 to-blue-800 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl shadow-2xl z-[10000] backdrop-blur-sm border border-white/20';
  loadingAlert.style.fontSize = 'clamp(12px, 2vw, 14px)';
  const spinnerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="display: inline-block; width: 16px; height: 16px; border: 2px solid white; border-right: 2px solid transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <div><p style="margin: 0; font-weight: bold; font-size: 13px;">Downloading ${files.length} file${files.length > 1 ? 's' : ''}...</p></div>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `;
  loadingAlert.innerHTML = spinnerHTML;
  document.body.appendChild(loadingAlert);
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileUrl = file?.url || file?.downloadUrl || file?.href;
      const fileName = file?.fileName || file?.name || file?.originalName || 'download';
      if (fileUrl) {
        downloadFile(fileUrl, fileName);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    loadingAlert.innerHTML = `<div style="display: flex; align-items: center; gap: 12px;"><div style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: linear-gradient(135deg, #4ade80 0%, #10b981 100%); border-radius: 50%; font-weight: bold; color: white; font-size: 12px;">✓</div><div><p style="margin: 0; font-weight: bold; font-size: 13px;">Downloaded ${files.length} file${files.length > 1 ? 's' : ''}!</p></div></div>`;
    setTimeout(() => document.body.removeChild(loadingAlert), 2500);
  } catch (error) {
    console.error('Error downloading files:', error);
    loadingAlert.innerHTML = `<div style="display: flex; align-items: center; gap: 12px;"><div style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: linear-gradient(135deg, #f87171 0%, #ef4444 100%); border-radius: 50%; font-weight: bold; color: white; font-size: 12px;">!</div><div><p style="margin: 0; font-weight: bold; font-size: 13px;">Download failed. Try again.</p></div></div>`;
    setTimeout(() => document.body.removeChild(loadingAlert), 2500);
  }
};

// ==================== COMPONENTS ====================

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative">
          <CircularProgress size={80} thickness={4} className="text-blue-600" sx={{ '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-r from-blue-950 to-blue-800 rounded-full w-12 h-12 flex items-center justify-center">
              <IoDocumentsOutline className="text-white text-xl" />
            </div>
          </div>
          <div className="absolute -inset-6 bg-gradient-to-r from-blue-100 to-slate-100 rounded-full blur-xl opacity-30"></div>
        </div>
        <div className="mt-8 space-y-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-bold text-gray-800">Loading Resources</motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-600">Fetching your latest assignments...</motion.div>
          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.6, duration: 1.5 }} className="h-1 bg-gradient-to-r from-blue-950 to-blue-800 rounded-full"></motion.div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color, trend, description }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${color} shadow-md`}><Icon className="text-white text-xl" /></div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-800' : trend < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
          {trend > 0 ? <IoArrowUp className="text-xs" /> : <IoArrowDown className="text-xs" />}{Math.abs(trend)}%
        </div>
      </div>
      <div className="space-y-1">
        <div className="font-bold text-gray-900 text-3xl">{value}</div>
        <div className="text-sm font-bold text-gray-700 truncate">{title}</div>
        {description && <div className="text-xs text-gray-500 truncate">{description}</div>}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status, size = "md" }) {
  const configs = {
    'completed': { bg: 'from-emerald-500 to-teal-400', text: 'Completed', icon: <IoCheckmarkCircle /> },
    'assigned': { bg: 'from-blue-500 to-cyan-400', text: 'Assigned', icon: <IoTime /> },
    'pending': { bg: 'from-amber-500 to-orange-400', text: 'Pending', icon: <IoTime /> },
    'reviewed': { bg: 'from-blue-950 to-blue-800', text: 'Reviewed', icon: <IoCheckmarkCircle /> },
    'overdue': { bg: 'from-rose-500 to-pink-400', text: 'Overdue', icon: <IoWarning /> },
    'submitted': { bg: 'from-blue-950 to-blue-800', text: 'Submitted', icon: <IoDocument /> }
  };
  const config = configs[status?.toLowerCase()] || configs.pending;
  const sizeClasses = { sm: 'px-2 py-1 text-xs', md: 'px-3 py-1.5 text-sm', lg: 'px-4 py-2 text-base' };
  return (
    <div className={`inline-flex items-center gap-2 ${sizeClasses[size]} bg-gradient-to-r ${config.bg} text-white rounded-full font-bold shadow-md`}>
      {config.icon}<span>{config.text}</span>
    </div>
  );
}

function FilePreviewCard({ file, onDownload, onPreview, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">{getFileIcon(file.fileType, file.extension, 20)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 truncate">{file.fileName}</h4>
              <div className="flex items-center gap-2 mt-1"><span className="text-xs text-gray-500">{file.fileType}</span><span className="text-xs text-gray-400">•</span><span className="text-xs text-gray-500">{file.extension}</span></div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button onClick={() => onPreview?.(file)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><IoEye size={16} /><span>Preview</span></button>
          <button onClick={() => onDownload?.(file)} className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold shadow-md"><IoCloudDownload size={16} /><span>Download</span></button>
        </div>
      </div>
    </motion.div>
  );
}

function DetailModal({ item, type, onClose, onDownload }) {
  if (!item) return null;
  const isResource = type === 'resource';
  const isOverdue = !isResource && item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'completed';
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className={`p-4 sm:p-6 md:p-8 text-white ${isResource ? 'bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900' : isOverdue ? 'bg-gradient-to-r from-rose-600 via-rose-700 to-pink-800' : 'bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl">
                {isResource ? getFileIcon(item.type, item.files?.[0]?.extension, 20) : <IoDocument className="text-white w-5 h-5 sm:w-7 sm:h-7" />}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{item.title || 'Untitled'}</h2>
                <div className="flex items-center gap-2 mt-1 sm:mt-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold opacity-90">{item.subject || 'General'}</span>
                  <span className="text-xs sm:text-sm opacity-90">•</span>
                  <span className="text-xs sm:text-sm font-bold opacity-90">{item.className || 'All Classes'}</span>
                  <span className="text-xs sm:text-sm opacity-90">•</span>
                  <span className="text-xs sm:text-sm font-bold opacity-90 truncate">{item.teacher || 'Not specified'}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 sm:p-2 rounded-lg sm:rounded-xl ml-2 sm:ml-4"><IoClose className="w-5 h-5 sm:w-6 sm:h-6" /></button>
          </div>
        </div>
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {!isResource && item.status && <StatusBadge status={item.status} size="md" />}
            <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-bold">{item.className || 'All Classes'}</span>
            <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 text-blue-900 rounded-full text-xs sm:text-sm font-bold">{item.subject || 'General'}</span>
            {isResource && item.category && <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-bold">{item.category}</span>}
            {isOverdue && <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-rose-100 text-rose-800 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-2"><IoWarning className="w-3 h-3 sm:w-4 sm:h-4" />Overdue</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {!isResource && item.dueDate && (
              <div className="text-center p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl">
                <div className="text-xs sm:text-sm text-gray-600 font-bold">Due Date</div>
                <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mt-1 sm:mt-2">{new Date(item.dueDate).toLocaleDateString()}</div>
              </div>
            )}
            <div className="text-center p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl">
              <div className="text-xs sm:text-sm text-gray-600 font-bold">Teacher</div>
              <div className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mt-1 sm:mt-2 truncate">{item.teacher || 'Not specified'}</div>
            </div>
          </div>
          {item.description && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 flex items-center gap-2 sm:gap-3"><IoInformation className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" /><span>Description</span></h3>
              <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line">{item.description}</p>
            </div>
          )}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {isResource && item.files && item.files.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-blue-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3"><IoCloudDownload className="text-blue-900 w-4 h-4 sm:w-5 sm:h-5" /><span>Resource Files ({item.files.length})</span></h3>
                  <button onClick={() => downloadMultipleFiles(item.files?.map(file => ({ url: file.url, fileName: file.name || 'file', fileType: file.fileType, extension: file.extension })) || [])} className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-950 to-blue-800 text-white rounded-lg font-bold shadow-md flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap"><IoCloudDownload className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /><span className="hidden sm:inline">Download All</span><span className="inline sm:hidden">Download</span></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  {item.files.map((file, index) => (<FilePreviewCard key={index} file={{ url: file.url, fileName: file.name, extension: file.extension, fileType: file.fileType }} onDownload={() => downloadFile(file.url, file.name)} onPreview={() => window.open(file.url, '_blank')} index={index} />))}
                </div>
              </div>
            )}
            {!isResource && (
              <>
                {(item.assignmentFileAttachments?.length || 0) > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-blue-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3"><IoDocument className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" /><span>Assignment Files ({item.assignmentFileAttachments?.length || 0})</span></h3>
                      <button onClick={() => downloadMultipleFiles(item.assignmentFileAttachments?.map(file => ({ url: file.url, fileName: file.fileName || file.name || 'file', fileType: file.fileType, extension: file.extension })) || [])} className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold shadow-md flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap"><IoCloudDownload className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /><span className="hidden sm:inline">Download All</span><span className="inline sm:hidden">Download</span></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      {item.assignmentFileAttachments?.map((file, index) => (<FilePreviewCard key={index} file={file} onDownload={() => downloadFile(file.url, file.fileName)} onPreview={() => window.open(file.url, '_blank')} index={index} />))}
                    </div>
                  </div>
                )}
                {(item.attachmentAttachments?.length || 0) > 0 && (
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-emerald-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3"><IoDocumentAttach className="text-emerald-600 w-4 h-4 sm:w-5 sm:h-5" /><span>Additional Attachments ({item.attachmentAttachments?.length || 0})</span></h3>
                      <button onClick={() => downloadMultipleFiles(item.attachmentAttachments?.map(file => ({ url: file.url, fileName: file.fileName || file.name || 'file', fileType: file.fileType, extension: file.extension })) || [])} className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-bold shadow-md flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap"><IoCloudDownload className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /><span className="hidden sm:inline">Download All</span><span className="inline sm:hidden">Download</span></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      {item.attachmentAttachments?.map((file, index) => (<FilePreviewCard key={index} file={file} onDownload={() => downloadFile(file.url, file.fileName)} onPreview={() => window.open(file.url, '_blank')} index={index} />))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 sm:pt-4 border-t border-gray-200">
            <button onClick={onClose} className="flex items-center justify-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold text-xs sm:text-sm"><IoClose className="shrink-0 w-4 h-4" /><span>Close</span></button>
            <button onClick={() => onDownload?.(item)} className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold text-xs sm:text-sm shadow-md"><IoCloudDownload className="shrink-0 w-4 h-4" /><span>Download</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function ModernResourcesAssignmentsView({
  student,
  assignments: assignmentsProp = [],
  resources: resourcesProp = [],
  assignmentsLoading: assignmentsLoadingProp = false,
  resourcesLoading: resourcesLoadingProp = false,
  onRefresh,
  isRefreshing = false,
  onDownload,
  onViewDetails
}) {
  const [activeTab, setActiveTab] = useState('assignments');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedResourceType, setSelectedResourceType] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [resources, setResources] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [stats, setStats] = useState({ totalAssignments: 0, totalResources: 0, assignmentFiles: 0, resourceFiles: 0 });

  const matchesStudentClass = useCallback((itemClassName) => {
    if (!student || !student.form) return true;
    return itemClassName === student.form;
  }, [student]);

  const fetchAssignments = useCallback(async () => {
    setAssignmentsLoading(true);
    try {
      const response = await fetch('/api/assignment');
      const data = await response.json();
      if (data.success) {
        let filteredAssignments = data.assignments || [];
        if (student && student.form) filteredAssignments = filteredAssignments.filter(assignment => matchesStudentClass(assignment.className));
        const processedAssignments = filteredAssignments.map((assignment) => ({
          ...assignment,
          assignmentFileAttachments: (assignment.assignmentFiles || []).map((url) => ({ ...extractFileInfoFromUrl(url), url })),
          attachmentAttachments: (assignment.attachments || []).map((url) => ({ ...extractFileInfoFromUrl(url), url }))
        }));
        setAssignments(processedAssignments);
      } else setAssignments([]);
    } catch (error) { console.error('Error fetching assignments:', error); setAssignments([]); }
    finally { setAssignmentsLoading(false); }
  }, [student, matchesStudentClass]);

  const fetchResources = useCallback(async () => {
    setResourcesLoading(true);
    try {
      const response = await fetch('/api/resources');
      const data = await response.json();
      if (data.success) {
        let filteredResources = data.resources || [];
        if (student && student.form) filteredResources = filteredResources.filter(resource => matchesStudentClass(resource.className));
        const processedResources = filteredResources.map((resource) => ({
          ...resource,
          files: (resource.files || []).map(file => ({ ...file, url: file.url, name: file.name || 'Untitled', extension: file.extension || (file.name ? file.name.split('.').pop()?.toLowerCase() : ''), fileType: file.fileType || resource.type || 'document' }))
        }));
        setResources(processedResources);
      } else setResources([]);
    } catch (error) { console.error('Error fetching resources:', error); setResources([]); }
    finally { setResourcesLoading(false); }
  }, [student, matchesStudentClass]);

  useEffect(() => {
    let filteredAssignments = Array.isArray(assignmentsProp) ? assignmentsProp : [];
    if (student && student.form) filteredAssignments = filteredAssignments.filter(assignment => matchesStudentClass(assignment.className));
    setAssignments(filteredAssignments.map((assignment) => ({
      ...assignment,
      assignmentFileAttachments: (assignment.assignmentFiles || []).map((url) => ({ ...extractFileInfoFromUrl(url), url })),
      attachmentAttachments: (assignment.attachments || []).map((url) => ({ ...extractFileInfoFromUrl(url), url }))
    })));
  }, [assignmentsProp, student, matchesStudentClass]);

  useEffect(() => {
    let filteredResources = Array.isArray(resourcesProp) ? resourcesProp : [];
    if (student && student.form) filteredResources = filteredResources.filter(resource => matchesStudentClass(resource.className));
    setResources(filteredResources.map((resource) => ({
      ...resource,
      files: (resource.files || []).map(file => ({ ...file, url: file.url, name: file.name || 'Untitled', extension: file.extension || (file.name ? file.name.split('.').pop()?.toLowerCase() : ''), fileType: file.fileType || resource.type || 'document' }))
    })));
  }, [resourcesProp, student, matchesStudentClass]);

  useEffect(() => {
    if (onRefresh || assignmentsProp.length > 0 || resourcesProp.length > 0) return;
    fetchAssignments();
    fetchResources();
  }, [fetchAssignments, fetchResources, onRefresh, assignmentsProp.length, resourcesProp.length]);

  useEffect(() => {
    setStats({
      totalAssignments: assignments.length,
      totalResources: resources.length,
      assignmentFiles: assignments.reduce((total, item) => total + (item.assignmentFileAttachments?.length || 0) + (item.attachmentAttachments?.length || 0), 0),
      resourceFiles: resources.reduce((total, item) => total + (item.files?.length || 0), 0)
    });
  }, [assignments, resources]);

  const classes = useMemo(() => {
    const items = activeTab === 'assignments' ? assignments : resources;
    return ['all', ...new Set(items.map(item => item.className).filter(Boolean))];
  }, [assignments, resources, activeTab]);

  const subjects = useMemo(() => {
    const items = activeTab === 'assignments' ? assignments : resources;
    return ['all', ...new Set(items.map(item => item.subject).filter(Boolean))];
  }, [assignments, resources, activeTab]);

  const statuses = [
    { id: 'all', label: 'All Status' }, { id: 'assigned', label: 'Assigned' }, { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' }, { id: 'reviewed', label: 'Reviewed' }, { id: 'overdue', label: 'Overdue' }
  ];

  const resourceTypes = useMemo(() => {
    const uniqueTypes = ['all', ...new Set(resources.map(r => r.type).filter(Boolean))];
    return uniqueTypes.map(type => ({ id: type, label: type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1) }));
  }, [resources]);

  const filteredAssignments = useMemo(() => {
    let filtered = assignments.filter(assignment => {
      const matchesClass = selectedClass === 'all' || assignment.className === selectedClass;
      const matchesSubject = selectedSubject === 'all' || assignment.subject === selectedSubject;
      const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || assignment.title?.toLowerCase().includes(searchLower) || assignment.description?.toLowerCase().includes(searchLower) || assignment.subject?.toLowerCase().includes(searchLower) || assignment.teacher?.toLowerCase().includes(searchLower);
      return matchesClass && matchesSubject && matchesStatus && matchesSearch;
    });
    return filtered.sort((a, b) => a.dueDate && b.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : 0);
  }, [assignments, selectedClass, selectedSubject, selectedStatus, searchTerm]);

  const filteredResources = useMemo(() => {
    let filtered = resources.filter(resource => {
      const matchesType = selectedResourceType === 'all' || resource.type === selectedResourceType;
      const matchesClass = selectedClass === 'all' || resource.className === selectedClass;
      const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || resource.title?.toLowerCase().includes(searchLower) || resource.description?.toLowerCase().includes(searchLower) || resource.subject?.toLowerCase().includes(searchLower);
      return matchesType && matchesClass && matchesSubject && matchesSearch;
    });
    return filtered.sort((a, b) => a.createdAt && b.createdAt ? new Date(b.createdAt) - new Date(a.createdAt) : 0);
  }, [resources, selectedResourceType, selectedClass, selectedSubject, searchTerm]);

  const handleDownload = useCallback((item) => {
    if (activeTab === 'resources') {
      if (item.files && item.files.length > 0) {
        if (item.files.length === 1) downloadFile(item.files[0].url, item.files[0].name);
        else downloadMultipleFiles(item.files.map(file => ({ url: file.url, fileName: file.name })));
      }
    } else {
      const allFiles = [...(item.assignmentFileAttachments || []), ...(item.attachmentAttachments || [])];
      if (allFiles.length === 1) downloadFile(allFiles[0].url, allFiles[0].fileName);
      else downloadMultipleFiles(allFiles);
    }
    onDownload?.(item);
  }, [activeTab, onDownload]);

  const handleDownloadAll = useCallback(() => {
    const items = activeTab === 'assignments' ? filteredAssignments : filteredResources;
    const allFiles = [];
    items.forEach(item => {
      if (activeTab === 'resources' && item.files) item.files.forEach(file => allFiles.push({ url: file.url, fileName: file.name }));
      else if (activeTab === 'assignments') {
        (item.assignmentFileAttachments || []).forEach(file => allFiles.push({ url: file.url, fileName: file.fileName }));
        (item.attachmentAttachments || []).forEach(file => allFiles.push({ url: file.url, fileName: file.fileName }));
      }
    });
    if (allFiles.length > 0) downloadMultipleFiles(allFiles);
    else alert('No files available for download');
  }, [activeTab, filteredAssignments, filteredResources]);

  const clearFilters = useCallback(() => {
    setSelectedClass('all'); setSelectedSubject('all'); setSelectedStatus('all'); setSelectedResourceType('all'); setSearchTerm('');
  }, []);

  const isLoading = assignmentsLoading || resourcesLoading || assignmentsLoadingProp || resourcesLoadingProp || isRefreshing;
  if (isLoading && assignments.length === 0 && resources.length === 0) return <LoadingSpinner />;

  const currentItems = activeTab === 'assignments' ? filteredAssignments : filteredResources;
  const totalItems = activeTab === 'assignments' ? assignments.length : resources.length;
  const filteredCount = currentItems.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-2 sm:p-4 md:p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-3xl p-4 sm:p-6 md:p-8 text-white overflow-hidden mb-4 sm:mb-6 md:mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-950/20 rounded-full -ml-24 -mb-24 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-2xl"><IoDocumentsOutline className="text-xl sm:text-2xl text-yellow-300" /></div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Learning Hub</h1>
              </div>
              <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
                Access assignments, resources, and study materials all in one place
                {student && <span className="ml-2 text-yellow-300 font-bold">({student.form} {student.stream})</span>}
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button onClick={async () => { if (onRefresh) await onRefresh(); else if (activeTab === 'assignments') await fetchAssignments(); else await fetchResources(); }} disabled={isRefreshing || assignmentsLoadingProp || resourcesLoadingProp} className="px-4 py-2 sm:px-5 sm:py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"><FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} /><span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span></button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        <StatsCard title="Total Assignments" value={stats.totalAssignments} icon={IoDocument} color="from-blue-950 to-blue-800" trend={0} description="From teachers" />
        <StatsCard title="Learning Resources" value={stats.totalResources} icon={IoDocumentsOutline} color="from-emerald-500 to-teal-600" trend={0} description="Learning materials" />
        <StatsCard title="Assignment Files" value={stats.assignmentFiles} icon={IoDocumentAttach} color="from-amber-500 to-orange-600" trend={0} description="Attached files" />
        <StatsCard title="Resource Files" value={stats.resourceFiles} icon={IoFolderOpen} color="from-slate-600 to-blue-700" trend={0} description="Downloadable files" />
      </div>

      {/* Main Content Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Tabs */}
          <div className="flex bg-gradient-to-r from-gray-50 to-white/50 rounded-2xl p-1 border border-gray-200 overflow-hidden">
            <button onClick={() => setActiveTab('assignments')} className={`flex-1 py-3 sm:py-4 px-2 rounded-xl flex items-center justify-center gap-2 sm:gap-3 ${activeTab === 'assignments' ? 'bg-gradient-to-r from-blue-950 to-blue-800 shadow-lg shadow-blue-950/20 text-white' : 'text-gray-600'}`}>
              <div className="text-left"><div className="text-sm font-bold">Assignments</div><div className={`text-xs ${activeTab === 'assignments' ? 'text-white/80' : 'text-gray-400'}`}>{assignments.length} active</div></div>
            </button>
            <button onClick={() => setActiveTab('resources')} className={`flex-1 py-3 sm:py-4 px-2 rounded-xl flex items-center justify-center gap-2 sm:gap-3 ${activeTab === 'resources' ? 'bg-gradient-to-r from-blue-950 to-blue-800 shadow-lg shadow-blue-950/20 text-white' : 'text-gray-600'}`}>
              <div className="text-left"><div className="text-sm font-bold">Resources</div><div className={`text-xs ${activeTab === 'resources' ? 'text-white/80' : 'text-gray-400'}`}>{resources.length} files</div></div>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={`Search ${activeTab === 'assignments' ? 'assignments...' : 'resources...'}`} className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 bg-white/80 backdrop-blur-sm rounded-2xl focus:outline-none focus:border-blue-500 placeholder:text-gray-400" />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400"><IoClose className="text-base sm:text-lg" /></button>}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`p-2.5 sm:p-3 rounded-2xl border ${showAdvancedFilters ? 'bg-gradient-to-r from-blue-50 to-slate-50 border-blue-200 text-blue-900 shadow-lg shadow-blue-500/10' : 'bg-white border-gray-200 text-gray-600'}`}><IoFilter className="text-lg sm:text-xl" /></button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="pt-4 sm:pt-6 border-t border-gray-200 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="space-y-2"><label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2"><IoSchool className="text-blue-500" />Class</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 bg-white rounded-2xl focus:outline-none focus:border-blue-500">{classes.map(cls => <option key={cls} value={cls}>{cls === 'all' ? 'All Classes' : cls}</option>)}</select></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2"><FiBookOpen className="text-blue-900" />Subject</label><select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 bg-white rounded-2xl focus:outline-none focus:border-blue-500">{subjects.map(subject => <option key={subject} value={subject}>{subject === 'all' ? 'All Subjects' : subject}</option>)}</select></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">{activeTab === 'assignments' ? <><FiCheckCircle className="text-emerald-500" />Status</> : <><FiTag className="text-blue-900" />Type</>}</label><select value={activeTab === 'assignments' ? selectedStatus : selectedResourceType} onChange={(e) => activeTab === 'assignments' ? setSelectedStatus(e.target.value) : setSelectedResourceType(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 bg-white rounded-2xl focus:outline-none focus:border-blue-500">{activeTab === 'assignments' ? statuses.map(status => <option key={status.id} value={status.id}>{status.label}</option>) : resourceTypes.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}</select></div>
                    <div className="flex items-end">{(selectedClass !== 'all' || selectedSubject !== 'all' || selectedStatus !== 'all' || selectedResourceType !== 'all' || searchTerm) && <button onClick={clearFilters} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"><IoClose /><span>Clear All</span></button>}</div>
                  </div>
                  {(selectedClass !== 'all' || selectedSubject !== 'all' || selectedStatus !== 'all' || selectedResourceType !== 'all' || searchTerm) && (
                    <div className="flex flex-wrap gap-2"><span className="text-sm text-gray-500">Active filters:</span>{selectedClass !== 'all' && <span className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-bold border border-blue-100"><IoSchool className="text-xs sm:text-sm" />{selectedClass}<button onClick={() => setSelectedClass('all')} className="ml-1 text-blue-500"><IoClose className="text-xs sm:text-sm" /></button></span>}{selectedSubject !== 'all' && <span className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-900 rounded-full text-xs sm:text-sm font-bold border border-blue-100"><FiBookOpen className="text-xs sm:text-sm" />{selectedSubject}<button onClick={() => setSelectedSubject('all')} className="ml-1 text-blue-700"><IoClose className="text-xs sm:text-sm" /></button></span>}{activeTab === 'assignments' && selectedStatus !== 'all' && <span className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs sm:text-sm font-bold border border-emerald-100"><FiCheckCircle className="text-xs sm:text-sm" />{statuses.find(s => s.id === selectedStatus)?.label}<button onClick={() => setSelectedStatus('all')} className="ml-1 text-emerald-500"><IoClose className="text-xs sm:text-sm" /></button></span>}{activeTab === 'resources' && selectedResourceType !== 'all' && <span className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-900 rounded-full text-xs sm:text-sm font-bold border border-blue-100"><FiTag className="text-xs sm:text-sm" />{resourceTypes.find(t => t.id === selectedResourceType)?.label}<button onClick={() => setSelectedResourceType('all')} className="ml-1 text-blue-700"><IoClose className="text-xs sm:text-sm" /></button></span>}</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Table Layout Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-xl p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div><h2 className="text-xl sm:text-2xl font-bold text-gray-900">{activeTab === 'assignments' ? 'Assignments' : 'Learning Resources'}</h2><p className="text-sm sm:text-base text-gray-600">Showing {filteredCount} of {totalItems} items{searchTerm && ` • Search: "${searchTerm}"`}{student && <span className="text-blue-600 font-bold"> • Filtered for {student.form} {student.stream}</span>}</p></div>
          <div className="flex items-center gap-3">{filteredCount > 0 && <button onClick={handleDownloadAll} className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"><IoCloudDownload className="text-sm sm:text-base" /><span>Download All</span></button>}<div className="text-xs sm:text-sm text-gray-500">{isLoading ? 'Loading...' : 'Updated just now'}</div></div>
        </div>

        {filteredCount === 0 && !isLoading ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 sm:py-12 md:py-16">
            <div className="inline-block p-4 sm:p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl mb-4 sm:mb-6"><IoDocumentsOutline className="text-gray-400 text-3xl sm:text-4xl md:text-5xl" /></div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">No {activeTab === 'assignments' ? 'assignments' : 'resources'} found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4 sm:mb-6 text-sm sm:text-base">{searchTerm || selectedClass !== 'all' || selectedSubject !== 'all' || selectedStatus !== 'all' || selectedResourceType !== 'all' ? 'Try adjusting your filters or search terms' : student ? `No ${activeTab === 'assignments' ? 'assignments' : 'resources'} available for ${student.form} ${student.stream}` : `No ${activeTab === 'assignments' ? 'assignments' : 'resources'} available yet`}</p>
            {(searchTerm || selectedClass !== 'all' || selectedSubject !== 'all' || selectedStatus !== 'all' || selectedResourceType !== 'all') && <button onClick={clearFilters} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold shadow-lg">Clear All Filters</button>}
          </motion.div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gradient-to-r from-blue-950 to-blue-900 text-white border-b border-gray-200">
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider">Title</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider hidden sm:table-cell">Subject</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider hidden lg:table-cell">Class</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider">{activeTab === 'assignments' ? 'Due Date' : 'Date Added'}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold uppercase tracking-wider">Files</th>
                  {activeTab === 'assignments' && <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold uppercase tracking-wider hidden md:table-cell">Status</th>}
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <motion.tr key={item.id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-slate-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 sm:px-6 py-4 text-sm sm:text-base font-semibold text-gray-900 max-w-xs"><div className="flex items-center gap-2 sm:gap-3"><div className={`p-2 rounded-lg flex-shrink-0 ${activeTab === 'assignments' ? 'bg-blue-100' : 'bg-green-100'}`}>{activeTab === 'assignments' ? <IoDocument className="text-blue-900" /> : getFileIcon(item.type, item.files?.[0]?.extension, 16)}</div><span className="line-clamp-2">{item.title || 'Untitled'}</span></div></td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 hidden sm:table-cell"><span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-semibold">{item.subject || 'General'}</span></td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 hidden lg:table-cell"><span className="text-xs sm:text-sm font-medium">{item.className || 'All'}</span></td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-700"><span className="text-xs sm:text-sm">{activeTab === 'assignments' ? (item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—') : (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—')}</span></td>
                    <td className="px-4 sm:px-6 py-4 text-center"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 text-xs font-bold">{activeTab === 'assignments' ? ((item.assignmentFileAttachments?.length || 0) + (item.attachmentAttachments?.length || 0)) : (item.files?.length || 0)}</span></td>
                    {activeTab === 'assignments' && <td className="px-4 sm:px-6 py-4 text-center hidden md:table-cell">{item.status && <StatusBadge status={item.status} size="sm" />}</td>}
                    <td className="px-4 sm:px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 sm:gap-3"><button onClick={() => setSelectedItem(item)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200" title="View details"><IoEye className="text-gray-700 text-lg" /></button><button onClick={() => handleDownload(item)} className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200" title="Download files"><IoCloudDownload className="text-blue-700 text-lg" /></button></div></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>{selectedItem && <DetailModal item={selectedItem} type={activeTab} onClose={() => setSelectedItem(null)} onDownload={() => handleDownload(selectedItem)} />}</AnimatePresence>

      <div className="mt-6 text-center text-gray-500 text-xs sm:text-sm"><p>{totalItems} total items • Last updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p><p className="mt-1 sm:mt-2 text-xs">All files are securely stored and downloaded directly from Cloudinary storage</p></div>
    </div>
  );
}