import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";

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
            message: 'User does not have permission to manage school stats' 
          };
        }
        
      } catch (error) {
        return { valid: false, reason: 'invalid_admin_token', message: 'Invalid admin token' };
      }

      console.log('✅ School stats management authentication successful');
      
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
          message: "Authentication required to manage school stats.",
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

// ============ API ROUTES ============

// 🟡 GET school stats (PUBLIC - no authentication required)
export async function GET() {
  try {
    console.log("🔍 GET /api/school-stats - Fetching school stats");
    
    let stats = await prisma.schoolStats.findFirst();
    
    // If no stats exist, return null (don't auto-create)
    if (!stats) {
      return NextResponse.json({ 
        success: true, 
        message: "No school stats found",
        stats: null
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "School stats retrieved successfully",
      stats: {
        id: stats.id,
        meanScore: stats.meanScore,
        lastYearMean: stats.lastYearMean,
        targetMean: stats.targetMean,
        slogan: stats.slogan,
        sloganDescription: stats.sloganDescription,
        sloganAuthor: stats.sloganAuthor,
        createdAt: stats.createdAt,
        updatedAt: stats.updatedAt
      }
    });

  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error"
      }, 
      { status: 500 }
    );
  }
}

// 🟢 CREATE school stats (POST - PROTECTED)
export async function POST(req) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("📝 POST /api/school-stats - Creating school stats");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    
    // Check if stats already exist
    const existing = await prisma.schoolStats.findFirst();
    
    if (existing) {
      return NextResponse.json(
        { 
          success: false, 
          error: "School stats already exist. Use PUT to update.",
          message: "Stats already exist. Use update instead.",
          authenticated: true
        },
        { status: 409 }
      );
    }
    
    const body = await req.json();
    
    // Create new stats
    const stats = await prisma.schoolStats.create({
      data: {
        meanScore: body.meanScore !== undefined ? parseFloat(body.meanScore) : null,
        lastYearMean: body.lastYearMean !== undefined ? parseFloat(body.lastYearMean) : null,
        targetMean: body.targetMean !== undefined ? parseFloat(body.targetMean) : null,
        slogan: body.slogan || null,
        sloganDescription: body.sloganDescription || null,
        sloganAuthor: body.sloganAuthor || null
      }
    });

    console.log(`✅ School stats created successfully`);
    
    return NextResponse.json({ 
      success: true, 
      message: "School stats created successfully",
      stats: {
        id: stats.id,
        meanScore: stats.meanScore,
        lastYearMean: stats.lastYearMean,
        targetMean: stats.targetMean,
        slogan: stats.slogan,
        sloganDescription: stats.sloganDescription,
        sloganAuthor: stats.sloganAuthor,
        createdAt: stats.createdAt,
        updatedAt: stats.updatedAt
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ POST Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        message: "Failed to create school stats",
        authenticated: true
      }, 
      { status: 500 }
    );
  }
}

// 🔵 UPDATE school stats (PUT - PROTECTED)
export async function PUT(req) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("✏️ PUT /api/school-stats - Updating school stats");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    
    const body = await req.json();
    
    let stats = await prisma.schoolStats.findFirst();
    
    const updateData = {
      meanScore: body.meanScore !== undefined ? parseFloat(body.meanScore) : undefined,
      lastYearMean: body.lastYearMean !== undefined ? parseFloat(body.lastYearMean) : undefined,
      targetMean: body.targetMean !== undefined ? parseFloat(body.targetMean) : undefined,
      slogan: body.slogan !== undefined ? body.slogan : undefined,
      sloganDescription: body.sloganDescription !== undefined ? body.sloganDescription : undefined,
      sloganAuthor: body.sloganAuthor !== undefined ? body.sloganAuthor : undefined,
      updatedAt: new Date()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    if (stats) {
      stats = await prisma.schoolStats.update({
        where: { id: stats.id },
        data: updateData
      });
    } else {
      // If no stats exist, create them
      stats = await prisma.schoolStats.create({
        data: {
          meanScore: updateData.meanScore || null,
          lastYearMean: updateData.lastYearMean || null,
          targetMean: updateData.targetMean || null,
          slogan: updateData.slogan || null,
          sloganDescription: updateData.sloganDescription || null,
          sloganAuthor: updateData.sloganAuthor || null
        }
      });
    }

    console.log(`✅ School stats updated successfully`);
    
    return NextResponse.json({ 
      success: true, 
      message: "School stats updated successfully",
      stats: {
        id: stats.id,
        meanScore: stats.meanScore,
        lastYearMean: stats.lastYearMean,
        targetMean: stats.targetMean,
        slogan: stats.slogan,
        sloganDescription: stats.sloganDescription,
        sloganAuthor: stats.sloganAuthor,
        createdAt: stats.createdAt,
        updatedAt: stats.updatedAt
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ PUT Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        message: "Failed to update school stats",
        authenticated: true
      }, 
      { status: 500 }
    );
  }
}

// 🔴 DELETE school stats (DELETE - PROTECTED)
export async function DELETE(req) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log("🗑️ DELETE /api/school-stats - Deleting school stats");
    console.log(`Request from: ${auth.user.name} (${auth.user.role})`);
    
    const existing = await prisma.schoolStats.findFirst();
    
    if (!existing) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No school stats found to delete",
          authenticated: true
        }, 
        { status: 404 }
      );
    }

    await prisma.schoolStats.delete({
      where: { id: existing.id }
    });
    
    console.log(`✅ School stats deleted successfully`);
    
    return NextResponse.json({ 
      success: true, 
      message: "School stats deleted successfully",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ DELETE Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error",
        message: "Failed to delete school stats",
        authenticated: true
      }, 
      { status: 500 }
    );
  }
}