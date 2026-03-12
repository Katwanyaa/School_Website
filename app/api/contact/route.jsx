// app/api/contact/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ====================================================================
// CONFIGURATION
// ====================================================================
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const SCHOOL_NAME = 'Katwanyaa Senior School';
const SCHOOL_LOCATION = 'Matungulu, Machakos County';
const SCHOOL_MOTTO = 'Education is Light';
const CONTACT_PHONE = '0710894145';
const CONTACT_EMAIL = 'katzict@gmail.com';
const EMAIL_USER = process.env.EMAIL_USER;

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

function validatePhone(phone) {
  const cleaned = phone.replace(/\s/g, '');
  const regex = /^(07|01)\d{8}$/;
  return regex.test(cleaned);
}

function generateReferenceNumber() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CONT-${year}-${randomNum}`;
}

// ====================================================================
// EMAIL TEMPLATES (Fully Mobile Responsive with Inline Styles)
// ====================================================================

async function sendContactConfirmation(toEmail, name, subject, referenceNumber) {
  const mailOptions = {
    from: {
      name: `${SCHOOL_NAME} `,
      address: process.env.EMAIL_USER
    },
    to: toEmail,
    subject: `✅ Contact Form Received - ${SCHOOL_NAME}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <title>Contact Form Confirmation - ${SCHOOL_NAME}</title>
      </head>
      <body style="margin:0; padding:16px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height:1.6; color:#333; background-color:#f8fafc; -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
        
        <!-- Main Container -->
        <div style="max-width:600px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
          
          <!-- HEADER -->
          <div style="background:linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color:white; padding:40px 20px; text-align:center; position:relative; overflow:hidden;">
            <div style="position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size:20px 20px; opacity:0.1;"></div>
            <h1 style="font-size:28px; font-weight:800; margin:0 0 8px 0; position:relative; z-index:1;">${SCHOOL_NAME}</h1>
            <p style="font-size:15px; opacity:0.95; margin:0; position:relative; z-index:1;">${SCHOOL_LOCATION}</p>
            <p style="font-size:14px; opacity:0.9; margin:6px 0 0 0; position:relative; z-index:1;">${SCHOOL_MOTTO}</p>
            <div style="display:inline-block; background:rgba(255,255,255,0.15); padding:8px 20px; border-radius:24px; font-size:12px; font-weight:600; text-transform:uppercase; margin-top:12px; position:relative; z-index:1;">Contact Form Received</div>
          </div>
          
          <!-- CONTENT -->
          <div style="padding:40px 28px;">
            
            <!-- Success Card -->
            <div style="background:linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding:28px; margin:24px 0; border-radius:12px; text-align:center; border:1px solid #a5d6a7;">
              <span style="font-size:48px; display:block; margin-bottom:12px;">✅</span>
              <p style="color:#2e7d32; font-size:18px; font-weight:700; margin:0;">Your Message Has Been Received!</p>
            </div>
            
            <!-- Greeting -->
            <p style="font-size:16px; color:#333; margin:20px 0; line-height:1.6;">
              Dear <strong style="color:#1e3c72;">${name}</strong>,
              <br><br>
              Thank you for contacting ${SCHOOL_NAME}. We have successfully received your inquiry and greatly appreciate you reaching out to us.
            </p>
            
            <!-- Info Cards Container -->
            <div style="display:flex; flex-direction:column; gap:14px; margin:28px 0;">
              <!-- Subject Card -->
              <div style="background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; flex:1;">
                <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#0369a1; letter-spacing:0.05em; margin-bottom:8px;">📝 Inquiry Subject</div>
                <div style="font-size:20px; font-weight:700; color:#075985; word-break:break-word; line-height:1.3;">${subject}</div>
              </div>
            </div>
            
            <!-- Section Title -->
            <div style="font-size:18px; font-weight:700; color:#1e3c72; margin:28px 0 16px 0; border-left:4px solid #4c7cf3; padding-left:12px;">What Happens Next?</div>
            
            <!-- Process Box -->
            <div style="background:#e3f2fd; padding:24px; border-radius:12px; margin:24px 0;">
              <ul style="list-style:none; padding:0; margin:0;">
                <li style="padding:14px 0; border-bottom:1px solid rgba(30,60,114,0.1); display:flex; align-items:flex-start; gap:12px;">
                  <span style="font-size:14px; color:#333; line-height:1.6;"><strong>Review:</strong> Our team will carefully review your inquiry</span>
                </li>
                <li style="padding:14px 0; border-bottom:1px solid rgba(30,60,114,0.1); display:flex; align-items:flex-start; gap:12px;">
                  <span style="font-size:14px; color:#333; line-height:1.6;"><strong>Contact:</strong> We will reach out to you via your preferred method</span>
                </li>
                <li style="padding:14px 0; border-bottom:1px solid rgba(30,60,114,0.1); display:flex; align-items:flex-start; gap:12px;">
                  <span style="font-size:14px; color:#333; line-height:1.6;"><strong>Assistance:</strong> Our team will provide the information you need</span>
                </li>
                <li style="padding:14px 0; border-bottom:1px solid rgba(30,60,114,0.1); display:flex; align-items:flex-start; gap:12px;">
                  <span style="font-size:14px; color:#333; line-height:1.6;"><strong>Follow-up:</strong> We will ensure your inquiry is fully resolved</span>
                </li>
              </ul>
            </div>
            
            <!-- Response Time -->
            <div style="background:linear-gradient(135deg, #f0f7ff 0%, #dbeafe 100%); border:1px solid #dbeafe; padding:20px; border-radius:12px; margin:24px 0; text-align:center;">
              <h3 style="font-size:16px; font-weight:700; color:#1e3c72; margin:0 0 8px 0;">📅 Response Timeline</h3>
              <p style="font-size:15px; color:#075985; margin:0;">We aim to respond to all inquiries within <strong>24 hours</strong> during working days</p>
            </div>
            
            <!-- Important Box -->
            <div style="background:rgba(234,179,8,0.1); border:1px solid rgba(234,179,8,0.3); padding:20px; border-radius:12px; margin:24px 0;">
              <h4 style="font-size:15px; font-weight:700; color:#92400e; margin:0 0 12px 0;">⚠️ Important Information</h4>
              <p style="font-size:14px; color:#78350f; margin:8px 0; line-height:1.6;">• Please keep this reference number <strong>${referenceNumber}</strong> for your records</p>
              <p style="font-size:14px; color:#78350f; margin:8px 0; line-height:1.6;">• All responses will be sent to <strong>${toEmail}</strong></p>
              <p style="font-size:14px; color:#78350f; margin:8px 0; line-height:1.6;">• Check your email inbox and spam folder for our response</p>
              <p style="font-size:14px; color:#78350f; margin:8px 0; line-height:1.6;">• Do not share this reference number with unauthorized persons</p>
            </div>
            
            <!-- Contact Section -->
            <div style="background:linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color:white; padding:28px; border-radius:12px; margin:28px 0; text-align:center;">
              <h3 style="font-size:18px; font-weight:700; margin:0 0 16px 0;">📞 Need Immediate Help?</h3>
              <p style="margin:0 0 16px 0; font-size:14px;">Contact our team directly:</p>
              
              <!-- Contact Actions -->
              <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap; justify-content:center;">
                <a href="tel:${CONTACT_PHONE}" style="display:inline-flex; align-items:center; justify-content:center; padding:14px 24px; background-color:#2563eb; color:#ffffff; text-decoration:none; font-weight:700; border-radius:12px; min-width:120px; transition:all 0.3s ease;">
                  <span>Call us</span>
                </a>
                <a href="mailto:${CONTACT_EMAIL}" style="display:inline-flex; align-items:center; justify-content:center; padding:14px 24px; background-color:#2563eb; color:#ffffff; text-decoration:none; font-weight:700; border-radius:12px; min-width:120px; transition:all 0.3s ease;">
                  <span>Email</span>
                </a>
              </div>
              
              <p style="margin-top:12px; font-size:12px; opacity:0.95;">Office Hours: Monday - Friday, 8:00 AM - 5:00 PM</p>
            </div>
            
            <!-- Closing -->
            <div style="text-align:center; margin-top:28px; padding-top:20px; border-top:2px solid #e2e8f0;">
              <p style="font-size:16px; color:#1e3c72; font-weight:600; margin-bottom:8px;">We appreciate your inquiry!</p>
              <p style="font-size:15px; color:#333; margin:0;">
                Best regards,<br>
                <strong>The ${SCHOOL_NAME} Contact Team</strong><br>
                ${SCHOOL_LOCATION}
              </p>
            </div>
          </div>
          
          <!-- FOOTER -->
          <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:#cbd5e1; padding:28px; text-align:center;">
            <p style="font-size:18px; font-weight:700; color:white; margin:0 0 8px 0;">${SCHOOL_NAME}</p>
            <p style="font-size:13px; margin:4px 0;">${SCHOOL_LOCATION}</p>
            <p style="font-size:12px; font-style:italic; margin:12px 0;">"${SCHOOL_MOTTO}"</p>
            <p style="font-size:13px; margin:4px 0; margin-top:12px;">© ${new Date().getFullYear()} ${SCHOOL_NAME}. All rights reserved.</p>
            <p style="font-size:13px; margin:4px 0; opacity:0.7;">This is an automated confirmation email. Please do not reply to this email.</p>
          </div>
        </div>
        
        <!-- Mobile Responsive Styles -->
        <style>
          @media (max-width: 768px) {
            body { padding: 12px; }
            [style*="padding:40px 28px"] { padding: 24px 16px !important; }
            [style*="padding:40px 20px"] { padding: 32px 16px !important; }
            [style*="font-size:28px"] { font-size: 24px !important; }
            [style*="font-size:20px"] { font-size: 18px !important; }
          }
          @media (max-width: 480px) {
            body { padding: 8px; }
            [style*="padding:40px 28px"] { padding: 16px 12px !important; }
            [style*="padding:40px 20px"] { padding: 24px 12px !important; }
            [style*="display:flex; align-items:center; gap:16px;"] { flex-direction: column; }
            [style*="min-width:120px"] { width: 100%; }
          }
        </style>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
}

