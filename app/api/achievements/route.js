import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import cloudinary from "../../../libs/cloudinary";

// ==================== AUTHENTICATION UTILITIES ====================

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
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'PRINCIPAL'];
        
        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          return { 
            valid: false, 
            reason: 'invalid_role', 
            message: 'User does not have permission to manage achievements' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ Achievements management authentication successful');
      
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
          message: "Authentication required to manage achievements.",
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

// ============ HELPER FUNCTIONS ============

const parseJsonField = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return fieldName === 'images' || fieldName === 'recipients' ? [] : null;
  }
  
  if (Array.isArray(value)) {
    return value;
  }
  
  try {
    return JSON.parse(value);
  } catch (parseError) {
    console.warn(`Failed to parse ${fieldName}, using empty array:`, parseError);
    return [];
  }
};

const parseNumber = (value) => {
  if (!value || value.trim() === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

const parseIntField = (value) => {
  if (!value || value.trim() === '') return null;
  const num = parseInt(value);
  return isNaN(num) ? null : num;
};

const parseDate = (dateString) => {
  if (!dateString || dateString.trim() === '') return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const parseBoolean = (value) => {
  if (value === undefined || value === null) return false;
  return value === 'true' || value === true;
};

// ============ CLOUDINARY FUNCTIONS ============

const uploadToCloudinary = async (file, folder, resourceType = 'image') => {
  if (!file || file.size === 0) return null;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const originalName = file.name;
    const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `achievements/${folder}`,
          public_id: `${timestamp}-${sanitizedFileName}`,
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
      format: result.format
    };
  } catch (error) {
    console.error(`❌ Cloudinary upload error for ${folder}:`, error);
    throw new Error(`Failed to upload file: ${error.message}`);
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

const handleImagesUpload = async (imageFiles, existingImages = []) => {
  const images = [...existingImages];
  
  if (!imageFiles || imageFiles.length === 0) {
    return images;
  }

  for (const file of imageFiles) {
    if (file && file.size > 0) {
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }
      
      const result = await uploadToCloudinary(file, 'images', 'image');
      images.push({
        url: result.url,
        public_id: result.public_id,
        caption: ''
      });
    }
  }
  
  return images;
};

// Clean achievement response
const cleanAchievementResponse = (achievement) => {
  try {
    let images = [];
    let recipients = [];
    
    try {
      images = typeof achievement.images === 'string' 
        ? JSON.parse(achievement.images || '[]') 
        : (achievement.images || []);
    } catch (e) {
      console.warn("Error parsing images:", e);
    }
    
    try {
      recipients = typeof achievement.recipients === 'string' 
        ? JSON.parse(achievement.recipients || '[]') 
        : (achievement.recipients || []);
    } catch (e) {
      console.warn("Error parsing recipients:", e);
    }

    return {
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      year: achievement.year,
      images,
      featured: achievement.featured,
      displayOrder: achievement.displayOrder,
      isActive: achievement.isActive,
      awardingBody: achievement.awardingBody,
      recipients,
      achievedDate: achievement.achievedDate,
      createdAt: achievement.createdAt,
      updatedAt: achievement.updatedAt
    };
  } catch (error) {
    console.error("Error cleaning achievement response:", error);
    return achievement;
  }
};

// ============ API ROUTES ============

// 🟡 GET all achievements (PUBLIC - no authentication required)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const year = searchParams.get('year');
    const featured = searchParams.get('featured');
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const id = searchParams.get('id');
    
    console.log("🔍 GET /api/achievements - Fetching achievements");
    
    // If ID is provided, return single achievement
    if (id) {
      const achievement = await prisma.achievement.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!achievement) {
        return NextResponse.json(
          { success: false, error: "Achievement not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        achievement: cleanAchievementResponse(achievement)
      });
    }
    
    const whereClause = {};
    
    if (category) whereClause.category = category;
    if (year) whereClause.year = parseInt(year);
    if (featured === 'true') whereClause.featured = true;
    if (activeOnly) whereClause.isActive = true;
    
    const achievements = await prisma.achievement.findMany({
      where: whereClause,
      orderBy: [
        { displayOrder: 'asc' },
        { year: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    console.log(`✅ Found ${achievements.length} achievements`);
    
    // Group achievements by category
    const groupedAchievements = {
      Academic: [],
      Sports: [],
      Arts: [],
      Leadership: [],
      Other: []
    };
    
    achievements.forEach(achievement => {
      const cleaned = cleanAchievementResponse(achievement);
      if (groupedAchievements[achievement.category]) {
        groupedAchievements[achievement.category].push(cleaned);
      } else {
        groupedAchievements.Other.push(cleaned);
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Achievements retrieved successfully",
      achievements: groupedAchievements,
      allAchievements: achievements.map(a => cleanAchievementResponse(a)),
      total: achievements.length
    });

  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        message: "Failed to fetch achievements"
      }, 
      { status: 500 }
    );
  }
}

// 🟢 CREATE Achievement (POST - PROTECTED)
export async function POST(req) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("📝 POST /api/achievements - Creating achievement");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    
    const formData = await req.formData();
    
    // Validate required fields
    const title = formData.get("title");
    const category = formData.get("category");
    const year = formData.get("year");
    
    if (!title || !category || !year) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields: title, category, year",
          authenticated: true
        },
        { status: 400 }
      );
    }

    // Handle images upload
    const imageFiles = formData.getAll("images");
    let images = [];
    
    try {
      images = await handleImagesUpload(imageFiles.filter(f => f && f.size > 0), []);
    } catch (imageError) {
      return NextResponse.json(
        { 
          success: false, 
          error: imageError.message,
          authenticated: true
        },
        { status: 400 }
      );
    }

    // Parse recipients
    let recipients = [];
    try {
      recipients = parseJsonField(formData.get("recipients") || "[]", "recipients");
    } catch (parseError) {
      console.warn("Error parsing recipients:", parseError);
    }

    // Create achievement
    const achievementData = {
      title,
      description: formData.get("description") || null,
      category,
      year: parseIntField(year),
      images,
      featured: parseBoolean(formData.get("featured")),
      displayOrder: parseIntField(formData.get("displayOrder")) || 0,
      isActive: parseBoolean(formData.get("isActive")),
      awardingBody: formData.get("awardingBody") || null,
      recipients,
      achievedDate: parseDate(formData.get("achievedDate"))
    };

    const achievement = await prisma.achievement.create({
      data: achievementData
    });
    
    console.log(`✅ Achievement created successfully: ${achievement.title}`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Achievement created successfully",
      achievement: cleanAchievementResponse(achievement),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ POST Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        message: "Failed to create achievement",
        authenticated: true
      }, 
      { status: 500 }
    );
  }
}

