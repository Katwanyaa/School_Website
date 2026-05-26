import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import cloudinary from "../../../../libs/cloudinary";

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
        
        // Check user role - only admins/SchoolTeam can manage staff
        const userRole = adminPayload.role || adminPayload.userRole;
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'PRINCIPAL', 'STAFF', 'HR_MANAGER'];
        
        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          return { 
            valid: false, 
            reason: 'invalid_role', 
            message: 'User does not have permission to manage staff' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ Staff management authentication successful for user:', adminPayload.name || 'Unknown');
      
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
          message: "Authentication required to manage staff.",
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

// Helper: Upload image to Cloudinary
const uploadImageToCloudinary = async (file) => {
  if (!file?.name || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const sanitizedFileName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, "_");
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "school_staff",
          public_id: `${timestamp}-${sanitizedFileName}`,
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" },
            { quality: "auto:good" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    
    return result.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    return null;
  }
};

// Helper: Delete image from Cloudinary
const deleteImageFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;

  try {
    // Extract public ID from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return;
    
    const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("❌ Error deleting image from Cloudinary:", error);
    // Silent fail - don't block operation if delete fails
  }
};

// ==================== STAFF VISIBILITY RULES ====================

const LEADERSHIP_ROLES = new Set([
  "Principal",
  "Deputy Principal",
  "Senior Teacher",
  "Head of Department",
  "Assistant Head of Department",
  "HOD",
  "AHOD",
]);

const LEADERSHIP_UPLOAD_ERROR =
  "Individual staff profiles are restricted to leadership roles only: Principal, Deputy Principal (Academics), Deputy Principal (Administration), Senior Teacher, HOD, and AHOD.";

const DEPUTY_POSITIONS = new Set([
  "Deputy Principal (Academics)",
  "Deputy Principal (Administration)",
]);

const isHodValue = (value = "") => {
  const normalized = value.toString().trim().toLowerCase();
  return (
    normalized === "hod" ||
    normalized === "ahod" ||
    normalized.includes("head of department") ||
    normalized.includes("assistant head of department")
  );
};

const isAllowedLeadershipRole = (role = "", position = "") => {
  const cleanRole = role.toString().trim();
  const cleanPosition = position?.toString().trim() || "";

  if (LEADERSHIP_ROLES.has(cleanRole)) return true;
  if (cleanPosition.toLowerCase().includes("senior teacher")) return true;
  if (isHodValue(cleanRole) || isHodValue(cleanPosition)) return true;

  return false;
};

const isLeadershipStaff = (staff) => {
  if (!staff) return false;
  const role = (staff.role || "").trim();
  const position = (staff.position || "").trim();
  const positionLower = position.toLowerCase();

  if (isAllowedLeadershipRole(role, position)) return true;
  if (positionLower.includes("senior teacher")) return true;

  if (role === "Deputy Principal") {
    if (!position) return true;
    const normalized = position.toLowerCase();
    return normalized.includes("academics") || normalized.includes("academic") || normalized.includes("admin");
  }

  return false;
};

const sanitizePublicStaff = (staff) => {
  const { email, phone, ...publicStaff } = staff;
  return publicStaff;
};

const getFormString = (formData, key, fallback = "") => {
  const value = formData.get(key);
  if (value === null || value === undefined || typeof value !== "string") return fallback;
  return value.trim();
};

const parseDepartmentId = (formData) => {
  const raw = getFormString(formData, "staffDepartmentId") || getFormString(formData, "departmentId");
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
};

const isTeacherRecord = (role = "", staffType = "") => (
  role?.toString().trim() === "Teacher" || staffType?.toString().trim() === "Teacher"
);

const formatStaffRecord = (staff) => {
  if (!staff) return staff;
  const departmentName = staff.department || staff.staffDepartment?.name || "";

  return {
    ...staff,
    department: departmentName,
    departmentId: staff.staffDepartmentId || null,
    staffType: staff.staffType || (staff.role === "Teacher" ? "Teacher" : "Leadership"),
  };
};

const syncDepartmentStaffCount = async (departmentId) => {
  if (!departmentId) return;

  const count = await prisma.staff.count({
    where: {
      staffDepartmentId: departmentId,
      role: "Teacher",
      status: "active",
    },
  });

  await prisma.staffDepartment.update({
    where: { id: departmentId },
    data: { staffCount: count },
  });
};

