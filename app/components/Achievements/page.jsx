'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import {
  FaTrophy, FaEdit, FaTrash, FaPlus, FaTimes, FaSave,
  FaImage, FaStar, FaMedal,
  FaGraduationCap, FaFutbol, FaPalette, FaUsersCog,
  FaChartLine, FaBullseye, FaQuoteRight, FaSync,
  FaEyeSlash, FaSearch
} from 'react-icons/fa';
import { CircularProgress, Modal, Box, TextareaAutosize } from '@mui/material';

// ==================== LOADING SPINNER ====================
function ModernLoadingSpinner({ message = "Loading achievements...", size = "medium" }) {
  const sizes = {
    small: { outer: 48, inner: 24 },
    medium: { outer: 64, inner: 32 },
    large: { outer: 80, inner: 40 }
  };

  const { outer, inner } = sizes[size];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-green-50/30 to-yellow-50/20 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative inline-block">
          <CircularProgress 
            size={outer} 
            thickness={5}
            className="text-green-600"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-r from-green-500 to-yellow-600 rounded-full animate-ping opacity-25"
                 style={{ width: inner, height: inner }}></div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <span className="block text-lg font-bold text-gray-800">{message}</span>
          <div className="flex justify-center space-x-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-green-500 rounded-full animate-bounce" 
                   style={{ animationDelay: `${i * 0.15}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== TAG INPUT COMPONENT ====================
function TagInput({ label, tags, onTagsChange, placeholder = "Type and press Enter..." }) {
  const [inputValue, setInputValue] = useState('');

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTags = [...tags, inputValue.trim()];
      onTagsChange(newTags);
      setInputValue('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onTagsChange(newTags);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white text-sm font-bold"
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          Press Enter to add
        </span>
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-3 py-2 rounded-lg border border-green-200 text-sm font-bold"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(index)}
                className="ml-1 text-green-500 hover:text-green-700 transition-colors"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== IMAGE UPLOAD COMPONENT ====================
function ImageUpload({ images, onImagesChange, maxImages = 5 }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images];
    
    files.forEach(file => {
      if (newImages.length >= maxImages) {
        toast.warning(`Maximum ${maxImages} images allowed`);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      const preview = URL.createObjectURL(file);
      newImages.push({
        file,
        preview,
        caption: ''
      });
    });
    
    onImagesChange(newImages);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    if (newImages[index].preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const handleCaptionChange = (index, caption) => {
    const newImages = [...images];
    newImages[index].caption = caption;
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-gray-700">Images ({images.length}/{maxImages})</label>
      
      <div
        className={`border-3 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer ${
          dragOver 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-green-400 bg-gray-50/50'
        } ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (images.length < maxImages) {
            const files = Array.from(e.dataTransfer.files);
            handleFileSelect({ target: { files } });
          }
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => images.length < maxImages && fileInputRef.current?.click()}
      >
        <FaImage className="mx-auto text-4xl text-gray-400 mb-2" />
        <p className="text-gray-700 font-bold">Click or drag to upload images</p>
        <p className="text-sm text-gray-500">PNG, JPG, JPEG (Max 5MB each)</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={images.length >= maxImages}
        />
      </div>
      
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.preview || image.url}
                alt={image.caption || 'Achievement image'}
                className="w-full h-32 object-contain rounded-lg border border-gray-200 bg-slate-100 p-1"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-teal-500 text-white rounded-full p-1 hover:bg-teal-600 transition"
              >
                <FaTimes className="w-3 h-3" />
              </button>
              <input
                type="text"
                value={image.caption || ''}
                onChange={(e) => handleCaptionChange(index, e.target.value)}
                placeholder="Caption"
                className="w-full mt-1 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-green-500"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== ACHIEVEMENT MODAL ====================
function AchievementModal({ onClose, onSave, achievement, loading }) {
  const isEditMode = !!achievement;
  const [formData, setFormData] = useState({
    title: achievement?.title || '',
    description: achievement?.description || '',
    category: achievement?.category || 'Academic',
    year: achievement?.year?.toString() || new Date().getFullYear().toString(),
    awardingBody: achievement?.awardingBody || '',
    recipients: achievement?.recipients || [],
    featured: achievement?.featured ?? achievement?.featuteal ?? false,
    isActive: achievement?.isActive !== false,
    displayOrder: achievement?.displayOrder?.toString() || '0',
    achievedDate: achievement?.achievedDate ? new Date(achievement.achievedDate).toISOString().split('T')[0] : ''
  });
  
  const [images, setImages] = useState(() => {
    if (achievement?.images) {
      return achievement.images.map(img => ({
        ...img,
        preview: img.url
      }));
    }
    return [];
  });
  
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const categories = ['Academic', 'Sports', 'Arts', 'Leadership', 'Environment', 'Other'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.year) {
      toast.error('Please fill in all requiteal fields');
      return;
    }
    
    setActionLoading(true);
    
    try {
      const adminToken = localStorage.getItem('admin_token');
      const deviceToken = localStorage.getItem('device_token');
      
      if (!adminToken || !deviceToken) {
        throw new Error('Authentication requiteal. Please login again.');
      }
      
      const formDataObj = new FormData();
      
      if (isEditMode) {
        formDataObj.append('id', achievement.id);
      }
      
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('category', formData.category);
      formDataObj.append('year', formData.year);
      formDataObj.append('awardingBody', formData.awardingBody);
      formDataObj.append('recipients', JSON.stringify(formData.recipients));
      formDataObj.append('featured', formData.featured);
      formDataObj.append('isActive', formData.isActive);
      formDataObj.append('displayOrder', formData.displayOrder);
      formDataObj.append('achievedDate', formData.achievedDate);
      
      // Add new images
      images.forEach(img => {
        if (img.file) {
          formDataObj.append('images', img.file);
        }
      });
      
      // Handle existing images
      if (isEditMode) {
        formDataObj.append('keepExistingImages', 'true');
        if (imagesToDelete.length > 0) {
          formDataObj.append('imagesToDelete', JSON.stringify(imagesToDelete));
        }
      }
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch('/api/achievements', {
        method,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-device-token': deviceToken
        },
        body: formDataObj
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expiteal. Please login again.');
        }
        throw new Error(data.error || 'Failed to save achievement');
      }
      
      toast.success(data.message);
      onSave(data.achievement);
      onClose();
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95vw', maxWidth: '700px', maxHeight: '90vh',
        bgcolor: 'background.paper', borderRadius: 3, boxShadow: 24,
        overflow: 'hidden', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div className="bg-gradient-to-r from-green-600 to-yellow-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaTrophy className="text-2xl" />
              <h2 className="text-xl font-bold">{isEditMode ? 'Edit Achievement' : 'Add Achievement'}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>
        
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Title <span className="text-teal-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., National Science Fair Winner"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  requiteal
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Category <span className="text-teal-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  requiteal
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Year <span className="text-teal-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  requiteal
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <TextareaAutosize
                  minRows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe the achievement..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Awarding Body</label>
                <input
                  type="text"
                  value={formData.awardingBody}
                  onChange={(e) => handleChange('awardingBody', e.target.value)}
                  placeholder="e.g., Kenya Science Association"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Achievement Date</label>
                <input
                  type="date"
                  value={formData.achievedDate}
                  onChange={(e) => handleChange('achievedDate', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="col-span-2">
                <TagInput
                  label="Recipients"
                  tags={formData.recipients}
                  onTagsChange={(tags) => handleChange('recipients', tags)}
                  placeholder="Type recipient name and press Enter..."
                />
              </div>
              
              <div className="col-span-2">
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxImages={5}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => handleChange('displayOrder', e.target.value)}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="flex items-center gap-4 pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleChange('featured', e.target.checked)}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm font-bold text-gray-700">Featured</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm font-bold text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-yellow-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-yellow-700 transition font-bold disabled:opacity-50"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <CircularProgress size={16} className="text-white" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FaSave />
                    {isEditMode ? 'Update' : 'Create'} Achievement
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}

// ==================== SCHOOL STATS MODAL ====================
function SchoolStatsModal({ onClose, onSave, stats, loading }) {
  const [formData, setFormData] = useState({
    meanScore: stats?.meanScore?.toString() || '',
    lastYearMean: stats?.lastYearMean?.toString() || '',
    targetMean: stats?.targetMean?.toString() || '',
    slogan: stats?.slogan || '',
    sloganDescription: stats?.sloganDescription || '',
    sloganAuthor: stats?.sloganAuthor || ''
  });
  
  const [actionLoading, setActionLoading] = useState(false);
  const isEditMode = !!stats;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    
    try {
      const adminToken = localStorage.getItem('admin_token');
      const deviceToken = localStorage.getItem('device_token');
      
      if (!adminToken || !deviceToken) {
        throw new Error('Authentication requiteal. Please login again.');
      }
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch('/api/school-stats', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'x-device-token': deviceToken
        },
        body: JSON.stringify({
          meanScore: formData.meanScore ? parseFloat(formData.meanScore) : null,
          lastYearMean: formData.lastYearMean ? parseFloat(formData.lastYearMean) : null,
          targetMean: formData.targetMean ? parseFloat(formData.targetMean) : null,
          slogan: formData.slogan || null,
          sloganDescription: formData.sloganDescription || null,
          sloganAuthor: formData.sloganAuthor || null
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expiteal. Please login again.');
        }
        throw new Error(data.error || 'Failed to save school stats');
      }
      
      toast.success(data.message);
      onSave(data.stats);
      onClose();
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95vw', maxWidth: '500px', maxHeight: '90vh',
        bgcolor: 'background.paper', borderRadius: 3, boxShadow: 24,
        overflow: 'hidden', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaChartLine className="text-2xl" />
              <h2 className="text-xl font-bold">{isEditMode ? 'Edit School Stats' : 'Set School Stats'}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>
        
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FaChartLine className="inline mr-2 text-emerald-600" />
                Current Mean Score
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.meanScore}
                onChange={(e) => handleChange('meanScore', e.target.value)}
                placeholder="e.g., 8.75"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Last Year Mean
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lastYearMean}
                  onChange={(e) => handleChange('lastYearMean', e.target.value)}
                  placeholder="e.g., 8.25"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <FaBullseye className="inline mr-2 text-emerald-600" />
                  Target Mean
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetMean}
                  onChange={(e) => handleChange('targetMean', e.target.value)}
                  placeholder="e.g., 9.00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FaQuoteRight className="inline mr-2 text-emerald-600" />
                School Slogan
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => handleChange('slogan', e.target.value)}
                placeholder="e.g., Strive for Excellence"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Slogan Description</label>
              <TextareaAutosize
                minRows={2}
                value={formData.sloganDescription}
                onChange={(e) => handleChange('sloganDescription', e.target.value)}
                placeholder="Explain the meaning of the slogan..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Slogan Author</label>
              <input
                type="text"
                value={formData.sloganAuthor}
                onChange={(e) => handleChange('sloganAuthor', e.target.value)}
                placeholder="e.g., School Administrator"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition font-bold disabled:opacity-50"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <CircularProgress size={16} className="text-white" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FaSave />
                    {isEditMode ? 'Update' : 'Save'} Stats
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </Box>
    </Modal>
  );
}

