import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

// ==================== AUTHENTICATION UTILITIES ====================

// Device Token Manager
class DeviceTokenManager {
  static validateTokensFromHeaders(headers, options = {}) {
    try {
      // Extract tokens from headers
      const adminToken = headers.get('x-admin-token') || headers.get('authorization')?.replace('Bearer ', '');
      const deviceToken = headers.get('x-device-token');

      if (!adminToken) {
        return { valid: false, reason: 'no_admin_token', message: 'Admin token is required' };
      }

      if (!deviceToken) {
        return { valid: false, reason: 'no_device_token', message: 'Device token is required' };
      }

      // Validate admin token format (basic check)
      const adminParts = adminToken.split('.');
      if (adminParts.length !== 3) {
        return { valid: false, reason: 'invalid_admin_token_format', message: 'Invalid admin token format' };
      }

      // Validate device token
      const deviceValid = this.validateDeviceToken(deviceToken);
      if (!deviceValid.valid) {
        return { 
          valid: false, 
          reason: `device_${deviceValid.reason}`,
          message: `Device token ${deviceValid.reason}: ${deviceValid.error || ''}`
        };
      }

      // Parse admin token payload
      let adminPayload;
      try {
        adminPayload = JSON.parse(atob(adminParts[1]));
        
        // Check expiration
        const currentTime = Date.now() / 1000;
        if (adminPayload.exp < currentTime) {
          return { valid: false, reason: 'admin_token_expired', message: 'Admin token has expired' };
        }
        
        // Check user role - only admins can manage school documents
        const userRole = adminPayload.role || adminPayload.userRole;
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'PRINCIPAL', 'REGISTRAR'];
        
        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          return { 
            valid: false, 
            reason: 'invalid_role', 
            message: 'User does not have permission to manage school documents' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ School documents management authentication successful for user:', adminPayload.name || 'Unknown');
      
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

  // Validate device token
  static validateDeviceToken(token) {
    try {
      // Handle base64 decoding safely
      const payloadStr = Buffer.from(token, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadStr);
      
      // Check expiration
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        return { valid: false, reason: 'expired', payload, error: 'Device token has expired' };
      }
      
      // Check age (30 days max)
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

// Authentication middleware for protected requests
const authenticateRequest = (req) => {
  const headers = req.headers;
  
  // Validate tokens
  const validationResult = DeviceTokenManager.validateTokensFromHeaders(headers);
  
  if (!validationResult.valid) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { 
          success: false, 
          error: "Access Denied",
          message: "Authentication required to manage school documents.",
          details: validationResult.message
        },
        { status: 401 }
      )
    };
  }

  return {
    authenticated: true,
    user: validationResult.user,
    deviceInfo: validationResult.deviceInfo
  };
};

// Upload PDF to Cloudinary
const uploadPdfToCloudinary = async (file, folder) => {
  if (!file || file.size === 0) return null;

  try {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(fileExtension)) {
      throw new Error(`Only PDF, DOC, and DOCX files are allowed`);
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const resourceType = fileExtension === '.pdf' ? 'raw' : 'raw';
    const format = fileExtension === '.pdf' ? 'pdf' : 
                   fileExtension === '.doc' ? 'doc' : 'docx';
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `school/documents/${folder}`,
          public_id: `${timestamp}-${sanitizedFileName}`,
          format: format,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
      format: result.format,
      original_name: file.name
    };
  } catch (error) {
    console.error(`❌ Cloudinary PDF upload error:`, error);
    throw error;
  }
};

const deleteFromCloudinary = async (url) => {
  if (!url) return;
  
  try {
    const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    if (matches && matches[1]) {
      const publicId = matches[1];
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
  }
};

const parseIntField = (value) => {
  if (!value || value.trim() === '') return null;
  const num = parseInt(value);
  return isNaN(num) ? null : num;
};

const parseStringField = (value) => {
  if (!value || value.trim() === '') return null;
  return value.trim();
};

const cleanDocumentResponse = (document) => {
  if (!document) return null;
  
  return {
    id: document.id,

    // Day School Fees PDF
    feesDayDistributionPdf: document.feesDayDistributionPdf,
    feesDayPdfName: document.feesDayPdfName,
    feesDayPdfSize: document.feesDayPdfSize,
    feesDayPdfUploadDate: document.feesDayPdfUploadDate,
    feesDayDescription: document.feesDayDescription,
    feesDayYear: document.feesDayYear,
    feesDayTerm: document.feesDayTerm,

    // Boarding School Fees PDF
    feesBoardingDistributionPdf: document.feesBoardingDistributionPdf,
    feesBoardingPdfName: document.feesBoardingPdfName,
    feesBoardingPdfSize: document.feesBoardingPdfSize,
    feesBoardingPdfUploadDate: document.feesBoardingPdfUploadDate,
    feesBoardingDescription: document.feesBoardingDescription,
    feesBoardingYear: document.feesBoardingYear,
    feesBoardingTerm: document.feesBoardingTerm,

    // KCSE Results PDF
    kcseResultsPdf: document.kcseResultsPdf,
    kcsePdfName: document.kcsePdfName,
    kcsePdfSize: document.kcsePdfSize,
    kcseDescription: document.kcseDescription,
    kcseYear: document.kcseYear,
    kcseTerm: document.kcseTerm,
    kcseUploadDate: document.kcseUploadDate,

    createdAt: document.createdAt,
    updatedAt: document.updatedAt
  };
};

// GET - Fetch all documents (PUBLIC - no authentication required)
export async function GET() {
  try {
    console.log("📥 GET Request received");
    
    const document = await prisma.schoolDocument.findFirst({
      // REMOVED: include additionalDocuments
    });

    if (!document) {
      return NextResponse.json({
        success: true,
        message: "No documents found",
        document: null
      });
    }
    
    return NextResponse.json({
      success: true,
      document: cleanDocumentResponse(document)
    });

  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create or update all documents (PROTECTED - authentication required)
export async function POST(req) {
  try {
    // Authenticate the request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("📥 POST Request received");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    
    const formData = await req.formData();
    
    let existingDocument = await prisma.schoolDocument.findFirst({
      // REMOVED: include additionalDocuments
    });

    console.log("📄 Existing document:", existingDocument ? `Found (ID: ${existingDocument.id})` : "Not found");

    const uploadPromises = {};
    const uploadResults = {};

    // Define document fields with their metadata
    const documentFields = [
      { 
        key: 'feesDay', 
        name: 'feesDayDistributionPdf', 
        year: 'feesDayYear',
        term: 'feesDayTerm',
        description: 'feesDayDescription',
        folder: 'day-fees' 
      },
      { 
        key: 'feesBoarding', 
        name: 'feesBoardingDistributionPdf', 
        year: 'feesBoardingYear',
        term: 'feesBoardingTerm',
        description: 'feesBoardingDescription',
        folder: 'boarding-fees' 
      }
    ];

    // Exam fields
    const examFields = [
      { 
        key: 'kcse', 
        name: 'kcseResultsPdf', 
        year: 'kcseYear', 
        term: 'kcseTerm',
        description: 'kcseDescription', 
        folder: 'exam-results' 
      }
    ];

    // Process all document uploads
    const allFields = [...documentFields, ...examFields];
    
    for (const field of allFields) {
      const pdfFile = formData.get(field.name);
      if (pdfFile && pdfFile.size > 0) {
        console.log(`📤 Uploading ${field.key} file:`, pdfFile.name);
        uploadPromises[field.key] = uploadPdfToCloudinary(pdfFile, field.folder);
      }
    }

    const uploadEntries = Object.entries(uploadPromises);
    console.log("🔄 Total uploads to process:", uploadEntries.length);
    
    const results = await Promise.allSettled(uploadEntries.map(([key, promise]) => promise));
    
    results.forEach((result, index) => {
      const [key] = uploadEntries[index];
      if (result.status === 'fulfilled' && result.value) {
        uploadResults[key] = result.value;
        console.log(`✅ Upload successful for ${key}:`, result.value.original_name);
      } else if (result.status === 'rejected') {
        console.error(`❌ Upload failed for ${key}:`, result.reason);
      }
    });

    // Delete old files if replacing
    const filesToDelete = [];
    
    if (existingDocument) {
      // REMOVED: Additional documents deletion logic
    }

    // Delete old main files if replacing
    for (const field of allFields) {
      if (uploadResults[field.key] && existingDocument && existingDocument[field.name]) {
        console.log(`🗑️ Replacing old file for ${field.key}:`, existingDocument[field.name]);
        filesToDelete.push(deleteFromCloudinary(existingDocument[field.name]));
      }
    }

    if (filesToDelete.length > 0) {
      console.log("🗑️ Deleting old files:", filesToDelete.length);
      await Promise.all(filesToDelete);
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date()
    };


    // Process all fields (documents + exams)
    for (const field of allFields) {
      // Handle file upload data
      if (uploadResults[field.key]) {
        const prismaFieldMap = {
          // Document fields
          'feesDay': {
            pdf: 'feesDayDistributionPdf',
            name: 'feesDayPdfName',
            size: 'feesDayPdfSize',
            uploadDate: 'feesDayPdfUploadDate'
          },
          'feesBoarding': {
            pdf: 'feesBoardingDistributionPdf',
            name: 'feesBoardingPdfName',
            size: 'feesBoardingPdfSize',
            uploadDate: 'feesBoardingPdfUploadDate'
          },
          // Exam fields
          'kcse': {
            pdf: 'kcseResultsPdf',
            name: 'kcsePdfName',
            size: 'kcsePdfSize',
            uploadDate: 'kcseUploadDate'
          }
        };
        
        const fields = prismaFieldMap[field.key];
        if (fields) {
          updateData[fields.pdf] = uploadResults[field.key].url;
          updateData[fields.name] = uploadResults[field.key].original_name;
          updateData[fields.size] = uploadResults[field.key].bytes;
          updateData[fields.uploadDate] = new Date();
        }
      }
      
      // Handle year, term, and description fields
      const year = formData.get(field.year);
      const description = formData.get(field.description);
      const term = field.term ? formData.get(field.term) : null;

      if (year !== null) {
        updateData[field.year] = parseIntField(year);
      }
      if (description !== null) {
        updateData[field.description] = parseStringField(description);
      }
      if (field.term && term !== null) {
        updateData[field.term] = parseStringField(term);
      }
    }

    console.log("📝 Update data prepared:", updateData);

    // Create or update document
    let finalDocument;
    
    if (existingDocument) {
      console.log("🔄 Updating existing document ID:", existingDocument.id);
      const updatedDocument = await prisma.schoolDocument.update({
        where: { id: existingDocument.id },
        data: updateData
      });

      finalDocument = await prisma.schoolDocument.findUnique({
        where: { id: existingDocument.id }
      });

      console.log(`✅ Document update successful by ${auth.user.name}`);

      return NextResponse.json({
        success: true,
        message: "School documents updated successfully",
        document: cleanDocumentResponse(finalDocument),
        updatedBy: auth.user.name,
        timestamp: new Date().toISOString()
      });

    } else {
      console.log("🆕 Creating new document");
      const newDocument = await prisma.schoolDocument.create({
        data: updateData
      });

      finalDocument = await prisma.schoolDocument.findUnique({
        where: { id: newDocument.id }
      });

      console.log(`✅ Document creation successful by ${auth.user.name}`);

      return NextResponse.json({
        success: true,
        message: "School documents created successfully",
        document: cleanDocumentResponse(finalDocument),
        timestamp: new Date().toISOString()
      }, { status: 201 });
    }

  } catch (error) {
    console.error("❌ POST Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        details: error.stack,
        authenticated: true
      },
      { status: 500 }
    );
  }
}

// PUT - Update specific document field (PROTECTED - authentication required)
export async function PUT(req) {
  try {
    // Authenticate the request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("📥 PUT Request received");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');
    
    if (!documentId) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Document ID is required",
          authenticated: true
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { field, data } = body;

    if (!field || !data) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Field and data are required",
          authenticated: true
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating field: ${field} with data:`, data);

    const updateData = {
      [field]: data,
      updatedAt: new Date(),

    };

    const updatedDocument = await prisma.schoolDocument.update({
      where: { id: parseInt(documentId) },
      data: updateData
    });

    console.log(`✅ Document field updated successfully by ${auth.user.name}`);

    return NextResponse.json({
      success: true,
      message: "Document field updated successfully",
      document: cleanDocumentResponse(updatedDocument),
      updatedBy: auth.user.name,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ PUT Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        authenticated: true
      },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (for deleting specific files) (PROTECTED - authentication required)
export async function PATCH(req) {
  try {
    // Authenticate the request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("📥 PATCH Request received");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');
    const field = searchParams.get('field');
    
    if (!documentId || !field) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Document ID and field are required",
          authenticated: true
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { action, fileId } = body;

    if (!action) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Action is required",
          authenticated: true
        },
        { status: 400 }
      );
    }

    console.log(`🔄 PATCH action: ${action} on field: ${field}, fileId: ${fileId}`);

    if (action === 'deleteFile') {
      // Find the document first
      const document = await prisma.schoolDocument.findUnique({
        where: { id: parseInt(documentId) }
      });

      if (!document) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Document not found",
            authenticated: true
          },
          { status: 404 }
        );
      }

      let fileUrlToDelete = null;

      if (document[field]) {
        // Delete main document field
        fileUrlToDelete = document[field];
        
        // Get field mapping to clear related fields
        const fieldMappings = {
          'feesDayDistributionPdf': {
            name: 'feesDayPdfName',
            size: 'feesDayPdfSize',
            uploadDate: 'feesDayPdfUploadDate',
            description: 'feesDayDescription',
            year: 'feesDayYear',
            term: 'feesDayTerm'
          },
          'feesBoardingDistributionPdf': {
            name: 'feesBoardingPdfName',
            size: 'feesBoardingPdfSize',
            uploadDate: 'feesBoardingPdfUploadDate',
            description: 'feesBoardingDescription',
            year: 'feesBoardingYear',
            term: 'feesBoardingTerm'
          },
          'kcseResultsPdf': {
            name: 'kcsePdfName',
            size: 'kcsePdfSize',
            uploadDate: 'kcseUploadDate',
            description: 'kcseDescription',
            year: 'kcseYear',
            term: 'kcseTerm'
          }
        };

        const clearData = {
          [field]: null,
          updatedAt: new Date(),
        };

        const mapping = fieldMappings[field];
        if (mapping) {
          clearData[mapping.name] = null;
          clearData[mapping.size] = null;
          clearData[mapping.uploadDate] = null;
        }
        
        await prisma.schoolDocument.update({
          where: { id: parseInt(documentId) },
          data: clearData
        });
      }

      // Delete file from Cloudinary
      if (fileUrlToDelete) {
        await deleteFromCloudinary(fileUrlToDelete);
      }

      const updatedDocument = await prisma.schoolDocument.findUnique({
        where: { id: parseInt(documentId) }
      });

      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
        document: cleanDocumentResponse(updatedDocument),
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Invalid action",
        authenticated: true
      },
      { status: 400 }
    );

  } catch (error) {
    console.error("❌ PATCH Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        authenticated: true
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete entire document (PROTECTED - authentication required)
export async function DELETE(req) {
  try {
    // Authenticate the request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("🗑️ DELETE Request received");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');
    
    if (!documentId) {
      // If no ID, delete the first document (legacy behavior)
      return handleDeleteFirstDocument(auth);
    }

    return handleDeleteDocumentById(parseInt(documentId), auth);

  } catch (error) {
    console.error("❌ DELETE Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        authenticated: true
      },
      { status: 500 }
    );
  }
}

async function handleDeleteFirstDocument(auth) {
  const document = await prisma.schoolDocument.findFirst();

  if (!document) {
    console.log("📭 No document found to delete");
    return NextResponse.json(
      { 
        success: false, 
        message: "No document found to delete",
        authenticated: true
      },
      { status: 404 }
    );
  }

  console.log(`🗑️ Deleting document by ${auth.user.name}:`, document.id);
  return deleteDocumentAndFiles(document, auth);
}

async function handleDeleteDocumentById(documentId, auth) {
  const document = await prisma.schoolDocument.findUnique({
    where: { id: documentId }
  });

  if (!document) {
    console.log("📭 No document found to delete");
    return NextResponse.json(
      { 
        success: false, 
        message: "Document not found",
        authenticated: true
      },
      { status: 404 }
    );
  }

  console.log(`🗑️ Deleting document by ${auth.user.name}:`, document.id);
  return deleteDocumentAndFiles(document, auth);
}

async function deleteDocumentAndFiles(document, auth) {
  const filesToDelete = [
    document.feesDayDistributionPdf,
    document.feesBoardingDistributionPdf,
    document.kcseResultsPdf,
  ].filter(Boolean);

  console.log("🗑️ Files to delete:", filesToDelete.length);

  await Promise.all(filesToDelete.map(file => deleteFromCloudinary(file)));

  await prisma.schoolDocument.delete({
    where: { id: document.id }
  });

  console.log(`✅ Document deleted successfully by ${auth.user.name}`);

  return NextResponse.json({
    success: true,
    message: "School documents deleted successfully",
    deletedDocumentId: document.id,
    timestamp: new Date().toISOString()
  });
}