async function sendAdminNotification(contactData, referenceNumber) {
  const adminEmail = process.env.ADMIN_EMAIL || EMAIL_USER;
  
  const mailOptions = {
    from: {
      name: `${SCHOOL_NAME}`,
      address: process.env.EMAIL_USER
    },
    to: adminEmail,
    subject: `📩 NEW CONTACT INQUIRY: ${contactData.subject} (${referenceNumber})`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <title>New Contact Inquiry - ${SCHOOL_NAME}</title>
      </head>
      <body style="margin:0; padding:16px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height:1.6; color:#333; background-color:#f8fafc; -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
        
        <!-- Main Container -->
        <div style="max-width:600px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
          
          <!-- HEADER -->
          <div style="background:linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color:white; padding:32px 20px; text-align:center; position:relative; overflow:hidden;">
            <div style="position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size:20px 20px; opacity:0.1;"></div>
            <h1 style="font-size:24px; font-weight:800; margin:0 0 6px 0; position:relative; z-index:1;">NEW CONTACT INQUIRY</h1>
            <p style="font-size:14px; opacity:0.95; margin:0; position:relative; z-index:1;">${SCHOOL_NAME}</p>
          </div>
          
          <!-- ALERT BANNER -->
          <div style="background:#fef2f2; border-left:4px solid #dc2626; padding:16px 20px; text-align:center;">
            <div style="display:inline-block; background:linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color:white; padding:8px 18px; border-radius:50px; font-weight:600; font-size:12px; margin-bottom:8px;">ACTION REQUIRED</div>
            <p style="margin:8px 0 0 0; font-weight:600; color:#991b1b; font-size:14px;">A new contact inquiry requires response</p>
          </div>
          
          <!-- CONTENT -->
          <div style="padding:28px;">
            
            <!-- Inquiry Card -->
            <div style="background:linear-gradient(135deg, #f0f7ff 0%, #dbeafe 100%); padding:24px; border-radius:12px; margin:20px 0; text-align:center; border:1px solid #dbeafe;">
              <p style="color:#1e3c72; font-size:14px; font-weight:600; margin:0 0 8px 0;">Reference: ${referenceNumber}</p>
              <p style="font-size:22px; font-weight:700; color:#075985; margin:0 0 8px 0; word-break:break-word; line-height:1.3;">${contactData.subject}</p>
              <p style="font-size:12px; color:#666; margin:0;">Submitted: ${new Date().toLocaleString('en-US')}</p>
            </div>
            
            <!-- Sender Information -->
            <div style="font-size:17px; font-weight:700; color:#dc2626; margin:24px 0 14px 0; border-bottom:2px solid #fee2e2; padding-bottom:8px;">👤 Sender Information</div>
            
            <div style="display:flex; padding:12px 0; border-bottom:1px solid #e5e7eb;">
              <div style="font-weight:700; color:#1e3c72; width:35%; font-size:14px;">Full Name:</div>
              <div style="color:#4b5563; width:65%; font-size:14px; word-break:break-word;">${contactData.name}</div>
            </div>
            <div style="display:flex; padding:12px 0; border-bottom:1px solid #e5e7eb;">
              <div style="font-weight:700; color:#1e3c72; width:35%; font-size:14px;">Email:</div>
              <div style="color:#4b5563; width:65%; font-size:14px; word-break:break-word;">${contactData.email}</div>
            </div>
            <div style="display:flex; padding:12px 0; border-bottom:1px solid #e5e7eb;">
              <div style="font-weight:700; color:#1e3c72; width:35%; font-size:14px;">Phone:</div>
              <div style="color:#4b5563; width:65%; font-size:14px; word-break:break-word;">${contactData.phone}</div>
            </div>
            <div style="display:flex; padding:12px 0; border-bottom:1px solid #e5e7eb;">
              <div style="font-weight:700; color:#1e3c72; width:35%; font-size:14px;">Inquiry Type:</div>
              <div style="color:#4b5563; width:65%; font-size:14px; word-break:break-word;">${contactData.inquiryType}</div>
            </div>
            <div style="display:flex; padding:12px 0; border-bottom:1px solid #e5e7eb;">
              <div style="font-weight:700; color:#1e3c72; width:35%; font-size:14px;">Contact Method:</div>
              <div style="color:#4b5563; width:65%; font-size:14px; word-break:break-word; text-transform:capitalize;">${contactData.contactMethod}</div>
            </div>
            ${contactData.studentGrade ? `
            <div style="display:flex; padding:12px 0; border-bottom:1px solid #e5e7eb;">
              <div style="font-weight:700; color:#1e3c72; width:35%; font-size:14px;">Student Grade:</div>
              <div style="color:#4b5563; width:65%; font-size:14px; word-break:break-word;">${contactData.studentGrade}</div>
            </div>
            ` : ''}
            
            <!-- Message -->
            <div style="font-size:17px; font-weight:700; color:#dc2626; margin:24px 0 14px 0; border-bottom:2px solid #fee2e2; padding-bottom:8px;">📝 Message</div>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin:20px 0;">
              <p style="font-size:14px; color:#4b5563; line-height:1.6; margin:0; white-space:pre-wrap; word-break:break-word;">${contactData.message}</p>
            </div>
            
            <!-- Action Box -->
            <div style="background:linear-gradient(135deg, #fff3cd, #ffeaa7); border:1px solid #ffc107; border-radius:12px; padding:20px; margin:20px 0;">
              <h3 style="font-size:16px; font-weight:700; color:#d35400; margin:0 0 12px 0;">⚡ Action Required</h3>
              <ul style="list-style:none; padding:0; margin:0;">
                <li style="padding:8px 0; font-size:13px; color:#856404;">✓ Review the inquiry details above</li>
                <li style="padding:8px 0; font-size:13px; color:#856404;">✓ Respond to the sender within 24 hours</li>
                <li style="padding:8px 0; font-size:13px; color:#856404;">✓ Reference number: ${referenceNumber}</li>
              </ul>
            </div>
          </div>
          
          <!-- FOOTER -->
          <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:#cbd5e1; padding:24px; text-align:center;">
            <p style="font-size:16px; font-weight:700; color:white; margin:0 0 6px 0;">${SCHOOL_NAME}</p>
            <p style="font-size:12px; margin:3px 0;">© ${new Date().getFullYear()} All rights reserved.</p>
            <p style="font-size:12px; margin:3px 0;">This is an automated notification. Please respond promptly.</p>
          </div>
        </div>
        
        <!-- Mobile Responsive Styles -->
        <style>
          @media (max-width: 768px) {
            body { padding: 12px; }
            [style*="padding:28px"] { padding: 20px !important; }
            [style*="font-size:24px"] { font-size: 22px !important; }
            [style*="font-size:22px"] { font-size: 20px !important; }
          }
          @media (max-width: 480px) {
            body { padding: 8px; }
            [style*="padding:28px"] { padding: 16px !important; }
            [style*="display:flex; padding:12px 0;"] { flex-direction: column; }
            [style*="width:35%"] { width: 100%; margin-bottom: 4px; }
            [style*="width:65%"] { width: 100%; }
          }
        </style>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
}

// ====================================================================
// POST REQUEST HANDLER
// ====================================================================

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { name, email, phone, message, subject, inquiryType, contactMethod, studentGrade } = body;
    
    // Validation
    if (!name || !email || !phone || !message || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }
    
    const referenceNumber = generateReferenceNumber();
    
    // Send confirmation email to user
    await sendContactConfirmation(email, name, subject, referenceNumber);
    
    // Send notification to admin
    await sendAdminNotification(
      { name, email, phone, message, subject, inquiryType, contactMethod, studentGrade },
      referenceNumber
    );
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Contact form submitted successfully',
        referenceNumber: referenceNumber
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}