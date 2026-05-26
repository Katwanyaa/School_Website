import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../../../libs/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'Katwanyaa-student-secret-key-2024';
const STUDENT_TOKEN_EXPIRY = '2h';
const SESSION_MS = 2 * 60 * 60 * 1000;
const SETUP_TOKEN_EXPIRY = '20m';
const RESET_TOKEN_MS = 30 * 60 * 1000;
const SCHOOL_NAME = 'Katwanyaa Senior School';
const CONTACT_EMAIL = 'katzict@gmail.com';

const json = (body, status = 200, headers = {}) => (
  NextResponse.json(body, { status, headers })
);

const normalizeAdmissionNumber = (value) => String(value || '').trim().toUpperCase();

const normalizeName = (name) => (
  String(name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z\s]/g, '')
    .split(' ')
    .filter(Boolean)
    .sort()
);

const getClientInfo = (request) => ({
  ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
  userAgent: request.headers.get('user-agent') || 'unknown'
});

const getBaseUrl = (request) => (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  new URL(request.url).origin
).replace(/\/$/, '');

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return 'registered email';
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}***@${domain}`;
};

const createResetTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Student password email is not configured. Set EMAIL_USER and EMAIL_PASS.');
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendStudentResetEmail = async ({ to, studentName, admissionNumber, resetLink, expiresMinutes }) => {
  const transporter = createResetTransporter();

  await transporter.sendMail({
    from: {
      name: `${SCHOOL_NAME} Portal`,
      address: process.env.EMAIL_USER
    },
    to,
    subject: `Student Portal Password Reset - ${studentName || admissionNumber}`,
    text: [
      `A password reset was requested for ${studentName || 'a student'} (${admissionNumber}).`,
      `Open this secure link within ${expiresMinutes} minutes: ${resetLink}`,
      `If you did not request this, contact ${CONTACT_EMAIL}.`
    ].join('\n\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:620px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 12px">${SCHOOL_NAME} Student Portal</h2>
        <p>A password reset was requested for <strong>${studentName || 'Student'}</strong> (${admissionNumber}).</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">
            Reset Student Password
          </a>
        </p>
        <p style="font-size:13px;color:#475569">This link expires in ${expiresMinutes} minutes. If the button does not work, copy this link into your browser:</p>
        <p style="word-break:break-all;font-size:13px;color:#2563eb">${resetLink}</p>
        <p style="font-size:13px;color:#64748b">If you did not request this reset, ignore this email or contact ${CONTACT_EMAIL}.</p>
      </div>
    `
  });
};

const findStudentByName = (student, nameParts) => {
  const dbNames = [
    student.firstName,
    student.middleName,
    student.lastName
  ]
    .map((name) => String(name || '').toLowerCase().trim())
    .filter(Boolean);

  return nameParts.every((part) => (
    dbNames.some((dbName) => (
      dbName === part ||
      dbName.startsWith(part) ||
      part.startsWith(dbName) ||
      (part.length === 1 && dbName[0] === part)
    ))
  ));
};

const fullNameFromParts = (record) => (
  [record?.firstName, record?.middleName, record?.lastName]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
);

const sanitizeStudent = (account, student = null) => {
  const source = student || account;
  const fullName = fullNameFromParts(source) || account.fullName || 'Student';

  return {
    id: student?.id || account.id,
    portalAccountId: account.id,
    admissionNumber: account.admissionNumber,
    firstName: source.firstName || null,
    middleName: source.middleName || null,
    lastName: source.lastName || null,
    name: fullName,
    fullName,
    form: source.form || null,
    stream: source.stream || null,
    email: source.email || null,
    gender: student?.gender || null,
    dateOfBirth: student?.dateOfBirth || null,
    parentPhone: source.parentPhone || null,
    address: student?.address || null,
    recordStatus: student?.status || null,
    portalStatus: account.status,
    recordLinked: Boolean(student)
  };
};

