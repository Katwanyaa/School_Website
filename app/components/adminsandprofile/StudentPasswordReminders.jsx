'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import {
  FiMail, FiCheck, FiX, FiRefreshCw, FiFilter, FiSearch,
  FiDownload, FiAlertCircle, FiCheckCircle, FiClock,
  FiChevronDown, FiChevronUp, FiUsers
} from 'react-icons/fi';
import {
  CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, Alert
} from '@mui/material';

export default function StudentPasswordRemindersAdmin() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('not-set'); // 'all', 'not-set', 'set'
  const [selectedForm, setSelectedForm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [sendingEmails, setSendingEmails] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [summary, setSummary] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Load students
  useEffect(() => {
    fetchStudents();
  }, [filter, selectedForm]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/student-password-reminders?filter=${filter}${selectedForm ? `&form=${selectedForm}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStudents(data.students || []);
        setSummary(data.summary);
      } else {
        toast.error('Failed to load students');
      }
    } catch (error) {
      toast.error('Error loading students: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectStudent = (admissionNumber) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(admissionNumber)) {
      newSelected.delete(admissionNumber);
    } else {
      newSelected.add(admissionNumber);
    }
    setSelectedStudents(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s.admissionNumber)));
    }
  };

  const sendReminders = async () => {
    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setSendingEmails(true);
    try {
      const response = await fetch('/api/admin/student-password-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionNumbers: Array.from(selectedStudents),
          message: customMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Reminders sent to ${data.successCount} students`);
        if (data.failureCount > 0) {
          toast.error(`Failed to send to ${data.failureCount} students`);
        }
        setSelectedStudents(new Set());
        setCustomMessage('');
        setShowMessage(false);
        fetchStudents(); // Refresh list
      } else {
        toast.error(data.message || 'Failed to send reminders');
      }
    } catch (error) {
      toast.error('Error sending reminders: ' + error.message);
    } finally {
      setSendingEmails(false);
    }
  };

  const getUniqueForms = () => {
    return [...new Set(students.map(s => s.form))].filter(Boolean).sort();
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.admissionNumber.toLowerCase().includes(searchLower) ||
      student.fullName.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower)
    );
  });

  const toggleRowExpand = (admissionNumber) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(admissionNumber)) {
      newExpanded.delete(admissionNumber);
    } else {
      newExpanded.add(admissionNumber);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FiMail className="text-3xl text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Password Reminders</h1>
            <p className="text-gray-600 text-sm mt-1">Manage student portal password setup reminders</p>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FiUsers className="text-blue-600 text-2xl" />
                <div>
                  <p className="text-gray-600 text-sm font-bold">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FiCheckCircle className="text-green-600 text-2xl" />
                <div>
                  <p className="text-gray-600 text-sm font-bold">Password Set</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.passwordSet}</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="text-orange-600 text-2xl" />
                <div>
                  <p className="text-gray-600 text-sm font-bold">Not Set</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.passwordNotSet}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by admission number, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter by Status */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Students</option>
            <option value="not-set">Password Not Set</option>
            <option value="set">Password Set</option>
          </select>

          {/* Filter by Form */}
          {getUniqueForms().length > 0 && (
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Forms</option>
              {getUniqueForms().map(form => (
                <option key={form} value={form}>Form {form}</option>
              ))}
            </select>
          )}

          {/* Refresh */}
          <button
            onClick={fetchStudents}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Selection Info and Send Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStudents.size === students.length && students.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="font-bold text-gray-700">
                {selectedStudents.size > 0 ? `Selected: ${selectedStudents.size}` : 'Select All'}
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            {selectedStudents.size > 0 && (
              <button
                onClick={() => setShowMessage(true)}
                disabled={sendingEmails}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <FiMail />
                Send Reminders ({selectedStudents.size})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={showMessage} onClose={() => !sendingEmails && setShowMessage(false)} maxWidth="md" fullWidth>
        <DialogTitle className="font-bold text-gray-900">Send Password Reminder</DialogTitle>
        <DialogContent className="space-y-4 py-4">
          <Alert severity="info">
            You are about to send password setup reminders to {selectedStudents.size} student(s).
          </Alert>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Additional Message (Optional)
            </label>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a custom message to include in the email (e.g., deadline, instructions, etc.)"
              variant="outlined"
              disabled={sendingEmails}
            />
            <p className="text-xs text-gray-500 mt-1">
              Keep it brief and helpful. This message will be included in the reminder email.
            </p>
          </div>
        </DialogContent>
        <DialogActions className="p-4 gap-2">
          <Button onClick={() => setShowMessage(false)} disabled={sendingEmails}>
            Cancel
          </Button>
          <Button
            onClick={sendReminders}
            variant="contained"
            disabled={sendingEmails}
            startIcon={sendingEmails ? <CircularProgress size={20} /> : <FiMail />}
          >
            {sendingEmails ? 'Sending...' : 'Send Reminders'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <FiAlertCircle className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-bold">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                      onChange={() => {
                        if (selectedStudents.size === filteredStudents.length) {
                          setSelectedStudents(new Set());
                        } else {
                          setSelectedStudents(new Set(filteredStudents.map(s => s.admissionNumber)));
                        }
                      }}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Admission</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Form</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Last Login</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tbody key={student.admissionNumber}>
                    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student.admissionNumber)}
                          onChange={() => toggleSelectStudent(student.admissionNumber)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">{student.admissionNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{student.fullName}</td>
                      <td className="px-4 py-3 text-gray-600">{student.form}</td>
                      <td className="px-4 py-3">
                        {student.passwordNotSet ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                            <FiClock size={12} />
                            Not Set
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                            <FiCheckCircle size={12} />
                            Set
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {student.lastLoginAt 
                          ? new Date(student.lastLoginAt).toLocaleDateString() 
                          : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleRowExpand(student.admissionNumber)}
                          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {expandedRows.has(student.admissionNumber) ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(student.admissionNumber) && (
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td colSpan="7" className="px-4 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 font-bold">Email</p>
                              <p className="text-sm text-gray-900 font-bold break-all">{student.email || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-bold">Parent Email</p>
                              <p className="text-sm text-gray-900 font-bold break-all">{student.parentEmail || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-bold">Phone</p>
                              <p className="text-sm text-gray-900 font-bold">{student.parentPhone || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-bold">Password Set At</p>
                              <p className="text-sm text-gray-900 font-bold">
                                {student.passwordSetAt 
                                  ? new Date(student.passwordSetAt).toLocaleString() 
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-bold">Account Created</p>
                              <p className="text-sm text-gray-900 font-bold">
                                {new Date(student.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-bold">Status</p>
                              <p className="text-sm text-gray-900 font-bold">{student.status}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Info */}
      <div className="mt-4 text-center text-sm text-gray-600 font-bold">
        Showing {filteredStudents.length} of {students.length} students
      </div>
    </div>
  );
}
