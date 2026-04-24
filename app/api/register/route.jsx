import { NextResponse } from 'next/server';
import { prisma } from '../../../libs/prisma';
import { hashPassword, generateToken, sanitizeUser } from '../../../libs/auth';
import nodemailer from 'nodemailer';

// Constants

const SCHOOL_NAME = 'Katwanyaa senior school';
const SCHOOL_LOCATION = 'Matungulu, Machakos County';
const SCHOOL_MOTTO = 'Strive to Excel';
const CONTACT_PHONE = '+254720123456';
const CONTACT_EMAIL = 'matungulugirls@gmail.com';

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ====================================================================
// EMAIL TEMPLATE - REGISTRATION SUCCESS
// ====================================================================
class DeviceTokenManager {
  static validateTokensFromHeaders(headers, options = {}) {
    try {
      const adminToken = headers.get('x-admin-token') || headers.get('authorization')?.replace('Bearer ', '');
      const deviceToken = headers.get('x-device-token');

      if (!adminToken) {
        return { valid: false, reason: 'no_admin_token', message: 'Admin token is required' };
      }

      if (!deviceToken) {
        return { valid: false, reason: 'no_device_token', message: 'Device token is required' };
      }

      const adminParts = adminToken.split('.');
      if (adminParts.length !== 3) {
        return { valid: false, reason: 'invalid_admin_token_format', message: 'Invalid admin token format' };
      }

      const deviceValid = this.validateDeviceToken(deviceToken);
      if (!deviceValid.valid) {
        return { 
          valid: false, 
          reason: `device_${deviceValid.reason}`,
          message: `Device token ${deviceValid.reason}: ${deviceValid.error || ''}`
        };
      }

      let adminPayload;
      try {
        adminPayload = JSON.parse(atob(adminParts[1]));
        
        const currentTime = Date.now() / 1000;
        if (adminPayload.exp < currentTime) {
          return { valid: false, reason: 'admin_token_expired', message: 'Admin token has expired' };
        }
        
        const userRole = adminPayload.role || adminPayload.userRole;
        // Only allow roles defined in Prisma enum UserRole
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'USER'];
        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          return { 
            valid: false, 
            reason: 'invalid_role', 
            message: 'User does not have permission to manage resources' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ Resource management authentication successful for user:', adminPayload.name || 'Unknown');
      
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

  static validateDeviceToken(token) {
    try {
      const payloadStr = Buffer.from(token, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadStr);
      
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        return { valid: false, reason: 'expired', payload, error: 'Device token has expired' };
      }
      
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

const authenticateRequest = (req) => {
  const headers = req.headers;
  
  const validationResult = DeviceTokenManager.validateTokensFromHeaders(headers);
  
  if (!validationResult.valid) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { 
          success: false, 
          error: "Access Denied",
          message: "Authentication required to manage resources.",
          details: validationResult.message
        },
        { status: 401 }
      )
    };
  }

  return {
    authenticated: true,
    user: validationResult.user,
    deviceInfo: validationResult.devInfo
  };
};


function getRegistrationSuccessTemplate(user) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <meta name="x-apple-disable-message-reformatting">
      <title>Account Created - ${SCHOOL_NAME}</title>
    </head>
    <body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f1f5f9; line-height: 1.6; color: #1e293b; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
      
      <!-- Wrapper table for full-width background -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f1f5f9;">
        <tr>
          <td align="center" style="padding: 4% 3%;">
            
            <!-- Main container -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,23,42,0.08);">
              
              <!-- HEADER -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f172a 0%, #334155 100%); padding: 10% 6% 8%; text-align: center;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 12px;">
                        <div style="display: inline-block; background: rgba(255,255,255,0.1); border-radius: 50%; width: 56px; height: 56px; line-height: 56px; text-align: center;">
                          <span style="font-size: 28px;">🎓</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <h1 style="color: white; font-size: clamp(20px, 5.5vw, 28px); font-weight: 800; margin: 0 0 8px; line-height: 1.2; letter-spacing: -0.02em;">Welcome to ${SCHOOL_NAME}</h1>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <p style="color: rgba(255,255,255,0.85); font-size: clamp(13px, 3.5vw, 15px); margin: 0 0 14px; font-weight: 400;">Your Account Has Been Successfully Created</p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <span style="display: inline-block; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.15); padding: 6px 18px; border-radius: 24px; font-size: clamp(10px, 2.5vw, 11px); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.95);">✓ Account Active</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- CONTENT -->
              <tr>
                <td style="padding: 8% 6%;">
                  
