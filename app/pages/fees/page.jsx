'use client';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { 
  FiDownload,
  FiFileText,
  FiCalendar,
  FiClock,
  FiUser,
  FiArrowRight,
  FiShare2,
  FiSearch,
  FiX,
  FiFilter,
  FiRotateCw,
  FiBookmark,
  FiChevronRight,
  FiChevronLeft,
  FiGrid,
  FiList,
  FiExternalLink,
  FiInfo,
  FiDollarSign,
  FiCreditCard,
  FiHome,
  FiBookOpen,
  FiTruck,
  FiHeart,
  FiCheckCircle,
  FiShield,
  FiWifi,
  FiCoffee,
  FiAward
} from 'react-icons/fi';
import { 
  IoNewspaperOutline,
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
  IoShareOutline,
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoEyeOutline,
  IoPrintOutline,
  IoCopyOutline,
  IoCheckmarkCircleOutline,
  IoWalletOutline,
  IoCardOutline,
  IoCashOutline,
  IoReceiptOutline,
  IoPricetagOutline,
  IoSchoolOutline,
  IoBusinessOutline,
  IoRestaurantOutline,
  IoBedOutline,
  IoMedkitOutline,
  IoLibraryOutline
} from 'react-icons/io5';
import { MdOutlineSchool, MdOutlineBoardingSchool, MdOutlineAdUnits } from 'react-icons/md';
import { FaWhatsapp, FaTelegram, FaEnvelope, FaRegCopy } from 'react-icons/fa';
import { CircularProgress, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';

// Modern Modal Component
const ModernModal = ({ children, open, onClose, maxWidth = '800px' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div 
        className="relative bg-white/95 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-white/40"
        style={{ 
          width: '90%',
          maxWidth: maxWidth,
          maxHeight: '90vh'
        }}
      >
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white cursor-pointer border border-gray-200 shadow-sm"
          >
            <FiX className="text-gray-600 w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Fee Breakdown Card Component - FIXED: Better responsive text sizing
const FeeBreakdownCard = ({ item, onInfo }) => {
  const getCategoryIcon = (name) => {
    const icons = {
      'Tuition': <FiBookOpen className="text-blue-600" />,
      'Boarding': <IoBedOutline className="text-purple-600" />,
      'Uniform': <FiTruck className="text-emerald-600" />,
      'Books': <FiFileText className="text-amber-600" />,
      'Medical': <IoMedkitOutline className="text-rose-600" />,
      'Activity': <FiHeart className="text-pink-600" />,
      'Application': <FiCreditCard className="text-indigo-600" />,
      'Registration': <FiUser className="text-cyan-600" />,
      'Acceptance': <FiCheckCircle className="text-green-600" />,
      'Development': <FiHome className="text-orange-600" />,
      'Deposit': <FiDollarSign className="text-teal-600" />
    };
    return icons[name] || <FiDollarSign className="text-slate-600" />;
  };

  return (
    <div className="group relative bg-white rounded-xl sm:rounded-2xl border border-slate-100 p-3 sm:p-4 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0 mt-0.5">
            <div className="text-xs sm:text-sm md:text-base">
              {getCategoryIcon(item.name)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
              {item.name}
            </h4>
            <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
              {item.description || 'Standard fee'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onInfo(item)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex-shrink-0"
        >
          <FiInfo size={14} />
        </button>
      </div>
      
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase whitespace-nowrap">Amount</span>
          <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 truncate">
            KSh {item.amount?.toLocaleString()}
          </span>
        </div>
        {item.optional && (
          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-amber-50 text-amber-700 rounded-full text-[6px] sm:text-[7px] font-black uppercase tracking-wider border border-amber-200 flex-shrink-0 whitespace-nowrap">
            Optional
          </span>
        )}
      </div>
    </div>
  );
};

// PDF Card Component
const PDFCard = ({ title, pdfUrl, fileName, fileSize, uploadDate, description, onDownload, onView }) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 p-3 sm:p-4 md:p-5 hover:shadow-lg transition-all">
      <div className="flex items-start gap-2 sm:gap-4">
        <div className="p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-100 flex-shrink-0">
          <IoDocumentTextOutline className="text-blue-600 text-lg sm:text-2xl" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1 line-clamp-1">{title}</h4>
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 mb-2 sm:mb-3 line-clamp-2">{description}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <FiFileText className="text-blue-400 flex-shrink-0" size={10} />
              <span className="truncate">{fileName || 'Document'}</span>
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <FiClock className="text-emerald-400 flex-shrink-0" size={10} />
              {formatFileSize(fileSize)}
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <FiCalendar className="text-purple-400 flex-shrink-0" size={10} />
              {formatDate(uploadDate)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(pdfUrl)}
              className="flex-1 py-2 sm:py-2.5 bg-slate-900 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 hover:bg-slate-800 active:scale-95 transition-all"
            >
              <IoEyeOutline size={12} className="sm:w-4 sm:h-4" />
              <span>View</span>
            </button>
            <button
              onClick={() => onDownload(pdfUrl, fileName)}
              className="p-2 sm:p-2.5 bg-slate-100 text-slate-700 rounded-lg sm:rounded-xl hover:bg-slate-200 active:scale-95 transition-all flex-shrink-0"
              title="Download"
            >
              <FiDownload size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fee Summary Card
const FeeSummaryCard = ({ title, total, items, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-4 sm:p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${classes.bg} ${classes.text} border ${classes.border}`}>
          <Icon size={20} className="sm:w-6 sm:h-6" />
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Total</span>
      </div>
      
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5 sm:mb-1">{title}</h3>
      <p className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 sm:mb-4">
        KSh {total?.toLocaleString()}
      </p>
      
      <div className="space-y-2 mb-3 sm:mb-4">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-slate-500">Items</span>
          <span className="font-bold text-slate-900">{items || 0}</span>
        </div>
      </div>
      
      <button className="w-full py-2 sm:py-3 bg-slate-900 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 hover:bg-slate-800 active:scale-95 transition-all">
        <span>View Breakdown</span>
        <FiChevronRight size={14} className="sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};

// Main Component
export default function ModernFeesPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const router = useRouter();

  // Fetch document data
  const fetchDocuments = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const response = await fetch('/api/schooldocuments');
      const data = await response.json();
      
      if (data.success) {
        setDocumentData(data.document);
        if (showRefresh) toast.success('Fees data refreshed!');
      } else {
        throw new Error(data.error || 'Failed to load fees data');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load fees information');
    } finally {
      if (showRefresh) setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle PDF download
  const handleDownloadPDF = (url, fileName) => {
    if (!url) {
      toast.error('PDF not available');
      return;
    }
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'fee-structure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  // Handle PDF view
  const handleViewPDF = (url) => {
    if (!url) {
      toast.error('PDF not available');
      return;
    }
    window.open(url, '_blank');
  };

  // Handle refresh
  const refreshData = () => {
    fetchDocuments(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="min-h-[70vh] flex items-center justify-center">
            <Stack spacing={2} alignItems="center">
              <div className="relative flex items-center justify-center scale-90 sm:scale-110">
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={48}
                  thickness={4.5}
                  sx={{ color: '#f1f5f9' }}
                />
                <CircularProgress
                  variant="indeterminate"
                  disableShrink
                  size={48}
                  thickness={4.5}
                  sx={{
                    color: '#0f172a',
                    animationDuration: '1000ms',
                    position: 'absolute',
                  }}
                />
                <div className="absolute">
                  <IoSparkles className="text-blue-600 text-sm animate-pulse" />
                </div>
              </div>
              <div className="text-center px-4">
                <p className="text-slate-900 font-medium text-sm sm:text-base tracking-tight">
                  Loading fee structure...
                </p>
                <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-widest mt-1 font-bold">
                  Katwanyaa Senior School
                </p>
              </div>
            </Stack>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" richColors />

{/* Hero Section */}
<div className="bg-gray-900 p-5 sm:p-8">
  <div className="max-w-7xl mx-auto">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white">
          School Fees
        </h1>
        <p className="text-gray-300 text-sm sm:text-base mt-1">
          Katwanyaa Senior School  fee structure
        </p>
      </div>
      
  <button
  onClick={refreshData}
  disabled={refreshing}
  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition-all disabled:opacity-50 w-fit"
>
  {refreshing && <CircularProgress size={16} thickness={4} sx={{ color: "#111827" }} />}
  <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
</button>
    </div>
  </div>
</div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Fee Cards - Day School & Boarding */}
 <div className="space-y-4">
  {/* Day School Fees */}
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="mb-3">
      <h2 className="text-lg font-semibold text-gray-900">Day Scholars</h2>
      <p className="text-xs text-gray-500">Annual fees</p>
    </div>

    <div className="mb-4">
      <p className="text-3xl font-bold text-gray-900">
        KSh {(documentData?.feesDayAnnualAmount || 0).toLocaleString()}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {documentData?.feesDayDescription || 'Total annual fees for day school'}
      </p>
    </div>

    {documentData?.feesDayDistributionPdf && (
      <div className="flex gap-2">
        <button
          onClick={() => handleViewPDF(documentData.feesDayDistributionPdf)}
          className="flex-1 py-2 px-3 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          View PDF
        </button>
        <button
          onClick={() => handleDownloadPDF(documentData.feesDayDistributionPdf, documentData.feesDayPdfName)}
          className="flex-1 py-2 px-3 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-1"
        >
          <FiDownload size={14} />
          Download
        </button>
      </div>
    )}
  </div>

  {/* Boarding Fees */}
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="mb-3">
      <h2 className="text-lg font-semibold text-gray-900">Boarders</h2>
      <p className="text-xs text-gray-500">Annual fees</p>
    </div>

    <div className="mb-4">
      <p className="text-3xl font-bold text-gray-900">
        KSh {(documentData?.feesBoardingAnnualAmount || 0).toLocaleString()}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {documentData?.feesBoardingDescription || 'Total annual fees for boarding school'}
      </p>
    </div>

    {documentData?.feesBoardingDistributionPdf && (
      <div className="flex gap-2">
        <button
          onClick={() => handleViewPDF(documentData.feesBoardingDistributionPdf)}
          className="flex-1 py-2 px-3 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          View PDF
        </button>
        <button
          onClick={() => handleDownloadPDF(documentData.feesBoardingDistributionPdf, documentData.feesBoardingPdfName)}
          className="flex-1 py-2 px-3 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-1"
        >
          <FiDownload size={14} />
          Download
        </button>
      </div>
    )}
  </div>
</div>

        {/* Latest Admission Letter */}
        {documentData?.admissionFeePdf && (
          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-amber-100 text-amber-600 rounded-lg">
                <MdOutlineAdUnits size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold text-slate-900">Latest Admission Letter</h2>
                <p className="text-xs sm:text-sm text-slate-500">For new students</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleViewPDF(documentData.admissionFeePdf)}
                className="flex-1 py-2 px-3 sm:px-4 bg-amber-50 text-amber-600 rounded-lg font-bold text-xs sm:text-sm hover:bg-amber-100 transition-colors"
              >
                View
              </button>
              <button
                onClick={() => handleDownloadPDF(documentData.admissionFeePdf, documentData.admissionFeePdfName)}
                className="flex-1 py-2 px-3 sm:px-4 bg-amber-600 text-white rounded-lg font-bold text-xs sm:text-sm hover:bg-amber-700 transition-colors flex items-center justify-center gap-1 sm:gap-2"
              >
                <FiDownload size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">DL</span>
              </button>
            </div>
          </div>
        )}

        {/* Payment Info - Complete Payment Methods */}
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-700">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-1 sm:mb-2"> School Fees Payment Methods</h2>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base">Multiple secure payment options available. Choose the method that works best for you.</p>
          </div>

          {/* DIRECT BANK PAYMENTS */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-2xl font-black text-slate-900">🏦 Direct Bank Transfers</h3>
            
            {/* Equity Bank */}
            <div className="bg-white border-2 border-emerald-500 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <IoCardOutline className="text-emerald-700 text-2xl" />
                </div>
                <h4 className="text-xl font-black text-slate-900">Equity Bank</h4>
              </div>
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="font-bold">Account Name:</span>
                  <span className="text-slate-900 font-semibold">KATWANYAA SECONDARY SCHOOL</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="font-bold">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-mono text-lg font-black">0900263541203</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('0900263541203');
                        toast.success('Account number copied!');
                      }}
                      className="p-1 hover:bg-emerald-50 rounded transition-colors"
                      title="Copy account number"
                    >
                      <IoCopyOutline className="text-emerald-600" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold">Branch:</span>
                  <span className="text-slate-900 font-semibold">TALA</span>
                </div>
              </div>
            </div>

            {/* KCB Bank */}
            <div className="bg-white border-2 border-blue-500 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <IoCardOutline className="text-blue-700 text-2xl" />
                </div>
                <h4 className="text-xl font-black text-slate-900">Kenya Commercial Bank (KCB)</h4>
              </div>
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="font-bold">Account Name:</span>
                  <span className="text-slate-900 font-semibold">KATWANYAA SECONDARY SCHOOL</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="font-bold">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-mono text-lg font-black">1107286352</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('1107286352');
                        toast.success('Account number copied!');
                      }}
                      className="p-1 hover:bg-blue-50 rounded transition-colors"
                      title="Copy account number"
                    >
                      <IoCopyOutline className="text-blue-600" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold">Branch:</span>
                  <span className="text-slate-900 font-semibold">TALA</span>
                </div>
              </div>
            </div>
          </div>

          {/* M-PESA PAYMENT - PRIMARY METHOD */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 p-3 rounded-lg text-white">
                <IoCashOutline className="text-2xl" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">📱 M-PESA Payment (Primary Method)</h3>
                <p className="text-green-700 text-sm font-bold">Business Number: <span className="font-mono">522123</span> (KCB Pay Bill)</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 space-y-4 border border-green-200">
              <h4 className="text-lg font-black text-slate-900 mb-4">Steps to Pay via M-PESA:</h4>
              
              <div className="space-y-3">
                {[
                  { step: 1, action: "Go to M-PESA menu", icon: "📱" },
                  { step: 2, action: "Select **Pay Bill**", icon: "💳" },
                  { step: 3, action: "Enter Business Number: **522123**", icon: "🏦" },
                  { 
                    step: 4, 
                    action: "Enter Account/School Code in this format:\n**34997K[StudentName][AdmNo]**\n\nExample: 34997KMUTUA2",
                    icon: "📝",
                    highlight: true
                  },
                  { step: 5, action: "Enter payment amount", icon: "💰" },
                  { step: 6, action: "Enter your M-PESA PIN to confirm", icon: "🔐" }
                ].map((item) => (
                  <div key={item.step} className={`flex gap-4 ${item.highlight ? 'bg-amber-50 p-4 rounded-lg border-2 border-amber-300' : ''}`}>
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-slate-700 whitespace-pre-wrap">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* School Code Format Box */}
              <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 mt-6">
                <h5 className="font-black text-amber-900 mb-3">⚠️ CRITICAL: Account Code Format</h5>
                <div className="space-y-2 text-sm text-amber-900">
                  <p><span className="font-bold">Format:</span> <span className="font-mono bg-white px-2 py-1 rounded">34997K[StudentName][AdmNo]</span></p>
                  <p><span className="font-bold">✅ Correct:</span> <span className="font-mono bg-white px-2 py-1 rounded">34997KMUTUA2</span> (Single name + admission number)</p>
                  <p><span className="font-bold">❌ Wrong:</span> <span className="font-mono bg-white px-2 py-1 rounded">34997KJohnMutua2</span> (Two names)</p>
                  <p><span className="font-bold">❌ Wrong:</span> <span className="font-mono bg-white px-2 py-1 rounded">34997KJohn Form2</span> (Class name included)</p>
                  <div className="mt-3 pt-3 border-t-2 border-amber-200">
                    <p className="font-bold">⚡ Key Points:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>School Code: <span className="font-mono font-black">34997K</span> (always the same)</li>
                      <li>Use <strong>only ONE name</strong> (e.g., "MUTUA" not "JOHN MUTUA")</li>
                      <li>Add admission number directly after name</li>
                      <li>Do NOT include class/form name</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ALTERNATIVE PAYMENT METHODS */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-slate-900">📜 Alternative Payment Methods</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border-2 border-purple-400 rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <IoDocumentTextOutline className="text-purple-700 text-2xl" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">Banker's Cheque</h4>
                </div>
                <p className="text-slate-700">
                  <span className="font-bold">Payable to:</span><br/>
                  <span className="text-slate-900 font-semibold">KATWANYAA SECONDARY SCHOOL</span>
                </p>
              </div>

              <div className="bg-white border-2 border-indigo-400 rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <IoReceiptOutline className="text-indigo-700 text-2xl" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">Postal Money Order</h4>
                </div>
                <p className="text-slate-700">
                  <span className="font-bold">Payable to:</span><br/>
                  <span className="text-slate-900 font-semibold">KATWANYAA SECONDARY SCHOOL</span>
                </p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
            <div className="flex gap-3 items-start">
              <FiInfo className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div className="space-y-2">
                <h4 className="font-black text-blue-900 text-lg">📋 Important Notes</h4>
                <ul className="space-y-1 text-blue-900 text-sm">
                  <li>✓ Fees must be paid through the listed channels only</li>
                  <li>✓ M-PESA is the quickest and most convenient method</li>
                  <li>✓ Always use the correct school code format for M-PESA payments</li>
                  <li>✓ Keep payment receipts for your records</li>
                  <li>✓ For payment plans or inquiries, contact our finance office</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Need Help?</h3>
            <p className="text-slate-600">Contact our finance office for payment plans</p>
          </div>
          <button
            onClick={() => router.push("/pages/contact")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}