const validatePasswordStrength = (password) => {
  const checks = [
    String(password || '').length >= 8,
    /[a-z]/.test(password || ''),
    /[A-Z]/.test(password || ''),
    /\d/.test(password || ''),
    /[^A-Za-z0-9]/.test(password || '')
  ];

  return checks.every(Boolean);
};

const getStudentByAdmission = (admissionNumber) => (
  prisma.databaseStudent.findUnique({
    where: { admissionNumber: normalizeAdmissionNumber(admissionNumber) }
  })
);

const validateStudentCredentials = async (fullName, admissionNumber) => {
  const cleanAdmissionNumber = normalizeAdmissionNumber(admissionNumber);
  const cleanFullName = String(fullName || '').trim();
  const nameParts = normalizeName(cleanFullName);

  if (!cleanAdmissionNumber) {
    return { success: false, error: 'Enter your admission number.', status: 400 };
  }

  if (nameParts.length < 1) {
    return { success: false, error: 'Enter your registered name.', status: 400 };
  }

  const student = await getStudentByAdmission(cleanAdmissionNumber);

  if (!student) {
    return {
      success: false,
      error: 'Student record was not found. Please contact your class teacher or the school office to confirm your details.',
      requiresContact: true,
      status: 404
    };
  }

  if (student.status !== 'active') {
    return {
      success: false,
      error: 'This student record is not active. Please contact your class teacher or the school office.',
      requiresContact: true,
      status: 403
    };
  }

  if (!findStudentByName(student, nameParts)) {
    return {
      success: false,
      error: 'The name does not match this admission number. Check the spelling or contact the school office for help.',
      requiresContact: true,
      status: 401
    };
  }

  return { success: true, student };
};

const buildAccountSnapshot = (student, passwordHash) => ({
  admissionNumber: normalizeAdmissionNumber(student.admissionNumber),
  passwordHash,
  firstName: student.firstName || null,
  middleName: student.middleName || null,
  lastName: student.lastName || null,
  fullName: fullNameFromParts(student),
  form: student.form || null,
  stream: student.stream || null,
  email: student.email || null,
  parentPhone: student.parentPhone || null,
  status: 'active',
  passwordSetAt: new Date()
});

const generateSetupToken = (student) => (
  jwt.sign(
    {
      type: 'student-password-setup',
      admissionNumber: normalizeAdmissionNumber(student.admissionNumber),
      studentSnapshot: {
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        fullName: fullNameFromParts(student),
        form: student.form,
        stream: student.stream,
        email: student.email,
        parentPhone: student.parentPhone
      }
    },
    JWT_SECRET,
    { expiresIn: SETUP_TOKEN_EXPIRY }
  )
);

const generateStudentToken = (account, student = null) => (
  jwt.sign(
    {
      portalAccountId: account.id,
      admissionNumber: account.admissionNumber,
      name: sanitizeStudent(account, student).fullName,
      role: 'student'
    },
    JWT_SECRET,
    { expiresIn: STUDENT_TOKEN_EXPIRY }
  )
);

const createSession = async (request, account, token, student = null) => {
  const { ipAddress, userAgent } = getClientInfo(request);

  await prisma.studentSession.create({
    data: {
      studentId: account.id,
      admissionNumber: account.admissionNumber,
      name: sanitizeStudent(account, student).fullName,
      token,
      expiresAt: new Date(Date.now() + SESSION_MS),
      ipAddress,
      userAgent
    }
  });
};

const loginResponse = async (request, account, student = null) => {
  const token = generateStudentToken(account, student);
  await createSession(request, account, token, student);

  return json({
    success: true,
    message: 'Login successful',
    student: sanitizeStudent(account, student),
    token,
    expiresIn: '2 hours',
    permissions: {
      canViewResources: true,
      canViewAssignments: true,
      canDownloadMaterials: true
    }
  }, 200, {
    'Set-Cookie': `student_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=7200; Secure=${process.env.NODE_ENV === 'production'}`
  });
};

const extractToken = (request) => {
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, ...parts] = cookie.trim().split('=');
      acc[key] = parts.join('=');
      return acc;
    }, {});

    if (cookies.student_token) return cookies.student_token;
  }

  return request.headers.get('authorization')?.replace('Bearer ', '') || null;
};

