// /app/api/login/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../libs/prisma';
import { verifyPassword, generateToken, sanitizeUser } from '../../../libs/auth';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Constants
const MAX_FAILED_ATTEMPTS = 3;
const MAX_LOGIN_ATTEMPTS_BEFORE_VERIFY = 15;
const VERIFICATION_CODE_EXPIRY_MINUTES = 15;
const VERIFICATION_CODE_LENGTH = 6;
const DEVICE_TOKEN_EXPIRY_DAYS = 10;

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ====================
// EMAIL TEMPLATE
// ====================
function getVerificationEmailTemplate(user, verificationCode) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <meta name="x-apple-disable-message-reformatting">
      <title>Verification Code - Katwanyaa senior school</title>
    </head>
    <body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f1f5f9; line-height: 1.6; color: #1e293b; -webkit-text-size-adjust: 100%;">
      
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f1f5f9;">
        <tr>
          <td align="center" style="padding: 4% 3%;">
            
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 550px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,23,42,0.08);">
              
              <!-- HEADER -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f172a 0%, #334155 100%); padding: 10% 6% 8%; text-align: center;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 12px;">
                        <div style="display: inline-block; background: rgba(255,255,255,0.1); border-radius: 50%; width: 52px; height: 52px; line-height: 52px; text-align: center;">
                          <span style="font-size: 26px;">🔐</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <h1 style="color: white; font-size: clamp(20px, 5.5vw, 26px); font-weight: 800; margin: 0 0 6px; line-height: 1.2; letter-spacing: -0.02em;">Login Verification</h1>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <p style="color: rgba(255,255,255,0.7); font-size: clamp(12px, 3vw, 14px); margin: 0; font-weight: 400; letter-spacing: 0.03em;">Katwanyaa senior school Admin System</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- CONTENT -->
              <tr>
                <td style="padding: 8% 6%;">
                  
                  <h2 style="color: #0f172a; font-size: clamp(17px, 4.5vw, 20px); font-weight: 700; margin: 0 0 3%; letter-spacing: -0.01em;">Hello ${user.name},</h2>
                  <p style="color: #475569; font-size: clamp(14px, 3.5vw, 15px); line-height: 1.6; margin: 0 0 6%;">
                    Use the verification code below to complete your login:
                  </p>
                  
                  <!-- Code Box -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #334155; margin-bottom: 6%;">
                    <tr>
                      <td style="padding: 6% 5%; text-align: center;">
                        <p style="color: #475569; font-size: clamp(13px, 3.2vw, 14px); font-weight: 600; margin: 0 0 12px;">Your 6-digit verification code:</p>
                        <div style="font-size: clamp(28px, 8vw, 36px); font-weight: 800; letter-spacing: 10px; color: #0f172a; font-family: 'Courier New', Courier, monospace; margin: 0; padding: 12px 0; background: #ffffff; border-radius: 8px; border: 2px solid #e2e8f0;">${verificationCode}</div>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Security Warning -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; border-left: 4px solid #64748b; margin-bottom: 5%;">
                    <tr>
                      <td style="padding: 5%;">
                        <p style="color: #1e293b; font-size: clamp(13px, 3.2vw, 14px); font-weight: 700; margin: 0 0 6px;">⚠️ Security Notice</p>
                        <p style="color: #475569; font-size: clamp(13px, 3.2vw, 14px); line-height: 1.5; margin: 0;">If you didn't attempt to login, change your password immediately.</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Expiry Note -->
                  <p style="color: #64748b; font-size: clamp(12px, 3vw, 13px); text-align: center; margin: 0;">
                    ⏰ This code expires in <strong style="color: #334155;">${VERIFICATION_CODE_EXPIRY_MINUTES} minutes</strong>.
                  </p>
                  
                </td>
              </tr>
              
              <!-- FOOTER -->
              <tr>
                <td style="background: #0f172a; padding: 8% 6%; text-align: center;">
                  <p style="color: #ffffff; font-size: clamp(14px, 3.5vw, 16px); font-weight: 700; margin: 0 0 4px; letter-spacing: -0.01em;">Katwanyaa senior school</p>
                  <div style="width: 40px; height: 2px; background: #475569; margin: 12px auto;"></div>
                  <p style="color: #64748b; font-size: clamp(10px, 2.5vw, 11px); margin: 0;">© ${new Date().getFullYear()} Katwanyaa senior school. All rights reserved.</p>
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

