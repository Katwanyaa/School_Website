import { NextResponse } from "next/server";
import path from "path";
import { prisma } from "../../../../libs/prisma";
import { normalizeEmailAddress, sendDeliveryEmail } from "../../../../libs/emailDelivery";

export const dynamic = "force-dynamic";

const decodeJwtPayload = (token) => {
  const payload = token.split('.')[1];
  const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
  const paddedPayload = normalizedPayload.padEnd(
    normalizedPayload.length + ((4 - normalizedPayload.length % 4) % 4),
    '='
  );

  return JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf-8'));
};

const authenticateDeliveryRequest = (req) => {
  const adminToken = req.headers.get('x-admin-token') || req.headers.get('authorization')?.replace('Bearer ', '');
  const deviceToken = req.headers.get('x-device-token');

  if (!adminToken || !deviceToken) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: 'Access Denied', message: 'Admin and device tokens are required' },
        { status: 401 }
      )
    };
  }

  try {
    if (adminToken.split('.').length !== 3) throw new Error('Invalid admin token format');
    JSON.parse(Buffer.from(deviceToken, 'base64').toString('utf-8'));

    const adminPayload = decodeJwtPayload(adminToken);
    if (adminPayload.exp && adminPayload.exp < Date.now() / 1000) {
      throw new Error('Admin token has expired');
    }

    const userRole = String(adminPayload.role || adminPayload.userRole || '').toUpperCase();
    const validRoles = ['ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR', 'PRINCIPAL', 'TEACHER', 'STAFF'];
    if (!validRoles.includes(userRole)) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { success: false, error: 'Access Denied', message: 'You do not have permission to send resource delivery emails' },
          { status: 403 }
        )
      };
    }

    return { authenticated: true, user: adminPayload };
  } catch (error) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: 'Access Denied', message: error.message || 'Invalid authentication headers' },
        { status: 401 }
      )
    };
  }
};

const getStudentName = (recipient) =>
  recipient.studentName ||
  (recipient.student
    ? `${recipient.student.firstName || ''} ${recipient.student.lastName || ''}`.trim()
    : '') ||
  'Student';

