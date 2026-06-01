/**
 * Delivery module for handling delivery criteria and recipient management
 */

export const SCHOOL_COMMUNICATION_NUMBER = '+254720123456';

/**
 * Build delivery criteria from form data
 * Determines which recipients should receive the assignment/resource
 */
export const buildDeliveryCriteriaFromFormData = (formData, className, category = 'general') => {
  const deliveryType = formData.get('deliveryType') || 'class'; // 'class', 'specific', 'all'
  const specificRecipients = formData.get('specificRecipients') || ''; // comma-separated emails
  const notifyParents = formData.get('notifyParents') === 'true' || formData.get('notifyParents') === true;
  const notifyTeachers = formData.get('notifyTeachers') === 'true' || formData.get('notifyTeachers') === true;

  let criteria = {
    senderReference: 'resource_delivery',
    type: deliveryType,
    className: className || null,
    category: category,
    notifyParents: notifyParents,
    notifyTeachers: notifyTeachers,
    createdAt: new Date().toISOString(),
  };

  if (deliveryType === 'specific' && specificRecipients) {
    criteria.specificRecipients = specificRecipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
  }

  return criteria;
};

/**
 * Prepare assignment delivery - creates delivery records for recipients
 */
export const prepareAssignmentDelivery = async (txOrPrisma, assignmentId, criteria) => {
  try {
    const prisma = txOrPrisma;

    // Get all students in the target class
    let students = [];
    
    if (criteria.type === 'class' && criteria.className) {
      students = await prisma.student.findMany({
        where: { 
          className: criteria.className,
          isActive: true 
        },
        select: {
          id: true,
          admissionNumber: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
    } else if (criteria.type === 'all') {
      students = await prisma.student.findMany({
        where: { isActive: true },
        select: {
          id: true,
          admissionNumber: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
    } else if (criteria.type === 'specific' && criteria.specificRecipients?.length > 0) {
      students = await prisma.student.findMany({
        where: { 
          email: { in: criteria.specificRecipients }
        },
        select: {
          id: true,
          admissionNumber: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
    }

    // Create delivery records for each student
    const deliveryRecords = await Promise.all(
      students.map(student =>
        prisma.assignmentDeliveryRecipient.create({
          data: {
            assignmentId: assignmentId,
            studentId: student.id,
            admissionNumber: student.admissionNumber,
            studentName: `${student.firstName} ${student.lastName}`,
            email: student.email,
            status: 'prepared',
          },
        })
      )
    );

    return {
      channel: 'email',
      senderReference: criteria.senderReference,
      status: students.length > 0 ? 'prepared' : 'no_recipients',
      totalRecipients: students.length,
      successCount: 0,
      failureCount: 0,
      pendingCount: students.length,
      results: deliveryRecords.map(record => ({
        recipientId: record.id,
        admissionNumber: record.admissionNumber,
        studentName: record.studentName,
        status: 'prepared',
      })),
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error preparing assignment delivery:', error);
    return {
      channel: 'email',
      status: 'error',
      error: error.message,
      totalRecipients: 0,
      results: [],
    };
  }
};

/**
 * Prepare resource delivery - creates delivery records for recipients
 */
export const prepareResourceDelivery = async (txOrPrisma, resourceId, criteria) => {
  try {
    const prisma = txOrPrisma;

    // Get all students in the target class or category
    let students = [];
    
    if (criteria.type === 'class' && criteria.className) {
      students = await prisma.student.findMany({
        where: { 
          className: criteria.className,
          isActive: true 
        },
        select: {
          id: true,
          admissionNumber: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
    } else if (criteria.type === 'all') {
      students = await prisma.student.findMany({
        where: { isActive: true },
        select: {
          id: true,
          admissionNumber: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
    } else if (criteria.type === 'specific' && criteria.specificRecipients?.length > 0) {
      students = await prisma.student.findMany({
        where: { 
          email: { in: criteria.specificRecipients }
        },
        select: {
          id: true,
          admissionNumber: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
    }

    // Create delivery records for each student
    const deliveryRecords = await Promise.all(
      students.map(student =>
        prisma.resourceDeliveryRecipient.create({
          data: {
            resourceId: resourceId,
            studentId: student.id,
            admissionNumber: student.admissionNumber,
            studentName: `${student.firstName} ${student.lastName}`,
            email: student.email,
            status: 'prepared',
          },
        })
      )
    );

    return {
      channel: 'email',
      senderReference: criteria.senderReference,
      status: students.length > 0 ? 'prepared' : 'no_recipients',
      totalRecipients: students.length,
      successCount: 0,
      failureCount: 0,
      pendingCount: students.length,
      results: deliveryRecords.map(record => ({
        recipientId: record.id,
        admissionNumber: record.admissionNumber,
        studentName: record.studentName,
        status: 'prepared',
      })),
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error preparing resource delivery:', error);
    return {
      channel: 'email',
      status: 'error',
      error: error.message,
      totalRecipients: 0,
      results: [],
    };
  }
};

export default {
  SCHOOL_COMMUNICATION_NUMBER,
  buildDeliveryCriteriaFromFormData,
  prepareAssignmentDelivery,
  prepareResourceDelivery,
};
