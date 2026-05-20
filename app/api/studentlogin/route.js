import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../../libs/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'Katwanyaa-student-secret-key-2024';
const STUDENT_TOKEN_EXPIRY = '2h';
const SESSION_MS = 2 * 60 * 60 * 1000;
const SETUP_TOKEN_EXPIRY = '20m';

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

  if (existingAccount?.passwordHash) {
    return json({
      success: false,
      error: 'A portal password already exists for this admission number. Use Password Login instead.',
      requiresPasswordLogin: true,
      student: {
        admissionNumber,
        fullName: fullNameFromParts(validation.student)
      }
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
  const passwordHash = await bcrypt.hash(body.newPassword, 12);

  const account = await prisma.studentPortalAccount.upsert({
    where: { admissionNumber },
    update: {
      ...buildAccountSnapshot(snapshot, passwordHash),
      lastLoginAt: new Date()
    },
    create: {
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
    return json({ success: false, error: 'This portal account is not active. Please contact the school office.' }, 403);
  }

  const passwordOk = await bcrypt.compare(body.password, account.passwordHash);
  if (!passwordOk) {
    return json({ success: false, error: 'Invalid admission number or password.' }, 401);
  }

  const student = await getStudentByAdmission(admissionNumber);
  const updatedAccount = await prisma.studentPortalAccount.update({
    where: { admissionNumber },
    data: {
      lastLoginAt: new Date(),
      ...(student ? {
        firstName: student.firstName,
        middleName: student.middleName || null,
        lastName: student.lastName,
        fullName: fullNameFromParts(student),
        form: student.form,
        stream: student.stream || null,
        email: student.email || null,
        parentPhone: student.parentPhone || null
      } : {})
    }
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
  const student = await getStudentByAdmission(admissionNumber);

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

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const { ipAddress, userAgent } = getClientInfo(request);

  await prisma.studentPasswordResetRequest.create({
    data: {
      admissionNumber,
      requestType,
      fullName: student ? fullNameFromParts(student) : account.fullName,
      email: student?.email || account.email || null,
      parentEmail: student?.email || account.email || null,
      parentPhone: student?.parentPhone || account.parentPhone || null,
      message: String(body.message || '').trim() || null,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      status: 'pending',
      requestedByIp: ipAddress,
      requestedByUserAgent: userAgent
    }
  });

  return json({
    success: true,
    message: 'Password help request received. The school office can now send a secure reset link using the registered parent contact.'
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

    const student = await getStudentByAdmission(account.admissionNumber);

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
