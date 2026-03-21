import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import { hashPassword, sanitizeUser } from "../../../../libs/auth";

// ==================== AUTHENTICATION UTILITIES (Matching your working pattern) ====================

class DeviceTokenManager {
  static decodeBase64(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) throw new Error('Invalid base64 string');
      base64 += '==='.slice(0, 4 - pad);
    }
    return Buffer.from(base64, 'base64').toString('utf-8');
  }

  static validateTokensFromHeaders(headers) {
    try {
      // Try to get token from different header formats
      let adminToken = headers.get('x-admin-token');
      
      // If not found, try authorization header
      if (!adminToken) {
        const authHeader = headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          adminToken = authHeader.replace('Bearer ', '');
        }
      }
      
      const deviceToken = headers.get('x-device-token');

      if (!adminToken || !deviceToken) {
        return { valid: false, reason: 'missing_tokens', message: 'Both admin and device tokens are required' };
      }

      // Validate JWT format
      const adminParts = adminToken.split('.');
      if (adminParts.length !== 3) {
        return { valid: false, reason: 'invalid_jwt_format', message: 'Invalid JWT format' };
      }

      try {
        // Parse JWT payload using decodeBase64
        const payloadStr = this.decodeBase64(adminParts[1]);
        const payload = JSON.parse(payloadStr);
        
        // Check expiration
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          return { valid: false, reason: 'token_expired', message: 'Token has expired' };
        }

        // Check role
        const userRole = payload.role || payload.userRole;
        const validRoles = ['ADMIN', 'SUPER_ADMIN', 'administrator', 'PRINCIPAL', 'TEACHER', 'STAFF', 'EDITOR', 'NEWS_MANAGER'];
        
        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          return { valid: false, reason: 'invalid_role', message: 'Insufficient permissions' };
        }

        // Validate device token
        try {
          const devicePayloadStr = Buffer.from(deviceToken, 'base64').toString('utf-8');
          const devicePayload = JSON.parse(devicePayloadStr);
          
          if (devicePayload.exp && devicePayload.exp * 1000 <= Date.now()) {
            return { valid: false, reason: 'device_expired', message: 'Device token expired' };
          }

        } catch (deviceError) {
          return { valid: false, reason: 'invalid_device_token', message: 'Invalid device token' };
        }

        return { 
          valid: true,
          user: {
            id: payload.userId || payload.id,
            name: payload.name,
            email: payload.email,
            role: payload.role || payload.userRole
          }
        };

      } catch (error) {
        console.error('❌ Token decode error:', error);
        return { valid: false, reason: 'token_parsing_error', message: 'Failed to parse token' };
      }

    } catch (error) {
      console.error('❌ Token validation error:', error);
      return { valid: false, reason: 'validation_error', message: 'Authentication failed' };
    }
  }
}

// Authentication helper function - UPDATED to match working pattern
const authenticateRequest = (req) => {
  const validation = DeviceTokenManager.validateTokensFromHeaders(req.headers);
  
  if (!validation.valid) {
    console.log('❌ Authentication failed:', validation.message);
    return {
      authenticated: false,
      response: NextResponse.json(
        { 
          success: false, 
          error: "Authentication Failed",
          message: "Please login again to perform this action.",
          details: validation.message
        },
        { status: 401 }
      )
    };
  }

  return {
    authenticated: true,
    user: validation.user
  };
};

// ==================== HELPER FUNCTIONS ====================

const validateInput = (name, email, password, role, phone = null, isEditing = false) => {
  const errors = [];

  if (name && name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Valid email is required");
  }

  // Phone validation for Kenyan format
  if (phone && !/^\+254[17]\d{8}$/.test(phone)) {
    errors.push("Phone number must be in format: +2547XXXXXXXX or +2541XXXXXXXX");
  }

  // Password validation
  if (!isEditing) {
    if (!password || password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    } else {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        errors.push("Password must contain uppercase, lowercase, numbers, and special characters");
      }
    }
  } else if (password && password.length > 0) {
    // If editing and password is being changed, validate it
    if (password.length < 8) {
      errors.push("New password must be at least 8 characters long");
    } else {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        errors.push("New password must contain uppercase, lowercase, numbers, and special characters");
      }
    }
  }

  const validRoles = ["TEACHER", "PRINCIPAL", "ADMIN", "SUPER_ADMIN", "MODERATOR"];
  if (role && !validRoles.includes(role.toUpperCase())) {
    errors.push("Invalid user role");
  }

  return errors;
};

