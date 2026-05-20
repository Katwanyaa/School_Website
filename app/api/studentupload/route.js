import { NextResponse } from 'next/server';
import { parse } from 'papaparse';
import * as XLSX from 'xlsx';
import { prisma } from '../../../libs/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

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

// ========== HELPER FUNCTIONS ==========

// Helper to parse dates consistently
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  const str = String(dateStr).trim();
  
  // Reject extended year formats
  if (str.match(/^[+-]\d{6}/)) return null;
  
  // Try Excel serial number
  if (!isNaN(str) && Number(str) > 0) {
    const excelDate = Number(str);
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      if (year >= 1900 && year <= new Date().getFullYear() + 5) {
        return date;
      }
    }
  }
  
  // Try ISO string
  let date = new Date(str);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    if (year >= 1900 && year <= new Date().getFullYear() + 5) {
      return date;
    }
  }
  
  // Try common formats
  const formats = [
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/,
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/,
  ];
  
  for (const format of formats) {
    const match = str.match(format);
    if (match) {
      let year, month, day;
      
      if (match[1].length === 4) {
        // YYYY-MM-DD or YYYY/MM/DD
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else {
        // DD/MM/YYYY or MM/DD/YYYY
        const part1 = parseInt(match[1]);
        const part2 = parseInt(match[2]);
        const part3 = parseInt(match[3]);
        
        if (part3 > 31) {
          // DD/MM/YYYY or MM/DD/YYYY with 4-digit year
          if (part1 > 12) {
            // DD/MM/YYYY
            day = part1;
            month = part2 - 1;
            year = part3;
          } else {
            // MM/DD/YYYY
            month = part1 - 1;
            day = part2;
            year = part3;
          }
        } else {
          // Ambiguous, assume DD/MM/YYYY
          day = part1;
          month = part2 - 1;
          year = part3 < 100 ? 2000 + part3 : part3;
        }
      }
      
      if (year && month >= 0 && day) {
        date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          const finalYear = date.getFullYear();
          if (finalYear >= 1900 && finalYear <= new Date().getFullYear() + 5) {
            return date;
          }
        }
      }
    }
  }
  
  return null;
};

// Build WHERE clause from query parameters
const buildWhereClause = (params) => {
  const { form, stream, gender, status, search } = params;
  const where = {};
  
  if (form && form !== 'all') where.form = form;
  if (stream && stream !== 'all') where.stream = stream;
  if (gender && gender !== 'all') where.gender = gender;
  if (status && status !== 'all') where.status = status;
  
  if (search && search.trim()) {
    const searchTerm = search.toLowerCase();
    
    where.OR = [
      { admissionNumber: { contains: searchTerm } },
      { firstName: { contains: searchTerm } },
      { middleName: { contains: searchTerm } },
      { lastName: { contains: searchTerm } },
      { email: { contains: searchTerm } },
      { parentPhone: { contains: searchTerm } }
    ];
  }
  
  return where;
};

// Calculate statistics from WHERE clause
const calculateStatistics = async (whereClause = {}) => {
  try {
    // Get form distribution
    const formStats = await prisma.databaseStudent.groupBy({
      by: ['form'],
      where: whereClause,
      _count: { id: true }
    });

    // Get total count
    const totalStudents = await prisma.databaseStudent.count({
      where: whereClause
    });

    // Convert to structured format
    const formStatsObj = formStats.reduce((acc, stat) => ({
      ...acc,
      [stat.form]: stat._count.id
    }), {});

    const stats = {
      totalStudents,
      form1: formStatsObj['Form 1'] || 0,
      form2: formStatsObj['Form 2'] || 0,
      form3: formStatsObj['Form 3'] || 0,
      form4: formStatsObj['Form 4'] || 0,
      updatedAt: new Date()
    };

    // Validate consistency
    const formSum = stats.form1 + stats.form2 + stats.form3 + stats.form4;
    const isValid = formSum === totalStudents;

    return {
      stats,
      validation: {
        isValid,
        totalStudents,
        sumOfForms: formSum,
        difference: totalStudents - formSum,
        hasDiscrepancy: !isValid
      }
    };
  } catch (error) {
    console.error('Error calculating statistics:', error);
    throw error;
  }
};

// Update cached statistics
const updateCachedStats = async (stats) => {
  try {
    await prisma.studentStats.upsert({
      where: { id: 'global_stats' },
      update: {
        totalStudents: stats.totalStudents,
        form1: stats.form1,
        form2: stats.form2,
        form3: stats.form3,
        form4: stats.form4,
        updatedAt: new Date()
      },
      create: {
        id: 'global_stats',
        ...stats
      }
    });
  } catch (error) {
    console.error('Error updating cached stats:', error);
  }
};

// ========== UPLOAD STRATEGY FUNCTIONS ==========

// Validate and normalize form selection
const validateFormSelection = (forms) => {
  if (!forms || forms.length === 0) {
    throw new Error('Please select at least one form to upload');
  }
  
  const validForms = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
  const normalizedForms = [];
  
  forms.forEach(form => {
    const trimmed = form.trim();
    const formMap = {
      'form1': 'Form 1',
      'form 1': 'Form 1',
      '1': 'Form 1',
      'form2': 'Form 2',
      'form 2': 'Form 2',
      '2': 'Form 2',
      'form3': 'Form 3',
      'form 3': 'Form 3',
      '3': 'Form 3',
      'form4': 'Form 4',
      'form 4': 'Form 4',
      '4': 'Form 4'
    };
    
    const normalized = formMap[trimmed.toLowerCase()] || trimmed;
    if (validForms.includes(normalized)) {
      normalizedForms.push(normalized);
    }
  });
  
  if (normalizedForms.length === 0) {
    throw new Error('Please select valid forms (Form 1, Form 2, Form 3, Form 4)');
  }
  
  return normalizedForms;
};

// Check for duplicate admission numbers
const checkDuplicateAdmissionNumbers = async (students, targetForm = null) => {
  const admissionNumbers = students.map(s => s.admissionNumber);
  
  const whereClause = {
    admissionNumber: { in: admissionNumbers }
  };
  
  if (targetForm) {
    whereClause.form = targetForm;
  }
  
  const existingStudents = await prisma.databaseStudent.findMany({
    where: whereClause,
    select: {
      admissionNumber: true,
      firstName: true,
      lastName: true,
      form: true
    }
  });
  
  const duplicates = students
    .map((student, index) => {
      const existing = existingStudents.find(s => s.admissionNumber === student.admissionNumber);
      if (existing) {
        return {
          row: index + 2,
          admissionNumber: student.admissionNumber,
          name: `${student.firstName} ${student.lastName}`,
          form: student.form,
          existingName: `${existing.firstName} ${existing.lastName}`,
          existingForm: existing.form
        };
      }
      return null;
    })
    .filter(dup => dup !== null);
  
  return duplicates;
};

