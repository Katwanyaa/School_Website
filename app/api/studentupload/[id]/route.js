import { NextResponse } from 'next/server';
import { prisma } from '../../../../libs/prisma';

const GRADE_LEVELS = ['Grade 10', 'Grade 11', 'Grade 12'];
const GRADE_STAT_KEYS = {
  'Grade 10': 'grade10',
  'Grade 11': 'grade11',
  'Grade 12': 'grade12'
};

const cleanText = (value) => String(value ?? '').replace(/\u00a0/g, ' ').trim();

const splitFullName = (fullName = '') => {
  const parts = cleanText(fullName).replace(/\s+/g, ' ').split(' ').filter(Boolean);
  return {
    firstName: parts[0] || '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : null,
    lastName: parts.length > 1 ? parts[parts.length - 1] : parts[0] || ''
  };
};

const normalizeGrade = (value) => {
  const normalized = cleanText(value).toLowerCase();
  const map = {
    grade10: 'Grade 10',
    'grade 10': 'Grade 10',
    class10: 'Grade 10',
    'class 10': 'Grade 10',
    g10: 'Grade 10',
    '10': 'Grade 10',
    grade11: 'Grade 11',
    'grade 11': 'Grade 11',
    class11: 'Grade 11',
    'class 11': 'Grade 11',
    g11: 'Grade 11',
    '11': 'Grade 11',
    grade12: 'Grade 12',
    'grade 12': 'Grade 12',
    class12: 'Grade 12',
    'class 12': 'Grade 12',
    g12: 'Grade 12',
    '12': 'Grade 12'
  };
  return map[normalized] || cleanText(value);
};

// ==================== AUTHENTICATION UTILITIES ====================

// Device Token Manager
class DeviceTokenManager {
  static validateTokensFromHeaders(headers, options = {}) {
    try {
      // Extract tokens from headers
      const adminToken = headers.get('x-admin-token') || headers.get('authorization')?.replace('Bearer ', '');
      const deviceToken = headers.get('x-device-token');

      if (!adminToken) {
        return { valid: false, reason: 'no_admin_token', message: 'Admin token is required' };
      }

      if (!deviceToken) {
        return { valid: false, reason: 'no_device_token', message: 'Device token is required' };
      }

      // Validate admin token format (basic check)
      const adminParts = adminToken.split('.');
      if (adminParts.length !== 3) {
        return { valid: false, reason: 'invalid_admin_token_format', message: 'Invalid admin token format' };
      }

      // Validate device token
      const deviceValid = this.validateDeviceToken(deviceToken);
      if (!deviceValid.valid) {
        return { 
          valid: false, 
          reason: `device_${deviceValid.reason}`,
          message: `Device token ${deviceValid.reason}: ${deviceValid.error || ''}`
        };
      }

      // Parse admin token payload
      let adminPayload;
      try {
        adminPayload = JSON.parse(atob(adminParts[1]));
        
        // Check expiration
        const currentTime = Date.now() / 1000;
        if (adminPayload.exp < currentTime) {
          return { valid: false, reason: 'admin_token_expired', message: 'Admin token has expired' };
        }
        
        // Check user role - only admins/staff can manage students
        const userRole = adminPayload.role || adminPayload.userRole;
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'PRINCIPAL', 'STAFF', 'HR_MANAGER', 'TEACHER'];
        
        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          return { 
            valid: false, 
            reason: 'invalid_role', 
            message: 'User does not have permission to manage students' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ Student management authentication successful for user:', adminPayload.name || 'Unknown');
      
      return { 
        valid: true, 
        user: {
          id: adminPayload.userId || adminPayload.id,
          name: adminPayload.name,
          email: adminPayload.email,
          role: adminPayload.role || adminPayload.userRole
        },
        deviceInfo: deviceValid.payload
      };

    } catch (error) {
      console.error('❌ Token validation error:', error);
      return { 
        valid: false, 
        reason: 'validation_error', 
        message: 'Authentication validation failed',
        error: error.message 
      };
    }
  }

  // Validate device token
  static validateDeviceToken(token) {
    try {
      // Handle base64 decoding safely
      const payloadStr = Buffer.from(token, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadStr);
      
      // Check expiration
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        return { valid: false, reason: 'expired', payload, error: 'Device token has expired' };
      }
      
      // Check age (30 days max)
      const createdAt = new Date(payload.createdAt || payload.iat * 1000);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      if (createdAt < thirtyDaysAgo) {
        return { valid: false, reason: 'age_expired', payload, error: 'Device token is too old' };
      }
      
      return { valid: true, payload };
    } catch (error) {
      return { valid: false, reason: 'invalid_format', error: error.message };
    }
  }
}