// ====================
// HELPER FUNCTIONS
// ====================

function base64Encode(str) {
  return Buffer.from(str, 'utf-8').toString('base64');
}

function base64Decode(str) {
  return Buffer.from(str, 'base64').toString('utf-8');
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateDeviceHash(req) {
  const userAgent = req.headers.get('user-agent') || '';
  const accept = req.headers.get('accept') || '';
  const language = req.headers.get('accept-language') || '';
  const platform = req.headers.get('sec-ch-ua-platform') || '';
  
  const deviceString = `${userAgent}|${accept}|${language}|${platform}`;
  return crypto.createHash('sha256').update(deviceString).digest('hex').substring(0, 32);
}

async function checkFailedAttempts(email) {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  return await prisma.loginAttempt.count({
    where: {
      email: email.toLowerCase(),
      status: 'failed',
      reason: 'wrong_password',
      attemptedAt: { gte: fifteenMinutesAgo }
    }
  });
}

async function storeVerificationCode(email, code, deviceHash) {
  const expires = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);
  
  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  });
  
  return await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires: expires
    }
  });
}

async function sendVerificationEmail(user, verificationCode) {
  try {
    const mailOptions = {
      from: {
        name: 'Katwanyaa senior school Security',
        address: process.env.EMAIL_USER
      },
      to: user.email,
      subject: `🔐 Your Verification Code: ${verificationCode}`,
      html: getVerificationEmailTemplate(user, verificationCode)
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification code sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
}

function generateDeviceToken(userId, deviceHash, currentLoginCount = 1) {
  const payload = {
    userId: userId,
    deviceHash: deviceHash,
    loginCount: currentLoginCount,
    createdAt: new Date().toISOString(),
    exp: Math.floor(Date.now() / 1000) + (DEVICE_TOKEN_EXPIRY_DAYS * 24 * 60 * 60),
    iat: Math.floor(Date.now() / 1000),
  };
  
  return base64Encode(JSON.stringify(payload));
}

function verifyDeviceToken(token, deviceHash) {
  try {
    let payloadStr;
    
    if (token.includes('.')) {
      const parts = token.split('.');
      if (parts.length !== 3) return { valid: false, reason: 'invalid_jwt_format' };
      payloadStr = Buffer.from(parts[1], 'base64').toString('utf-8');
    } else {
      try {
        payloadStr = Buffer.from(token, 'base64').toString('utf-8');
      } catch {
        payloadStr = Buffer.from(token.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
      }
    }
    
    const payload = JSON.parse(payloadStr);
    
    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      return { valid: false, reason: 'expired' };
    }
    
    if (payload.deviceHash && payload.deviceHash !== deviceHash) {
      return { valid: false, reason: 'device_mismatch' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, reason: 'invalid_token' };
  }
}

async function resetDeviceCounts(userId, deviceHash) {
  try {
    console.log('🔄 Resetting device counts for user');
    
    const expiresAt = new Date(Date.now() + DEVICE_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    
    const device = await prisma.deviceToken.upsert({
      where: {
        userId_deviceHash: {
          userId: userId,
          deviceHash: deviceHash
        }
      },
      update: {
        lastUsed: new Date(),
        expiresAt: expiresAt,
        isTrusted: true,
        loginCount: 1,
        countsResetAt: new Date(),
        isCountsReset: true
      },
      create: {
        userId: userId,
        deviceHash: deviceHash,
        deviceName: 'Device after verification',
        lastUsed: new Date(),
        expiresAt: expiresAt,
        isTrusted: true,
        loginCount: 1,
        countsResetAt: new Date(),
        isCountsReset: true
      }
    });
    
    console.log('✅ Device counts reset to 1');
    return device;
  } catch (error) {
    console.error('❌ Error resetting device counts:', error);
    throw error;
  }
}

async function checkDeviceVerification(userId, deviceHash, clientLoginCount = 0, clientDeviceToken = null) {
  try {
    if (!clientDeviceToken) {
      return { 
        requiresVerification: true, 
        reason: 'new_device',
        shouldResetAfterVerification: true 
      };
    }

    const tokenValid = verifyDeviceToken(clientDeviceToken, deviceHash);
    
    if (!tokenValid.valid) {
      return { 
        requiresVerification: true, 
        reason: tokenValid.reason,
        shouldResetAfterVerification: tokenValid.reason === 'expired'
      };
    }

    const loginCount = tokenValid.payload.loginCount || 0;
    if (loginCount >= MAX_LOGIN_ATTEMPTS_BEFORE_VERIFY) {
      return { 
        requiresVerification: true, 
        reason: 'max_logins_reached',
        shouldResetAfterVerification: true
      };
    }

    const device = await prisma.deviceToken.findFirst({
      where: {
        userId: userId,
        deviceHash: deviceHash,
        isBlocked: false
      }
    });

    if (!device) {
      return { 
        requiresVerification: true, 
        reason: 'no_device_record',
        shouldResetAfterVerification: true
      };
    }

    if (!device.isTrusted) {
      return { 
        requiresVerification: true, 
        reason: 'device_not_trusted',
        shouldResetAfterVerification: false
      };
    }

    if (device.expiresAt <= new Date()) {
      return { 
        requiresVerification: true, 
        reason: 'device_expired',
        shouldResetAfterVerification: true
      };
    }

    if (device.loginCount >= MAX_LOGIN_ATTEMPTS_BEFORE_VERIFY) {
      return { 
        requiresVerification: true, 
        reason: 'max_logins_reached',
        shouldResetAfterVerification: true
      };
    }

    return { 
      requiresVerification: false,
      currentLoginCount: device.loginCount,
      shouldResetAfterVerification: false
    };

  } catch (error) {
    console.error('❌ Error checking device verification:', error);
    return { 
      requiresVerification: true, 
      reason: 'verification_error',
      shouldResetAfterVerification: false
    };
  }
}

async function updateDeviceLoginCount(userId, deviceHash, userAgent) {
  const expiresAt = new Date(Date.now() + DEVICE_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  const device = await prisma.deviceToken.upsert({
    where: {
      userId_deviceHash: {
        userId: userId,
        deviceHash: deviceHash
      }
    },
    update: {
      lastUsed: new Date(),
      expiresAt: expiresAt,
      isTrusted: true,
      loginCount: { increment: 1 }
    },
    create: {
      userId: userId,
      deviceHash: deviceHash,
      deviceName: userAgent.substring(0, 100),
      lastUsed: new Date(),
      expiresAt: expiresAt,
      isTrusted: true,
      loginCount: 1
    }
  });
  
  return device;
}

// ====================
// MAIN LOGIN HANDLER
// ====================
export async function POST(request) {
  try {
    const requestBody = await request.json();
    
    const { 
      email, 
      password, 
      verificationCode, 
      action,
      clientDeviceToken,
      clientLoginCount,
      clientDeviceHash
    } = requestBody;
    
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const serverDeviceHash = generateDeviceHash(request);
    const deviceHash = clientDeviceHash || serverDeviceHash;

    console.log('🔍 Login request:', { 
      email: email ? `${email.substring(0, 3)}...` : 'none', 
      action,
      hasVerificationCode: !!verificationCode
    });

    // ====================
    // VERIFY CODE FLOW
    // ====================
    if (action === 'verify' && verificationCode) {
      console.log('🔐 OTP verification flow for:', email);
      
      const verificationToken = await prisma.verificationToken.findFirst({
        where: {
          identifier: email,
          token: verificationCode,
          expires: { gt: new Date() }
        }
      });

      if (!verificationToken) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired verification code'
        }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { email: email }
      });

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 });
      }

      // Check if we need to reset counts
      const deviceCheck = await checkDeviceVerification(
        user.id,
        deviceHash,
        clientLoginCount,
        clientDeviceToken
      );
      
      const shouldReset = deviceCheck.shouldResetAfterVerification || 
                         deviceCheck.reason === 'max_logins_reached' ||
                         deviceCheck.reason === 'expired';

      console.log('🔄 Reset decision:', { shouldReset, reason: deviceCheck.reason });

      // Reset or update device counts
      if (shouldReset) {
        await resetDeviceCounts(user.id, deviceHash);
      } else {
        await updateDeviceLoginCount(user.id, deviceHash, userAgent);
      }

      // Delete used verification code
      await prisma.verificationToken.delete({
        where: { token: verificationCode }
      });

      // Generate tokens
      const authToken = generateToken(user);
      const deviceToken = generateDeviceToken(user.id, deviceHash, shouldReset ? 1 : (deviceCheck.currentLoginCount || 1) + 1);
      
      const userData = sanitizeUser(user);

      // Log successful verification
      await prisma.loginAttempt.create({
        data: {
          userId: user.id,
          email: user.email,
          ipAddress: ipAddress,
          userAgent: userAgent,
          deviceHash: deviceHash,
          status: 'success',
          reason: shouldReset ? 'otp_verified_counts_reset' : 'otp_verified'
        }
      });

      console.log(`✅ OTP verification successful for: ${user.email} ${shouldReset ? '(counts reset)' : ''}`);

      return NextResponse.json({
        success: true,
        message: shouldReset 
          ? 'Login successful! Device verification counts have been reset.'
          : 'Login successful!',
        user: userData,
        email: user.email,
        token: authToken,
        deviceToken: deviceToken,
        storeInLocalStorage: true,
        loginCount: shouldReset ? 1 : (deviceCheck.currentLoginCount || 1) + 1,
        directLogin: true,
        countsWereReset: shouldReset
      }, { status: 200 });
    }

    // ====================
    // PASSWORD + VERIFICATION FLOW
    // ====================
    if (action === 'verify_password' && verificationCode && password) {
      console.log('🔐 Password + OTP flow for:', email);
      
      const verificationToken = await prisma.verificationToken.findFirst({
        where: {
          identifier: email,
          token: verificationCode,
          expires: { gt: new Date() }
        }
      });

      if (!verificationToken) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired verification code'
        }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { email: email }
      });

      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found'
        }, { status: 404 });
      }

      const isPasswordValid = await verifyPassword(password, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json({
          success: false,
          error: 'Incorrect password'
        }, { status: 401 });
      }

      // Check if we need to reset counts
      const deviceCheck = await checkDeviceVerification(
        user.id,
        deviceHash,
        clientLoginCount,
        clientDeviceToken
      );
      
      const shouldReset = deviceCheck.shouldResetAfterVerification || 
                         deviceCheck.reason === 'max_logins_reached' ||
                         deviceCheck.reason === 'expired';

      console.log('🔄 Reset decision:', { shouldReset, reason: deviceCheck.reason });

      // Reset or update device counts
      if (shouldReset) {
        await resetDeviceCounts(user.id, deviceHash);
      } else {
        await updateDeviceLoginCount(user.id, deviceHash, userAgent);
      }

      // Delete used verification code
      await prisma.verificationToken.delete({
        where: { token: verificationCode }
      });

      // Generate tokens
      const authToken = generateToken(user);
      const deviceToken = generateDeviceToken(user.id, deviceHash, shouldReset ? 1 : (deviceCheck.currentLoginCount || 1) + 1);
      
      const userData = sanitizeUser(user);

      // Log successful login
      await prisma.loginAttempt.create({
        data: {
          userId: user.id,
          email: user.email,
          ipAddress: ipAddress,
          userAgent: userAgent,
          deviceHash: deviceHash,
          status: 'success',
          reason: shouldReset ? 'password_correct_after_otp_counts_reset' : 'password_correct_after_otp'
        }
      });

      console.log(`✅ Password + OTP successful for: ${user.email} ${shouldReset ? '(counts reset)' : ''}`);

      return NextResponse.json({
        success: true,
        message: shouldReset 
          ? 'Login successful! Device verification counts have been reset.'
          : 'Login successful!',
        user: userData,
        email: user.email,
        token: authToken,
        deviceToken: deviceToken,
        storeInLocalStorage: true,
        loginCount: shouldReset ? 1 : (deviceCheck.currentLoginCount || 1) + 1,
        directLogin: true,
        countsWereReset: shouldReset
      }, { status: 200 });
    }

    // ====================
    // RESEND CODE FLOW
    // ====================
    if (action === 'resend') {
      console.log('🔄 Resend code for:', email);
      const user = await prisma.user.findUnique({ 
        where: { email: email.toLowerCase().trim() } 
      });
      
      if (!user) {
        return NextResponse.json({ 
          success: false,
          error: 'User not found' 
        }, { status: 404 });
      }

      // Check for existing unexpired code
      const existingToken = await prisma.verificationToken.findFirst({
        where: {
          identifier: user.email,
          expires: { gt: new Date() }
        }
      });
      let codeToSend;
      if (existingToken) {
        codeToSend = existingToken.token;
        console.log('♻️ Reusing existing verification code for RESEND:', email);
      } else {
        codeToSend = generateVerificationCode();
        await storeVerificationCode(user.email, codeToSend, deviceHash);
      }
      await sendVerificationEmail(user, codeToSend);

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your email'
      }, { status: 200 });
    }

    // ====================
    // NORMAL LOGIN FLOW
    // ====================
    if (!email || !password) {
      return NextResponse.json({ 
        success: false,
        error: 'Email and password are required' 
      }, { status: 400 });
    }

    console.log('🔑 Normal login attempt for:', email);

    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase().trim() } 
    });
    
    if (!user) {
      await prisma.loginAttempt.create({
        data: {
          email: email.toLowerCase(),
          ipAddress: ipAddress,
          userAgent: userAgent,
          deviceHash: deviceHash,
          status: 'failed',
          reason: 'user_not_found'
        }
      });
      
      return NextResponse.json({ 
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      await prisma.loginAttempt.create({
        data: {
          userId: user.id,
          email: user.email,
          ipAddress: ipAddress,
          userAgent: userAgent,
          deviceHash: deviceHash,
          status: 'failed',
          reason: 'wrong_password'
        }
      });
      
      const failedCount = await checkFailedAttempts(user.email);
      
      return NextResponse.json({ 
        success: false,
        error: 'Invalid email or password',
        attemptsLeft: MAX_FAILED_ATTEMPTS - failedCount - 1
      }, { status: 401 });
    }

    console.log('✅ Password correct for:', email);
    
    await prisma.loginAttempt.create({
      data: {
        userId: user.id,
        email: user.email,
        ipAddress: ipAddress,
        userAgent: userAgent,
        deviceHash: deviceHash,
        status: 'success',
        reason: 'password_correct'
      }
    });

    // ====================
    // DEVICE VERIFICATION CHECK
    // ====================
    console.log('🔍 Checking device verification...');
    
    const deviceVerificationCheck = await checkDeviceVerification(
      user.id,
      deviceHash,
      clientLoginCount,
      clientDeviceToken
    );
    
    console.log('📊 Device verification result:', {
      requiresVerification: deviceVerificationCheck.requiresVerification,
      reason: deviceVerificationCheck.reason,
      shouldResetAfterVerification: deviceVerificationCheck.shouldResetAfterVerification
    });
    
    if (deviceVerificationCheck.requiresVerification) {
      console.log('🔐 Verification required for:', email);
      // Check for existing unexpired code
      const existingToken = await prisma.verificationToken.findFirst({
        where: {
          identifier: user.email,
          expires: { gt: new Date() }
        }
      });
      let verificationCode;
      if (existingToken) {
        verificationCode = existingToken.token;
        console.log('♻️ Reusing existing verification code for:', email);
      } else {
        verificationCode = generateVerificationCode();
        await storeVerificationCode(user.email, verificationCode, deviceHash);
      }
      await sendVerificationEmail(user, verificationCode);
      return NextResponse.json({
        success: false,
        requiresVerification: true,
        message: 'Verification code sent to your email.',
        email: user.email,
        user: sanitizeUser(user),
        reason: deviceVerificationCheck.reason,
        deviceHash: deviceHash,
        shouldResetAfterVerification: deviceVerificationCheck.shouldResetAfterVerification,
        actionRequired: 'verify',
        passwordRequired: false
      }, { status: 200 });
    }

    console.log('✅ Device trusted, proceeding with login');
    
    const device = await updateDeviceLoginCount(user.id, deviceHash, userAgent);
    
    const token = generateToken(user);
    const deviceToken = generateDeviceToken(user.id, deviceHash, device.loginCount);
    
    const userData = sanitizeUser(user);

    console.log('🎉 Login successful for:', user.email, 'Login count:', device.loginCount);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      email: user.email,
      token: token,
      deviceToken: deviceToken,
      storeInLocalStorage: true,
      loginCount: device.loginCount,
      deviceTrusted: true,
      deviceHash: deviceHash
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error during login:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// ====================
// GET LOGIN INFO
// ====================
export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Login endpoint with verification',
      security: {
        maxFailedAttempts: MAX_FAILED_ATTEMPTS,
        maxLoginAttemptsBeforeVerify: MAX_LOGIN_ATTEMPTS_BEFORE_VERIFY,
        verificationCodeLength: VERIFICATION_CODE_LENGTH,
        verificationExpiryMinutes: VERIFICATION_CODE_EXPIRY_MINUTES,
        deviceTokenExpiryDays: DEVICE_TOKEN_EXPIRY_DAYS,
        resetPolicy: 'Login counts reset to 1 after reaching max attempts and successful verification'
      },
      status: 'operational'
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching login info:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}