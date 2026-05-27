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
    <div className="group relative bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 md:p-5 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 mt-0.5">
            <div className="text-sm sm:text-base md:text-lg">
              {getCategoryIcon(item.name)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm md:text-base leading-tight">
              {item.name}
            </h4>
            <p className="text-[10px] sm:text-xs md:text-xs text-slate-500 mt-0.5 line-clamp-2">
              {item.description || 'Standard fee'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onInfo(item)}
          className="opacity-0 group-hover:opacity-100 p-1 sm:p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex-shrink-0"
        >
          <FiInfo size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
        </button>
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 gap-2">
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
          <span className="text-[8px] sm:text-[9px] md:text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Amount</span>
          <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 truncate">
            KSh {item.amount?.toLocaleString()}
          </span>
        </div>
        {item.optional && (
          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-amber-50 text-amber-700 rounded-full text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-wider border border-amber-200 flex-shrink-0 whitespace-nowrap">
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
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <IoDocumentTextOutline className="text-blue-600 text-2xl" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{title}</h4>
          {description && (
            <p className="text-sm text-slate-500 mb-3 line-clamp-2">{description}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1">
              <FiFileText className="text-blue-400" size={12} />
              {fileName || 'Document'}
            </span>
            <span className="flex items-center gap-1">
              <FiClock className="text-emerald-400" size={12} />
              {formatFileSize(fileSize)}
            </span>
            <span className="flex items-center gap-1">
              <FiCalendar className="text-purple-400" size={12} />
              {formatDate(uploadDate)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(pdfUrl)}
              className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all"
            >
              <IoEyeOutline size={14} />
              View PDF
            </button>
            <button
              onClick={() => onDownload(pdfUrl, fileName)}
              className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
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
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${classes.bg} ${classes.text} border ${classes.border}`}>
          <Icon size={24} />
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-900 mb-4">
        KSh {total?.toLocaleString()}
      </p>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Items</span>
          <span className="font-bold text-slate-900">{items || 0}</span>
        </div>
      </div>
      
      <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all">
        View Breakdown
        <FiChevronRight size={16} />
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
      <div className="bg-slate-950 p-6 sm:p-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.1]">
                School Fees
              </h1>
              <p className="text-slate-300 text-sm sm:text-lg mt-2 font-medium">
                Transparent fee structure for Katwanyaa Senior School
              </p>
            </div>
            
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-8 sm:py-4 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              {refreshing && <CircularProgress size={18} thickness={5} sx={{ color: "#0f172a" }} />}
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Fee Cards - Day School & Boarding */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Day School Fees */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <IoBusinessOutline size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Day Scholars</h2>
                <p className="text-sm text-slate-500">Annual fees</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-5xl font-black text-slate-900">
                KSh {(documentData?.feesDayAnnualAmount || 0).toLocaleString()}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {documentData?.feesDayDescription || 'Total annual fees for day school'}
              </p>
            </div>

            {documentData?.feesDayDistributionPdf && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewPDF(documentData.feesDayDistributionPdf)}
                  className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  View PDF
                </button>
                <button
                  onClick={() => handleDownloadPDF(documentData.feesDayDistributionPdf, documentData.feesDayPdfName)}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiDownload size={16} />
                  Download
                </button>
              </div>
            )}
          </div>

          {/* Boarding Fees */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <IoBedOutline size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Boarders</h2>
                <p className="text-sm text-slate-500">Annual fees</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-5xl font-black text-slate-900">
                KSh {(documentData?.feesBoardingAnnualAmount || 0).toLocaleString()}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {documentData?.feesBoardingDescription || 'Total annual fees for boarding school'}
              </p>
            </div>

            {documentData?.feesBoardingDistributionPdf && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewPDF(documentData.feesBoardingDistributionPdf)}
                  className="flex-1 py-2 px-4 bg-purple-50 text-purple-600 rounded-lg font-bold text-sm hover:bg-purple-100 transition-colors"
                >
                  View PDF
                </button>
                <button
                  onClick={() => handleDownloadPDF(documentData.feesBoardingDistributionPdf, documentData.feesBoardingPdfName)}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiDownload size={16} />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Latest Admission Letter */}
        {documentData?.admissionFeePdf && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                <MdOutlineAdUnits size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Latest Admission Letter</h2>
                <p className="text-sm text-slate-500">For new students</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleViewPDF(documentData.admissionFeePdf)}
                className="flex-1 py-2 px-4 bg-amber-50 text-amber-600 rounded-lg font-bold text-sm hover:bg-amber-100 transition-colors"
              >
                View
              </button>
              <button
                onClick={() => handleDownloadPDF(documentData.admissionFeePdf, documentData.admissionFeePdfName)}
                className="flex-1 py-2 px-4 bg-amber-600 text-white rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
              >
                <FiDownload size={16} />
                Download
              </button>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-slate-900 text-white rounded-2xl p-6">
          <h2 className="text-2xl font-black mb-4">Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-bold text-slate-300 mb-1">Bank Transfer</p>
              <p className="text-lg font-black">Account: 1234567890</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-bold text-slate-300 mb-1">M-Pesa Paybill</p>
              <p className="text-lg font-black">Business No: 522522</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-bold text-slate-300 mb-1">Account Name</p>
              <p className="text-lg font-black">Katwanyaa Senior School</p>
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