const handleVerifyFirstAccess = async (body) => {
  const validation = await validateStudentCredentials(body.fullName, body.admissionNumber);

  if (!validation.success) {
    return json({
      success: false,
      error: validation.error,
      requiresContact: validation.requiresContact || false
    }, validation.status || 401);
  }

  const admissionNumber = normalizeAdmissionNumber(validation.student.admissionNumber);
  const existingAccount = await prisma.studentPortalAccount.findUnique({
    where: { admissionNumber }
  });

  // ============ RETURNING STUDENT DETECTION ============
  // IMPROVEMENT: If student has an existing account (even if databaseStudent was deleted),
  // guide them to use their saved password instead of resetting
  if (existingAccount?.passwordHash) {
    return json({
      success: false,
      error: 'You already have a portal account with this admission number. Use your saved password to log in instead.',
      isReturningStudent: true,
      requiresPasswordLogin: true,
      student: {
        admissionNumber,
        fullName: fullNameFromParts(validation.student)
      },
      // Helpful message explaining the situation
      hint: 'If you forgot your password, use the "Forgot Password?" option on the Password Login tab.'
    }, 409);
  }

  return json({
    success: true,
    requiresPasswordSetup: true,
    message: 'Student record verified. Create your portal password to continue.',
    setupToken: generateSetupToken(validation.student),
    student: {
      admissionNumber,
      fullName: fullNameFromParts(validation.student),
      form: validation.student.form,
      stream: validation.student.stream
    }
  });
};

