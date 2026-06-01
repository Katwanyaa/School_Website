'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiKey,
  FiMail,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiShield,
  FiUser,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi';
import { toast } from 'sonner';

const getAdminToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('jwt_token');
};

const formatDate = (date) => {
  if (!date) return 'Not yet';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const filterOptions = [
  { value: 'all', label: 'All Students' },
  { value: 'set', label: 'Password Set' },
  { value: 'not-set', label: 'Not Set' },
  { value: 'notify-ready', label: 'Ready To Email' },
  { value: 'missing-email', label: 'Missing Email' },
  { value: 'orphan', label: 'Not In Dashboard' },
];

const formOptions = ['all', 'Grade 10', 'Grade 11', 'Grade 12'];

const emailOptions = [
  { value: 'all', label: 'All Emails' },
  { value: 'with-email', label: 'Has Parent Email' },
  { value: 'missing-email', label: 'Missing Parent Email' },
];

export default function StudentPasswordRequests() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    passwordSet: 0,
    passwordNotSet: 0,
    missingParentEmail: 0,
    orphanAccounts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formFilter, setFormFilter] = useState('all');
  const [streamFilter, setStreamFilter] = useState('all');
  const [emailFilter, setEmailFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmissions, setSelectedAdmissions] = useState(new Set());
  const [sending, setSending] = useState(false);

  const eligibleRows = useMemo(
    () => rows.filter(row => !row.hasPassword && row.canSendSetupEmail && row.currentlyInDashboard),
    [rows]
  );

  const selectedEligibleAdmissions = useMemo(() => (
    rows
      .filter(row => selectedAdmissions.has(row.admissionNumber) && !row.hasPassword && row.canSendSetupEmail && row.currentlyInDashboard)
      .map(row => row.admissionNumber)
  ), [rows, selectedAdmissions]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const params = new URLSearchParams({
        scope: 'accounts',
        status: statusFilter,
        form: formFilter,
        stream: streamFilter,
        emailStatus: emailFilter,
      });
      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const response = await fetch(`/api/student-password-reset?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to load student accounts');

      setRows(data.rows || []);
      setStats(data.stats || {});
      setSelectedAdmissions(new Set());
    } catch (error) {
      toast.error(error.message || 'Failed to load student account status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [statusFilter, formFilter, streamFilter, emailFilter]);

  const streamOptions = useMemo(() => {
    const streams = [...new Set(rows.map(row => row.stream).filter(Boolean))].sort();
    return ['all', ...streams];
  }, [rows]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchAccounts();
  };

  const toggleRow = (admissionNumber) => {
    setSelectedAdmissions(prev => {
      const next = new Set(prev);
      if (next.has(admissionNumber)) next.delete(admissionNumber);
      else next.add(admissionNumber);
      return next;
    });
  };

  const toggleAllEligible = () => {
    setSelectedAdmissions(prev => {
      const next = new Set(prev);
      const allSelected = eligibleRows.every(row => next.has(row.admissionNumber));

      eligibleRows.forEach(row => {
        if (allSelected) next.delete(row.admissionNumber);
        else next.add(row.admissionNumber);
      });

      return next;
    });
  };

  const sendSetupLinks = async (admissionNumbers) => {
    if (!admissionNumbers.length) {
      toast.error('Select students without passwords and with a registered parent email.');
      return;
    }

    setSending(true);
    try {
      const token = getAdminToken();
      const response = await fetch('/api/student-password-reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'admin-send-setup-links',
          admissionNumbers
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || data.message || 'Could not send setup links');

      toast.success(data.message || 'Password setup links sent to parent emails');
      await fetchAccounts();
    } catch (error) {
      toast.error(error.message || 'Could not send password setup links');
    } finally {
      setSending(false);
    }
  };

  const statCards = [
    { label: 'Dashboard Students', value: stats.totalStudents || 0, icon: FiUsers, tone: 'bg-blue-50 text-blue-700 border-blue-100' },
    { label: 'Passwords Set', value: stats.passwordSet || 0, icon: FiCheckCircle, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Need Setup', value: stats.passwordNotSet || 0, icon: FiKey, tone: 'bg-amber-50 text-amber-700 border-amber-100' },
    { label: 'Missing Parent Email', value: stats.missingParentEmail || 0, icon: FiMail, tone: 'bg-red-50 text-red-700 border-red-100' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400" />
        <div className="bg-slate-950 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
                Student Account Records
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Student Portal Accounts</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                View students who have set portal passwords, students who have not, and send secure setup emails to registered parents.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => sendSetupLinks(eligibleRows.map(row => row.admissionNumber))}
                disabled={sending || eligibleRows.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiSend />
                Notify All Not Set
              </button>
              <button
                onClick={fetchAccounts}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${tone}`}>
                <Icon />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Live</span>
            </div>
            <p className="mt-5 text-3xl font-black text-slate-950">{value}</p>
            <p className="mt-1 text-sm font-bold text-slate-600">{label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Account Status Table</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Passwords set vs not set</h2>
          </div>

          <div className="flex flex-col gap-3">
            <form onSubmit={handleSearch} className="relative min-w-0 lg:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search full name, admission, email..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </form>
          </div>
        </div>

        <div className="mb-5 grid gap-3 lg:grid-cols-[1.35fr_0.65fr_0.7fr_0.8fr]">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 sm:grid-cols-3 xl:grid-cols-6">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider transition ${
                  statusFilter === option.value ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <select
            value={formFilter}
            onChange={(event) => {
              setFormFilter(event.target.value);
              setStreamFilter('all');
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {formOptions.map(option => (
              <option key={option} value={option}>{option === 'all' ? 'All Classes' : option}</option>
            ))}
          </select>

          <select
            value={streamFilter}
            onChange={(event) => setStreamFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {streamOptions.map(option => (
              <option key={option} value={option}>{option === 'all' ? 'All Streams' : option}</option>
            ))}
          </select>

          <select
            value={emailFilter}
            onChange={(event) => setEmailFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {emailOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {selectedEligibleAdmissions.length > 0 && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-emerald-900">{selectedEligibleAdmissions.length} eligible student selected</p>
              <p className="mt-1 text-xs font-bold text-emerald-700">Setup links will be sent to registered parent emails.</p>
            </div>
            <button
              onClick={() => sendSetupLinks(selectedEligibleAdmissions)}
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              <FiSend />
              {sending ? 'Sending...' : 'Send Selected'}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-56 items-center justify-center text-sm font-bold text-slate-500">
            Loading student account status...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <FiShield className="mx-auto text-4xl text-slate-300" />
            <p className="mt-3 text-sm font-black uppercase tracking-widest text-slate-500">No students found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={eligibleRows.length > 0 && eligibleRows.every(row => selectedAdmissions.has(row.admissionNumber))}
                        onChange={toggleAllEligible}
                        className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-300"
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">Student</th>
                    <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">Class</th>
                    <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">Parent Email</th>
                    <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">Password</th>
                    <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">Last Login</th>
                    <th className="px-4 py-4 text-right text-[11px] font-black uppercase tracking-widest text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.map((row) => {
                    const canSelect = !row.hasPassword && row.canSendSetupEmail && row.currentlyInDashboard;
                    return (
                      <tr key={`${row.admissionNumber}-${row.accountId || row.id}`} className="hover:bg-slate-50/80">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedAdmissions.has(row.admissionNumber)}
                            onChange={() => toggleRow(row.admissionNumber)}
                            disabled={!canSelect}
                            className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-300 disabled:opacity-30"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                              <FiUser />
                            </div>
                            <div>
                              <p className="font-black text-slate-950">{row.fullName || 'Student'}</p>
                              <p className="text-xs font-bold text-slate-500">ADM {row.admissionNumber}</p>
                              {!row.currentlyInDashboard && (
                                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-black uppercase text-red-700">
                                  <FiXCircle />
                                  Not in dashboard
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-black text-slate-900">{row.form || 'N/A'}</p>
                          <p className="text-xs font-bold text-slate-500">{row.stream || 'No stream'}</p>
                        </td>
                        <td className="px-4 py-4">
                          {row.parentEmail ? (
                            <p className="max-w-[220px] truncate text-sm font-bold text-slate-700">{row.parentEmail}</p>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                              <FiAlertCircle />
                              Missing
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {row.hasPassword ? (
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                                <FiCheckCircle />
                                Set
                              </span>
                              <p className="mt-1 text-[11px] font-bold text-slate-500">{formatDate(row.passwordSetAt)}</p>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                              <FiClock />
                              Not set
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-600">
                          {formatDate(row.lastLoginAt)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => sendSetupLinks([row.admissionNumber])}
                            disabled={sending || !canSelect}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                          >
                            <FiMail />
                            Send Setup Link
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
