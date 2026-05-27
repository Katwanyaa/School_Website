import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { prisma } from '../../../../libs/prisma';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const SCHOOL_NAME = 'Katwanyaa Senior School';
const SCHOOL_LOCATION = 'Matungulu, Machakos County';
const CONTACT_EMAIL = 'katzict@gmail.com';
const CONTACT_PHONE = '0710894145';

// Get students with password status
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // 'all', 'not-set', 'set'
    const form = searchParams.get('form'); // optional form filter
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Get all StudentPortalAccounts
    const whereClause = {};
    if (form) {
      whereClause.form = form;
    }

    const allStudents = await prisma.studentPortalAccount.findMany({
      where: whereClause,
      select: {
        id: true,
        admissionNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        fullName: true,
        form: true,
        email: true,
        parentPhone: true,
        passwordSetAt: true,
        lastLoginAt: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get parent emails from databaseStudent
    const admissionNumbers = allStudents.map(s => s.admissionNumber);
    const dbStudents = await prisma.databaseStudent.findMany({
      where: {
        admissionNumber: { in: admissionNumbers }
      },
      select: {
        admissionNumber: true,
        email: true,
      }
    });

    const dbStudentMap = new Map(dbStudents.map(s => [s.admissionNumber, s.email]));

    // Categorize students
    const studentsWithStatus = allStudents.map(student => {
      const passwordSetAt = new Date(student.passwordSetAt);
      const createdAt = new Date(student.createdAt);
      
      // If passwordSetAt is close to createdAt (within 1 hour), password likely not set by user
      const passwordNotReallySet = (passwordSetAt - createdAt) < 3600000;
      
      return {
        ...student,
        passwordSet: !passwordNotReallySet,
        passwordNotSet: passwordNotReallySet,
        passwordSetAt: passwordSetAt,
        lastLoginAt: student.lastLoginAt ? new Date(student.lastLoginAt) : null,
        parentEmail: dbStudentMap.get(student.admissionNumber) || student.email,
      };
    });

    // Filter based on request
    let filteredStudents = studentsWithStatus;
    if (filter === 'not-set') {
      filteredStudents = studentsWithStatus.filter(s => s.passwordNotSet);
    } else if (filter === 'set') {
      filteredStudents = studentsWithStatus.filter(s => s.passwordSet);
    }

    // Get total count
    const total = filteredStudents.length;

    // Apply pagination
    const paginated = filteredStudents.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      total,
      count: paginated.length,
      skip,
      limit,
      filter,
      students: paginated,
      summary: {
        totalStudents: allStudents.length,
        passwordSet: studentsWithStatus.filter(s => s.passwordSet).length,
        passwordNotSet: studentsWithStatus.filter(s => s.passwordNotSet).length,
      }
    });
  } catch (error) {
    console.error('Error fetching student password status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student data', error: error.message },
      { status: 500 }
    );
  }
}

// Send password reminder emails
export async function POST(req) {
  try {
    const { admissionNumbers, message } = await req.json();

    if (!admissionNumbers || !Array.isArray(admissionNumbers) || admissionNumbers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide valid admission numbers' },
        { status: 400 }
      );
    }

    // Get student data
    const students = await prisma.studentPortalAccount.findMany({
      where: {
        admissionNumber: { in: admissionNumbers }
      }
    });

    // Get parent emails from databaseStudent
    const dbStudents = await prisma.databaseStudent.findMany({
      where: {
        admissionNumber: { in: admissionNumbers }
      },
      select: {
        admissionNumber: true,
        email: true,
      }
    });

    const dbStudentMap = new Map(dbStudents.map(s => [s.admissionNumber, s.email]));

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const student of students) {
      try {
        const parentEmail = dbStudentMap.get(student.admissionNumber) || student.email;
        
        if (!parentEmail) {
          results.push({
            admissionNumber: student.admissionNumber,
            success: false,
            error: 'No parent email found'
          });
          failureCount++;
          continue;
        }

        // Generate password setup link
        const setupToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(setupToken).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Save reset request
        await prisma.studentPasswordResetRequest.create({
          data: {
            admissionNumber: student.admissionNumber,
            requestType: 'setup',
            fullName: student.fullName,
            email: student.email,
            parentEmail: parentEmail,
            parentPhone: student.parentPhone,
            tokenHash: tokenHash,
            expiresAt: expiresAt,
            status: 'pending',
            requestedByIp: 'admin',
            requestedByUserAgent: 'admin-panel',
          },
        });

        // Build password setup link
        const setupLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://katwanyaa.school'}/student-portal/setup-password?token=${setupToken}`;

        // Send email
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${SCHOOL_NAME}</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">${SCHOOL_LOCATION}</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333; margin-top: 0;">Password Setup Reminder</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Hello ${student.firstName || 'Student'},
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                This is a reminder to set up your student portal password. Your account has been created with the following details:
              </p>
              
              <div style="background-color: #f0f7ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 5px 0; color: #333;"><strong>Admission Number:</strong> ${student.admissionNumber}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Full Name:</strong> ${student.fullName}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Form:</strong> ${student.form}</p>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                To set up your password and access your student portal, please click the button below. This link will expire in 7 days.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${setupLink}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Set Up Your Password
                </a>
              </div>
              
              ${message ? `
                <div style="background-color: #fffbea; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #92400e;"><strong>Message from School:</strong></p>
                  <p style="margin: 10px 0 0 0; color: #92400e;">${message}</p>
                </div>
              ` : ''}
              
              <p style="color: #666; line-height: 1.6; font-size: 14px;">
                If you have any difficulties accessing your account or need assistance, please contact us:
              </p>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; font-size: 14px; color: #666;">
                <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${CONTACT_EMAIL}" style="color: #667eea; text-decoration: none;">${CONTACT_EMAIL}</a></p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${CONTACT_PHONE}" style="color: #667eea; text-decoration: none;">${CONTACT_PHONE}</a></p>
              </div>
              
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                © ${new Date().getFullYear()} ${SCHOOL_NAME}. All rights reserved.
              </p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: parentEmail,
          subject: `[${SCHOOL_NAME}] Student Portal - Password Setup Required`,
          html: emailHtml,
        });

        results.push({
          admissionNumber: student.admissionNumber,
          name: student.fullName,
          email: parentEmail,
          success: true,
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to send email to ${student.admissionNumber}:`, error);
        results.push({
          admissionNumber: student.admissionNumber,
          success: false,
          error: error.message,
        });
        failureCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reminders sent: ${successCount} succeeded, ${failureCount} failed`,
      successCount,
      failureCount,
      results,
    });
  } catch (error) {
    console.error('Error sending password reminders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send reminders', error: error.message },
      { status: 500 }
    );
  }
}
