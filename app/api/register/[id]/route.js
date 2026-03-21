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
      const adminToken = headers.get('x-admin-token') || 
                         headers.get('authorization')?.replace('Bearer ', '');
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
        // Parse JWT payload
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
        return { valid: false, reason: 'token_parsing_error', message: 'Failed to parse token' };
      }

    } catch (error) {
      return { valid: false, reason: 'validation_error', message: 'Authentication failed' };
    }
  }
}

const authenticateRequest = (req) => {
  const validation = DeviceTokenManager.validateTokensFromHeaders(req.headers);
  
  if (!validation.valid) {
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

const validateUserInput = (name, email, phone, password, role, isEditing = false) => {
  const errors = [];

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  // Email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Valid email is required");
  }

  // Phone validation (Kenyan format)
  if (!phone || !/^\+254[17]\d{8}$/.test(phone)) {
    errors.push("Phone number must be in format: +2547XXXXXXXX or +2541XXXXXXXX");
  }

  // Password validation (only for new admin or if password is being changed)
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

  // Role validation
  const validRoles = ["ADMIN", "SUPER_ADMIN", "MODERATOR", "TEACHER", "PRINCIPAL"];
  if (role && !validRoles.includes(role.toUpperCase())) {
    errors.push("Invalid user role");
  }

  return errors;
};

const checkAdminPermissions = (currentUserRole, targetUserRole, operation) => {
  const normalizedCurrent = currentUserRole?.toUpperCase() || '';
  const normalizedTarget = targetUserRole?.toUpperCase() || '';
  
  // SUPER_ADMIN can do anything
  if (normalizedCurrent === 'SUPER_ADMIN') {
    return { allowed: true, message: 'Super admin access granted' };
  }
  
  // Check if current user has admin role
  const adminRoles = ['ADMIN', 'PRINCIPAL'];
  const isAdmin = adminRoles.includes(normalizedCurrent);
  
  if (!isAdmin) {
    return { 
      allowed: false, 
      message: `Insufficient permissions. Required: ADMIN or SUPER_ADMIN. Current: ${normalizedCurrent}` 
    };
  }
  
  // ADMIN permissions
  if (normalizedCurrent === 'ADMIN') {
    // Admins can manage TEACHER and PRINCIPAL users
    if (normalizedTarget === 'TEACHER' || normalizedTarget === 'PRINCIPAL') {
      return { allowed: true, message: 'Admin access granted for teacher/principal' };
    }
    
    // Admins cannot manage other ADMINS or SUPER_ADMIN
    if (normalizedTarget === 'ADMIN' || normalizedTarget === 'SUPER_ADMIN') {
      return { 
        allowed: false, 
        message: 'Only SUPER_ADMIN can manage ADMIN users' 
      };
    }
  }
  
  // PRINCIPAL permissions
  if (normalizedCurrent === 'PRINCIPAL') {
    if (normalizedTarget === 'TEACHER') {
      return { allowed: true, message: 'Principal can manage teachers' };
    }
    
    return { 
      allowed: false, 
      message: `Principal cannot manage ${normalizedTarget} users` 
    };
  }
  
  return { 
    allowed: false, 
    message: `Insufficient permissions for operation: ${operation}` 
  };
};

// ==================== API ROUTES ====================

// GET all users (with pagination and filters)
export async function GET(req) {
  try {
    // Authenticate request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log(`📋 User list requested by: ${auth.user.name} (${auth.user.role})`);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const skip = (page - 1) * limit;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = { equals: role.toUpperCase(), mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
      }),
      prisma.user.count({ where })
    ]);

    // Sanitize users (remove sensitive data)
    const sanitizedUsers = users.map(user => sanitizeUser(user));

    return NextResponse.json({ 
      success: true, 
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      requestedBy: {
        name: auth.user.name,
        role: auth.user.role
      }
    }, { status: 200 });
  } catch (error) {
    console.error("❌ GET Users Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch users" 
    }, { status: 500 });
  }
}

// POST create new user
export async function POST(req) {
  try {
    // Authenticate request
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return auth.response;
    }

    console.log(`👤 User creation attempt by: ${auth.user.name} (${auth.user.role})`);

    const body = await req.json();
    const { name, email, phone, password, role, status = 'active' } = body;

    // Validate input
    const validationErrors = validateUserInput(name, email, phone, password, role, false);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation Error",
          message: "Please fix the following errors",
          details: validationErrors
        },
        { status: 400 }
      );
    }

    // Check permissions for creating user with specific role
    const permissionCheck = checkAdminPermissions(auth.user.role, role, 'CREATE');
    if (!permissionCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Permission Denied",
          message: permissionCheck.message,
          requiredRole: role === 'ADMIN' ? 'SUPER_ADMIN' : 'ADMIN'
        },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: phone }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User Exists",
          message: "A user with this email or phone number already exists"
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role: role.toUpperCase(),
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });

    console.log(`✅ User created successfully by: ${auth.user.name}`, {
      newUserId: newUser.id,
      newUserEmail: newUser.email,
      role: newUser.role
    });

    return NextResponse.json({ 
      success: true, 
      message: "User created successfully",
      user: sanitizeUser(newUser),
      createdBy: {
        name: auth.user.name,
        role: auth.user.role
      }
    }, { status: 201 });
  } catch (error) {
    console.error("❌ POST User Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create user",
      message: error.message
    }, { status: 500 });
  }
}