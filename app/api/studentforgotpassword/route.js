import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '../../../libs/prisma';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// School Information
const SCHOOL_NAME = 'Katwanyaa Senior School';
const SCHOOL_LOCATION = 'Matungulu, Machakos County';
const SCHOOL_MOTTO = 'Education is Light';
const CONTACT_PHONE = '0710894145';
const CONTACT_EMAIL = 'katzict@gmail.com';

export async function POST(req) {
  try {
    const { admissionNumber } = await req.json();

    if (!admissionNumber) {
      return NextResponse.json(
        { message: 'Admission number is required' },
        { status: 400 }
      );
    }

    const normalizedAdmissionNumber = String(admissionNumber).trim().toUpperCase();

    // Find student in StudentPortalAccount
    const studentAccount = await prisma.studentPortalAccount.findUnique({
      where: { admissionNumber: normalizedAdmissionNumber },
    });

    if (!studentAccount) {
      return NextResponse.json(
        { message: 'Student account not found. Please check your admission number.' },
        { status: 404 }
      );
    }

    // Try to get parent email from various sources
    let parentEmail = null;
    let studentName = studentAccount.fullName || 'Student';

    // First, try to get from databaseStudent (which has parent email)
    const databaseStudent = await prisma.databaseStudent.findUnique({
      where: { admissionNumber: normalizedAdmissionNumber },
    });

    if (databaseStudent) {
      parentEmail = databaseStudent.email;
      studentName = [databaseStudent.firstName, databaseStudent.middleName, databaseStudent.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || studentName;
    }

    // If no parent email found in databaseStudent, try StudentPortalAccount email
    if (!parentEmail) {
      parentEmail = studentAccount.email;
    }

    // If still no parent email, cannot proceed
    if (!parentEmail) {
      return NextResponse.json(
        {
          message: 'No parent email on file. Please contact the school administration to register your parent email address.',
        },
        { status: 404 }
      );
    }

    // Delete old reset requests for this student
    await prisma.studentPasswordResetRequest.deleteMany({
      where: {
        admissionNumber: normalizedAdmissionNumber,
        status: 'pending',
      },
    });

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Create password reset request
    await prisma.studentPasswordResetRequest.create({
      data: {
        admissionNumber: normalizedAdmissionNumber,
        requestType: 'forgot',
        fullName: studentName,
        email: studentAccount.email,
        parentEmail: parentEmail,
        parentPhone: studentAccount.parentPhone || databaseStudent?.parentPhone,
        tokenHash: tokenHash,
        expiresAt: expiresAt,
        status: 'pending',
        requestedByIp: req.headers.get('x-forwarded-for') || 'unknown',
        requestedByUserAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    const baseUrl = 'https://katwanyaasenior.school';
    const resetLink = `${baseUrl}/pages/studentresetpassword?token=${token}`;

    console.log('🔐 Student Password Reset Request -', SCHOOL_NAME);
    console.log('Admission Number:', normalizedAdmissionNumber);
    console.log('Parent Email:', parentEmail);

    // Send email to parent
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <title>Student Password Reset - ${SCHOOL_NAME}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            margin: 0;
            -webkit-font-smoothing: antialiased;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            opacity: 0.1;
          }
          
          .header h1 {
            font-size: 26px;
            font-weight: 800;
            margin: 0 0 8px 0;
            position: relative;
            z-index: 1;
          }
          
          .header p {
            font-size: 14px;
            opacity: 0.95;
            margin: 4px 0;
            position: relative;
            z-index: 1;
          }
          
          .alert-banner {
            background: #eff6ff;
            border-bottom: 3px solid #3b82f6;
            padding: 16px 30px;
            text-align: center;
          }
          
          .alert-text {
            color: #1e40af;
            font-size: 14px;
            font-weight: 600;
            margin: 0;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            color: #333;
            font-size: 16px;
            line-height: 1.7;
            margin: 0 0 20px 0;
          }
          
          .info-card {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border: 1px solid #bfdbfe;
          }
          
          .info-row {
            display: flex;
            padding: 8px 0;
            font-size: 14px;
            color: #4b5563;
          }
          
          .info-label {
            font-weight: 600;
            color: #1e40af;
            width: 40%;
          }
          
          .info-value {
            color: #333;
            width: 60%;
            word-break: break-word;
          }
          
          .reset-section {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            padding: 28px;
            border-radius: 12px;
            margin: 28px 0;
            border: 2px solid #86efac;
            text-align: center;
          }
          
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white !important;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 16px 0;
            transition: transform 0.3s ease;
          }
          
          .reset-button:hover {
            transform: translateY(-2px);
          }
          
          .button-text {
            color: #333;
            font-size: 13px;
            margin-top: 12px;
          }
          
          .button-link {
            color: #3b82f6;
            text-decoration: none;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
          }
          
          .footer {
            background: #f9fafb;
            padding: 24px 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          .footer a {
            color: #3b82f6;
            text-decoration: none;
          }
          
          .security-note {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
            color: #92400e;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>${SCHOOL_NAME}</p>
          </div>
          
          <div class="alert-banner">
            <p class="alert-text">Your student needs to reset their portal password</p>
          </div>
          
          <div class="content">
            <p class="greeting">Dear Parent/Guardian,</p>
            
            <p>A password reset request has been submitted for your student's account. Please follow the instructions below to help them reset their password.</p>
            
            <div class="info-card">
              <div class="info-row">
                <span class="info-label">School:</span>
                <span class="info-value">${SCHOOL_NAME}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Student Name:</span>
                <span class="info-value">${studentName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Admission No:</span>
                <span class="info-value">${normalizedAdmissionNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Request Time:</span>
                <span class="info-value">${new Date().toLocaleString()}</span>
              </div>
            </div>
            
            <div class="reset-section">
              <p style="margin: 0 0 12px 0; color: #059669; font-weight: 600;">How to Reset the Password:</p>
              
              <a href="${resetLink}" class="reset-button">Reset Student Password</a>
              
              <p class="button-text">
                Or copy and paste this link in your browser:<br>
                <a href="${resetLink}" class="button-link">${resetLink}</a>
              </p>
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">
                ⏰ This link will expire in 1 hour for security purposes
              </p>
            </div>
            
            <div class="security-note">
              <strong>⚠️ Security Notice:</strong> Never share your student's password with anyone. If this request was not made by you or your student, please ignore this email and ensure your password remains secure. Contact the school immediately if you notice any suspicious activity.
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <strong>Important:</strong> This is a student portal password reset request. Your student should share the reset link with you or have you help them reset their password using this email.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0 0 12px 0;">
              <strong>${SCHOOL_NAME}</strong><br>
              ${SCHOOL_LOCATION}<br>
              📞 ${CONTACT_PHONE}<br>
              📧 <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
            </p>
            <p style="margin: 12px 0 0 0; color: #999;">
              © ${new Date().getFullYear()} ${SCHOOL_NAME}. All rights reserved.<br>
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // CRITICAL FIX: Wrap email sending in try-catch to handle failures properly
    let emailSent = false;
    try {
      await transporter.sendMail({
        from: {
          name: `${SCHOOL_NAME} Portal`,
          address: process.env.EMAIL_USER
        },
        to: parentEmail,
        subject: `🔐 Student Password Reset Request - ${studentName} | ${SCHOOL_NAME}`,
        html: emailHtml,
      });
      emailSent = true;
      console.log(`✅ Password reset email sent to ${parentEmail}`);
    } catch (emailError) {
      console.error(`❌ Failed to send password reset email: ${emailError.message}`);
      
      // Update request status to track email failure
      await prisma.studentPasswordResetRequest.update({
        where: { 
          id: (await prisma.studentPasswordResetRequest.findFirst({
            where: { tokenHash }
          }))?.id 
        },
        data: { 
          status: 'email_failed',
          adminNote: `Email send failed: ${emailError.message}`
        }
      }).catch(() => {}); // Ignore update errors
    }

    // Only return success if email was actually sent
    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          message: 'We could not send the password reset email. Please contact school office.',
          support: `Email: ${CONTACT_EMAIL} | Phone: ${CONTACT_PHONE}`,
        },
        { status: 503 } // Service Unavailable
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Password reset link has been sent to the registered parent email (${parentEmail.substring(0, 3)}***${parentEmail.substring(parentEmail.lastIndexOf('@') - 3)}). Please check your email and follow the instructions.`,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Student forgot password error:', error);
    return NextResponse.json(
      {
        message: 'An error occurred while processing your request. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