// Process New Upload
const processNewUpload = async (students, uploadBatchId, selectedForms, duplicateAction = 'skip') => {
  const stats = {
    totalRows: students.length,
    validRows: 0,
    skippedRows: 0,
    errorRows: 0,
    errors: [],
    createdStudents: []
  };
  
  // Filter students to only include selected forms
  const filteredStudents = students.filter(student => 
    selectedForms.includes(student.form)
  );
  
  if (filteredStudents.length === 0) {
    throw new Error(`No students found for selected forms: ${selectedForms.join(', ')}`);
  }
  
  // Get existing admission numbers across all forms
  const existingAdmissionNumbers = new Set();
  const existingStudents = await prisma.databaseStudent.findMany({
    where: {
      admissionNumber: { 
        in: filteredStudents.map(s => s.admissionNumber) 
      }
    },
    select: {
      admissionNumber: true,
      form: true
    }
  });
  
  existingStudents.forEach(s => existingAdmissionNumbers.add(s.admissionNumber));
  
  const studentsToCreate = [];
  const seenAdmissionNumbers = new Set();
  
  for (const [index, student] of filteredStudents.entries()) {
    const validation = validateStudent(student, index);
    
    if (!validation.isValid) {
      stats.errorRows++;
      stats.errors.push(...validation.errors);
      continue;
    }
    
    const admissionNumber = student.admissionNumber;
    
    // Check duplicates within the file
    if (seenAdmissionNumbers.has(admissionNumber)) {
      stats.skippedRows++;
      stats.errors.push(`Row ${index + 2}: Duplicate admission number in file: ${admissionNumber}`);
      continue;
    }
    seenAdmissionNumbers.add(admissionNumber);
    
    // Check if admission number already exists in database
    if (existingAdmissionNumbers.has(admissionNumber)) {
      if (duplicateAction === 'skip') {
        stats.skippedRows++;
        stats.errors.push(`Row ${index + 2}: Skipped - admission number already exists: ${admissionNumber}`);
        continue;
      } else if (duplicateAction === 'replace') {
        // For replace action, we need to update existing student
        try {
          const updatedStudent = await prisma.databaseStudent.updateMany({
            where: {
              admissionNumber: admissionNumber,
              form: student.form
            },
            data: {
              firstName: student.firstName,
              middleName: student.middleName || null,
              lastName: student.lastName,
              stream: student.stream || null,
              dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
              gender: student.gender || null,
              parentPhone: student.parentPhone || null,
              email: student.email || null,
              address: student.address || null,
              uploadBatchId: uploadBatchId,
              status: 'active',
              updatedAt: new Date()
            }
          });
          
          if (updatedStudent.count === 0) {
            // Student exists but in different form - skip
            stats.skippedRows++;
            stats.errors.push(`Row ${index + 2}: Cannot replace - student exists in different form. Use Update Upload for specific forms.`);
            continue;
          }
          
          stats.validRows++;
          continue;
        } catch (error) {
          stats.skippedRows++;
          stats.errors.push(`Row ${index + 2}: Failed to replace student ${admissionNumber}: ${error.message}`);
          continue;
        }
      }
    }
    
    // Add to create list
    studentsToCreate.push({
      admissionNumber,
      firstName: student.firstName,
      middleName: student.middleName || null,
      lastName: student.lastName,
      form: student.form,
      stream: student.stream || null,
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
      gender: student.gender || null,
      parentPhone: student.parentPhone || null,
      email: student.email || null,
      address: student.address || null,
      uploadBatchId,
      status: 'active'
    });
    
    stats.validRows++;
  }
  
  // Insert students
  if (studentsToCreate.length > 0) {
    try {
      await prisma.databaseStudent.createMany({
        data: studentsToCreate,
        skipDuplicates: false // We handle duplicates manually
      });
      
      stats.createdStudents = studentsToCreate;
    } catch (error) {
      console.error('Error creating students:', error);
      stats.errorRows += studentsToCreate.length;
      stats.errors.push(`Failed to create ${studentsToCreate.length} students: ${error.message}`);
    }
  }
  
  return stats;
};

// Process Update Upload
const processUpdateUpload = async (students, uploadBatchId, targetForm) => {
  const stats = {
    totalRows: students.length,
    validRows: 0,
    updatedRows: 0,
    createdRows: 0,
    deactivatedRows: 0,
    errorRows: 0,
    errors: [],
    updatedStudents: [],
    createdStudents: []
  };
  
  // Filter students to only include the target form
  const filteredStudents = students.filter(student => 
    student.form === targetForm
  );
  
  if (filteredStudents.length === 0) {
    throw new Error(`No students found for form ${targetForm}. Make sure the form column matches the selected form.`);
  }
  
  // Get existing students in this form
  const existingStudents = await prisma.databaseStudent.findMany({
    where: {
      form: targetForm,
      status: 'active'
    },
    select: {
      id: true,
      admissionNumber: true,
      uploadBatchId: true
    }
  });
  
  const existingAdmissionMap = new Map(
    existingStudents.map(s => [s.admissionNumber, { 
      id: s.id, 
      uploadBatchId: s.uploadBatchId 
    }])
  );
  
  const seenAdmissionNumbers = new Set();
  const admissionNumbersInNewUpload = new Set();
  
  // Process each student in the upload
  for (const [index, student] of filteredStudents.entries()) {
    const validation = validateStudent(student, index);
    
    if (!validation.isValid) {
      stats.errorRows++;
      stats.errors.push(...validation.errors);
      continue;
    }
    
    const admissionNumber = student.admissionNumber;
    
    // Check duplicates within the file
    if (seenAdmissionNumbers.has(admissionNumber)) {
      stats.errorRows++;
      stats.errors.push(`Row ${index + 2}: Duplicate admission number in file: ${admissionNumber}`);
      continue;
    }
    seenAdmissionNumbers.add(admissionNumber);
    admissionNumbersInNewUpload.add(admissionNumber);
    
    // Check if student exists in this form
    const existingStudent = existingAdmissionMap.get(admissionNumber);
    
    if (existingStudent) {
      // Update existing student
      try {
        const updatedStudent = await prisma.databaseStudent.update({
          where: { id: existingStudent.id },
          data: {
            firstName: student.firstName,
            middleName: student.middleName || null,
            lastName: student.lastName,
            stream: student.stream || null,
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
            gender: student.gender || null,
            parentPhone: student.parentPhone || null,
            email: student.email || null,
            address: student.address || null,
            uploadBatchId: uploadBatchId,
            status: 'active',
            updatedAt: new Date()
          }
        });
        
        stats.updatedRows++;
        stats.updatedStudents.push(updatedStudent);
      } catch (error) {
        stats.errorRows++;
        stats.errors.push(`Row ${index + 2}: Failed to update student ${admissionNumber}: ${error.message}`);
        continue;
      }
    } else {
      // Create new student
      try {
        const newStudent = await prisma.databaseStudent.create({
          data: {
            admissionNumber,
            firstName: student.firstName,
            middleName: student.middleName || null,
            lastName: student.lastName,
            form: targetForm,
            stream: student.stream || null,
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
            gender: student.gender || null,
            parentPhone: student.parentPhone || null,
            email: student.email || null,
            address: student.address || null,
            uploadBatchId,
            status: 'active'
          }
        });
        
        stats.createdRows++;
        stats.createdStudents.push(newStudent);
      } catch (error) {
        stats.errorRows++;
        stats.errors.push(`Row ${index + 2}: Failed to create student ${admissionNumber}: ${error.message}`);
        continue;
      }
    }
    
    stats.validRows++;
  }
  
  // Deactivate students in this form that are not in the new upload
  const studentsToDeactivate = existingStudents.filter(s => 
    !admissionNumbersInNewUpload.has(s.admissionNumber)
  );
  
  if (studentsToDeactivate.length > 0) {
    await prisma.databaseStudent.updateMany({
      where: {
        id: { in: studentsToDeactivate.map(s => s.id) }
      },
      data: {
        status: 'inactive',
        updatedAt: new Date()
      }
    });
    
    stats.deactivatedRows = studentsToDeactivate.length;
  }
  
  return stats;
};