                  <!-- Success Card -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #334155; margin-bottom: 6%;">
                    <tr>
                      <td style="padding: 6% 5%; text-align: center;">
                        <span style="font-size: clamp(36px, 10vw, 48px); display: block; margin-bottom: 10px;">✅</span>
                        <h2 style="color: #0f172a; font-size: clamp(17px, 4.5vw, 20px); font-weight: 700; margin: 0 0 6px; letter-spacing: -0.01em;">Welcome Aboard!</h2>
                        <p style="color: #475569; font-size: clamp(13px, 3.5vw, 15px); margin: 0; line-height: 1.5;">Your account is now fully active and ready to use</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Welcome Text -->
                  <p style="color: #334155; font-size: clamp(14px, 3.5vw, 16px); line-height: 1.7; margin: 0 0 6%;">
                    Dear <strong>${user.name}</strong>,
                    <br><br>
                    Congratulations! Your staff account at ${SCHOOL_NAME} has been successfully created. You now have full access to the school management dashboard and all system privileges.
                  </p>
                  
                  <!-- Info Cards -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 6%;">
                    <tr>
                      <td style="padding-bottom: 10px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #475569;">
                          <tr>
                            <td style="padding: 5% 5%;">
                              <p style="font-size: clamp(10px, 2.5vw, 11px); font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.06em; margin: 0 0 6px;">👤 Account Role</p>
                              <p style="font-size: clamp(14px, 3.5vw, 16px); font-weight: 700; color: #0f172a; margin: 0; word-break: break-word;">${user.role}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #475569;">
                          <tr>
                            <td style="padding: 5% 5%;">
                              <p style="font-size: clamp(10px, 2.5vw, 11px); font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.06em; margin: 0 0 6px;">📧 Email Address</p>
                              <p style="font-size: clamp(14px, 3.5vw, 16px); font-weight: 700; color: #0f172a; margin: 0; word-break: break-word;">${user.email}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Features Section -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #334155; margin-bottom: 6%;">
                    <tr>
                      <td style="padding: 6% 5%;">
                        <h3 style="color: #0f172a; font-size: clamp(15px, 4vw, 17px); font-weight: 700; margin: 0 0 5%;">✨ Dashboard Features & Privileges</h3>
                        
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: clamp(13px, 3.2vw, 14px); color: #334155; line-height: 1.5;">
                              <span style="font-size: 18px; margin-right: 8px; vertical-align: middle;">📊</span>
                              <strong>Dashboard Access:</strong> Monitor school operations and statistics
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: clamp(13px, 3.2vw, 14px); color: #334155; line-height: 1.5;">
                              <span style="font-size: 18px; margin-right: 8px; vertical-align: middle;">👨‍🎓</span>
                              <strong>Student Management:</strong> Manage student records and information
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: clamp(13px, 3.2vw, 14px); color: #334155; line-height: 1.5;">
                              <span style="font-size: 18px; margin-right: 8px; vertical-align: middle;">📝</span>
                              <strong>Admissions:</strong> Handle admission applications and enrollment
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: clamp(13px, 3.2vw, 14px); color: #334155; line-height: 1.5;">
                              <span style="font-size: 18px; margin-right: 8px; vertical-align: middle;">📅</span>
                              <strong>Academic Calendar:</strong> Manage school events and schedules
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: clamp(13px, 3.2vw, 14px); color: #334155; line-height: 1.5;">
                              <span style="font-size: 18px; margin-right: 8px; vertical-align: middle;">📢</span>
                              <strong>Communications:</strong> Send announcements and newsletters
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: clamp(13px, 3.2vw, 14px); color: #334155; line-height: 1.5;">
                              <span style="font-size: 18px; margin-right: 8px; vertical-align: middle;">⚙️</span>
                              <strong>System Settings:</strong> Configure school information and policies
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; font-size: clamp(13px, 3.2vw, 14px); color: #334155; line-height: 1.5;">
                              <span style="font-size: 18px; margin-right: 8px; vertical-align: middle;">📊</span>
                              <strong>Reports:</strong> Generate and view school reports
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Box -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 6%;">
                    <tr>
                      <td style="padding: 6% 5%; text-align: center;">
                        <h3 style="color: #0f172a; font-size: clamp(15px, 3.8vw, 16px); font-weight: 700; margin: 0 0 8px;">🚀 Get Started Now</h3>
                        <p style="margin: 0 0 16px; font-size: clamp(13px, 3.2vw, 14px); color: #475569;">Access your dashboard and start managing the school system</p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kinyui-senior.vercel.app'}/MainDashboard" 
                           style="display: inline-block; 
                                  width: 80%; 
                                  max-width: 260px; 
                                  background: linear-gradient(135deg, #0f172a 0%, #334155 100%); 
                                  color: white; 
                                  padding: 14px 8px; 
                                  text-decoration: none; 
                                  border-radius: 8px; 
                                  font-weight: 600; 
                                  font-size: clamp(14px, 3.5vw, 15px); 
                                  text-align: center;
                                  border: none;">Open Dashboard →</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Credentials Box -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #64748b; margin-bottom: 6%;">
                    <tr>
                      <td style="padding: 5% 5%;">
                        <h3 style="color: #0f172a; font-size: clamp(14px, 3.5vw, 15px); font-weight: 700; margin: 0 0 4%;">🔐 Login Information</h3>
                        
                        <!-- Email credential -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: white; border-radius: 8px; border-left: 4px solid #475569; margin-bottom: 10px;">
                          <tr>
                            <td style="padding: 12px;">
                              <p style="font-size: clamp(10px, 2.5vw, 11px); color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px;">📧 Email</p>
                              <p style="font-size: clamp(13px, 3.2vw, 14px); color: #1e293b; font-weight: 700; margin: 0; word-break: break-word;">${user.email}</p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Password credential -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: white; border-radius: 8px; border-left: 4px solid #475569;">
                          <tr>
                            <td style="padding: 12px;">
                              <p style="font-size: clamp(10px, 2.5vw, 11px); color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px;">🔑 Password</p>
                              <p style="font-size: clamp(13px, 3.2vw, 14px); color: #1e293b; font-weight: 700; margin: 0;">Use the password you set during registration</p>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 12px 0 0; font-size: clamp(11px, 2.8vw, 12px); color: #475569;">
                          ⚠️ <strong>Important:</strong> Keep your login credentials safe and never share them with anyone.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Support Box -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #475569; margin-bottom: 6%;">
                    <tr>
                      <td style="padding: 5% 5%;">
                        <h3 style="color: #0f172a; font-size: clamp(14px, 3.5vw, 15px); font-weight: 700; margin: 0 0 3%;">💡 Need Help?</h3>
                        <p style="font-size: clamp(12px, 3vw, 13px); color: #475569; line-height: 1.6; margin: 0;">
                          If you have any questions or need assistance with the dashboard, please contact the IT department or school administrator at <strong>${CONTACT_EMAIL}</strong> or <strong>${CONTACT_PHONE}</strong>.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Closing Message -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="text-align: center; padding-top: 4%; border-top: 2px solid #e2e8f0;">
                        <p style="font-size: clamp(15px, 3.8vw, 16px); color: #0f172a; font-weight: 600; margin: 0 0 6px;">
                          Thank you for joining our team!
                        </p>
                        <p style="font-size: clamp(13px, 3.2vw, 14px); color: #475569; margin: 0;">
                          Together, we are making a difference in education.<br>
                          <strong style="color: #334155;">${SCHOOL_MOTTO}</strong>
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
              
              <!-- FOOTER -->
              <tr>
                <td style="background: #0f172a; padding: 8% 6%; text-align: center;">
                  <p style="color: #ffffff; font-size: clamp(15px, 4vw, 17px); font-weight: 700; margin: 0 0 4px; letter-spacing: -0.01em;">${SCHOOL_NAME}</p>
                  <p style="color: #94a3b8; font-size: clamp(12px, 3vw, 13px); margin: 4px 0;">${SCHOOL_LOCATION}</p>
                  <p style="color: #94a3b8; font-size: clamp(12px, 3vw, 13px); margin: 4px 0 0;">Public Boarding School</p>
                  <div style="width: 40px; height: 2px; background: #475569; margin: 14px auto;"></div>
                  <p style="color: #64748b; font-size: clamp(10px, 2.5vw, 11px); margin: 0 0 4px;">© ${new Date().getFullYear()} ${SCHOOL_NAME}. All rights reserved.</p>
                  <p style="color: #64748b; font-size: clamp(10px, 2.5vw, 11px); margin: 0;">📞 ${CONTACT_PHONE} | 📧 ${CONTACT_EMAIL}</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// ====================================================================
// SEND REGISTRATION EMAIL
// ====================================================================

async function sendRegistrationEmail(user) {
  try {
    const mailOptions = {
      from: {
        name: `${SCHOOL_NAME} - Staff Management`,
        address: process.env.EMAIL_USER
      },
      to: user.email,
      subject: `✅ Account Created Successfully - ${SCHOOL_NAME}`,
      html: getRegistrationSuccessTemplate(user)
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Registration email sent to:', user.email);
  } catch (error) {
    console.error('❌ Error sending registration email:', error);
  }
}

// Helpers
const validateEnvironment = () => {
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not set.');
    return false;
  }
  return true;
};

const validateInput = (name, email, password, role) => {
  const errors = [];
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  // If role is missing or invalid, default to ADMIN
  const validRoles = ['ADMIN', 'SUPER_ADMIN', 'USER'];
  if (!role || !validRoles.includes(role.toUpperCase())) {
    // No error, just default to ADMIN
  }
  return errors;
};

// Main POST
// Main POST
export async function POST(request) {
  try {
    // ===================== TOKEN VERIFICATION DISABLED FOR TESTING =====================
    // Authentication is disabled to allow user creation for testing purposes.
    // Uncomment the following block to re-enable admin/device token checks.
    /*
    // Authenticate request first - only ADMIN and SUPERADMIN can create users
    const auth = authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }
    // Check if user has permission to create new users (only ADMIN or SUPERADMIN)
    const adminRoles = ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN', 'administrator', 'PRINCIPAL'];
    if (!adminRoles.includes(auth.user.role?.toUpperCase())) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Permission Denied",
          message: "Only administrators can create new users"
        },
        { status: 403 }
      );
    }
    // Log the user creation attempt for audit
    console.log('👤 User creation attempt:', {
      createdBy: auth.user.name,
      createdById: auth.user.id,
      createdByRole: auth.user.role,
      device: auth.deviceInfo,
      timestamp: new Date().toISOString()
    });
    */
    // ===================== END TOKEN VERIFICATION DISABLED =====================

    // ================ REST OF YOUR EXISTING CODE CONTINUES HERE ================

    let { name, email, password, phone, role } = await request.json();
    // Normalize role to Prisma enum (ADMIN or SUPER_ADMIN)
    let dbRole = (role || '').toUpperCase().replace(/[- ]/g, '_');
    if (!['ADMIN', 'SUPER_ADMIN'].includes(dbRole)) {
      dbRole = 'ADMIN';
    }

    // Only allow ADMIN or SUPERADMIN to create users (unless no users exist yet)
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      // Token verification is DISABLED for user creation (for testing)
      /*
      const auth = authenticateRequest(request);
      if (!auth.authenticated) {
        return auth.response;
      }
      const allowedRoles = ['ADMIN', 'SUPERADMIN'];
      if (!allowedRoles.includes((auth.user.role || '').toUpperCase())) {
        return NextResponse.json(
          {
            success: false,
            error: 'Permission Denied',
            message: 'Only ADMIN or SUPERADMIN can create new users.'
          },
          { status: 403 }
        );
      }
      */
    }

    // Prevent non-SUPERADMIN role assignment for first user
    if (userCount === 0 && dbRole !== 'SUPER_ADMIN') {
      dbRole = 'SUPER_ADMIN';
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    if (!validateEnvironment()) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const validationErrors = validateInput(name, email, password, role);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 });
    }

    // Check duplicates
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Save user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { 
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role: dbRole
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        phone: true, 
        role: true, 
        image: true,
        emailVerified: true,
        createdAt: true, 
        updatedAt: true 
      },
    });

    // Send registration email
    await sendRegistrationEmail(user);

    // Generate token
    const token = generateToken(user);

    // Log successful creation
    console.log('✅ User created successfully:', {
      newUser: user.email,
      newUserRole: user.role,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        user: sanitizeUser(user),
        token
        // createdBy: only included if authentication is enabled
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error registering user:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}



// GET users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        createdAt: true 
      },
    });
    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}