// 🔵 UPDATE Achievement (PUT - PROTECTED)
export async function PUT(req) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("✏️ PUT /api/achievements - Updating achievement");
    
    const formData = await req.formData();
    const id = formData.get("id");
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Achievement ID is required",
          authenticated: true
        }, 
        { status: 400 }
      );
    }

    const existing = await prisma.achievement.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existing) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Achievement not found",
          authenticated: true
        }, 
        { status: 404 }
      );
    }

    // Handle images
    const imageFiles = formData.getAll("images");
    const keepExistingImages = formData.get("keepExistingImages") === 'true';
    const imagesToDelete = formData.get("imagesToDelete");
    
    let images = keepExistingImages ? (existing.images || []) : [];
    
    // Delete images marked for removal
    if (imagesToDelete) {
      try {
        const deleteUrls = JSON.parse(imagesToDelete);
        for (const url of deleteUrls) {
          await deleteFromCloudinary(url);
        }
        images = images.filter(img => !deleteUrls.includes(img.url));
      } catch (e) {
        console.warn("Error parsing imagesToDelete:", e);
      }
    }
    
    // Upload new images
    try {
      const newImages = await handleImagesUpload(imageFiles.filter(f => f && f.size > 0), []);
      images = [...images, ...newImages];
    } catch (imageError) {
      return NextResponse.json(
        { 
          success: false, 
          error: imageError.message,
          authenticated: true
        },
        { status: 400 }
      );
    }

    // Parse recipients
    let recipients = existing.recipients;
    const recipientsField = formData.get("recipients");
    if (recipientsField) {
      try {
        recipients = parseJsonField(recipientsField, "recipients");
      } catch (parseError) {
        console.warn("Error parsing recipients:", parseError);
      }
    }

    // Prepare update data
    const updateData = {
      title: formData.get("title") || existing.title,
      description: formData.get("description") !== null ? formData.get("description") : existing.description,
      category: formData.get("category") || existing.category,
      year: formData.get("year") ? parseIntField(formData.get("year")) : existing.year,
      images,
      featured: formData.get("featured") !== null ? parseBoolean(formData.get("featured")) : existing.featured,
      displayOrder: formData.get("displayOrder") ? parseIntField(formData.get("displayOrder")) : existing.displayOrder,
      isActive: formData.get("isActive") !== null ? parseBoolean(formData.get("isActive")) : existing.isActive,
      awardingBody: formData.get("awardingBody") !== null ? formData.get("awardingBody") : existing.awardingBody,
      recipients,
      achievedDate: formData.get("achievedDate") ? parseDate(formData.get("achievedDate")) : existing.achievedDate,
      updatedAt: new Date()
    };

    const updated = await prisma.achievement.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    console.log(`✅ Achievement updated successfully: ${updated.title}`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Achievement updated successfully",
      achievement: cleanAchievementResponse(updated),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ PUT Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        message: "Failed to update achievement",
        authenticated: true
      }, 
      { status: 500 }
    );
  }
}

// 🔴 DELETE Achievement (DELETE - PROTECTED)
export async function DELETE(req) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Achievement ID is required",
          authenticated: true
        }, 
        { status: 400 }
      );
    }

    console.log(`🗑️ DELETE /api/achievements - Deleting achievement ${id}`);
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    
    const existing = await prisma.achievement.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existing) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Achievement not found",
          authenticated: true
        }, 
        { status: 404 }
      );
    }

    // Delete images from Cloudinary
    if (existing.images && existing.images.length > 0) {
      for (const image of existing.images) {
        if (image.url) {
          await deleteFromCloudinary(image.url);
        }
      }
    }

    await prisma.achievement.delete({
      where: { id: parseInt(id) }
    });
    
    console.log(`✅ Achievement deleted successfully: ${existing.title}`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Achievement deleted successfully",
      deletedId: id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ DELETE Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        message: "Failed to delete achievement",
        authenticated: true
      }, 
      { status: 500 }
    );
  }
}