const handleSetupPassword = async (request, body) => {
  if (!body.setupToken) {
    return json({ success: false, error: 'Password setup session is missing. Verify your record again.' }, 400);
  }

  if (!body.newPassword || body.newPassword !== body.confirmPassword) {
    return json({ success: false, error: 'Passwords do not match.' }, 400);
  }

  if (!validatePasswordStrength(body.newPassword)) {
    return json({
      success: false,
      error: 'Use at least 8 characters with uppercase, lowercase, a number, and a symbol.'
    }, 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(body.setupToken, JWT_SECRET);
  } catch (error) {
    return json({ success: false, error: 'Password setup link expired. Verify your record again.' }, 401);
  }

  if (decoded.type !== 'student-password-setup' || !decoded.admissionNumber) {
    return json({ success: false, error: 'Invalid password setup session.' }, 401);
  }

  const admissionNumber = normalizeAdmissionNumber(decoded.admissionNumber);
  const currentStudent = await getStudentByAdmission(admissionNumber);
  const snapshot = currentStudent || {
    admissionNumber,
    ...decoded.studentSnapshot
  };

  const existingAccount = await prisma.studentPortalAccount.findUnique({
    where: { admissionNumber }
  });

  if (existingAccount?.passwordHash) {
    return json({
      success: false,
      error: 'This admission number already has portal credentials. Use Password Login or Forgot Password instead.',
      isReturningStudent: true,
      requiresPasswordLogin: true
    }, 409);
  }

  const passwordHash = await bcrypt.hash(body.newPassword, 12);

  // ============ IMPROVED ACCOUNT CREATION/UPDATE ============
  // IMPROVEMENT: Use upsert to handle three scenarios:
  // 1. Brand new student → create account with password
  // 2. Returning student (re-upload) → preserve existing password if set
  // 3. Re-uploaded student setting password → update with new password
  
  const account = await prisma.studentPortalAccount.upsert({
    where: { admissionNumber },
    update: {
      // On update (returning student), always set the new password if provided
      ...buildAccountSnapshot(snapshot, passwordHash),
      lastLoginAt: new Date()
    },
    create: {
      // On create (new student), set everything
      ...buildAccountSnapshot(snapshot, passwordHash),
      lastLoginAt: new Date()
    }
  });

  return loginResponse(request, account, currentStudent);
};

const handlePasswordLogin = async (request, body) => {
  const admissionNumber = normalizeAdmissionNumber(body.identifier || body.admissionNumber || body.username);

  if (!admissionNumber || !body.password) {
    return json({ success: false, error: 'Admission number and password are required.' }, 400);
  }

  const account = await prisma.studentPortalAccount.findUnique({
    where: { admissionNumber }
  });

  if (!account?.passwordHash) {
    return json({
      success: false,
      error: 'No portal password exists for this admission number. Use First-Time Access to verify your record and create one.',
      requiresFirstAccess: true
    }, 404);
  }

  if (account.status !== 'active') {
    return json({ 
      success: false, 
      error: 'This portal account is not active. Please contact the school office.' 
    }, 403);
  }

  const passwordOk = await bcrypt.compare(body.password, account.passwordHash);
  if (!passwordOk) {
    return json({ success: false, error: 'Invalid admission number or password.' }, 401);
  }

  const studentRecord = await getStudentByAdmission(admissionNumber);
  const student = studentRecord?.status === 'active' ? studentRecord : null;
  
  // ============ PERSISTENT STUDENT RECOGNITION SYSTEM ============
  // IMPROVEMENT: Handle three scenarios for returning students:
  // 1. Student record exists in current batch → sync latest data
  // 2. Student record was deleted/batch removed → preserve credentials
  // 3. Student record re-uploaded after deletion → recognize and sync
  
  const updateData = {
    lastLoginAt: new Date(),
    status: 'active' // Ensure account remains active on every successful login
  };

  // If student record exists in database, sync their latest information
  // This handles batch re-uploads automatically
  if (student) {
    Object.assign(updateData, {
      firstName: student.firstName,
      middleName: student.middleName || null,
      lastName: student.lastName,
      fullName: fullNameFromParts(student),
      form: student.form,
      stream: student.stream || null,
      email: student.email || null,
      parentPhone: student.parentPhone || null
    });
  } else {
    // RETURNING STUDENT: Student record might have been deleted/re-uploaded
    // Preserve account identity while keeping existing profile snapshot
    // User can use their saved password without re-verification
    console.log(`ℹ️ Returning student login: ${admissionNumber} (record may be between batch uploads)`);
  }

  const updatedAccount = await prisma.studentPortalAccount.update({
    where: { admissionNumber },
    data: updateData
  });

  return loginResponse(request, updatedAccount, student);
};

const handlePasswordResetRequest = async (request, body) => {
  const admissionNumber = normalizeAdmissionNumber(body.admissionNumber || body.identifier);
  const requestType = body.requestType === 'change' ? 'change' : 'forgot';

  if (!admissionNumber) {
    return json({ success: false, error: 'Admission number is required.' }, 400);
  }

  const account = await prisma.studentPortalAccount.findUnique({
    where: { admissionNumber }
  });
  const studentRecord = await getStudentByAdmission(admissionNumber);
  const student = studentRecord?.status === 'active' ? studentRecord : null;

  if (!account?.passwordHash) {
    return json({
      success: false,
      error: 'No portal account was found for this admission number. Use First-Time Access first.'
    }, 404);
  }

  if (requestType === 'change') {
    if (!body.currentPassword) {
      return json({ success: false, error: 'Current password is required to request a password change.' }, 400);
    }

    const passwordOk = await bcrypt.compare(body.currentPassword, account.passwordHash);
    if (!passwordOk) {
      return json({ success: false, error: 'Current password is not correct.' }, 401);
    }
  }

  const resetEmail = student?.email || account.email || null;

  if (!resetEmail) {
    return json({
      success: false,
      error: 'No email address is registered for this student. Please contact the school office.'
    }, 404);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const { ipAddress, userAgent } = getClientInfo(request);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_MS);

  await prisma.studentPasswordResetRequest.updateMany({
    where: {
      admissionNumber,
      status: 'pending',
      usedAt: null
    },
    data: {
      status: 'replaced',
      resolvedAt: new Date()
    }
  });

  const resetRequest = await prisma.studentPasswordResetRequest.create({
    data: {
      admissionNumber,
      requestType,
      fullName: student ? fullNameFromParts(student) : account.fullName,
      email: account.email || student?.email || null,
      parentEmail: resetEmail,
      parentPhone: student?.parentPhone || account.parentPhone || null,
      message: String(body.message || '').trim() || null,
      tokenHash,
      expiresAt,
      status: 'pending',
      requestedByIp: ipAddress,
      requestedByUserAgent: userAgent
    }
  });

  const resetLink = `${getBaseUrl(request)}/pages/studentresetpassword?token=${rawToken}`;

  try {
    await sendStudentResetEmail({
      to: resetEmail,
      studentName: resetRequest.fullName,
      admissionNumber,
      resetLink,
      expiresMinutes: Math.round(RESET_TOKEN_MS / 60000)
    });
  } catch (emailError) {
    await prisma.studentPasswordResetRequest.update({
      where: { id: resetRequest.id },
      data: {
        status: 'email_failed',
        adminNote: emailError.message
      }
    });

    console.error('Student password reset email error:', emailError);
    return json({
      success: false,
      error: 'Password reset request was created, but the email could not be sent. Please contact the school office.'
    }, 500);
  }

  return json({
    success: true,
    message: `A secure password reset link has been sent to ${maskEmail(resetEmail)}. It expires in ${Math.round(RESET_TOKEN_MS / 60000)} minutes.`
  });
};

export async function POST(request) {
  try {
    const body = await request.json();
    const action = body.action || (body.password ? 'login' : 'verify-first-access');

    if (action === 'verify-first-access') return handleVerifyFirstAccess(body);
    if (action === 'setup-password') return handleSetupPassword(request, body);
    if (action === 'login') return handlePasswordLogin(request, body);
    if (action === 'request-forgot-password' || action === 'request-change-password') {
      return handlePasswordResetRequest(request, body);
    }

    return json({ success: false, error: 'Unsupported student portal action.' }, 400);
  } catch (error) {
    console.error('Student portal auth error:', error);
    return json({ success: false, error: 'Student portal authentication failed. Please try again.' }, 500);
  }
}

export async function GET(request) {
  try {
    const token = extractToken(request);

    if (!token) {
      return json({ success: false, authenticated: false, error: 'No token provided' }, 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'student' || !decoded.portalAccountId) {
      return json({ success: false, authenticated: false, error: 'Invalid student session' }, 401);
    }

    const account = await prisma.studentPortalAccount.findUnique({
      where: { id: decoded.portalAccountId }
    });

    if (!account || account.status !== 'active') {
      return json({
        success: false,
        authenticated: false,
        error: 'Portal account is not active. Please sign in again.'
      }, 401);
    }

    const session = await prisma.studentSession.findFirst({
      where: {
        token,
        studentId: account.id,
        expiresAt: { gt: new Date() }
      }
    });

    if (!session) {
      return json({
        success: false,
        authenticated: false,
        error: 'Session expired. Please log in again.',
        requiresReauth: true
      }, 401);
    }

    const studentRecord = await getStudentByAdmission(account.admissionNumber);
    const student = studentRecord?.status === 'active' ? studentRecord : null;

    return json({
      success: true,
      authenticated: true,
      student: sanitizeStudent(account, student),
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : session.expiresAt
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return json({
        success: false,
        authenticated: false,
        error: 'Session expired. Please log in again.',
        requiresReauth: true
      }, 401);
    }

    console.error('Student token verification error:', error);
    return json({ success: false, authenticated: false, error: 'Invalid token' }, 401);
  }
}

export async function DELETE(request) {
  try {
    const token = extractToken(request);

    if (token) {
      await prisma.studentSession.deleteMany({ where: { token } });
    }

    return json(
      { success: true, message: 'Logged out successfully' },
      200,
      {
        'Set-Cookie': `student_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure=${process.env.NODE_ENV === 'production'}`
      }
    );
  } catch (error) {
    console.error('Student logout error:', error);
    return json({ success: false, error: 'Logout failed' }, 500);
  }
}