// 🔹 Check principal/deputy principal limits
async function checkRoleLimits(role, staffId = null, position = null) {
  if (role === "Principal") {
    const existingPrincipal = await prisma.staff.findFirst({
      where: { 
        role: "Principal",
        ...(staffId && { id: { not: staffId } }) // Exclude current staff if updating
      }
    });
    
    if (existingPrincipal) {
      throw new Error("A principal already exists. There can only be one principal.");
    }
  } 
  
  else if (role === "Deputy Principal") {
    const existingDeputies = await prisma.staff.findMany({
      where: { 
        role: "Deputy Principal",
        ...(staffId && { id: { not: staffId } }) // Exclude current staff if updating
      }
    });
    
    // Hard limit: Exactly 2 Deputy Principals maximum
    if (existingDeputies.length >= 2) {
      throw new Error(
        "Maximum of two deputy principals allowed.\n" +
        "✓ One Deputy Principal (Academics)\n" +
        "✓ One Deputy Principal (Administration)"
      );
    }

    // If position is provided, check for duplicates based on position type
    if (position && existingDeputies.length > 0) {
      const positionLower = position.toLowerCase();

      // Check if trying to add a second Academic Deputy
      if (positionLower.includes('academics') || positionLower.includes('academic')) {
        const academicExists = existingDeputies.some(deputy => 
          deputy.position?.toLowerCase().includes('academics') || 
          deputy.position?.toLowerCase().includes('academic')
        );
        
        if (academicExists) {
          throw new Error("Deputy Principal (Academics) already exists.");
        }
      }
      
      // Check if trying to add a second Administration Deputy
      if (positionLower.includes('admin')) {
        const adminExists = existingDeputies.some(deputy => 
          deputy.position?.toLowerCase().includes('admin') ||
          deputy.position?.toLowerCase().includes('administration')
        );
        
        if (adminExists) {
          throw new Error("Deputy Principal (Administration) already exists.");
        }
      }
    }
  }
}

