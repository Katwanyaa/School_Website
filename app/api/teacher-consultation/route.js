import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ====================================================================
// CONFIGURATION
// ====================================================================

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Missing email credentials in environment variables');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add this to debug connection issues
  debug: true,
  logger: true
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const SCHOOL_NAME = 'Katwanyaa Senior School';
const SCHOOL_LOCATION = 'Matungulu, Machakos County';
const SCHOOL_MOTTO = 'Education is Light';
const CONTACT_PHONE = '0710894145';
const CONTACT_EMAIL = 'katzict@gmail.com';

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

function validatePhone(phone) {
  const cleaned = phone.replace(/\s/g, '');
  const regex = /^(07|01)\d{8}$/;
  return regex.test(cleaned);
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function generateReferenceNumber() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `TC-${year}${month}-${randomNum}`;
}

// ====================================================================
// EMAIL TEMPLATES
// ====================================================================

async function sendParentConfirmation(parentEmail, parentName, teacherName, referenceNumber) {
  const mailOptions = {
    from: {
      name: `${SCHOOL_NAME} - Teacher Consultation`,
      address: process.env.EMAIL_USER
    },
    to: parentEmail,
    subject: `📧 Teacher Consultation Request Received - ${SCHOOL_NAME}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Consultation Confirmation - ${SCHOOL_NAME}</title>
      </head>
      <body style="margin:0; padding:16px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height:1.6; color:#333; background-color:#f8fafc;">
        <div style="max-width:600px; margin:0 auto; background:white; border-radius:24px; overflow:hidden; box-shadow:0 20px 35px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color:white; padding:40px 24px; text-align:center;">
            <div style="font-size:48px; margin-bottom:16px;">📧</div>
            <h1 style="font-size:28px; font-weight:800; margin:0 0 8px 0;">Consultation Request</h1>
            <p style="font-size:14px; opacity:0.9; margin:0;">Teacher-Parent Communication</p>
          </div>
          
          <!-- Content -->
          <div style="padding:32px 28px;">
            
            <div style="background:#e8f5e9; padding:20px; border-radius:16px; text-align:center; margin-bottom:24px;">
              <span style="font-size:40px;">✅</span>
              <p style="color:#2e7d32; font-weight:700; margin:8px 0 0 0;">Your consultation request has been received!</p>
            </div>
            
            <p style="font-size:16px; margin-bottom:16px;">
              Dear <strong style="color:#1e3c72;">${parentName}</strong>,
            </p>
            
            <p style="font-size:15px; color:#4b5563; margin-bottom:24px;">
              Thank you for reaching out to <strong>${teacherName}</strong>. Your consultation request has been successfully submitted and will be reviewed shortly.
            </p>
            
            <!-- Reference Card -->
            <div style="background:#f3f4f6; border-radius:12px; padding:16px; margin-bottom:24px; border-left:4px solid #2a5298;">
              <p style="font-size:12px; font-weight:700; color:#6b7280; margin-bottom:4px;">REFERENCE NUMBER</p>
              <p style="font-size:20px; font-weight:800; color:#1e3c72; margin:0;">${referenceNumber}</p>
              <p style="font-size:11px; color:#9ca3af; margin-top:8px;">Please keep this for your records</p>
            </div>
            
            <!-- What Happens Next -->
            <h3 style="font-size:18px; font-weight:700; color:#1e3c72; margin:24px 0 16px 0;">📋 What Happens Next?</h3>
            
            <div style="background:#f9fafb; border-radius:12px; padding:20px; margin-bottom:24px;">
              <div style="display:flex; gap:12px; margin-bottom:16px;">
                <span style="background:#2a5298; color:white; width:28px; height:28px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:700;">1</span>
                <p style="margin:0; font-size:14px;"><strong>Teacher Review:</strong> ${teacherName} will review your consultation request</p>
              </div>
              <div style="display:flex; gap:12px; margin-bottom:16px;">
                <span style="background:#2a5298; color:white; width:28px; height:28px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:700;">2</span>
                <p style="margin:0; font-size:14px;"><strong>Response Time:</strong> You'll receive a response within 24-48 hours</p>
              </div>
              <div style="display:flex; gap:12px;">
                <span style="background:#2a5298; color:white; width:28px; height:28px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:700;">3</span>
                <p style="margin:0; font-size:14px;"><strong>Follow-up:</strong> The teacher will contact you via your preferred method</p>
              </div>
            </div>
            
            <!-- Contact Options -->
            <div style="background:linear-gradient(135deg, #fef3c7, #fde68a); border-radius:12px; padding:20px; text-align:center; margin-bottom:24px;">
              <h4 style="margin:0 0 12px 0; color:#92400e;">📞 Need Immediate Assistance?</h4>
              <div style="display:flex; gap:12px; justify-content:center;">
                <a href="tel:${CONTACT_PHONE}" style="background:#2563eb; color:white; padding:10px 20px; border-radius:12px; text-decoration:none; font-size:14px; font-weight:600;">Call School</a>
                <a href="mailto:${CONTACT_EMAIL}" style="background:#6b7280; color:white; padding:10px 20px; border-radius:12px; text-decoration:none; font-size:14px; font-weight:600;">Email Office</a>
              </div>
            </div>
            
            <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;">
            
            <p style="font-size:13px; color:#6b7280; text-align:center;">
              This is an automated confirmation. Please do not reply to this email.<br>
              © ${new Date().getFullYear()} ${SCHOOL_NAME} | ${SCHOOL_MOTTO}
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Parent confirmation email sent to ${parentEmail}`);
  } catch (error) {
    console.error('Error sending parent email:', error);
    throw new Error('Failed to send parent confirmation');
  }
}

