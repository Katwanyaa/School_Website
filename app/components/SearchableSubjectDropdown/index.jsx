'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiSearch, FiChevronDown } from 'react-icons/fi';

const optionToText = (option) => {
  if (typeof option === 'string') return option;
  if (typeof option === 'number') return String(option);
  if (!option || typeof option !== 'object') return '';
  return String(option.label || option.name || option.subject || option.value || '');
};

/**
 * SearchableSubjectDropdown
 * A reusable dropdown component with real-time search/filter functionality
 * 
 * Props:
 * - value: Currently selected subject
 * - onChange: Callback when selection changes
 * - options: Array of subject options
 * - placeholder: Placeholder text for the dropdown
 * - label: Label for the dropdown
 */
export const SearchableSubjectDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select a subject...',
  label = 'Subject',
  className = '',
  showLabel = false,
  allowClear = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  useEffect(() => {
    const filtered = options.filter(option =>
      optionToText(option).toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange(optionToText(option));
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('all');
    setSearchTerm('');
  };

  const displayValue = value && value !== 'all' ? optionToText(value) : placeholder;

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 cursor-pointer text-md text-left flex items-center justify-between transition-all ${
          isOpen ? 'ring-2 ring-green-500 border-green-500' : ''
        }`}
      >
        <span className={value && value !== 'all' ? 'text-gray-900' : 'text-gray-500'}>
          {displayValue}
        </span>
        <div className="flex items-center gap-2">
          {allowClear && value && value !== 'all' && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              title="Clear selection"
            >
              <FiX className="text-gray-600" size={16} />
            </button>
          )}
          <FiChevronDown
            className={`transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            size={18}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
            <div className="relative flex items-center">
              <FiSearch className="absolute left-3 text-gray-400" size={18} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 p-1 hover:bg-gray-200 rounded"
                  title="Clear search"
                >
                  <FiX size={16} className="text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optionText = optionToText(option);
                return (
                <button
                  type="button"
                  key={`${optionText}-${index}`}
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                    optionToText(value) === optionText
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{optionText}</span>
                    {optionToText(value) === optionText && (
                      <span className="text-green-600 font-bold">✓</span>
                    )}
                  </div>
                </button>
              );
              })
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                No subjects match "{searchTerm}"
              </div>
            )}
          </div>

          {/* Reset All Button */}
          {(searchTerm || (value && value !== 'all')) && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  onChange('all');
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-medium"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSubjectDropdown;