// 🔹 GET single staff by ID
// - Public: leadership only (privacy)
// - Admin (auth headers present + valid): any staff record
export async function GET(req, { params }) {
  try {
    let isAdmin = false;

    const maybeAdminToken = req?.headers?.get('x-admin-token') || req?.headers?.get('authorization')?.replace('Bearer ', '');
    const maybeDeviceToken = req?.headers?.get('x-device-token');

    if (maybeAdminToken && maybeDeviceToken) {
      const validation = DeviceTokenManager.validateTokensFromHeaders(req.headers);
      isAdmin = validation.valid;
    }

    const staff = await prisma.staff.findUnique({
      where: { id: Number(params.id) },
      include: {
        staffDepartment: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 }
      );
    }

    if (!isAdmin && !isLeadershipStaff(staff)) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 }
      );
    }

    const formattedStaff = formatStaffRecord(staff);
    return NextResponse.json({ success: true, staff: isAdmin ? formattedStaff : sanitizePublicStaff(formattedStaff) });
  } catch (error) {
    console.error("❌ GET Staff Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

// 🔹 UPDATE staff by ID (PROTECTED - authentication required)
export async function PUT(req, { params }) {
  try {
    // Authenticate the request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log(`📝 Staff update request from: ${auth.user.name} (${auth.user.role})`);

    const id = Number(params.id);
    const formData = await req.formData();
    const data = {};

    // Fetch existing staff (for image cleanup and role checks)
    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!existingStaff) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Staff not found",
          authenticated: true
        },
        { status: 404 }
      );
    }

    // Check if role or position is being changed
    const newRole = getFormString(formData, "role", existingStaff.role);
    const newPosition = getFormString(formData, "position", existingStaff.position || "");
    const newStaffType = getFormString(formData, "staffType", existingStaff.staffType || "Leadership");
    const subjectOffered = getFormString(formData, "subjectOffered", existingStaff.subjectOffered || "");
    const parsedDepartmentId = parseDepartmentId(formData);
    const hasDepartmentField = formData.has("staffDepartmentId") || formData.has("departmentId");
    const nextDepartmentId = hasDepartmentField ? parsedDepartmentId : existingStaff.staffDepartmentId;
    const nextIsTeacher = isTeacherRecord(newRole, newStaffType);

    let linkedDepartment = null;
    if (nextDepartmentId) {
      linkedDepartment = await prisma.staffDepartment.findUnique({
        where: { id: nextDepartmentId },
      });
    }

    if (nextIsTeacher) {
      if (!nextDepartmentId || !linkedDepartment || linkedDepartment.isActive === false) {
        return NextResponse.json(
          {
            success: false,
            error: "Teachers must be linked to an existing active department.",
            authenticated: true,
          },
          { status: 400 }
        );
      }

      if (!subjectOffered) {
        return NextResponse.json(
          {
            success: false,
            error: "Subject offered is required for teacher records.",
            authenticated: true,
          },
          { status: 400 }
        );
      }
    }

    // 🔹 Restrict updates to leadership profiles only
    const effectiveRole = nextIsTeacher ? "Teacher" : newRole;
    const effectivePosition = nextIsTeacher ? "Teacher" : newPosition;
    if (!nextIsTeacher && (formData.has("role") || formData.has("position")) && !isAllowedLeadershipRole(effectiveRole, effectivePosition)) {
      return NextResponse.json(
        {
          success: false,
          error: LEADERSHIP_UPLOAD_ERROR,
          authenticated: true,
        },
        { status: 400 }
      );
    }
    
    // Validate Deputy Principal has position when role is Deputy Principal
    if (!nextIsTeacher && newRole === "Deputy Principal" && !newPosition) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Deputy Principal must have a position: 'Deputy Principal (Academics)' or 'Deputy Principal (Administration)'",
          authenticated: true
        },
        { status: 400 }
      );
    }

    // Enforce Deputy Principal type (Academics/Admin)
    if (!nextIsTeacher && newRole === "Deputy Principal" && newPosition && !DEPUTY_POSITIONS.has(newPosition)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Deputy Principal position must be 'Deputy Principal (Academics)' or 'Deputy Principal (Administration)'.",
          authenticated: true,
        },
        { status: 400 }
      );
    }

    // If role isn't provided but we're updating a Deputy Principal, still validate the position
    if (!nextIsTeacher && !formData.has("role") && existingStaff.role === "Deputy Principal" && newPosition && !DEPUTY_POSITIONS.has(newPosition)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Deputy Principal position must be 'Deputy Principal (Academics)' or 'Deputy Principal (Administration)'.",
          authenticated: true,
        },
        { status: 400 }
      );
    }

    // Check role limits if role is being changed OR if position is being updated for Deputy Principal
    if (!nextIsTeacher && formData.has("role") && newRole !== existingStaff.role) {
      try {
        await checkRoleLimits(newRole, id, newPosition);
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: error.message,
            authenticated: true
          },
          { status: 400 }
        );
      }
    } 
    // Special case: Updating Deputy Principal position (e.g., from Academics to Administration)
    else if (!nextIsTeacher && existingStaff.role === "Deputy Principal" && 
             newPosition && 
             newPosition !== existingStaff.position) {
      
      // Check if the target position is already taken
      const existingDeputies = await prisma.staff.findMany({
        where: { 
          role: "Deputy Principal",
          id: { not: id } // Exclude current staff
        }
      });
      
      const positionLower = newPosition.toLowerCase();
      
      if (positionLower.includes('academics') || positionLower.includes('academic')) {
        const academicExists = existingDeputies.some(deputy => 
          deputy.position?.toLowerCase().includes('academics') || 
          deputy.position?.toLowerCase().includes('academic')
        );
        
        if (academicExists) {
          throw new Error("Deputy Principal (Academics) already exists. Cannot change to this position.");
        }
      }
      
      if (positionLower.includes('admin')) {
        const adminExists = existingDeputies.some(deputy => 
          deputy.position?.toLowerCase().includes('admin') ||
          deputy.position?.toLowerCase().includes('administration')
        );
        
        if (adminExists) {
          throw new Error("Deputy Principal (Administration) already exists. Cannot change to this position.");
        }
      }
    }

    // Include ALL fields from your Prisma schema
    if (formData.has("name")) data.name = getFormString(formData, "name");
    if (nextIsTeacher) {
      data.role = "Teacher";
      data.position = "Teacher";
      data.staffType = "Teacher";
      data.staffDepartmentId = nextDepartmentId;
      data.department = linkedDepartment?.name || getFormString(formData, "department", existingStaff.department || null);
      data.subjectOffered = subjectOffered;
    } else {
      if (formData.has("role")) data.role = newRole;
      if (formData.has("position")) data.position = newPosition || null;
      if (formData.has("staffType")) data.staffType = "Leadership";
      if (hasDepartmentField) data.staffDepartmentId = nextDepartmentId || null;
      if (formData.has("department")) data.department = getFormString(formData, "department") || linkedDepartment?.name || null;
      if (formData.has("subjectOffered")) data.subjectOffered = null;
    }
    if (formData.has("email")) data.email = getFormString(formData, "email") || null;
    if (formData.has("phone")) data.phone = getFormString(formData, "phone") || null;
    if (formData.has("bio")) data.bio = getFormString(formData, "bio") || null;
    if (formData.has("quote")) data.quote = getFormString(formData, "quote") || null;
    if (formData.has("education")) data.education = getFormString(formData, "education") || null;
    if (formData.has("experience")) data.experience = getFormString(formData, "experience") || null;
    if (formData.has("gender")) data.gender = getFormString(formData, "gender") || "male";
    if (formData.has("status")) data.status = getFormString(formData, "status") || "active";
    if (formData.has("joinDate")) data.joinDate = getFormString(formData, "joinDate") || null;

    // JSON fields (safe parsing)
    if (formData.get("responsibilities")) {
      try {
        data.responsibilities = JSON.parse(formData.get("responsibilities"));
      } catch (e) {
        console.error("Error parsing responsibilities:", e);
      }
    }

    if (formData.get("expertise")) {
      try {
        data.expertise = JSON.parse(formData.get("expertise"));
      } catch (e) {
        console.error("Error parsing expertise:", e);
      }
    }

    if (formData.get("achievements")) {
      try {
        data.achievements = JSON.parse(formData.get("achievements"));
      } catch (e) {
        console.error("Error parsing achievements:", e);
      }
    }

    // Optional image upload (replace old one)
    const file = formData.get("image");
    
    // Check if it's an actual file upload
    if (file && typeof file !== "string" && file.size > 0) {
      // Validate image type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid image format. Only JPEG, PNG, WebP, and GIF are allowed.",
            authenticated: true
          },
          { status: 400 }
        );
      }
      
      // Validate image size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Image size too large. Maximum size is 5MB.",
            authenticated: true
          },
          { status: 400 }
        );
      }
      
      // Remove old image from Cloudinary if it exists
      if (existingStaff.image) {
        await deleteImageFromCloudinary(existingStaff.image);
      }

      // Upload new image to Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(file);
      if (!cloudinaryUrl) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Failed to upload image",
            authenticated: true
          },
          { status: 500 }
        );
      }
      data.image = cloudinaryUrl;
    } else if (typeof file === "string" && file.trim() !== "") {
      // It's a string (either existing Cloudinary URL or default)
      data.image = file;
    }
    // If file is null/undefined, keep existing image

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data,
      include: {
        staffDepartment: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    await syncDepartmentStaffCount(existingStaff.staffDepartmentId);
    if (updatedStaff.staffDepartmentId !== existingStaff.staffDepartmentId) {
      await syncDepartmentStaffCount(updatedStaff.staffDepartmentId);
    }

    console.log(`✅ Staff member updated by ${auth.user.name}: ${updatedStaff.name} (${updatedStaff.role}${updatedStaff.position ? ' - ' + updatedStaff.position : ''})`);

    return NextResponse.json({ 
      success: true, 
      staff: formatStaffRecord(updatedStaff),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ PUT Staff Error:", error);
    
    // Handle role limit errors
    if (error.message.includes("principal") || 
        error.message.includes("deputy") || 
        error.message.includes("Deputy")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          authenticated: true
        },
        { status: 400 }
      );
    }

    // Handle unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return NextResponse.json(
        {
          success: false,
          error: `A staff member with this ${field} already exists`,
          authenticated: true
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to update staff",
        authenticated: true
      },
      { status: 500 }
    );
  }
}

// 🔹 DELETE staff by ID (PROTECTED - authentication required)
export async function DELETE(req, { params }) {
  try {
    // Authenticate the request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log(`🗑️ Staff delete request from: ${auth.user.name} (${auth.user.role})`);

    const id = Number(params.id);

    const staff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Staff not found",
          authenticated: true
        },
        { status: 404 }
      );
    }

    // Remove image from Cloudinary
    if (staff.image) {
      await deleteImageFromCloudinary(staff.image);
    }

    await prisma.staff.delete({
      where: { id },
    });

    await syncDepartmentStaffCount(staff.staffDepartmentId);

    console.log(`✅ Staff member deleted by ${auth.user.name}: ${staff.name}`);

    return NextResponse.json({
      success: true,
      message: "Staff deleted successfully",
      deletedStaff: staff.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ DELETE Staff Error:", error);
    
    // Handle foreign key constraint errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete staff member because they are referenced in other records",
          authenticated: true
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to delete staff",
        authenticated: true
      },
      { status: 500 }
    );
  }
}