const buildResourceEmail = (resource, studentName) => {
  const subject = `New learning resource: ${resource.title}`;
  const text = [
    'Dear Parent/Guardian,',
    '',
    `A new learning resource has been shared for ${studentName}.`,
    `Title: ${resource.title}`,
    `Subject: ${resource.subject}`,
    '',
    `Description: ${resource.description || 'Please check the student portal for details.'}`,
    '',
    'Regards,',
    'Katwanyaa Senior School'
  ].join('\n');
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <p>Dear Parent/Guardian,</p>
      <p>A new learning resource has been shared for <strong>${studentName}</strong>.</p>
      <ul>
        <li><strong>Title:</strong> ${resource.title}</li>
        <li><strong>Subject:</strong> ${resource.subject}</li>
      </ul>
      <p><strong>Description:</strong> ${resource.description || 'Please check the student portal for details.'}</p>
      <p>Regards,<br/>Katwanyaa Senior School</p>
    </div>
  `;

  return { subject, text, html };
};

const attachmentFromResourceFile = (file, fallbackName = 'resource-file') => {
  if (!file) return null;
  const url = typeof file === 'string' ? file : file.url;
  if (!url || typeof url !== 'string') return null;

  const cleanUrl = url.split('?')[0];
  const filename = typeof file === 'object' && file.name
    ? file.name
    : decodeURIComponent(cleanUrl.split('/').pop() || fallbackName);

  if (/^https?:\/\//i.test(url)) {
    return { filename, path: url };
  }

  const publicPath = cleanUrl.startsWith('/') ? cleanUrl.slice(1) : cleanUrl;
  return {
    filename,
    path: path.join(process.cwd(), 'public', publicPath),
  };
};

const buildResourceAttachments = (resource) => (Array.isArray(resource.files) ? resource.files : [])
  .map((file, index) => attachmentFromResourceFile(file, `resource-file-${index + 1}`))
  .filter(Boolean);

const mergeDeliveryResults = (previousResults = [], nextResults = []) => {
  const merged = new Map();
  previousResults.forEach((result) => {
    if (result?.recipientId) merged.set(result.recipientId, result);
  });
  nextResults.forEach((result) => {
    if (result?.recipientId) merged.set(result.recipientId, result);
  });
  return Array.from(merged.values());
};

const summarizeRecipientStatuses = async (resourceId, previousSummary, nextResults) => {
  const allRecipients = await prisma.resourceDeliveryRecipient.findMany({
    where: { resourceId },
    select: { id: true, status: true },
  });

  const successCount = allRecipients.filter((recipient) => recipient.status === 'sent').length;
  const failureCount = allRecipients.filter((recipient) => recipient.status === 'failed').length;
  const pendingCount = allRecipients.length - successCount - failureCount;
  const status = allRecipients.length === 0
    ? 'no_recipients'
    : pendingCount > 0
      ? (successCount > 0 || failureCount > 0 ? 'sending' : 'prepared')
      : failureCount === 0
        ? 'sent'
        : successCount > 0
          ? 'partial'
          : 'failed';

  return {
    channel: 'email',
    senderReference: previousSummary?.senderReference || 'email',
    status,
    successCount,
    failureCount,
    pendingCount,
    totalRecipients: allRecipients.length,
    sentAt: new Date().toISOString(),
    results: mergeDeliveryResults(
      Array.isArray(previousSummary?.results) ? previousSummary.results : [],
      nextResults
    ),
  };
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const resourceIdStr = searchParams.get("resourceId");

    if (!resourceIdStr) {
      return NextResponse.json(
        { success: false, error: "Resource ID is required" },
        { status: 400 }
      );
    }

    const resourceId = parseInt(resourceIdStr);
    const deliveryRecipients = await prisma.resourceDeliveryRecipient.findMany({
      where: { resourceId },
      orderBy: [{ createdAt: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: deliveryRecipients,
      count: deliveryRecipients.length,
    });
  } catch (error) {
    console.error("Error fetching resource delivery recipients:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const auth = authenticateDeliveryRequest(req);
    if (!auth.authenticated) return auth.response;

    const body = await req.json();
    const { resourceId, recipientIds } = body;

    if (!resourceId) {
      return NextResponse.json(
        { success: false, error: "Resource ID is required" },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, error: "Resource not found" },
        { status: 404 }
      );
    }

    const where = { resourceId };
    if (recipientIds?.length) where.id = { in: recipientIds };

    const recipients = await prisma.resourceDeliveryRecipient.findMany({
      where,
      include: {
        student: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
          },
        },
      },
    });

    if (recipients.length === 0) {
      await prisma.resource.update({
        where: { id: resourceId },
        data: {
          deliveryStatus: 'no_recipients',
          deliverySummary: {
            channel: 'email',
            successCount: 0,
            failureCount: 0,
            totalRecipients: 0,
            sentAt: new Date().toISOString(),
            results: [],
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Email delivery completed. No recipients found.',
        data: { successCount: 0, failureCount: 0, totalRecipients: 0, results: [] },
      });
    }

    const sendResults = [];
    let successCount = 0;
    let failureCount = 0;
    let rateLimitEncountered = false;
    let rateLimitWaitTime = 0;

    for (let recipientIndex = 0; recipientIndex < recipients.length; recipientIndex++) {
      const recipient = recipients[recipientIndex];
      const parentEmail = normalizeEmailAddress(recipient.student?.email);
      const studentName = getStudentName(recipient);

      if (!parentEmail) {
        failureCount++;
        await prisma.resourceDeliveryRecipient.update({
          where: { id: recipient.id },
          data: { status: "failed", updatedAt: new Date() },
        });
        sendResults.push({
          recipientId: recipient.id,
          admissionNumber: recipient.admissionNumber,
          studentName,
          success: false,
          error: "No parent email address available",
        });
        continue;
      }

      // If we hit rate limit, pause before continuing
      if (rateLimitEncountered && rateLimitWaitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, rateLimitWaitTime));
        rateLimitWaitTime = 0;
      }

      const emailContent = buildResourceEmail(resource, studentName);
      const sendResult = await sendDeliveryEmail({
        to: parentEmail,
        ...emailContent,
        attachments: buildResourceAttachments(resource),
      });

      if (sendResult.success) {
        successCount++;
        rateLimitEncountered = false; // Reset rate limit flag on success
        await prisma.resourceDeliveryRecipient.update({
          where: { id: recipient.id },
          data: { status: "sent", updatedAt: new Date() },
        });
      } else {
        failureCount++;
        
        // Check if this is a rate limit error
        const isRateLimit = sendResult.error?.includes('454') || 
                           sendResult.error?.includes('Too many login attempts') ||
                           sendResult.responseCode === 454;
        
        if (isRateLimit) {
          rateLimitEncountered = true;
          // Exponential backoff: start with 5 seconds, then increase
          rateLimitWaitTime = Math.min(
            5000 * Math.pow(2, failureCount / 3),
            120000 // Max 2 minutes
          );
          console.warn(`Rate limit detected after ${successCount + failureCount} emails. Waiting ${rateLimitWaitTime}ms`);
        }
        
        await prisma.resourceDeliveryRecipient.update({
          where: { id: recipient.id },
          data: { status: "failed", updatedAt: new Date() },
        });
      }

      sendResults.push({
        recipientId: recipient.id,
        admissionNumber: recipient.admissionNumber,
        studentName,
        email: parentEmail,
        ...sendResult,
      });
    }

    const deliverySummary = await summarizeRecipientStatuses(resourceId, resource.deliverySummary, sendResults);

    await prisma.resource.update({
      where: { id: resourceId },
      data: {
        deliveryStatus: deliverySummary.status,
        deliverySummary,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Email delivery completed. ${successCount} sent, ${failureCount} failed`,
      data: { successCount, failureCount, totalRecipients: recipients.length, results: sendResults },
    });
  } catch (error) {
    console.error("Error sending resource delivery emails:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const auth = authenticateDeliveryRequest(req);
    if (!auth.authenticated) return auth.response;

    const body = await req.json();
    const { resourceId, failedRecipientIds } = body;

    if (!resourceId || !failedRecipientIds?.length) {
      return NextResponse.json(
        { success: false, error: "Resource ID and failed recipient IDs are required" },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, error: "Resource not found" },
        { status: 404 }
      );
    }

    const recipients = await prisma.resourceDeliveryRecipient.findMany({
      where: { resourceId, id: { in: failedRecipientIds } },
      include: {
        student: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const resendResults = [];
    let successCount = 0;

    for (const recipient of recipients) {
      const parentEmail = normalizeEmailAddress(recipient.student?.email);
      const studentName = getStudentName(recipient);

      if (!parentEmail) {
        await prisma.resourceDeliveryRecipient.update({
          where: { id: recipient.id },
          data: { status: "failed", updatedAt: new Date() },
        });
        resendResults.push({
          recipientId: recipient.id,
          studentName,
          success: false,
          error: "Invalid parent email address",
        });
        continue;
      }

      const emailContent = buildResourceEmail(resource, studentName);
      const sendResult = await sendDeliveryEmail({
        to: parentEmail,
        ...emailContent,
        attachments: buildResourceAttachments(resource),
      });

      if (sendResult.success) {
        successCount++;
        await prisma.resourceDeliveryRecipient.update({
          where: { id: recipient.id },
          data: { status: "sent", updatedAt: new Date() },
        });
      } else {
        await prisma.resourceDeliveryRecipient.update({
          where: { id: recipient.id },
          data: { status: "failed", updatedAt: new Date() },
        });
      }

      resendResults.push({ recipientId: recipient.id, email: parentEmail, ...sendResult });
    }

    const deliverySummary = await summarizeRecipientStatuses(resourceId, resource.deliverySummary, resendResults);
    await prisma.resource.update({
      where: { id: resourceId },
      data: {
        deliveryStatus: deliverySummary.status,
        deliverySummary,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Resent ${successCount} email(s)`,
      data: {
        successCount,
        failureCount: resendResults.length - successCount,
        results: resendResults,
      },
    });
  } catch (error) {
    console.error("Error resending resource delivery emails:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
