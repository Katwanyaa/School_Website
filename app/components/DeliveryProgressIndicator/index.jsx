'use client';

import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiAlertCircle, FiRotateCw, FiLoader } from 'react-icons/fi';

/**
 * DeliveryProgressIndicator
 * Shows progress of resource/assignment delivery with status, percentage, and retry options
 * 
 * Props:
 * - isOpen: Whether to show the modal
 * - totalRecipients: Total number of recipients
 * - sentCount: Number of successfully sent emails
 * - failedCount: Number of failed emails
 * - currentRecipient: Currently processing recipient name/index
 * - isComplete: Whether delivery is complete
 * - failedRecipients: Array of failed recipient details
 * - onRetry: Callback to retry failed deliveries
 * - onClose: Callback to close modal
 * - isLoading: Whether currently sending emails
 */
export const DeliveryProgressIndicator = ({
  isOpen,
  totalRecipients = 0,
  sentCount = 0,
  failedCount = 0,
  currentRecipient = '',
  isComplete = false,
  failedRecipients = [],
  retryMessage = '',
  onRetry,
  onCancel,
  onClose,
  isLoading = false
}) => {
  const [expandFailures, setExpandFailures] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (isComplete && failedCount > 0) {
      setExpandFailures(true);
    }
  }, [isComplete, failedCount]);

  if (!isOpen) return null;

  const processedCount = Math.min(totalRecipients, sentCount + failedCount);
  const activeRecipientNumber = isLoading && !isComplete
    ? Math.min(totalRecipients, processedCount + 1)
    : processedCount;
  const percentage = totalRecipients > 0 ? Math.round((processedCount / totalRecipients) * 100) : 0;
  const hasFailures = failedCount > 0;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetry?.();
    } finally {
      setRetrying(false);
    }
  };

  const getStatusColor = () => {
    if (!isComplete) return 'text-blue-600';
    if (failedCount === 0) return 'text-green-600';
    if (sentCount === 0) return 'text-red-600';
    return 'text-orange-600';
  };

  const getStatusMessage = () => {
    if (!isComplete) return `Sending to ${activeRecipientNumber} of ${totalRecipients} recipients...`;
    if (failedCount === 0) return '✓ Successfully delivered to all recipients!';
    if (sentCount === 0) return '✗ Failed to deliver to any recipients';
    return `✓ Delivered to ${sentCount} recipient(s), ${failedCount} failed`;
  };

  const getProgressBarColor = () => {
    if (!isComplete) return 'bg-blue-500';
    if (failedCount === 0) return 'bg-green-500';
    if (sentCount === 0) return 'bg-red-500';
    return 'bg-orange-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2200] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-green-500 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Email Delivery Status</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Spinner and Status */}
          {isLoading && !isComplete && (
            <div className="flex items-center justify-center gap-3 py-2">
              <FiLoader className={`text-2xl text-blue-500 animate-spin`} />
              <span className="text-gray-700 font-medium">Processing...</span>
            </div>
          )}

          {/* Current Recipient */}
          {!isComplete && currentRecipient && (
            <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              Currently sending to: <strong>{currentRecipient}</strong>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-gray-900">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${getProgressBarColor()} transition-all duration-500 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Status Stats */}
          <div className="grid grid-cols-3 gap-3">
            {/* Sent */}
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{sentCount}</div>
              <div className="text-xs text-gray-600">Sent</div>
            </div>

            {/* Remaining */}
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalRecipients - sentCount - failedCount}
              </div>
              <div className="text-xs text-gray-600">Remaining</div>
            </div>

            {/* Failed */}
            <div className={`${hasFailures ? 'bg-red-50' : 'bg-gray-50'} rounded-lg p-3 text-center`}>
              <div className={`text-2xl font-bold ${hasFailures ? 'text-red-600' : 'text-gray-600'}`}>
                {failedCount}
              </div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
          </div>

          {/* Status Message */}
          <div className={`text-center text-sm font-semibold ${getStatusColor()}`}>
            {getStatusMessage()}
          </div>

          {isComplete && hasFailures && retryMessage && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm font-medium text-orange-800">
              {retryMessage}
            </div>
          )}

          {/* Failed Recipients List (if complete and has failures) */}
          {isComplete && hasFailures && (
            <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandFailures(!expandFailures)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="text-red-600" />
                  <span className="font-medium text-red-700">
                    {failedRecipients.length} Failed Recipient(s)
                  </span>
                </div>
                <span className={`transform transition-transform ${expandFailures ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {expandFailures && (
                <div className="max-h-40 overflow-y-auto border-t border-red-200">
                  {failedRecipients.map((recipient, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 border-b border-red-100 last:border-b-0 text-xs bg-white hover:bg-red-50"
                    >
                      <div className="font-medium text-gray-800">
                        {recipient.studentName || recipient.email}
                      </div>
                      {(recipient.email || recipient.admissionNumber) && (
                        <div className="text-gray-500 text-xs mt-1">
                          {[recipient.email, recipient.admissionNumber].filter(Boolean).join(' | ')}
                        </div>
                      )}
                      <div className="text-gray-600 text-xs mt-1">
                        {recipient.error || 'Unknown error'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {isComplete && failedCount === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <FiCheck className="text-2xl text-green-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-green-800">All Delivered!</div>
                <div className="text-sm text-green-700">
                  Successfully sent to {sentCount} recipient{sentCount !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          {isComplete && hasFailures && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <FiRotateCw size={16} />
              Retry Failed
            </button>
          )}

          {isLoading && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors bg-red-500 hover:bg-red-600 text-white"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-600 text-white'
            }`}
          >
            {isLoading ? 'Sending...' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProgressIndicator;
