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
const authenticatePostRequest = (req) => {
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
          message: "Authentication required to add new staff members.",
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
    // Prefer the new, explicit positions but allow legacy deputy records too
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
// 🔹 Enhanced role limits with position-based validation for Deputy Principals
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

// 🔹 GET staff
// - Public: leadership only (privacy)
// - Admin (auth headers present + valid): all staff records
export async function GET(req) {
  try {
    let isAdmin = false;

    const maybeAdminToken = req?.headers?.get('x-admin-token') || req?.headers?.get('authorization')?.replace('Bearer ', '');
    const maybeDeviceToken = req?.headers?.get('x-device-token');

    if (maybeAdminToken && maybeDeviceToken) {
      const validation = DeviceTokenManager.validateTokensFromHeaders(req.headers);
      isAdmin = validation.valid;
    }

    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: "desc" },
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

    const formattedStaff = staff.map(formatStaffRecord);
    const visibleStaff = isAdmin
      ? formattedStaff
      : formattedStaff.filter(isLeadershipStaff).map(sanitizePublicStaff);

    return NextResponse.json({ success: true, staff: visibleStaff });
  } catch (error) {
    console.error("❌ GET Staff Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}
// 🔹 POST new staff (PROTECTED - authentication required)
export async function POST(req) {
  try {
    // Step 1: Authenticate the POST request
    const auth = authenticatePostRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log(`📝 Staff creation request from: ${auth.user.name} (${auth.user.role})`);

    const formData = await req.formData();

    // Basic fields - Include ALL fields from your Prisma schema
    const name = getFormString(formData, "name");
    const staffType = getFormString(formData, "staffType", "Leadership");
    const role = getFormString(formData, "role", staffType === "Teacher" ? "Teacher" : "");
    const position = getFormString(formData, "position");
    const staffDepartmentId = parseDepartmentId(formData);
    const department = getFormString(formData, "department");
    const subjectOffered = getFormString(formData, "subjectOffered");
    const email = getFormString(formData, "email");
    const phone = getFormString(formData, "phone");
    const bio = getFormString(formData, "bio");
    const quote = getFormString(formData, "quote");
    const education = getFormString(formData, "education");
    const experience = getFormString(formData, "experience");
    const gender = getFormString(formData, "gender", "male");
    const status = getFormString(formData, "status", "active");
    const joinDate = getFormString(formData, "joinDate", new Date().toISOString().split('T')[0]);
    const isTeacher = isTeacherRecord(role, staffType);

    // 🔹 Validate required fields
    if (!name || !role) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Name and role are required fields",
          authenticated: true
        },
        { status: 400 }
      );
    }

    let linkedDepartment = null;
    if (staffDepartmentId) {
      linkedDepartment = await prisma.staffDepartment.findUnique({
        where: { id: staffDepartmentId },
      });
    }

    if (isTeacher) {
      if (!staffDepartmentId || !linkedDepartment || linkedDepartment.isActive === false) {
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

    // 🔹 Restrict individual non-teacher profiles to leadership roles only
    if (!isTeacher && !isAllowedLeadershipRole(role, position)) {
      return NextResponse.json(
        {
          success: false,
          error: LEADERSHIP_UPLOAD_ERROR,
          authenticated: true,
        },
        { status: 400 }
      );
    }

    // 🔹 Validate Deputy Principal has position specified
    if (!isTeacher && role === "Deputy Principal" && !position) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Deputy Principal must have a position: 'Deputy Principal (Academics)' or 'Deputy Principal (Administration)'",
          authenticated: true
        },
        { status: 400 }
      );
    }

    // 🔹 Enforce Deputy Principal type (Academics/Admin) for privacy + grouping
    if (!isTeacher && role === "Deputy Principal" && position && !DEPUTY_POSITIONS.has(position)) {
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

    // 🔹 Validate Principal/Deputy Principal limits
    try {
      if (!isTeacher) await checkRoleLimits(role, null, position);
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

    // 🔹 CRITICAL: Image handling - Image is REQUIRED
    const imageFile = formData.get("image");
    
    // Validate that an image was uploaded
    if (!imageFile || (typeof imageFile === "string" && imageFile.trim() === "")) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Staff image is required. Please upload an image.",
          authenticated: true
        },
        { status: 400 }
      );
    }
    
    let imageUrl = "";
    
    // Check if it's an actual file upload
    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      // Validate image type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(imageFile.type)) {
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
      if (imageFile.size > maxSize) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Image size too large. Maximum size is 5MB.",
            authenticated: true
          },
          { status: 400 }
        );
      }
      
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(imageFile);
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
      imageUrl = cloudinaryUrl;
    } else if (typeof imageFile === "string" && imageFile.trim() !== "") {
      // If it's already a valid URL (for editing existing staff)
      imageUrl = imageFile;
    } else {
      // No image provided
      return NextResponse.json(
        { 
          success: false, 
          error: "Staff image is required. Please upload an image.",
          authenticated: true
        },
        { status: 400 }
      );
    }

    // 🔹 JSON fields with safe parsing
    let responsibilities = [];
    let expertise = [];
    let achievements = [];

    try {
      const responsibilitiesStr = formData.get("responsibilities");
      if (responsibilitiesStr) {
        responsibilities = JSON.parse(responsibilitiesStr);
      }
    } catch (e) {
      console.error("Error parsing responsibilities:", e);
    }

    try {
      const expertiseStr = formData.get("expertise");
      if (expertiseStr) {
        expertise = JSON.parse(expertiseStr);
      }
    } catch (e) {
      console.error("Error parsing expertise:", e);
    }

    try {
      const achievementsStr = formData.get("achievements");
      if (achievementsStr) {
        achievements = JSON.parse(achievementsStr);
      }
    } catch (e) {
      console.error("Error parsing achievements:", e);
    }

    // 🔹 Save staff - Include ALL fields
    const newStaff = await prisma.staff.create({
      data: {
        name,
        role: isTeacher ? "Teacher" : role,
        position: isTeacher ? "Teacher" : (position || null),
        department: linkedDepartment?.name || department || null,
        staffType: isTeacher ? "Teacher" : "Leadership",
        subjectOffered: isTeacher ? subjectOffered : null,
        staffDepartmentId,
        email: email || null,
        phone: phone || null,
        bio: bio || null,
        quote: quote || null,
        education: education || null,
        experience: experience || null,
        gender: gender || "male",
        status: status || "active",
        joinDate: joinDate || new Date().toISOString().split('T')[0],
        image: imageUrl,
        responsibilities,
        expertise,
        achievements,
      },
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

    if (isTeacher) {
      await syncDepartmentStaffCount(staffDepartmentId);
    }

    console.log(`✅ Staff member created by ${auth.user.name}: ${newStaff.name} (${newStaff.role}${newStaff.position ? ' - ' + newStaff.position : ''})`);

    return NextResponse.json(
      { 
        success: true, 
        staff: formatStaffRecord(newStaff),
        timestamp: new Date().toISOString()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ POST Staff Error:", error);

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
        error: error.message || "Failed to create staff",
        authenticated: true
      },
      { status: 500 }
    );
  }
}
