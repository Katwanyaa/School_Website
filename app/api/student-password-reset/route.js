import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../../../libs/prisma';
import { getTokenFromHeaders, verifyToken } from '../../../libs/auth';

export const dynamic = 'force-dynamic';

const SCHOOL_NAME = 'Katwanyaa Senior School';
const CONTACT_EMAIL = 'katzict@gmail.com';
const CONTACT_PHONE = '0710894145';
const SETUP_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;
const SETUP_REQUEST_TYPES = ['setup', 'admin-setup'];
const OPEN_SETUP_STATUSES = ['pending', 'email_sent', 'email_failed'];
const SET_PASSWORD_STATUSES = ['used', 'completed'];
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'ADMINISTRATOR'];

const json = (body, status = 200) => NextResponse.json(body, { status });

const normalizeAdmissionNumber = (value) => String(value || '').trim().toUpperCase();

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const fullNameFromStudent = (student) => (
  [student?.firstName, student?.middleName, student?.lastName]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ')
);

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getClientInfo = (request) => ({
  ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'admin-dashboard',
  userAgent: request.headers.get('user-agent') || 'admin-dashboard'
});

const getBaseUrl = (request) => (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  new URL(request.url).origin
).replace(/\/$/, '');

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Student password email is not configured. Set EMAIL_USER and EMAIL_PASS.');
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const verifyAdminAuth = (request) => {
  try {
    const token = getTokenFromHeaders(request.headers) || request.headers.get('x-admin-token');
    if (!token) return null;

    const payload = verifyToken(token);
    const role = String(payload.role || payload.userRole || '').toUpperCase();

    if (!ADMIN_ROLES.includes(role)) return null;

    return {
      id: payload.userId || payload.id || null,
      name: payload.name || 'Admin',
      email: payload.email || null,
      role,
    };
  } catch (error) {
    console.error('Student password reset auth failed:', error.message);
    return null;
  }
};

const latestSetupRequestMap = async (admissionNumbers) => {
  if (!admissionNumbers.length) return new Map();

  const requests = await prisma.studentPasswordResetRequest.findMany({
    where: {
      admissionNumber: { in: admissionNumbers },
      requestType: { in: SETUP_REQUEST_TYPES },
    },
    orderBy: { requestedAt: 'desc' },
    select: {
      id: true,
      admissionNumber: true,
      requestType: true,
      status: true,
      requestedAt: true,
      usedAt: true,
      expiresAt: true,
    },
  });

  const map = new Map();
  for (const request of requests) {
    const key = normalizeAdmissionNumber(request.admissionNumber);
    if (!map.has(key)) map.set(key, request);
  }
  return map;
};

const hasSetPortalPassword = (account, latestSetupRequest) => {
  if (!account?.passwordHash) return false;
  if (account.lastLoginAt) return true;
  if (latestSetupRequest && SET_PASSWORD_STATUSES.includes(latestSetupRequest.status)) return true;
  if (latestSetupRequest && OPEN_SETUP_STATUSES.includes(latestSetupRequest.status)) {
    if (account.passwordSetAt && latestSetupRequest.requestedAt && account.passwordSetAt > latestSetupRequest.requestedAt) {
      return true;
    }
    return false;
  }
  return true;
};