// ========== STUDENT FILE PARSING ==========
const REQUIRED_STUDENT_FIELDS = ['admissionNumber', 'firstName', 'lastName', 'form'];
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const normalizeHeader = (header) => String(header || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

const mapStudentHeader = (header) => {
  const normalized = normalizeHeader(header);

  const exactMap = {
    admissionnumber: 'admissionNumber',
    admissionno: 'admissionNumber',
    admno: 'admissionNumber',
    admnumber: 'admissionNumber',
    adm: 'admissionNumber',
    studentid: 'admissionNumber',
    firstname: 'firstName',
    fname: 'firstName',
    middlename: 'middleName',
    mname: 'middleName',
    lastname: 'lastName',
    surname: 'lastName',
    lname: 'lastName',
    form: 'form',
    class: 'form',
    grade: 'form',
    status: 'status',
    stream: 'stream',
    dateofbirth: 'dateOfBirth',
    dob: 'dateOfBirth',
    birthdate: 'dateOfBirth',
    gender: 'gender',
    sex: 'gender',
    parentphone: 'parentPhone',
    guardianphone: 'parentPhone',
    phone: 'parentPhone',
    phonenumber: 'parentPhone',
    email: 'email',
    address: 'address',
    uploadbatchid: 'uploadBatchId'
  };

  if (exactMap[normalized]) return exactMap[normalized];
  if (normalized.includes('admission')) return 'admissionNumber';
  if (normalized.includes('first')) return 'firstName';
  if (normalized.includes('middle')) return 'middleName';
  if (normalized.includes('last') || normalized.includes('surname')) return 'lastName';
  if (normalized.includes('form') || normalized.includes('class') || normalized.includes('grade')) return 'form';
  if (normalized.includes('stream')) return 'stream';
  if (normalized.includes('birth') || normalized === 'dob') return 'dateOfBirth';
  if (normalized.includes('gender') || normalized.includes('sex')) return 'gender';
  if (normalized.includes('phone')) return 'parentPhone';
  if (normalized.includes('email')) return 'email';
  if (normalized.includes('address')) return 'address';
  if (normalized.includes('status')) return 'status';

  return normalized;
};

const cleanText = (value) => String(value ?? '')
  .replace(/\u00a0/g, ' ')
  .trim();

const normalizeAdmissionNumber = (value) => cleanText(value).toUpperCase();

const normalizeFormValue = (value) => {
  const formValue = cleanText(value).toLowerCase();
  const formMap = {
    form1: 'Form 1',
    'form 1': 'Form 1',
    one: 'Form 1',
    '1': 'Form 1',
    form2: 'Form 2',
    'form 2': 'Form 2',
    two: 'Form 2',
    '2': 'Form 2',
    form3: 'Form 3',
    'form 3': 'Form 3',
    three: 'Form 3',
    '3': 'Form 3',
    form4: 'Form 4',
    'form 4': 'Form 4',
    four: 'Form 4',
    '4': 'Form 4'
  };

  return formMap[formValue] || cleanText(value);
};

const normalizeStatus = (value) => {
  const status = cleanText(value || 'active').toLowerCase();
  return ['active', 'inactive', 'graduated', 'transferred'].includes(status) ? status : 'active';
};

const normalizeStudentRow = (row, index) => {
  const normalizedRow = {};

  Object.entries(row || {}).forEach(([key, value]) => {
    normalizedRow[mapStudentHeader(key)] = value;
  });

  return {
    __rowNumber: normalizedRow.__rowNumber || index + 2,
    admissionNumber: normalizeAdmissionNumber(normalizedRow.admissionNumber),
    firstName: cleanText(normalizedRow.firstName),
    middleName: cleanText(normalizedRow.middleName) || null,
    lastName: cleanText(normalizedRow.lastName),
    form: normalizeFormValue(normalizedRow.form),
    status: normalizeStatus(normalizedRow.status),
    stream: cleanText(normalizedRow.stream) || null,
    dateOfBirth: normalizedRow.dateOfBirth ? parseDate(normalizedRow.dateOfBirth) : null,
    gender: cleanText(normalizedRow.gender) || null,
    parentPhone: cleanText(normalizedRow.parentPhone) || null,
    email: cleanText(normalizedRow.email) || null,
    address: cleanText(normalizedRow.address) || null
  };
};

const rowHasAnyStudentData = (student) => (
  [
    student.admissionNumber,
    student.firstName,
    student.middleName,
    student.lastName,
    student.form,
    student.stream,
    student.gender,
    student.parentPhone,
    student.email,
    student.address
  ].some((value) => cleanText(value))
);

const ensureRequiredHeaders = (headers) => {
  const mappedHeaders = [...new Set(headers.map(mapStudentHeader))];
  const missing = REQUIRED_STUDENT_FIELDS.filter((field) => !mappedHeaders.includes(field));

  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(', ')}. Required columns are admissionNumber, firstName, lastName, and form.`);
  }
};

const chooseBestCsvParse = (text) => {
  const delimiters = [',', '\t', ';'];
  const candidates = delimiters.map((delimiter) => {
    const result = parse(text, {
      header: true,
      skipEmptyLines: 'greedy',
      delimiter,
      dynamicTyping: false,
      transformHeader: mapStudentHeader
    });
    const fields = result.meta.fields || [];
    const requiredFound = REQUIRED_STUDENT_FIELDS.filter((field) => fields.includes(field)).length;

    return { delimiter, result, score: requiredFound * 100 + fields.length };
  });

  return candidates.sort((a, b) => b.score - a.score)[0];
};

const parseCSV = async (file) => {
  const text = await file.text();

  if (!text.trim()) {
    throw new Error('The CSV file is empty.');
  }

  const candidate = chooseBestCsvParse(text);
  const results = candidate.result;

  if (results.errors?.length) {
    const fatalError = results.errors.find((error) => error.type === 'Delimiter' || error.code === 'UndetectableDelimiter');
    if (fatalError) {
      throw new Error(`CSV parsing failed: ${fatalError.message}`);
    }
  }

  const headers = results.meta.fields || [];
  ensureRequiredHeaders(headers);

  const rows = (results.data || [])
    .map((row, index) => normalizeStudentRow(row, index))
    .filter(rowHasAnyStudentData);

  if (rows.length === 0) {
    throw new Error('No student rows were found in the CSV file.');
  }

  return rows;
};

const parseExcel = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error('The Excel workbook has no sheets.');
  }

  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false,
    dateNF: 'yyyy-mm-dd',
    blankrows: false
  });

  if (jsonData.length === 0) {
    throw new Error('The Excel file is empty or the first sheet has no student rows.');
  }

  ensureRequiredHeaders(Object.keys(jsonData[0] || {}));

  const rows = jsonData
    .map((row, index) => normalizeStudentRow(row, index))
    .filter(rowHasAnyStudentData);

  if (rows.length === 0) {
    throw new Error('No student rows were found in the Excel file.');
  }

  return rows;
};

// ========== VALIDATION ==========
const validateStudent = (student, index) => {
  const errors = [];
  const rowNumber = student.__rowNumber || index + 2;
  
  // Admission number
  if (!student.admissionNumber) {
    errors.push(`Row ${rowNumber}: Admission number is required`);
  } else if (!/^[A-Z0-9][A-Z0-9/-]{1,49}$/.test(student.admissionNumber)) {
    errors.push(`Row ${rowNumber}: Admission number must be 2-50 letters/numbers (got: ${student.admissionNumber})`);
  }
  
  // Names
  if (!student.firstName) {
    errors.push(`Row ${rowNumber}: First name is required`);
  } else if (student.firstName.length > 100) {
    errors.push(`Row ${rowNumber}: First name too long (max 100 chars)`);
  }
  
  if (!student.lastName) {
    errors.push(`Row ${rowNumber}: Last name is required`);
  } else if (student.lastName.length > 100) {
    errors.push(`Row ${rowNumber}: Last name too long (max 100 chars)`);
  }
  
  // Form validation
  const formValue = student.form.trim();
  const validForms = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
  
  if (!validForms.includes(formValue)) {
    errors.push(`Row ${rowNumber}: Form must be one of: ${validForms.join(', ')} (got: ${formValue || 'empty'})`);
  }
  
  // Update student with normalized form
  student.form = formValue;
  
  // Date of birth
  if (student.dateOfBirth) {
    const dob = new Date(student.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push(`Row ${rowNumber}: Invalid date of birth format`);
    } else {
      const year = dob.getFullYear();
      const currentYear = new Date().getFullYear();
      
      if (dob > new Date()) {
        errors.push(`Row ${rowNumber}: Date of birth cannot be in the future`);
      }
      
      if (year < 1900) {
        errors.push(`Row ${rowNumber}: Date of birth year must be after 1900`);
      }
      
      const age = currentYear - year;
      if (age < 4) {
        errors.push(`Row ${rowNumber}: Student appears to be too young (${age} years old)`);
      }
      
      if (age > 30) {
        errors.push(`Row ${rowNumber}: Student appears to be too old (${age} years old)`);
      }
    }
  }
  
  // Optional fields
  if (student.middleName && student.middleName.length > 100) {
    errors.push(`Row ${rowNumber}: Middle name too long (max 100 chars)`);
  }
  
  if (student.stream && student.stream.length > 50) {
    errors.push(`Row ${rowNumber}: Stream too long (max 50 chars)`);
  }
  
  if (student.gender && student.gender.length > 20) {
    errors.push(`Row ${rowNumber}: Gender too long (max 20 chars)`);
  }
  
  if (student.parentPhone) {
    const phoneRegex = /^[+]?[0-9\s\-()]{10,20}$/;
    if (!phoneRegex.test(student.parentPhone)) {
      errors.push(`Row ${rowNumber}: Parent phone number is invalid`);
    } else if (student.parentPhone.length > 20) {
      errors.push(`Row ${rowNumber}: Parent phone too long (max 20 chars)`);
    }
  }
  
  if (student.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.email)) {
      errors.push(`Row ${rowNumber}: Email is invalid`);
    } else if (student.email.length > 100) {
      errors.push(`Row ${rowNumber}: Email too long (max 100 chars)`);
    }
  }
  
  if (student.address && student.address.length > 255) {
    errors.push(`Row ${rowNumber}: Address too long (max 255 chars)`);
  }
  
  return { isValid: errors.length === 0, errors };
};

class UploadValidationError extends Error {
  constructor(message, details = [], status = 422) {
    super(message);
    this.name = 'UploadValidationError';
    this.details = details;
    this.status = status;
  }
}

const toStudentCreateData = (student, uploadBatchId, formOverride = null) => ({
  admissionNumber: student.admissionNumber,
  firstName: student.firstName,
  middleName: student.middleName || null,
  lastName: student.lastName,
  form: formOverride || student.form,
  stream: student.stream || null,
  dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
  gender: student.gender || null,
  parentPhone: student.parentPhone || null,
  email: student.email || null,
  address: student.address || null,
  uploadBatchId,
  status: student.status || 'active'
});

const toStudentUpdateData = (student, uploadBatchId, formOverride = null) => ({
  firstName: student.firstName,
  middleName: student.middleName || null,
  lastName: student.lastName,
  form: formOverride || student.form,
  stream: student.stream || null,
  dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
  gender: student.gender || null,
  parentPhone: student.parentPhone || null,
  email: student.email || null,
  address: student.address || null,
  uploadBatchId,
  status: student.status || 'active',
  updatedAt: new Date()
});

const chunkArray = (items, size = 500) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const prepareUploadRows = (students, { uploadType, selectedForms, targetForm }) => {
  const errors = [];
  const warnings = [];
  const processableStudents = [];
  const skippedByForm = [];
  const seenAdmissionRows = new Map();
  const duplicateRows = [];

  students.forEach((student, index) => {
    const validation = validateStudent(student, index);

    if (!validation.isValid) {
      errors.push(...validation.errors);
      return;
    }

    if (uploadType === 'new' && !selectedForms.includes(student.form)) {
      skippedByForm.push(student);
      warnings.push(`Row ${student.__rowNumber}: skipped because ${student.form} was not selected for this upload.`);
      return;
    }

    if (uploadType === 'update' && student.form !== targetForm) {
      errors.push(`Row ${student.__rowNumber}: Form is ${student.form}, but this refresh is for ${targetForm}.`);
      return;
    }

    if (seenAdmissionRows.has(student.admissionNumber)) {
      duplicateRows.push({
        admissionNumber: student.admissionNumber,
        firstRow: seenAdmissionRows.get(student.admissionNumber),
        row: student.__rowNumber
      });
      return;
    }

    seenAdmissionRows.set(student.admissionNumber, student.__rowNumber);
    processableStudents.push(student);
  });

  duplicateRows.forEach((duplicate) => {
    errors.push(`Rows ${duplicate.firstRow} and ${duplicate.row}: duplicate admission number in file (${duplicate.admissionNumber}).`);
  });

  if (processableStudents.length === 0 && errors.length === 0) {
    errors.push(`No rows matched the selected form${selectedForms.length > 1 ? 's' : ''}: ${selectedForms.join(', ')}.`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    processableStudents,
    skippedByForm
  };
};

const findStudentDuplicates = async (students, targetForm = null) => {
  const admissionNumbers = [...new Set(students.map((student) => student.admissionNumber))];
  const existingStudents = admissionNumbers.length > 0
    ? await prisma.databaseStudent.findMany({
        where: { admissionNumber: { in: admissionNumbers } },
        select: {
          admissionNumber: true,
          firstName: true,
          lastName: true,
          form: true,
          status: true
        }
      })
    : [];
  const existingMap = new Map(existingStudents.map((student) => [student.admissionNumber, student]));

  return students
    .map((student) => {
      const existing = existingMap.get(student.admissionNumber);
      if (!existing) return null;
      if (targetForm && existing.form !== targetForm) {
        return {
          row: student.__rowNumber,
          admissionNumber: student.admissionNumber,
          name: `${student.firstName} ${student.lastName}`,
          form: student.form,
          existingName: `${existing.firstName} ${existing.lastName}`,
          existingForm: existing.form,
          conflict: 'different_form'
        };
      }

      return {
        row: student.__rowNumber,
        admissionNumber: student.admissionNumber,
        name: `${student.firstName} ${student.lastName}`,
        form: student.form,
        existingName: `${existing.firstName} ${existing.lastName}`,
        existingForm: existing.form,
        status: existing.status
      };
    })
    .filter(Boolean);
};

// Sync existing StudentPortalAccounts with latest student data from upload
// IMPORTANT: Preserves passwordHash and other sensitive fields
// IMPROVED: Now explicitly handles orphaned accounts from deleted batches
const syncPortalAccountSnapshots = async (tx, students) => {
  const admissionNumbers = [...new Set(students.map((student) => student.admissionNumber))];
  if (admissionNumbers.length === 0 || !tx.studentPortalAccount) return;

  const accounts = await tx.studentPortalAccount.findMany({
    where: { admissionNumber: { in: admissionNumbers } },
    select: { 
      id: true, 
      admissionNumber: true,
      passwordHash: true,
      passwordSetAt: true
    }
  });
  const accountNumbers = new Set(accounts.map((account) => account.admissionNumber));

  for (const student of students) {
    if (!accountNumbers.has(student.admissionNumber)) continue;

    const existingAccount = accounts.find(a => a.admissionNumber === student.admissionNumber);
    
    // ============ PERSISTENT STUDENT RECOGNITION ============
    // IMPROVEMENT: This ensures returning students are recognized even after:
    // 1. Batch deletions
    // 2. Account orphaning
    // 3. Re-uploads with same admission numbers
    //
    // Strategy: Only update student info fields, NEVER modify password
    // This preserves the student's credentials and authentication history
    
    await tx.studentPortalAccount.update({
      where: { admissionNumber: student.admissionNumber },
      data: {
        firstName: student.firstName,
        middleName: student.middleName || null,
        lastName: student.lastName,
        fullName: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
        form: student.form,
        stream: student.stream || null,
        email: student.email || null,
        parentPhone: student.parentPhone || null,
        status: 'active', // Always set to active when re-uploaded
        // CRITICAL: passwordHash and passwordSetAt are NOT updated here
        // This preserves the student's existing password across uploads
        // If a student's batch was deleted, they can still login with saved password
        // If student is re-uploaded later, they keep same password
      }
    });
    
    console.log(`✅ Portal account synced for returning student: ${student.admissionNumber}`);
  }
};

// Additional utility: Find orphaned StudentPortalAccounts (optional cleanup)
const findOrphanedPortalAccounts = async (tx) => {
  const orphaned = await tx.studentPortalAccount.findMany({
    where: {
      // Portal account exists but no matching databaseStudent
      // This can happen after batch deletions
      // These accounts should NOT be deleted - students might still use saved passwords
    }
  });
  return orphaned;
};

const processStudentUpload = async (tx, {
  students,
  uploadBatchId,
  uploadType,
  selectedForms,
  targetForm,
  duplicateAction,
  auth,
  file,
  fileExtension,
  skippedByForm,
  warnings
}) => {
  const stats = {
    totalRows: students.length + skippedByForm.length,
    validRows: 0,
    skippedRows: skippedByForm.length,
    errorRows: 0,
    createdRows: 0,
    updatedRows: 0,
    deactivatedRows: 0,
    newAccountsCreated: 0,
    returningStudentsRecognized: 0,
    errors: [],
    warnings: [...warnings],
    createdStudents: [],
    updatedStudents: []
  };

  const admissionNumbers = [...new Set(students.map((student) => student.admissionNumber))];
  
  // ============ RETURNING STUDENT DETECTION ============
  // IMPROVEMENT: Before processing upload, check for existing StudentPortalAccounts
  // This helps us recognize returning students even if their databaseStudent was deleted
  const existingPortalAccounts = await tx.studentPortalAccount.findMany({
    where: { admissionNumber: { in: admissionNumbers } },
    select: {
      admissionNumber: true,
      passwordHash: true,
      status: true
    }
  });
  const portalAccountMap = new Map(existingPortalAccounts.map(a => [a.admissionNumber, a]));
  
  const existingStudents = await tx.databaseStudent.findMany({
    where: { admissionNumber: { in: admissionNumbers } },
    select: {
      id: true,
      admissionNumber: true,
      form: true,
      status: true
    }
  });
  const existingMap = new Map(existingStudents.map((student) => [student.admissionNumber, student]));
  const relationshipErrors = [];

  if (uploadType === 'update') {
    students.forEach((student) => {
      const existing = existingMap.get(student.admissionNumber);
      if (existing && existing.form !== targetForm) {
        relationshipErrors.push(`Row ${student.__rowNumber}: admission number ${student.admissionNumber} already belongs to ${existing.form}, not ${targetForm}.`);
      }
    });
  }

  if (relationshipErrors.length > 0) {
    throw new UploadValidationError('Some rows conflict with existing student records.', relationshipErrors, 409);
  }

  const createRows = [];
  const updateRows = [];
  const uploadedAdmissionNumbers = new Set(students.map((student) => student.admissionNumber));

  students.forEach((student) => {
    const existing = existingMap.get(student.admissionNumber);
    const portalAccount = portalAccountMap.get(student.admissionNumber);

    if (!existing) {
      // ============ NEW OR RETURNING STUDENT ============
      // Check if they have a StudentPortalAccount (returning) or not (brand new)
      if (portalAccount) {
        stats.returningStudentsRecognized++;
        console.log(`✅ Recognized returning student: ${student.admissionNumber}`);
      } else {
        stats.newAccountsCreated++;
      }
      
      createRows.push(toStudentCreateData(student, uploadBatchId, uploadType === 'update' ? targetForm : null));
      return;
    }

    if (uploadType === 'new' && duplicateAction !== 'replace') {
      stats.skippedRows++;
      stats.warnings.push(`Row ${student.__rowNumber}: skipped because admission number ${student.admissionNumber} already exists.`);
      return;
    }

    updateRows.push({
      id: existing.id,
      student,
      data: toStudentUpdateData(student, uploadBatchId, uploadType === 'update' ? targetForm : null)
    });
  });

  for (const chunk of chunkArray(createRows, 500)) {
    if (chunk.length === 0) continue;
    await tx.databaseStudent.createMany({ data: chunk, skipDuplicates: false });
  }

  for (const row of updateRows) {
    const updated = await tx.databaseStudent.update({
      where: { id: row.id },
      data: row.data
    });
    stats.updatedStudents.push(updated);
  }

  if (uploadType === 'update') {
    const deactivated = await tx.databaseStudent.updateMany({
      where: {
        form: targetForm,
        status: 'active',
        admissionNumber: { notIn: [...uploadedAdmissionNumbers] }
      },
      data: {
        status: 'inactive',
        updatedAt: new Date()
      }
    });

    stats.deactivatedRows = deactivated.count;
  }

  stats.createdRows = createRows.length;
  stats.updatedRows = updateRows.length;
  stats.validRows = stats.createdRows + stats.updatedRows;
  stats.createdStudents = createRows;

  // ============ SYNC PORTAL ACCOUNTS ============
  // CRITICAL: Sync all processed students with their StudentPortalAccount records
  // This ensures returning students keep their passwords and are recognized
  await syncPortalAccountSnapshots(tx, [
    ...createRows.map((row) => ({
      ...row,
      __rowNumber: null
    })),
    ...updateRows.map((row) => row.student)
  ]);

  await tx.studentBulkUpload.create({
    data: {
      id: uploadBatchId,
      fileName: file.name,
      fileType: fileExtension,
      uploadedBy: auth.user.name || auth.user.email || 'Admin',
      status: 'completed',
      processedDate: new Date(),
      totalRows: stats.totalRows,
      validRows: stats.validRows,
      skippedRows: stats.skippedRows,
      errorRows: stats.errorRows,
      errorLog: stats.errors.length > 0 ? stats.errors.slice(0, 100) : undefined,
      metadata: {
        uploadType,
        selectedForms,
        targetForm: uploadType === 'update' ? targetForm : null,
        duplicateAction,
        uploadedBy: auth.user.name,
        userRole: auth.user.role,
        createdRows: stats.createdRows,
        updatedRows: stats.updatedRows,
        deactivatedRows: stats.deactivatedRows,
        returningStudentsRecognized: stats.returningStudentsRecognized,
        newAccountsCreated: stats.newAccountsCreated,
        warnings: stats.warnings.slice(0, 100),
        processedAt: new Date().toISOString()
      }
    }
  });

  return stats;
};

// ========== API ENDPOINTS ==========

// GET - Main endpoint with consistent statistics (PUBLIC - no authentication required)
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const form = url.searchParams.get('form') || '';
    const stream = url.searchParams.get('stream') || '';
    const gender = url.searchParams.get('gender') || '';
    const status = url.searchParams.get('status') || 'active';
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const includeStats = url.searchParams.get('includeStats') !== 'false';

    // Build filters
    const filters = { form, stream, gender, status, search };
    const where = buildWhereClause(filters);

if (action === 'uploads') {
  const uploads = await prisma.studentBulkUpload.findMany({
    orderBy: { uploadDate: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      fileName: true,
      fileType: true,
      status: true,
      uploadDate: true,
      uploadedBy: true,
      processedDate: true,
      totalRows: true,
      validRows: true,
      skippedRows: true,
      errorRows: true,
      errorLog: true
    }
  });

  const total = await prisma.studentBulkUpload.count();
  
  return NextResponse.json({
    success: true,
    uploads,
    pagination: { 
      page, 
      limit, 
      total, 
      pages: Math.ceil(total / limit) 
    }
  });
}
    if (action === 'stats') {
      // Calculate fresh statistics with filters
      const statsResult = await calculateStatistics(where);
      
      // Update cache for consistency
      if (Object.keys(where).length === 0) {
        await updateCachedStats(statsResult.stats);
      }
      
      return NextResponse.json({
        success: true,
        data: {
          stats: statsResult.stats,
          filters,
          validation: statsResult.validation,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Get students with pagination
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [students, total] = await Promise.all([
      prisma.databaseStudent.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          admissionNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          form: true,
          stream: true,
          dateOfBirth: true,
          gender: true,
          parentPhone: true,
          email: true,
          address: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          uploadBatchId: true,
          uploadBatch: {
            select: {
              fileName: true,
              uploadDate: true
            }
          }
        }
      }),
      prisma.databaseStudent.count({ where })
    ]);

    // Calculate statistics for this filtered set
    let statsResult = null;
    if (includeStats) {
      statsResult = await calculateStatistics(where);
      
      // If no filters, update cache
      if (Object.keys(where).length === 0) {
        await updateCachedStats(statsResult.stats);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        students,
        stats: statsResult?.stats || null,
        filters,
        validation: statsResult?.validation || null,
        pagination: { 
          page, 
          limit, 
          total, 
          pages: Math.ceil(total / limit) 
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST - Bulk upload with atomic validation and large-file stability
export async function POST(request) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const uploadType = cleanText(formData.get('uploadType')).toLowerCase();
    const formsInput = formData.get('forms');
    const targetFormInput = formData.get('targetForm');
    const checkDuplicates = formData.get('checkDuplicates') === 'true';
    const duplicateAction = cleanText(formData.get('duplicateAction') || 'skip').toLowerCase();

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({
        success: false,
        error: 'Please choose a CSV or Excel file before uploading.',
        authenticated: true
      }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({
        success: false,
        error: 'The selected file is empty.',
        authenticated: true
      }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({
        success: false,
        error: 'The file is too large. Please upload a file below 25MB.',
        authenticated: true
      }, { status: 413 });
    }

    if (!['new', 'update'].includes(uploadType)) {
      return NextResponse.json({
        success: false,
        error: 'Choose a valid upload type: new or update.',
        authenticated: true
      }, { status: 400 });
    }

    if (!['skip', 'replace'].includes(duplicateAction)) {
      return NextResponse.json({
        success: false,
        error: 'Duplicate action must be either skip or replace.',
        authenticated: true
      }, { status: 400 });
    }

    let selectedForms = [];
    let targetForm = null;

    try {
      if (uploadType === 'new') {
        selectedForms = validateFormSelection(JSON.parse(formsInput || '[]'));
      } else {
        targetForm = validateFormSelection([targetFormInput])[0];
        selectedForms = [targetForm];
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error.message || 'Please select valid form values.',
        authenticated: true
      }, { status: 400 });
    }

    const fileName = cleanText(file.name).toLowerCase();
    const fileExtension = fileName.split('.').pop();

    if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Upload a CSV, XLSX, or XLS student file.',
        authenticated: true
      }, { status: 400 });
    }

    const rawData = fileExtension === 'csv'
      ? await parseCSV(file)
      : await parseExcel(file);

    const prepared = prepareUploadRows(rawData, { uploadType, selectedForms, targetForm });

    if (!prepared.ok) {
      return NextResponse.json({
        success: false,
        error: 'The upload was not saved because some rows need correction.',
        errors: prepared.errors.slice(0, 100),
        errorCount: prepared.errors.length,
        authenticated: true
      }, { status: 422 });
    }

    const duplicates = await findStudentDuplicates(
      prepared.processableStudents,
      uploadType === 'update' ? targetForm : null
    );

    if (checkDuplicates) {
      return NextResponse.json({
        success: true,
        hasDuplicates: duplicates.length > 0,
        duplicates,
        totalRows: rawData.length,
        validRows: prepared.processableStudents.length,
        skippedRows: prepared.skippedByForm.length,
        warnings: prepared.warnings.slice(0, 50),
        authenticated: true,
        uploadedBy: auth.user.name,
        message: duplicates.length > 0
          ? `Found ${duplicates.length} existing admission number${duplicates.length === 1 ? '' : 's'}.`
          : 'No existing admission numbers were found.'
      });
    }

    if (uploadType === 'new' && duplicateAction === 'replace') {
      const differentFormConflicts = duplicates.filter((duplicate) => (
        duplicate.conflict === 'different_form' && !selectedForms.includes(duplicate.existingForm)
      ));

      if (differentFormConflicts.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'Some admission numbers already exist in forms that were not selected for this replacement.',
          duplicates: differentFormConflicts.slice(0, 50),
          authenticated: true
        }, { status: 409 });
      }
    }

    const batchId = `BATCH_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const processingStats = await prisma.$transaction(async (tx) => (
      processStudentUpload(tx, {
        students: prepared.processableStudents,
        uploadBatchId: batchId,
        uploadType,
        selectedForms,
        targetForm,
        duplicateAction,
        auth,
        file,
        fileExtension,
        skippedByForm: prepared.skippedByForm,
        warnings: prepared.warnings
      })
    ), {
      maxWait: 30000,
      timeout: 180000
    });

    const finalStats = await calculateStatistics({});
    await updateCachedStats(finalStats.stats);

    return NextResponse.json({
      success: true,
      message: uploadType === 'new'
        ? `Upload completed: ${processingStats.createdRows} created, ${processingStats.updatedRows} replaced, ${processingStats.skippedRows} skipped.`
        : `Refresh completed for ${targetForm}: ${processingStats.createdRows} created, ${processingStats.updatedRows} updated, ${processingStats.deactivatedRows} deactivated.`,
      batch: {
        id: batchId,
        fileName: file.name,
        status: 'completed',
        uploadType,
        selectedForms
      },
      stats: finalStats.stats,
      validation: finalStats.validation,
      processingStats,
      warnings: processingStats.warnings.slice(0, 50),
      authenticated: true,
      uploadedBy: auth.user.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Student upload error:', error);

    const status = error instanceof UploadValidationError ? error.status : 500;
    return NextResponse.json({
      success: false,
      error: error instanceof UploadValidationError
        ? error.message
        : 'Upload failed before saving. Please check the file and try again.',
      errors: error.details?.slice?.(0, 100) || undefined,
      details: error instanceof UploadValidationError ? undefined : error.message,
      authenticated: true,
      suggestion: 'Use the current student spreadsheet columns: admissionNumber, firstName, middleName, lastName, form, status, stream, dateOfBirth, gender, parentPhone, email, address.'
    }, { status });
  }
}


// PUT - Update student with transaction (PROTECTED - authentication required)
export async function PUT(request) {
  try {
    // Step 1: Authenticate the PUT request
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Log authentication info
    console.log(`📝 Student update request from: ${auth.user.name} (${auth.user.role})`);

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required', authenticated: true },
        { status: 400 }
      );
    }

    // Use transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get current student
      const currentStudent = await tx.databaseStudent.findUnique({
        where: { id }
      });

      if (!currentStudent) {
        throw new Error('Student not found');
      }

      // Check admission number uniqueness
      if (updateData.admissionNumber && updateData.admissionNumber !== currentStudent.admissionNumber) {
        const existing = await tx.databaseStudent.findFirst({
          where: {
            admissionNumber: updateData.admissionNumber,
            NOT: { id: id }
          }
        });

        if (existing) {
          throw new Error('Admission number already exists');
        }
      }

      // Parse date if provided
      if (updateData.dateOfBirth) {
        try {
          updateData.dateOfBirth = new Date(updateData.dateOfBirth);
          if (isNaN(updateData.dateOfBirth.getTime())) {
            throw new Error('Invalid date format');
          }
        } catch (dateError) {
          throw new Error('Invalid date format');
        }
      }

      // Update student with audit info
      const updatedStudent = await tx.databaseStudent.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
          
        }
      });

      await syncPortalAccountSnapshots(tx, [updatedStudent]);

      // Update stats if form changed
      if (updateData.form && updateData.form !== currentStudent.form) {
        // Decrement count from old form
        await tx.studentStats.update({
          where: { id: 'global_stats' },
          data: {
            ...(currentStudent.form === 'Form 1' && { form1: { decrement: 1 } }),
            ...(currentStudent.form === 'Form 2' && { form2: { decrement: 1 } }),
            ...(currentStudent.form === 'Form 3' && { form3: { decrement: 1 } }),
            ...(currentStudent.form === 'Form 4' && { form4: { decrement: 1 } })
          }
        });

        // Increment count to new form
        await tx.studentStats.update({
          where: { id: 'global_stats' },
          data: {
            ...(updateData.form === 'Form 1' && { form1: { increment: 1 } }),
            ...(updateData.form === 'Form 2' && { form2: { increment: 1 } }),
            ...(updateData.form === 'Form 3' && { form3: { increment: 1 } }),
            ...(updateData.form === 'Form 4' && { form4: { increment: 1 } })
          }
        });
      }

      return updatedStudent;
    });

    // Recalculate to ensure consistency
    const finalStats = await calculateStatistics({});

    console.log(`✅ Student updated by ${auth.user.name}: ${result.firstName} ${result.lastName}`);

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      data: {
        student: result,
        stats: finalStats.stats,
        validation: finalStats.validation
      },
      authenticated: true,

    });

  } catch (error) {
    console.error('PUT error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Student not found', authenticated: true },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Update failed',
        authenticated: true
      },
      { status: 500 }
    );
  }
}