// Authentication middleware for protected requests
const authenticateRequest = (req) => {
  const headers = req.headers;
  
  // Validate tokens
  const validationResult = DeviceTokenManager.validateTokensFromHeaders(headers);
  
  if (!validationResult.valid) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { 
          success: false, 
          error: "Access Denied",
          message: "Authentication required to manage student data.",
          details: validationResult.message
        },
        { status: 401 }
      )
    };
  }

  return {
    authenticated: true,
    user: validationResult.user,
    deviceInfo: validationResult.deviceInfo
  };
};

const fullNameFromStudent = (student) => (
  [student?.fullName || [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
);

const syncPortalAccountAfterStudentUpdate = async (previousStudent, updatedStudent) => {
  if (!updatedStudent?.admissionNumber) return;

  const profileData = {
    admissionNumber: updatedStudent.admissionNumber,
    firstName: updatedStudent.firstName,
    middleName: updatedStudent.middleName || null,
    lastName: updatedStudent.lastName,
    fullName: fullNameFromStudent(updatedStudent),
    form: updatedStudent.form,
    stream: updatedStudent.stream || null,
    email: updatedStudent.email || null,
    parentEmail: updatedStudent.parentEmail || updatedStudent.email || null,
    parentPhone: updatedStudent.parentPhone || null,
    status: updatedStudent.status || 'active'
  };

  if (previousStudent?.admissionNumber && previousStudent.admissionNumber !== updatedStudent.admissionNumber) {
    const [oldAccount, newAccount] = await Promise.all([
      prisma.studentPortalAccount.findUnique({ where: { admissionNumber: previousStudent.admissionNumber } }),
      prisma.studentPortalAccount.findUnique({ where: { admissionNumber: updatedStudent.admissionNumber } })
    ]);

    if (oldAccount && !newAccount) {
      await prisma.studentPortalAccount.update({
        where: { admissionNumber: previousStudent.admissionNumber },
        data: profileData
      });
      return;
    }
  }

  await prisma.studentPortalAccount.updateMany({
    where: { admissionNumber: updatedStudent.admissionNumber },
    data: profileData
  });
};

// GET single student by ID (PUBLIC - no authentication required)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const student = await prisma.databaseStudent.findUnique({
      where: { id },
      include: {
        uploadBatch: {
          select: {
            fileName: true,
            uploadDate: true,
            status: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student
    });
  } catch (error) {
    console.error('GET student error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT update student (PROTECTED - authentication required)
export async function PUT(request, { params }) {
  try {
    // Step 1: Authenticate the PUT request
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Log authentication info
    console.log(`📝 Individual student update request from: ${auth.user.name} (${auth.user.role})`);

    const { id } = params;
    const data = await request.json();

    // Validate required fields
    const fullName = cleanText(data.fullName || [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' '));
    const grade = normalizeGrade(data.form);
    const stream = cleanText(data.stream);
    const parentEmail = cleanText(data.parentEmail || data.email);

    if (!fullName || !grade || !stream || !parentEmail) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Full name, grade/class, stream, and parent email are required',
          authenticated: true 
        },
        { status: 400 }
      );
    }

    if (!GRADE_LEVELS.includes(grade)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Grade/Class must be one of: ${GRADE_LEVELS.join(', ')}`,
          authenticated: true 
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      return NextResponse.json(
        { success: false, message: 'Parent email must be valid', authenticated: true },
        { status: 400 }
      );
    }

    const names = splitFullName(fullName);

    // Check if admission number is being changed and if it already exists
    if (data.admissionNumber) {
      const existingStudent = await prisma.databaseStudent.findFirst({
        where: {
          admissionNumber: data.admissionNumber,
          id: { not: id }
        }
      });

      if (existingStudent) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Admission number already exists',
            authenticated: true 
          },
          { status: 400 }
        );
      }
    }

    const oldStudent = await prisma.databaseStudent.findUnique({
      where: { id },
      select: { admissionNumber: true, form: true }
    });

    const updatedStudent = await prisma.databaseStudent.update({
      where: { id },
      data: {
        admissionNumber: data.admissionNumber,
        fullName,
        firstName: names.firstName,
        middleName: names.middleName,
        lastName: names.lastName,
        form: grade,
        stream,
        dateOfBirth: null,
        gender: null,
        parentPhone: null,
        email: parentEmail,
        parentEmail,
        address: null,
        status: data.status || 'active',
        updatedAt: new Date(),
        lastUpdatedBy: auth.user.id,
        lastUpdatedByName: auth.user.name,
        lastUpdatedByRole: auth.user.role
      }
    });

    await syncPortalAccountAfterStudentUpdate(oldStudent, updatedStudent);

    // Update stats if form changed
    if (oldStudent && oldStudent.form !== grade) {
      // Decrement old form count
      await prisma.studentStats.update({
          where: { id: 'global_stats' },
          data: {
          ...(GRADE_STAT_KEYS[oldStudent.form] && { [GRADE_STAT_KEYS[oldStudent.form]]: { decrement: 1 } })
        }
      });

      // Increment new form count
      await prisma.studentStats.update({
          where: { id: 'global_stats' },
          data: {
          ...(GRADE_STAT_KEYS[grade] && { [GRADE_STAT_KEYS[grade]]: { increment: 1 } })
        }
      });
    }

    console.log(`✅ Individual student updated by ${auth.user.name}: ${updatedStudent.firstName} ${updatedStudent.lastName}`);

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent,
      authenticated: true,
      updatedBy: auth.user.name
    });
  } catch (error) {
    console.error('Update student error:', error);
    
    // Handle Prisma not found error
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Student not found',
          authenticated: true 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update student',
        authenticated: true 
      },
      { status: 500 }
    );
  }
}

// DELETE student (PROTECTED - authentication required)
export async function DELETE(request, { params }) {
  try {
    // Step 1: Authenticate the DELETE request
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Log authentication info
    console.log(`🗑️ Individual student delete request from: ${auth.user.name} (${auth.user.role})`);

    const { id } = params;

    const deletedStudent = await prisma.databaseStudent.delete({
      where: { id }
    });

    // Update stats
    await prisma.studentStats.update({
      where: { id: 'global_stats' },
      data: {
        totalStudents: { decrement: 1 },
        ...(GRADE_STAT_KEYS[deletedStudent.form] && { [GRADE_STAT_KEYS[deletedStudent.form]]: { decrement: 1 } })
      }
    });

    console.log(`✅ Individual student deleted by ${auth.user.name}: ${deletedStudent.firstName} ${deletedStudent.lastName}`);

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
      authenticated: true,
      deletedBy: auth.user.name,
      deletedStudent: {
        name: `${deletedStudent.firstName} ${deletedStudent.lastName}`,
        admissionNumber: deletedStudent.admissionNumber,
        form: deletedStudent.form
      }
    });
  } catch (error) {
    console.error('Delete student error:', error);
    
    // Handle Prisma not found error
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Student not found',
          authenticated: true 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete student',
        authenticated: true 
      },
      { status: 500 }
    );
  }
}