const buildRows = async () => {
  const [students, accounts] = await Promise.all([
    prisma.databaseStudent.findMany({
      where: { status: 'active' },
      orderBy: [
        { form: 'asc' },
        { stream: 'asc' },
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
      select: {
        id: true,
        admissionNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        form: true,
        stream: true,
        email: true,
        parentPhone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.studentPortalAccount.findMany({
      select: {
        id: true,
        admissionNumber: true,
        passwordHash: true,
        firstName: true,
        middleName: true,
        lastName: true,
        fullName: true,
        form: true,
        stream: true,
        email: true,
        parentPhone: true,
        status: true,
        passwordSetAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const studentMap = new Map(students.map((student) => [normalizeAdmissionNumber(student.admissionNumber), student]));
  const accountMap = new Map(accounts.map((account) => [normalizeAdmissionNumber(account.admissionNumber), account]));
  const admissionNumbers = [...new Set([...studentMap.keys(), ...accountMap.keys()])];
  const setupRequests = await latestSetupRequestMap(admissionNumbers);

  return admissionNumbers.map((admissionNumber) => {
    const student = studentMap.get(admissionNumber);
    const account = accountMap.get(admissionNumber);
    const latestSetupRequest = setupRequests.get(admissionNumber);
    const currentlyInDashboard = Boolean(student);
    const parentEmail = student?.email || account?.email || '';
    const hasPassword = hasSetPortalPassword(account, latestSetupRequest);
    const fullName = fullNameFromStudent(student) || account?.fullName || fullNameFromStudent(account) || 'Student';

    return {
      id: student?.id || account?.id || admissionNumber,
      accountId: account?.id || null,
      admissionNumber,
      fullName,
      form: student?.form || account?.form || '',
      stream: student?.stream || account?.stream || '',
      parentEmail,
      parentPhone: student?.parentPhone || account?.parentPhone || '',
      hasPassword,
      passwordSet: hasPassword,
      passwordNotSet: !hasPassword,
      passwordSetAt: hasPassword ? account?.passwordSetAt || null : null,
      lastLoginAt: account?.lastLoginAt || null,
      currentlyInDashboard,
      canSendSetupEmail: currentlyInDashboard && !hasPassword && Boolean(parentEmail),
      accountStatus: account?.status || 'not-created',
      dashboardStatus: student?.status || 'missing',
      setupRequestStatus: latestSetupRequest?.status || null,
      setupRequestExpiresAt: latestSetupRequest?.expiresAt || null,
    };
  });
};

const applyFilters = (rows, searchParams) => {
  const status = searchParams.get('status') || 'all';
  const form = searchParams.get('form') || 'all';
  const stream = searchParams.get('stream') || 'all';
  const emailStatus = searchParams.get('emailStatus') || 'all';
  const search = normalizeText(searchParams.get('search'));

  return rows.filter((row) => {
    if (status === 'set' && (!row.currentlyInDashboard || !row.hasPassword)) return false;
    if (status === 'not-set' && (!row.currentlyInDashboard || row.hasPassword)) return false;
    if (status === 'notify-ready' && !row.canSendSetupEmail) return false;
    if (status === 'missing-email' && (row.parentEmail || !row.currentlyInDashboard)) return false;
    if (status === 'orphan' && row.currentlyInDashboard) return false;

    if (form !== 'all' && normalizeText(row.form) !== normalizeText(form)) return false;
    if (stream !== 'all' && normalizeText(row.stream) !== normalizeText(stream)) return false;
    if (emailStatus === 'with-email' && !row.parentEmail) return false;
    if (emailStatus === 'missing-email' && row.parentEmail) return false;

    if (search) {
      const haystack = [
        row.fullName,
        row.admissionNumber,
        row.parentEmail,
        row.parentPhone,
        row.form,
        row.stream,
      ].map(normalizeText).join(' ');

      if (!haystack.includes(search)) return false;
    }

    return true;
  });
};

const buildStats = (rows) => ({
  totalStudents: rows.filter((row) => row.currentlyInDashboard).length,
  activeStudents: rows.filter((row) => row.currentlyInDashboard).length,
  passwordSet: rows.filter((row) => row.currentlyInDashboard && row.hasPassword).length,
  passwordNotSet: rows.filter((row) => row.currentlyInDashboard && !row.hasPassword).length,
  missingParentEmail: rows.filter((row) => row.currentlyInDashboard && !row.parentEmail).length,
  orphanAccounts: rows.filter((row) => !row.currentlyInDashboard).length,
});

const createPlaceholderAccount = async (student) => {
  const admissionNumber = normalizeAdmissionNumber(student.admissionNumber);
  const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);

  return prisma.studentPortalAccount.create({
    data: {
      admissionNumber,
      passwordHash,
      firstName: student.firstName || null,
      middleName: student.middleName || null,
      lastName: student.lastName || null,
      fullName: fullNameFromStudent(student),
      form: student.form || null,
      stream: student.stream || null,
      email: student.email || null,
      parentPhone: student.parentPhone || null,
      status: 'active',
      passwordSetAt: new Date(),
    },
  });
};

const syncAccountSnapshot = async (account, student) => {
  if (!account) return createPlaceholderAccount(student);

  return prisma.studentPortalAccount.update({
    where: { id: account.id },
    data: {
      firstName: student.firstName || null,
      middleName: student.middleName || null,
      lastName: student.lastName || null,
      fullName: fullNameFromStudent(student),
      form: student.form || null,
      stream: student.stream || null,
      email: student.email || account.email || null,
      parentPhone: student.parentPhone || account.parentPhone || null,
      status: 'active',
    },
  });
};

const sendSetupEmail = async ({ transporter, to, student, setupLink, expiresDays }) => {
  const studentName = fullNameFromStudent(student) || 'Student';
  const safeName = escapeHtml(studentName);
  const safeAdmission = escapeHtml(normalizeAdmissionNumber(student.admissionNumber));
  const safeForm = escapeHtml([student.form, student.stream].filter(Boolean).join(' ') || 'Not specified');
  const safeLink = escapeHtml(setupLink);

  await transporter.sendMail({
    from: {
      name: `${SCHOOL_NAME} Portal`,
      address: process.env.EMAIL_USER,
    },
    to,
    subject: `Set up student portal password - ${studentName}`,
    text: [
      `Dear Parent/Guardian,`,
      `The student portal password for ${studentName} (${safeAdmission}) has not been set yet.`,
      `Use this secure link within ${expiresDays} days: ${setupLink}`,
      `If you need help, contact ${CONTACT_EMAIL} or ${CONTACT_PHONE}.`,
    ].join('\n\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 12px">${SCHOOL_NAME} Student Portal</h2>
        <p>Dear Parent/Guardian,</p>
        <p>The student portal password for <strong>${safeName}</strong> (Admission No: <strong>${safeAdmission}</strong>) has not been set yet.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:18px 0">
          <p style="margin:0 0 6px"><strong>Student:</strong> ${safeName}</p>
          <p style="margin:0 0 6px"><strong>Admission Number:</strong> ${safeAdmission}</p>
          <p style="margin:0"><strong>Class:</strong> ${safeForm}</p>
        </div>
        <p>Please use the secure button below to set the portal password. The link expires in ${expiresDays} days.</p>
        <p>
          <a href="${safeLink}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">
            Set Student Portal Password
          </a>
        </p>
        <p style="font-size:13px;color:#475569">If the button does not work, copy this link into your browser:</p>
        <p style="word-break:break-all;font-size:13px;color:#2563eb">${safeLink}</p>
        <p style="font-size:13px;color:#64748b">For help, contact ${CONTACT_EMAIL} or ${CONTACT_PHONE}.</p>
      </div>
    `,
  });
};

export async function GET(request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return json({ success: false, error: 'Unauthorized: admin access required.' }, 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const rows = await buildRows();

    return json({
      success: true,
      rows: applyFilters(rows, searchParams),
      stats: buildStats(rows),
    });
  } catch (error) {
    console.error('Failed to load student password status:', error);
    return json({ success: false, error: 'Failed to load student password status.' }, 500);
  }
}

export async function POST(request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return json({ success: false, error: 'Unauthorized: admin access required.' }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return json({ success: false, error: 'Invalid request body.' }, 400);
  }

  if (body.action !== 'admin-send-setup-links') {
    return json({ success: false, error: 'Unsupported password reset action.' }, 400);
  }

  const admissionNumbers = [...new Set((body.admissionNumbers || []).map(normalizeAdmissionNumber).filter(Boolean))];
  if (!admissionNumbers.length) {
    return json({ success: false, error: 'Select at least one student.' }, 400);
  }

  let transporter;
  try {
    transporter = getTransporter();
  } catch (error) {
    return json({ success: false, error: error.message }, 500);
  }

  try {
    const [students, accounts] = await Promise.all([
      prisma.databaseStudent.findMany({
        where: {
          admissionNumber: { in: admissionNumbers },
          status: 'active',
        },
      }),
      prisma.studentPortalAccount.findMany({
        where: { admissionNumber: { in: admissionNumbers } },
      }),
    ]);

    const studentMap = new Map(students.map((student) => [normalizeAdmissionNumber(student.admissionNumber), student]));
    const accountMap = new Map(accounts.map((account) => [normalizeAdmissionNumber(account.admissionNumber), account]));
    const setupRequests = await latestSetupRequestMap(admissionNumbers);
    const { ipAddress, userAgent } = getClientInfo(request);
    const baseUrl = getBaseUrl(request);
    const expiresDays = Math.round(SETUP_TOKEN_MS / (24 * 60 * 60 * 1000));

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const admissionNumber of admissionNumbers) {
      const student = studentMap.get(admissionNumber);
      const account = accountMap.get(admissionNumber) || null;

      if (!student) {
        results.push({ admissionNumber, success: false, error: 'Student is not active in dashboard records.' });
        failureCount++;
        continue;
      }

      const parentEmail = student.email || account?.email || null;
      if (!parentEmail) {
        results.push({ admissionNumber, success: false, error: 'No parent email is registered.' });
        failureCount++;
        continue;
      }

      const latestSetupRequest = setupRequests.get(admissionNumber);
      if (hasSetPortalPassword(account, latestSetupRequest)) {
        results.push({ admissionNumber, success: false, error: 'Portal password is already set.' });
        failureCount++;
        continue;
      }

      try {
        const syncedAccount = await syncAccountSnapshot(account, student);
        accountMap.set(admissionNumber, syncedAccount);

        await prisma.studentPasswordResetRequest.updateMany({
          where: {
            admissionNumber,
            requestType: { in: SETUP_REQUEST_TYPES },
            status: { in: OPEN_SETUP_STATUSES },
            usedAt: null,
          },
          data: {
            status: 'replaced',
            resolvedAt: new Date(),
          },
        });

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + SETUP_TOKEN_MS);
        const setupLink = `${baseUrl}/pages/studentresetpassword?token=${rawToken}`;

        const resetRequest = await prisma.studentPasswordResetRequest.create({
          data: {
            admissionNumber,
            requestType: 'setup',
            fullName: fullNameFromStudent(student),
            email: syncedAccount.email || student.email || null,
            parentEmail,
            parentPhone: student.parentPhone || syncedAccount.parentPhone || null,
            message: body.message ? String(body.message).trim() : null,
            tokenHash,
            expiresAt,
            status: 'pending',
            requestedByIp: ipAddress,
            requestedByUserAgent: userAgent,
            adminNote: `Setup email sent by ${admin.name || admin.email || 'Admin'}`,
          },
        });

        await sendSetupEmail({
          transporter,
          to: parentEmail,
          student,
          setupLink,
          expiresDays,
        });

        await prisma.studentPasswordResetRequest.update({
          where: { id: resetRequest.id },
          data: { status: 'email_sent' },
        });

        results.push({
          admissionNumber,
          name: fullNameFromStudent(student),
          email: parentEmail,
          success: true,
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to send student setup email for ${admissionNumber}:`, error);
        await prisma.studentPasswordResetRequest.updateMany({
          where: {
            admissionNumber,
            requestType: 'setup',
            status: 'pending',
            usedAt: null,
          },
          data: {
            status: 'email_failed',
            adminNote: error.message,
          },
        });

        results.push({ admissionNumber, success: false, error: error.message });
        failureCount++;
      }
    }

    const success = successCount > 0;
    return json({
      success,
      message: success
        ? `Setup emails sent: ${successCount} succeeded, ${failureCount} failed.`
        : 'No setup emails were sent.',
      successCount,
      failureCount,
      results,
    }, success ? 200 : 400);
  } catch (error) {
    console.error('Failed to send student setup emails:', error);
    return json({ success: false, error: 'Failed to send student setup emails.' }, 500);
  }
}
