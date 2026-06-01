import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
  rateDelta: 2000,
  rateLimit: 5,
});

/**
 * Normalize and validate email addresses
 * @param {string} email - Email address to normalize
 * @returns {string|null} - Normalized email or null if invalid
 */
export const normalizeEmailAddress = (email) => {
  if (!email || typeof email !== 'string') return null;
  
  const trimmed = email.trim().toLowerCase();
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) return null;
  
  return trimmed;
};

/**
 * Send email via delivery queue
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {Array} options.attachments - Optional file attachments
 * @returns {Promise<Object>} - { success: boolean, error?: string, responseCode?: number }
 */
export const sendDeliveryEmail = async (options) => {
  try {
    const { to, subject, text, html, attachments = [] } = options;

    if (!to || !subject || (!text && !html)) {
      return {
        success: false,
        error: 'Missing required email parameters (to, subject, text/html)',
        responseCode: 400,
      };
    }

    const normalizedTo = normalizeEmailAddress(to);
    if (!normalizedTo) {
      return {
        success: false,
        error: `Invalid email address: ${to}`,
        responseCode: 400,
      };
    }

    const mailOptions = {
      from: `"Katwanyaa Senior School" <${process.env.EMAIL_USER}>`,
      to: normalizedTo,
      subject: subject,
      text: text || html?.replace(/<[^>]*>/g, ''),
      html: html || text,
      attachments: attachments.filter(att => att && (att.path || att.content)),
      headers: {
        'X-Priority': '3',
        'Importance': 'normal',
        'X-Mailer': 'Katwanyaa School Management System',
      },
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Email delivery error:', error);

    // Handle specific error codes
    let responseCode = 500;
    let errorMessage = error.message;

    // Gmail specific error codes
    if (error.code === 'ECONNREFUSED') {
      responseCode = 503;
      errorMessage = 'Email service unavailable. Connection refused.';
    } else if (error.message?.includes('454') || error.message?.includes('Too many login attempts')) {
      responseCode = 454;
      errorMessage = 'Too many login attempts. Rate limited. Please try again later.';
    } else if (error.message?.includes('Invalid login') || error.message?.includes('INVALID_LOGIN_401')) {
      responseCode = 401;
      errorMessage = 'Email authentication failed. Check credentials.';
    } else if (error.message?.includes('Message rejected')) {
      responseCode = 550;
      errorMessage = 'Email rejected by server.';
    } else if (error.responseCode) {
      responseCode = error.responseCode;
    }

    return {
      success: false,
      error: errorMessage,
      responseCode: responseCode,
      code: error.code,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Verify email transporter connection
 * @returns {Promise<boolean>} - True if connection successful
 */
export const verifyEmailTransporter = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email transporter verified and ready to send');
    return true;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error);
    return false;
  }
};

export default {
  normalizeEmailAddress,
  sendDeliveryEmail,
  verifyEmailTransporter,
};