async function sendTeacherNotification(teacherEmail, teacherName, parentData, referenceNumber) {
  const mailOptions = {
    from: {
      name: `${SCHOOL_NAME} - Parent Communication`,
      address: process.env.EMAIL_USER
    },
    to: teacherEmail,
    subject: `📩 New Consultation Request from Parent - ${referenceNumber}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Consultation Request - ${SCHOOL_NAME}</title>
      </head>
      <body style="margin:0; padding:16px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height:1.6; color:#333; background-color:#f8fafc;">
        <div style="max-width:600px; margin:0 auto; background:white; border-radius:24px; overflow:hidden; box-shadow:0 20px 35px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color:white; padding:32px 24px; text-align:center;">
            <div style="font-size:48px; margin-bottom:16px;">📩</div>
            <h1 style="font-size:26px; font-weight:800; margin:0 0 8px 0;">NEW CONSULTATION REQUEST</h1>
            <p style="font-size:13px; opacity:0.9; margin:0;">Action Required - Parent Communication</p>
          </div>
          
          <!-- Content -->
          <div style="padding:32px 28px;">
            
            <div style="background:#fee2e2; padding:16px; border-radius:16px; text-align:center; margin-bottom:24px;">
              <span style="font-size:32px;">👋</span>
              <p style="color:#991b1b; font-weight:700; margin:8px 0 0 0;">You have a new consultation request from a parent!</p>
            </div>
            
            <p style="font-size:16px; margin-bottom:16px;">
              Hello <strong style="color:#dc2626;">${teacherName}</strong>,
            </p>
            
            <p style="font-size:15px; color:#4b5563; margin-bottom:24px;">
              A parent has requested a consultation with you. Please review the details below and respond within 24-48 hours.
            </p>
            
            <!-- Reference Card -->
            <div style="background:#f3f4f6; border-radius:12px; padding:16px; margin-bottom:24px; border-left:4px solid #dc2626;">
              <p style="font-size:12px; font-weight:700; color:#6b7280; margin-bottom:4px;">REFERENCE NUMBER</p>
              <p style="font-size:20px; font-weight:800; color:#991b1b; margin:0;">${referenceNumber}</p>
            </div>
            
            <!-- Parent Details -->
            <h3 style="font-size:18px; font-weight:700; color:#1e3c72; margin:24px 0 16px 0;">👨‍👩‍👧 Parent Information</h3>
            
            <div style="background:#f9fafb; border-radius:12px; padding:20px; margin-bottom:24px;">
              <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e5e7eb;">
                <span style="font-weight:700; color:#4b5563;">Name:</span>
                <span style="color:#111827;">${parentData.name}</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e5e7eb;">
                <span style="font-weight:700; color:#4b5563;">Email:</span>
                <span style="color:#111827;">${parentData.email}</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e5e7eb;">
                <span style="font-weight:700; color:#4b5563;">Phone:</span>
                <span style="color:#111827;">${parentData.phone}</span>
              </div>
              ${parentData.studentDetails ? `
              <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e5e7eb;">
                <span style="font-weight:700; color:#4b5563;">Student:</span>
                <span style="color:#111827;">${parentData.studentDetails}</span>
              </div>
              ` : ''}
              <div style="display:flex; justify-content:space-between; padding:8px 0;">
                <span style="font-weight:700; color:#4b5563;">Contact Preference:</span>
                <span style="color:#111827; text-transform:capitalize;">${parentData.contactMethod || 'email'}</span>
              </div>
            </div>
            
            <!-- Message -->
            <h3 style="font-size:18px; font-weight:700; color:#1e3c72; margin:24px 0 16px 0;">💬 Message from Parent</h3>
            
            <div style="background:#fef3c7; border-radius:12px; padding:20px; margin-bottom:24px;">
              <p style="font-size:14px; font-weight:700; color:#92400e; margin-bottom:8px;">Subject: ${parentData.subject}</p>
              <p style="font-size:14px; color:#78350f; line-height:1.6; margin:0; white-space:pre-wrap;">${parentData.message}</p>
            </div>
            
            <!-- Action Buttons -->
            <div style="display:flex; gap:12px; margin-bottom:24px;">
              <a href="mailto:${parentData.email}" style="flex:1; background:#2563eb; color:white; text-align:center; padding:12px; border-radius:12px; text-decoration:none; font-weight:600; font-size:14px;">📧 Reply via Email</a>
              ${parentData.contactMethod === 'phone' || parentData.contactMethod === 'whatsapp' ? `
              <a href="tel:${parentData.phone}" style="flex:1; background:#10b981; color:white; text-align:center; padding:12px; border-radius:12px; text-decoration:none; font-weight:600; font-size:14px;">📞 Call Parent</a>
              ` : ''}
            </div>
            
            <!-- Quick Response Tips -->
            <div style="background:#f0f9ff; border-radius:12px; padding:16px; margin-bottom:24px;">
              <p style="font-size:12px; font-weight:700; color:#0369a1; margin-bottom:8px;">💡 Quick Response Tips:</p>
              <ul style="margin:0; padding-left:20px; font-size:12px; color:#075985;">
                <li>Acknowledge receipt of the consultation request</li>
                <li>Schedule a convenient time for follow-up</li>
                <li>Address the parent's specific concerns</li>
                <li>Keep the reference number for tracking</li>
              </ul>
            </div>
            
            <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;">
            
            <p style="font-size:12px; color:#6b7280; text-align:center;">
              This is an automated notification from ${SCHOOL_NAME}.<br>
              Please respond to the parent within 24-48 hours.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Teacher notification sent to ${teacherEmail}`);
  } catch (error) {
    console.error('Error sending teacher email:', error);
    throw new Error('Failed to send teacher notification');
  }
}