// Helper to check if operation requires admin privileges
const requiresAdminPrivilege = (operation, targetUserRole, currentUserRole) => {
  const normalizedCurrentRole = currentUserRole?.toUpperCase() || '';
  const normalizedTargetRole = targetUserRole?.toUpperCase() || '';
  
  console.log('🔐 Permission check:', {
    operation,
    currentRole: normalizedCurrentRole,
    targetRole: normalizedTargetRole
  });
  
  // SUPER_ADMIN can do anything
  if (normalizedCurrentRole === 'SUPER_ADMIN') {
    return { allowed: true, message: 'Super admin access granted' };
  }
  
  // Check if current user has admin role
  const adminRoles = ['ADMIN', 'PRINCIPAL'];
  const isAdmin = adminRoles.includes(normalizedCurrentRole);
  
  if (!isAdmin) {
    return { 
      allowed: false, 
      message: `Insufficient permissions. Required: ADMIN or SUPER_ADMIN. Current: ${normalizedCurrentRole}` 
    };
  }
  
  // For ADMIN users (non-super)
  if (normalizedCurrentRole === 'ADMIN') {
    // Admins can manage TEACHER or PRINCIPAL users
    if (normalizedTargetRole === 'TEACHER' || normalizedTargetRole === 'PRINCIPAL') {
      return { allowed: true, message: 'Admin access granted for teacher/principal' };
    }
    
    // Admins cannot manage other ADMINS or SUPER_ADMIN
    if (normalizedTargetRole === 'ADMIN' || normalizedTargetRole === 'SUPER_ADMIN') {
      return { 
        allowed: false, 
        message: 'Only SUPER_ADMIN can manage ADMIN users',
        requiresSuperAdmin: true
      };
    }
  }
  
  // PRINCIPAL role permissions
  if (normalizedCurrentRole === 'PRINCIPAL') {
    if (normalizedTargetRole === 'TEACHER') {
      return { allowed: true, message: 'Principal can manage teachers' };
    }
    
    return { 
      allowed: false, 
      message: `Principal cannot manage ${normalizedTargetRole} users` 
    };
  }
  
  return { 
    allowed: false, 
    message: `Insufficient permissions for operation: ${operation}` 
  };
};

// ==================== API ROUTES ====================

// GET user by ID
export async function GET(req, { params }) {
  try {
    // Authenticate request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }
    
    const { id } = params;
    
    console.log('👁️ User view request:', {
      requestedBy: auth.user.name,
      requestedById: auth.user.id,
      requestedRole: auth.user.role,
      targetUserId: id,
      timestamp: new Date().toISOString()
    });

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Check if user has permission to view this user
    const userRolesForView = ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL'];
    if (!userRolesForView.includes(auth.user.role?.toUpperCase()) && auth.user.id !== id) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Permission Denied",
          message: "You can only view your own profile"
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      user: sanitizeUser(user),
      requestedBy: {
        name: auth.user.name,
        role: auth.user.role
      }
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// UPDATE user by ID
export async function PUT(req, { params }) {
  try {
    // Authenticate request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }
    
    const { id } = params;
    const { name, email, phone, password, role, status } = await req.json();

    // Get target user to check role
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, email: true, name: true, id: true }
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Allow users to update their own profile
    let permissionCheck = { allowed: true };
    if (auth.user.id !== id) {
      permissionCheck = requiresAdminPrivilege('UPDATE', targetUser.role, auth.user.role);
      
      if (!permissionCheck.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Permission Denied",
            message: permissionCheck.message
          },
          { status: 403 }
        );
      }
    }

    console.log('📝 User update attempt:', {
      updatedBy: auth.user.name,
      targetUser: targetUser.email,
      isSelfUpdate: auth.user.id === id,
      changes: { name, email, phone, role, status, passwordChanged: !!password }
    });

    // Validate input
    const validationErrors = validateInput(name, email, password, role, phone, true);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed", 
          details: validationErrors 
        }, 
        { status: 400 }
      );
    }

    let dataToUpdate = {
      name: name || targetUser.name,
      email: email || targetUser.email,
      phone: phone || undefined,
      status: status || undefined,
    };

    // Only update role if user has permission
    if (auth.user.id !== id && role) {
      const rolePermission = requiresAdminPrivilege('UPDATE_ROLE', targetUser.role, auth.user.role);
      if (rolePermission.allowed) {
        dataToUpdate.role = role.toUpperCase();
      }
    }

    if (password) {
      dataToUpdate.password = await hashPassword(password);
    }

    // Remove undefined fields
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true, updatedAt: true },
    });

    console.log('✅ User updated successfully:', {
      updatedBy: auth.user.name,
      targetUser: updatedUser.email
    });

    return NextResponse.json({ 
      success: true, 
      message: "User updated successfully", 
      user: sanitizeUser(updatedUser),
      updatedBy: {
        name: auth.user.name,
        role: auth.user.role,
        isSelfUpdate: auth.user.id === id
      }
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false, 
        error: "User with this email already exists" 
      }, { status: 409 });
    }
    
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE user by ID
export async function DELETE(req, { params }) {
  try {
    // Authenticate request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }
    
    const { id } = params;
    
    // Get target user to check role
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, email: true, name: true, id: true }
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Prevent self-deletion
    if (auth.user.id === id) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Operation Not Allowed",
          message: "You cannot delete your own account"
        },
        { status: 400 }
      );
    }

    // Check permission
    const permissionCheck = requiresAdminPrivilege('DELETE', targetUser.role, auth.user.role);
    
    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Permission Denied",
          message: permissionCheck.message
        },
        { status: 403 }
      );
    }

    console.log('🗑️ User deletion:', {
      deletedBy: auth.user.name,
      targetUser: targetUser.email,
      targetRole: targetUser.role
    });

    const deletedUser = await prisma.user.delete({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });

    console.log('✅ User deleted successfully');

    return NextResponse.json({ 
      success: true, 
      message: "User deleted successfully", 
      user: deletedUser,
      deletedBy: {
        name: auth.user.name,
        role: auth.user.role
      }
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}