// ==================== DELETE CONFIRMATION MODAL ====================
function DeleteConfirmationModal({ onClose, onConfirm, title, loading }) {
  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95vw', maxWidth: '400px',
        bgcolor: 'background.paper', borderRadius: 3, boxShadow: 24,
        overflow: 'hidden'
      }}>
        <div className="bg-gradient-to-r from-teal-600 to-teal-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <FaTrash className="text-xl" />
            <h2 className="text-lg font-bold">Confirm Deletion</h2>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete <span className="font-bold">"{title}"</span>? This action cannot be undone.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-bold"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-teal-600 to-teal-600 text-white px-4 py-3 rounded-xl hover:from-teal-700 hover:to-teal-700 transition font-bold disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <CircularProgress size={16} className="text-white" />
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

// ==================== MAIN COMPONENT ====================
export default function AchievementsPage() {
  const [achievements, setAchievements] = useState({
    Academic: [], Sports: [], Arts: [], Leadership: [], Environment: [], Other: []
  });
  const [schoolStats, setSchoolStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const categoryIcons = {
    Academic: FaGraduationCap,
    Sports: FaFutbol,
    Arts: FaPalette,
    Leadership: FaUsersCog,
    Environment: FaMedal,
    Other: FaMedal
  };

  const categoryColors = {
    Academic: 'from-blue-600 to-cyan-600',
    Sports: 'from-green-600 to-emerald-600',
    Arts: 'from-purple-600 to-pink-600',
    Leadership: 'from-green-600 to-teal-600',
    Environment: 'from-lime-600 to-emerald-600',
    Other: 'from-gray-600 to-slate-600'
  };

  const getAchievementTime = (achievement) => {
    const fallbackYear = achievement?.year ? `${achievement.year}-01-01` : '';
    const value = achievement?.achievedDate || achievement?.createdAt || fallbackYear;
    const parsed = value ? new Date(value).getTime() : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const getAchievementImage = (achievement) => {
    const firstImage = Array.isArray(achievement?.images) ? achievement.images[0] : null;
    return firstImage?.url || firstImage?.preview || '/MatG.jpg';
  };

  const getAchievementDate = (achievement) => {
    if (achievement?.achievedDate) {
      return new Date(achievement.achievedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return achievement?.year || 'Not set';
  };

  const getCategoryStyle = (category) => {
    const styles = {
      Academic: 'bg-blue-50 text-blue-700 border-blue-100',
      Sports: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      Arts: 'bg-purple-50 text-purple-700 border-purple-100',
      Leadership: 'bg-teal-50 text-teal-700 border-teal-100',
      Environment: 'bg-lime-50 text-lime-700 border-lime-100',
      Other: 'bg-slate-50 text-slate-700 border-slate-100'
    };
    return styles[category] || styles.Other;
  };

  const allAchievements = useMemo(() => {
    return Object.values(achievements || {})
      .flat()
      .filter(Boolean)
      .sort((a, b) => {
        const orderA = Number(a.displayOrder ?? 999);
        const orderB = Number(b.displayOrder ?? 999);
        if (orderA !== orderB) return orderA - orderB;
        return getAchievementTime(b) - getAchievementTime(a);
      });
  }, [achievements]);

  const categoryOptions = useMemo(() => {
    return ['all', ...new Set(allAchievements.map(item => item.category || 'Other'))];
  }, [allAchievements]);

  const filteredAchievements = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return allAchievements.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || (item.category || 'Other') === selectedCategory;
      const matchesSearch = !query || [
        item.title,
        item.description,
        item.awardingBody,
        item.category,
        item.year,
        ...(Array.isArray(item.recipients) ? item.recipients : [])
      ].filter(Boolean).join(' ').toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [allAchievements, searchTerm, selectedCategory]);

  const categorySummaries = useMemo(() => {
    return categoryOptions
      .filter(category => category !== 'all')
      .map(category => ({
        category,
        count: allAchievements.filter(item => (item.category || 'Other') === category).length
      }));
  }, [allAchievements, categoryOptions]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load achievements
      const achievementsRes = await fetch('/api/achievements');
      const achievementsData = await achievementsRes.json();
      
      if (achievementsData.success) {
        setAchievements(achievementsData.achievements);
      }
      
      // Load school stats
      const statsRes = await fetch('/api/school-stats');
      const statsData = await statsRes.json();
      
      if (statsData.success) {
        setSchoolStats(statsData.stats);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSaveAchievement = (achievement) => {
    loadData();
  };

  const handleSaveStats = (stats) => {
    setSchoolStats(stats);
  };

  const handleDeleteClick = (id, title) => {
    setDeleteId(id);
    setDeleteTitle(title);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      const deviceToken = localStorage.getItem('device_token');
      
      if (!adminToken || !deviceToken) {
        throw new Error('Authentication requiteal. Please login again.');
      }
      
      const response = await fetch(`/api/achievements?id=${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-device-token': deviceToken
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete achievement');
      }
      
      toast.success('Achievement deleted successfully');
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteTitle('');
      loadData();
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message);
    }
  };

  if (loading && allAchievements.length === 0) {
    return <ModernLoadingSpinner message="Loading achievements..." />;
  }

  const totalAchievements = allAchievements.length;
  const featuredCount = allAchievements.filter(item => item.featured).length;
  const activeCount = allAchievements.filter(item => item.isActive !== false).length;
  const latestAchievement = allAchievements[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-yellow-50 p-4 md:p-6">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <div className="group relative mb-8 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-teal-800 via-emerald-800 to-green-800 p-6 md:p-8 shadow-xl sm:shadow-2xl">
        {/* Abstract Gradient Orbs */}
        <div className="absolute top-[-25%] right-[-10%] w-[250px] h-[250px] md:w-[420px] md:h-[420px] bg-gradient-to-br from-emerald-500/30 via-teal-500/20 to-green-500/30 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-25%] left-[-10%] w-[200px] h-[200px] md:w-[340px] md:h-[340px] bg-gradient-to-tr from-teal-500/20 via-emerald-500/10 to-green-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-[30%] right-[20%] w-[180px] h-[180px] bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-full blur-[70px] pointer-events-none animate-pulse" />

        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Shine Effect Overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full pointer-events-none"
          style={{ transform: 'skewX(-20deg)' }}
        />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaTrophy className="text-white text-3xl" />
              <h1 className="text-3xl md:text-4xl font-black text-white">Achievements</h1>
            </div>
            <p className="text-emerald-100/90">Celebrating our school's excellence and success stories</p>
            
            {/* School Slogan */}
            {schoolStats?.slogan && (
              <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 inline-block">
                <FaQuoteRight className="text-emerald-200 mb-2" />
                <p className="text-white text-lg font-bold italic">"{schoolStats.slogan}"</p>
                {schoolStats.sloganAuthor && (
                  <p className="text-emerald-200 text-sm mt-1">— {schoolStats.sloganAuthor}</p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-xl hover:bg-white/30 transition font-bold flex items-center gap-2"
            >
              <FaSync className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            
            <button
              onClick={() => setShowStatsModal(true)}
              className="bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-xl hover:bg-white/30 transition font-bold flex items-center gap-2"
            >
              <FaChartLine />
              {schoolStats ? 'Edit Stats' : 'Set Stats'}
            </button>
            
            <button
              onClick={() => {
                setSelectedAchievement(null);
                setShowAchievementModal(true);
              }}
              className="bg-white text-teal-800 px-6 py-3 rounded-xl hover:bg-teal-50 transition font-bold flex items-center gap-2 shadow-lg"
            >
              <FaPlus />
              Add Achievement
            </button>
          </div>
        </div>
        

      </div>
      
{/* --- MODERN PERFORMANCE METRICS BENTO --- */}
{schoolStats && (schoolStats.meanScore || schoolStats.lastYearMean || schoolStats.targetMean) && (
  <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 mb-10">
    
    {/* Header with Subtitle */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-emerald-600">
          <FaChartLine className="text-xl" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Academic Analytics</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-black">
          Performance <span className="italic text-slate-400">Tracking</span>
        </h2>
      </div>
      
      <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reporting Cycle</p>
        <p className="text-xs font-bold text-slate-700">Annual Academic Audit 2026</p>
      </div>
    </div>

    {/* Bento Grid Layout */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* 1. Last Year Mean (Compact) */}
      {schoolStats.lastYearMean && (
        <div className="md:col-span-3 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col justify-between">
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Prev. Cycle</p>
          <div>
            <p className="text-4xl font-serif font-bold text-slate-800 italic">{schoolStats.lastYearMean}</p>
            <p className="text-[10px] font-bold text-slate-900 mt-1 uppercase">Last Year's Mean Score</p>
          </div>
        </div>
      )}

      {/* 2. Current Mean (Hero Focus) */}
      {schoolStats.meanScore && (
        <div className="md:col-span-5 p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] -z-0" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Active Performance</p>
              {schoolStats.lastYearMean && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
                  schoolStats.meanScore > schoolStats.lastYearMean ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {schoolStats.meanScore > schoolStats.lastYearMean ? '↑' : '↓'}
                  {Math.abs(schoolStats.meanScore - schoolStats.lastYearMean).toFixed(2)}
                </div>
              )}
            </div>

            <div className="mt-8">
              <p className="text-6xl font-serif font-bold tracking-tighter italic">
                {schoolStats.meanScore}
              </p>
              <p className="text-xs font-medium text-slate-800 mt-2">Current Institutional Mean</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Target Mean (Progress View) */}
      {schoolStats.targetMean && (
        <div className="md:col-span-4 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Growth Target</p>
            <p className="text-4xl font-serif font-bold text-emerald-700 mt-2">{schoolStats.targetMean}</p>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-emerald-600 uppercase">Achievement</p>
                <p className="text-lg font-serif font-bold text-emerald-700">
                  {((schoolStats.meanScore / schoolStats.targetMean) * 100).toFixed(1)}%
                </p>
             </div>
             {/* Custom Progress Bar */}
             <div className="h-3 w-full bg-white rounded-full p-1 overflow-hidden border border-emerald-200">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min((schoolStats.meanScore / schoolStats.targetMean) * 100, 100)}%` }}
                />
             </div>
          </div>
        </div>
      )}

    </div>
  </section>
)}
      {/* Achievement Records */}
      {totalAchievements > 0 && (
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">Achievement Records</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">School milestones</h2>
                <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
                  Latest records, featured highlights, status, images, and category information in one cleaner dashboard view.
                </p>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_180px] lg:w-[520px]">
                <div className="relative">
                  <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search achievements..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                >
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{totalAchievements}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Featured</p>
                <p className="mt-1 text-3xl font-black text-amber-700">{featuredCount}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active</p>
                <p className="mt-1 text-3xl font-black text-emerald-700">{activeCount}</p>
              </div>
              <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600">Categories</p>
                <p className="mt-1 text-3xl font-black text-teal-700">{categorySummaries.length}</p>
              </div>
            </div>

            {categorySummaries.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {categorySummaries.map(({ category, count }) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black transition ${getCategoryStyle(category)} ${selectedCategory === category ? 'ring-2 ring-emerald-200' : ''}`}
                  >
                    {category}
                    <span className="rounded-full bg-white/80 px-2 py-0.5">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {latestAchievement && (
            <div className="grid overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:grid-cols-12">
              <div className="relative min-h-[340px] bg-slate-100 lg:col-span-7 lg:min-h-[460px]">
                <img
                  src={getAchievementImage(latestAchievement)}
                  alt={latestAchievement.title}
                  className="h-full w-full object-contain p-4"
                />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">Latest</span>
                  {latestAchievement.featured && (
                    <span className="rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">Featured</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 lg:col-span-5 lg:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getCategoryStyle(latestAchievement.category)}`}>
                      {latestAchievement.category || 'Other'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                      {getAchievementDate(latestAchievement)}
                    </span>
                  </div>
                  <h3 className="mt-5 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                    {latestAchievement.title}
                  </h3>
                  <p className="mt-4 text-sm font-medium leading-6 text-slate-500 line-clamp-5">
                    {latestAchievement.description || 'No description has been added for this achievement yet.'}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Awarding Body</p>
                    <p className="mt-1 truncate text-sm font-black text-slate-800">{latestAchievement.awardingBody || 'School Award'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Recipients</p>
                    <p className="mt-1 text-sm font-black text-slate-800">{latestAchievement.recipients?.length || 0}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 border-t border-slate-100 pt-5">
                  <button
                    onClick={() => {
                      setSelectedAchievement(latestAchievement);
                      setShowAchievementModal(true);
                    }}
                    className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition active:scale-[0.98]"
                  >
                    <FaEdit className="mr-2 inline text-xs" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(latestAchievement.id, latestAchievement.title)}
                    className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-600 transition active:scale-[0.98]"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAchievements.map((achievement) => {
              const Icon = categoryIcons[achievement.category] || FaMedal;
              return (
                <article
                  key={achievement.id}
                  className="flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]"
                >
                  <div className="relative h-[390px] bg-slate-100 sm:h-[410px]">
                    <img
                      src={getAchievementImage(achievement)}
                      alt={achievement.title}
                      className="h-full w-full object-contain p-3"
                    />
                    <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
                      <span className={`rounded-full border bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur ${getCategoryStyle(achievement.category)}`}>
                        {achievement.category || 'Other'}
                      </span>
                      <div className="flex gap-2">
                        {achievement.featured && (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg">
                            <FaStar className="text-xs" />
                          </span>
                        )}
                        {achievement.isActive === false && (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg">
                            <FaEyeSlash className="text-xs" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r ${categoryColors[achievement.category] || categoryColors.Other} text-white shadow-lg`}>
                        <Icon />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{achievement.year || 'Year not set'}</p>
                        <p className="truncate text-xs font-bold text-slate-500">{getAchievementDate(achievement)}</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-black leading-snug text-slate-950 line-clamp-2">{achievement.title}</h3>
                    <p className="mt-2 text-sm font-medium leading-5 text-slate-500 line-clamp-2">
                      {achievement.description || 'No description has been added for this achievement yet.'}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Award</p>
                        <p className="mt-1 truncate text-xs font-black text-slate-800">{achievement.awardingBody || 'School Award'}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">People</p>
                        <p className="mt-1 text-xs font-black text-slate-800">{achievement.recipients?.length || 0} listed</p>
                      </div>
                    </div>

                    <div className="mt-auto flex gap-3 border-t border-slate-100 pt-4">
                      <button
                        onClick={() => {
                          setSelectedAchievement(achievement);
                          setShowAchievementModal(true);
                        }}
                        className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white transition active:scale-[0.98]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(achievement.id, achievement.title)}
                        className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-600 transition active:scale-[0.98]"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center">
              <FaSearch className="mx-auto mb-3 text-3xl text-slate-300" />
              <h3 className="text-lg font-black text-slate-900">No matching achievements</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">Try another search term or category filter.</p>
            </div>
          )}
        </section>
      )}
      
      {totalAchievements === 0 && (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <FaTrophy className="text-6xl text-green-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Achievements Yet</h3>
          <p className="text-gray-500 mb-6">Start adding your school's achievements to showcase excellence!</p>
          <button
            onClick={() => {
              setSelectedAchievement(null);
              setShowAchievementModal(true);
            }}
            className="bg-gradient-to-r from-green-600 to-yellow-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-yellow-700 transition font-bold inline-flex items-center gap-2"
          >
            <FaPlus /> Add First Achievement
          </button>
        </div>
      )}
      
      {/* Modals */}
      {showAchievementModal && (
        <AchievementModal
          onClose={() => {
            setShowAchievementModal(false);
            setSelectedAchievement(null);
          }}
          onSave={handleSaveAchievement}
          achievement={selectedAchievement}
        />
      )}
      
      {showStatsModal && (
        <SchoolStatsModal
          onClose={() => setShowStatsModal(false)}
          onSave={handleSaveStats}
          stats={schoolStats}
        />
      )}
      
      {showDeleteModal && (
        <DeleteConfirmationModal
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
            setDeleteTitle('');
          }}
          onConfirm={handleDeleteConfirm}
          title={deleteTitle}
        />
      )}
    </div>
  );
}