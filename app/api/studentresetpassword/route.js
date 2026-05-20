import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../../libs/prisma';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const SCHOOL_NAME = 'Katwanyaa Senior School';
const CONTACT_EMAIL = 'katzict@gmail.com';
const CONTACT_PHONE = '0710894145';

// GET method to verify token validity
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    console.log('🔍 Student Token Verification Request');

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Verifying token hash:', tokenHash);

    const resetRequest = await prisma.studentPasswordResetRequest.findUnique({
      where: { tokenHash: tokenHash },
    });

    if (!resetRequest) {
      console.log('❌ No reset request found for this token');
      return NextResponse.json(
        { 
          valid: false,
          message: 'Invalid or expired token',
        },
        { status: 400 }
      );
    }

    // Check expiry
    const isExpired = resetRequest.expiresAt < new Date();
    console.log('Token expires:', resetRequest.expiresAt);
    console.log('Current time:', new Date());
    console.log('Is expired:', isExpired);

    if (isExpired) {
      console.log('❌ Token has expired');
      await prisma.studentPasswordResetRequest.update({
        where: { id: resetRequest.id },
        data: { status: 'expired' }
      });
      return NextResponse.json(
        { 
          valid: false,
          message: 'Token has expired. Please request a new password reset.' 
        },
        { status: 400 }
      );
    }

    console.log('✅ Token is valid');
    return NextResponse.json({
      valid: true,
      message: 'Token is valid',
      admissionNumber: resetRequest.admissionNumber,
      studentName: resetRequest.fullName,
      expires: resetRequest.expiresAt,
      timeRemaining: Math.max(0, resetRequest.expiresAt - new Date())
    });

  } catch (error) {
    console.error('❌ Token verification error:', error);
    return NextResponse.json(
      { 
        valid: false,
        message: 'Internal server error during token verification' 
      },
      { status: 500 }
    );
  }
}

// POST method to reset password
export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    console.log('🔐 Student Password Reset Request Received');

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        {
          message: 'Password does not meet requirements. Must be 8+ characters with uppercase, lowercase, number, and special character.'
        },
        { status: 400 }
      );
    }

    // Hash the token to find the reset request
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Looking up token hash:', tokenHash);

    const resetRequest = await prisma.studentPasswordResetRequest.findUnique({
      where: { tokenHash: tokenHash },
    });

    if (!resetRequest) {
      console.log('❌ No reset request found for this token');
      return NextResponse.json(
        { message: 'Invalid or expired token. Please request a new password reset.' },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (resetRequest.expiresAt < new Date()) {
      console.log('❌ Token has expired');
      await prisma.studentPasswordResetRequest.update({
        where: { id: resetRequest.id },
        data: { status: 'expired' }
      });
      return NextResponse.json(
        { message: 'Token has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (resetRequest.status === 'used') {
      console.log('❌ Token has already been used');
      return NextResponse.json(
        { message: 'This password reset link has already been used. Please request a new one.' },
        { status: 400 }
      );
    }

    // Find the student account
    const studentAccount = await prisma.studentPortalAccount.findUnique({
      where: { admissionNumber: resetRequest.admissionNumber },
    });

    if (!studentAccount) {
      console.log('❌ Student account not found');
      return NextResponse.json(
        { message: 'Student account not found.' },
        { status: 404 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update the student account password
    await prisma.studentPortalAccount.update({
      where: { id: studentAccount.id },
      data: {
        passwordHash: passwordHash,
        passwordSetAt: new Date(),
        lastLoginAt: null, // Force re-login
      },
    });

    // Mark the reset request as used
    await prisma.studentPasswordResetRequest.update({
      where: { id: resetRequest.id },
      data: {
        status: 'used',
        usedAt: new Date(),
        resolvedAt: new Date(),
      },
    });

    console.log('✅ Password reset successful for admission number:', resetRequest.admissionNumber);

    // Send confirmation email to parent
    const confirmationEmail = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Confirmation - ${SCHOOL_NAME}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .content {
            padding: 40px 30px;
          }
          .success-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .footer {
            background: #f9fafb;
            padding: 24px 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          h1 {
            color: #333;
            margin-bottom: 16px;
          }
          p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1 style="color: white; margin-bottom: 0;">Password Reset Successful</h1>
          </div>
          <div class="content">
            <p>Dear Parent/Guardian,</p>
            <p>The password for student <strong>${resetRequest.fullName}</strong> (Admission No: ${resetRequest.admissionNumber}) has been successfully reset.</p>
            <p>Your student can now log in to the student portal with their admission number and the new password.</p>
            <h3 style="color: #333; margin-top: 24px; margin-bottom: 12px;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Your student can now access the portal with their admission number and new password</li>
              <li>We recommend changing the password to something memorable after the first login</li>
              <li>Keep the password secure and do not share it with anyone</li>
            </ul>
            <p style="margin-top: 24px;">If you did not request this password reset or need further assistance, please contact the school office.</p>
          </div>
          <div class="footer">
            <p><strong>${SCHOOL_NAME}</strong><br>
            📞 ${CONTACT_PHONE}<br>
            📧 ${CONTACT_EMAIL}<br>
            © ${new Date().getFullYear()} ${SCHOOL_NAME}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (resetRequest.parentEmail) {
      try {
        await transporter.sendMail({
          from: {
            name: `${SCHOOL_NAME} Portal`,
            address: process.env.EMAIL_USER
          },
          to: resetRequest.parentEmail,
          subject: `✅ Password Reset Confirmation - ${SCHOOL_NAME}`,
          html: confirmationEmail,
        });
        console.log('✅ Confirmation email sent to parent');
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the reset just because email failed
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password has been successfully reset. You will be redirected to login shortly.',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Password reset error:', error);
    return NextResponse.json(
      {
        message: 'An error occurred while resetting the password. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
