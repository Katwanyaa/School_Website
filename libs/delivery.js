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

const uploadedStudentSelect = {
  id: true,
  admissionNumber: true,
  fullName: true,
  firstName: true,
  middleName: true,
  lastName: true,
  form: true,
  stream: true,
  email: true,
  parentEmail: true,
};

const getStudentName = (student) =>
  student.fullName ||
  [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') ||
  'Student';

const getParentEmail = (student) => String(student.parentEmail || student.email || '').trim();

const hasParentEmail = (student) => getParentEmail(student).length > 0;

const getUploadedStudentsForCriteria = async (prisma, criteria) => {
  if (criteria.type === 'class' && criteria.className) {
    const students = await prisma.databaseStudent.findMany({
      where: {
        form: criteria.className,
        status: 'active',
      },
      select: uploadedStudentSelect,
      orderBy: { admissionNumber: 'asc' },
    });

    return students.filter(hasParentEmail);
  }

  if (criteria.type === 'all') {
    const students = await prisma.databaseStudent.findMany({
      where: { status: 'active' },
      select: uploadedStudentSelect,
      orderBy: [{ form: 'asc' }, { admissionNumber: 'asc' }],
    });

    return students.filter(hasParentEmail);
  }

  if (criteria.type === 'specific' && criteria.specificRecipients?.length > 0) {
    const requestedEmails = new Set(
      criteria.specificRecipients.map(email => String(email).trim().toLowerCase()).filter(Boolean)
    );
    const students = await prisma.databaseStudent.findMany({
      where: { status: 'active' },
      select: uploadedStudentSelect,
      orderBy: { admissionNumber: 'asc' },
    });

    return students.filter((student) => {
      const parentEmail = String(student.parentEmail || '').trim().toLowerCase();
      const studentEmail = String(student.email || '').trim().toLowerCase();
      return requestedEmails.has(parentEmail) || requestedEmails.has(studentEmail);
    });
  }

  return [];
};

const buildRecipientData = (student, criteria) => ({
  studentId: student.id,
  admissionNumber: student.admissionNumber,
  studentName: getStudentName(student),
  className: student.form,
  gradeLevel: student.form,
  uploadedCategory: criteria.category || null,
  whatsappPhone: SCHOOL_COMMUNICATION_NUMBER,
  senderReference: criteria.senderReference || 'email_delivery',
  channel: 'email',
  status: 'prepared',
});

/**
 * Prepare assignment delivery - creates delivery records for recipients
 */
export const prepareAssignmentDelivery = async (txOrPrisma, assignmentId, criteria) => {
  try {
    const prisma = txOrPrisma;

    const students = await getUploadedStudentsForCriteria(prisma, criteria);

    await prisma.assignmentDeliveryRecipient.deleteMany({
      where: { assignmentId },
    });

    // Create delivery records for each student
    const deliveryRecords = await Promise.all(
      students.map(student =>
        prisma.assignmentDeliveryRecipient.create({
          data: {
            assignmentId: assignmentId,
            ...buildRecipientData(student, criteria),
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

    const students = await getUploadedStudentsForCriteria(prisma, criteria);

    await prisma.resourceDeliveryRecipient.deleteMany({
      where: { resourceId },
    });

    // Create delivery records for each student
    const deliveryRecords = await Promise.all(
      students.map(student =>
        prisma.resourceDeliveryRecipient.create({
          data: {
            resourceId: resourceId,
            ...buildRecipientData(student, criteria),
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