// ====================================================================
// POST REQUEST HANDLER
// ====================================================================

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received consultation request:', { ...body, message: '[REDACTED]' });
    
    const { 
      name,           // Parent name
      email,          // Parent email
      phone,          // Parent phone
      message,        // Consultation message
      subject,        // Message subject
      studentDetails, // Student name/grade (optional)
      contactMethod,  // Preferred contact: email/phone/whatsapp
      teacherId,      // Teacher's ID
      teacherName,    // Teacher's name
      teacherEmail,   // Teacher's email
      teacherPosition // Teacher's position
    } = body;
    
    // Validation
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!message) missingFields.push('message');
    if (!subject) missingFields.push('subject');
    if (!teacherName) missingFields.push('teacherName');
    if (!teacherEmail) missingFields.push('teacherEmail');
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }
    
    // Validate phone format
    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use 07XXXXXXXX or 01XXXXXXXX' },
        { status: 400 }
      );
    }
    
    const referenceNumber = generateReferenceNumber();
    console.log(`Generated reference number: ${referenceNumber}`);
    
    // Send confirmation to parent
    await sendParentConfirmation(email, name, teacherName, referenceNumber);
    console.log('Parent confirmation email sent successfully');
    
    // Send notification to teacher
    await sendTeacherNotification(
      teacherEmail,
      teacherName,
      { name, email, phone, message, subject, studentDetails, contactMethod: contactMethod || 'email' },
      referenceNumber
    );
    console.log('Teacher notification email sent successfully');
    
    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: 'Consultation request sent successfully',
        referenceNumber: referenceNumber
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Teacher consultation error:', error);
    
    // Return more specific error message
    return NextResponse.json(
      { 
        error: 'Failed to send consultation request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ====================================================================
// OPTIONS HANDLER FOR CORS
// ====================================================================

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'POST, OPTIONS',
      },
    }
  );
}