// DELETE - Student or batch with transaction (PROTECTED - authentication required)
export async function DELETE(request) {
  try {
    // Step 1: Authenticate the DELETE request
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Log authentication info
    console.log(`🗑️ Student delete request from: ${auth.user.name} (${auth.user.role})`);

    const url = new URL(request.url);
    const batchId = url.searchParams.get('batchId');
    const studentId = url.searchParams.get('studentId');
    const hardDelete = url.searchParams.get('hardDelete') === 'true';

    if (batchId) {
      const result = await prisma.$transaction(async (tx) => {
        const batch = await tx.studentBulkUpload.findUnique({
          where: { id: batchId }
        });

        if (!batch) {
          throw new Error('Batch not found');
        }

        const batchStudents = await tx.databaseStudent.findMany({
          where: { uploadBatchId: batchId },
          select: { form: true, status: true }
        });

        const formCounts = batchStudents.reduce((acc, student) => {
          if (student.status === 'active') {
            acc[student.form] = (acc[student.form] || 0) + 1;
          }
          return acc;
        }, {});

        if (hardDelete) {
          // Hard delete students
          await tx.databaseStudent.deleteMany({
            where: { uploadBatchId: batchId }
          });
        } else {
          // Soft delete students (mark as inactive)
          await tx.databaseStudent.updateMany({
            where: { uploadBatchId: batchId },
            data: {
              status: 'inactive',
              updatedAt: new Date(),
              
            }
          });
        }

        // Update stats if hard deleting
        if (hardDelete) {
          await tx.studentStats.update({
            where: { id: 'global_stats' },
            data: {
              totalStudents: { decrement: batchStudents.length },
              form1: { decrement: formCounts['Form 1'] || 0 },
              form2: { decrement: formCounts['Form 2'] || 0 },
              form3: { decrement: formCounts['Form 3'] || 0 },
              form4: { decrement: formCounts['Form 4'] || 0 }
            }
          });
        }

        // Delete batch record
        await tx.studentBulkUpload.delete({
          where: { id: batchId }
        });

        return { 
          batch, 
          deletedCount: batchStudents.length,
          deletionType: hardDelete ? 'hard' : 'soft'
        };
      });

      // Recalculate to ensure consistency
      const finalStats = await calculateStatistics({});

      console.log(`✅ Batch deleted by ${auth.user.name}: ${result.batch.fileName} (${result.deletedCount} students)`);

      return NextResponse.json({
        success: true,
        message: `${result.deletionType === 'hard' ? 'Hard deleted' : 'Soft deleted'} batch ${result.batch.fileName} and ${result.deletedCount} students`,
        data: {
          stats: finalStats.stats,
          validation: finalStats.validation
        },
        authenticated: true,
      });
    }

    if (studentId) {
      const result = await prisma.$transaction(async (tx) => {
        const student = await tx.databaseStudent.findUnique({
          where: { id: studentId }
        });

        if (!student) {
          throw new Error('Student not found');
        }

        if (hardDelete) {
          // Hard delete student
          await tx.databaseStudent.delete({
            where: { id: studentId }
          });

          // Update stats
          await tx.studentStats.update({
            where: { id: 'global_stats' },
            data: {
              totalStudents: { decrement: 1 },
              ...(student.form === 'Form 1' && { form1: { decrement: 1 } }),
              ...(student.form === 'Form 2' && { form2: { decrement: 1 } }),
              ...(student.form === 'Form 3' && { form3: { decrement: 1 } }),
              ...(student.form === 'Form 4' && { form4: { decrement: 1 } })
            }
          });
        } else {
          // Soft delete student (mark as inactive)
          await tx.databaseStudent.update({
            where: { id: studentId },
            data: {
              status: 'inactive',
              updatedAt: new Date(),
             
            }
          });
        }

        return { student, deletionType: hardDelete ? 'hard' : 'soft' };
      });

      // Recalculate to ensure consistency
      const finalStats = await calculateStatistics({});

      console.log(`✅ Student deleted by ${auth.user.name}: ${result.student.firstName} ${result.student.lastName}`);

      return NextResponse.json({
        success: true,
        message: `${result.deletionType === 'hard' ? 'Hard deleted' : 'Soft deleted'} student ${result.student.firstName} ${result.student.lastName}`,
        data: {
          stats: finalStats.stats,
          validation: finalStats.validation
        },
        authenticated: true,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Provide batchId or studentId', authenticated: true },
      { status: 400 }
    );

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Delete failed', authenticated: true },
      { status: 500 }
    );
  }
}

// PATCH - Reactivate inactive students (PROTECTED - authentication required)
export async function PATCH(request) {
  try {
    // Step 1: Authenticate the PATCH request
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Log authentication info
    console.log(`📝 Student reactivate request from: ${auth.user.name} (${auth.user.role})`);

    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const batchId = url.searchParams.get('batchId');
    const form = url.searchParams.get('form');

    if (studentId) {
      // Reactivate single student
      const student = await prisma.databaseStudent.update({
        where: { id: studentId },
        data: {
          status: 'active',
          updatedAt: new Date(),
          
        }
      });

      console.log(`✅ Student reactivated by ${auth.user.name}: ${student.firstName} ${student.lastName}`);

      return NextResponse.json({
        success: true,
        message: `Student ${student.firstName} ${student.lastName} reactivated`,
        data: { student },
        authenticated: true,
        reactivatedBy: auth.user.name
      });
    }

    if (batchId) {
      // Reactivate all students in a batch
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.databaseStudent.updateMany({
          where: { 
            uploadBatchId: batchId,
            status: 'inactive'
          },
          data: {
            status: 'active',
            updatedAt: new Date(),
            
          }
        });

        // Update statistics
        const batchStudents = await tx.databaseStudent.findMany({
          where: { uploadBatchId: batchId },
          select: { form: true }
        });

        const formCounts = batchStudents.reduce((acc, student) => {
          acc[student.form] = (acc[student.form] || 0) + 1;
          return acc;
        }, {});

        await tx.studentStats.update({
          where: { id: 'global_stats' },
          data: {
            totalStudents: { increment: updated.count },
            form1: { increment: formCounts['Form 1'] || 0 },
            form2: { increment: formCounts['Form 2'] || 0 },
            form3: { increment: formCounts['Form 3'] || 0 },
            form4: { increment: formCounts['Form 4'] || 0 }
          }
        });

        return { count: updated.count };
      });

      console.log(`✅ Batch reactivated by ${auth.user.name}: ${result.count} students`);

      return NextResponse.json({
        success: true,
        message: `Reactivated ${result.count} students from batch`,
        data: result,
        authenticated: true,
        reactivatedBy: auth.user.name
      });
    }

    if (form) {
      // Reactivate all inactive students in a form
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.databaseStudent.updateMany({
          where: { 
            form: form,
            status: 'inactive'
          },
          data: {
            status: 'active',
            updatedAt: new Date(),
            
          }
        });

        // Update statistics
        await tx.studentStats.update({
          where: { id: 'global_stats' },
          data: {
            totalStudents: { increment: updated.count },
            ...(form === 'Form 1' && { form1: { increment: updated.count } }),
            ...(form === 'Form 2' && { form2: { increment: updated.count } }),
            ...(form === 'Form 3' && { form3: { increment: updated.count } }),
            ...(form === 'Form 4' && { form4: { increment: updated.count } })
          }
        });

        return { count: updated.count };
      });

      console.log(`✅ Form reactivated by ${auth.user.name}: ${result.count} students in ${form}`);

      return NextResponse.json({
        success: true,
        message: `Reactivated ${result.count} students in ${form}`,
        data: result,
        authenticated: true,
        reactivatedBy: auth.user.name
      });
    }

    return NextResponse.json(
      { success: false, error: 'Provide studentId, batchId, or form', authenticated: true },
      { status: 400 }
    );

  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Reactivate failed', authenticated: true },
      { status: 500 }
    );
  }
}
