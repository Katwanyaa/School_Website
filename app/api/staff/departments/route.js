import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import {
  isFileUpload,
  uploadSchoolImagesFromFormData,
  validateSchoolImage,
} from "../../../../libs/schoolContentUpload";

// ==================== AUTHENTICATION UTILITIES ====================

class DeviceTokenManager {
  static validateTokensFromHeaders(headers) {
    try {
      const adminToken =
        headers.get("x-admin-token") ||
        headers.get("authorization")?.replace("Bearer ", "");
      const deviceToken = headers.get("x-device-token");

      if (!adminToken) {
        return {
          valid: false,
          reason: "no_admin_token",
          message: "Admin token is required",
        };
      }

      if (!deviceToken) {
        return {
          valid: false,
          reason: "no_device_token",
          message: "Device token is required",
        };
      }

      const adminParts = adminToken.split(".");
      if (adminParts.length !== 3) {
        return {
          valid: false,
          reason: "invalid_admin_token_format",
          message: "Invalid admin token format",
        };
      }

      const deviceValid = this.validateDeviceToken(deviceToken);
      if (!deviceValid.valid) {
        return {
          valid: false,
          reason: `device_${deviceValid.reason}`,
          message: `Device token ${deviceValid.reason}: ${deviceValid.error || ""}`,
        };
      }

      let adminPayload;
      try {
        adminPayload = JSON.parse(atob(adminParts[1]));

        const currentTime = Date.now() / 1000;
        if (adminPayload.exp < currentTime) {
          return {
            valid: false,
            reason: "admin_token_expired",
            message: "Admin token has expired",
          };
        }

        const userRole = adminPayload.role || adminPayload.userRole;
        const validRoles = [
          "ADMIN",
          "SUPER_ADMIN",
          "administrator",
          "PRINCIPAL",
          "STAFF",
          "HR_MANAGER",
        ];

        if (!userRole || !validRoles.includes(userRole.toUpperCase())) {
          return {
            valid: false,
            reason: "invalid_role",
            message: "User does not have permission to manage departments",
          };
        }
      } catch {
        return {
          valid: false,
          reason: "invalid_admin_token",
          message: "Invalid admin token",
        };
      }

      return {
        valid: true,
        user: {
          id: adminPayload.userId || adminPayload.id,
          name: adminPayload.name,
          email: adminPayload.email,
          role: adminPayload.role || adminPayload.userRole,
        },
        deviceInfo: deviceValid.payload,
      };
    } catch (error) {
      return {
        valid: false,
        reason: "validation_error",
        message: "Authentication validation failed",
        error: error.message,
      };
    }
  }

  static validateDeviceToken(token) {
    try {
      const payloadStr = Buffer.from(token, "base64").toString("utf-8");
      const payload = JSON.parse(payloadStr);

      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        return {
          valid: false,
          reason: "expired",
          payload,
          error: "Device token has expired",
        };
      }

      const createdAt = new Date(payload.createdAt || payload.iat * 1000);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      if (createdAt < thirtyDaysAgo) {
        return {
          valid: false,
          reason: "age_expired",
          payload,
          error: "Device token is too old",
        };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, reason: "invalid_format", error: error.message };
    }
  }
}

const authenticateWriteRequest = (req) => {
  const validationResult = DeviceTokenManager.validateTokensFromHeaders(req.headers);
  if (!validationResult.valid) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Access Denied",
          message: "Authentication required to manage departments.",
          details: validationResult.message,
        },
        { status: 401 }
      ),
    };
  }
  return { authenticated: true, user: validationResult.user };
};

// ==================== ROUTE HANDLERS ====================

const VALID_CATEGORIES = new Set(["CBC", "EIGHT_FOUR_FOUR", "TEACHING", "SUPPORT"]);

const publicTeacherSelect = {
  id: true,
  name: true,
  role: true,
  position: true,
  department: true,
  staffType: true,
  subjectOffered: true,
  bio: true,
  gender: true,
  image: true,
  status: true,
  staffDepartmentId: true,
};

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const grouped = url.searchParams.get("grouped") === "1";
    const includeStaff = url.searchParams.get("includeStaff") === "1" || grouped;
    const includeInactive = url.searchParams.get("includeInactive") === "1";

    // Only admins can include inactive records
    let adminOk = false;
    if (includeInactive) {
      const maybeAdminToken =
        req?.headers?.get("x-admin-token") ||
        req?.headers?.get("authorization")?.replace("Bearer ", "");
      const maybeDeviceToken = req?.headers?.get("x-device-token");

      if (maybeAdminToken && maybeDeviceToken) {
        const validation = DeviceTokenManager.validateTokensFromHeaders(req.headers);
        adminOk = validation.valid;
      }

      if (!adminOk) {
        return NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 }
        );
      }
    }

    const where = {};

    if (category) {
      if (!VALID_CATEGORIES.has(category)) {
        return NextResponse.json(
          { success: false, error: "Invalid department category" },
          { status: 400 }
        );
      }
      where.category = category;
    }

    if (!includeInactive) {
      where.isActive = true;
    }

    const departments = await prisma.staffDepartment.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: {
        images: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] },
        ...(includeStaff && {
          staff: {
            where: {
              role: "Teacher",
              status: "active",
            },
            orderBy: [{ name: "asc" }],
            select: publicTeacherSelect,
          },
        }),
      },
    });

    const normalizedDepartments = departments.map((department) => ({
      ...department,
      staffCount: includeStaff ? department.staff?.length || 0 : department.staffCount,
      staff: includeStaff ? department.staff || [] : undefined,
    }));

    if (!grouped) {
      return NextResponse.json({ success: true, departments: normalizedDepartments });
    }

    const departmentsByCategory = normalizedDepartments.reduce((acc, dept) => {
      const key = dept.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(dept);
      return acc;
    }, {});

    return NextResponse.json({ success: true, departmentsByCategory, departments: normalizedDepartments });
  } catch (error) {
    console.error("❌ GET Departments Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const auth = authenticateWriteRequest(req);
    if (!auth.authenticated) return auth.response;

    const formData = await req.formData();

    const name = (formData.get("name") || "").toString().trim();
    const category = (formData.get("category") || "").toString().trim();
    const description = (formData.get("description") || "").toString().trim();
    const headName = (formData.get("headName") || "").toString().trim();
    const assistantHeadName = (
      formData.get("assistantHeadName") ||
      formData.get("ahodName") ||
      formData.get("aHOD") ||
      ""
    ).toString().trim();

    const staffCountRaw = formData.get("staffCount");
    const displayOrderRaw = formData.get("displayOrder");
    const isActiveRaw = formData.get("isActive");

    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: "Department name and category are required" },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json(
        { success: false, error: "Invalid department category" },
        { status: 400 }
      );
    }

    const staffCount = staffCountRaw !== null && staffCountRaw !== undefined && staffCountRaw !== ""
      ? Number(staffCountRaw)
      : 0;
    if (!Number.isFinite(staffCount) || staffCount < 0) {
      return NextResponse.json(
        { success: false, error: "staffCount must be a valid non-negative number" },
        { status: 400 }
      );
    }

    const displayOrder = displayOrderRaw !== null && displayOrderRaw !== undefined && displayOrderRaw !== ""
      ? Number(displayOrderRaw)
      : 0;
    if (!Number.isFinite(displayOrder)) {
      return NextResponse.json(
        { success: false, error: "displayOrder must be a valid number" },
        { status: 400 }
      );
    }

    const isActive =
      typeof isActiveRaw === "string"
        ? isActiveRaw === "true" || isActiveRaw === "1"
        : true;

    let extra = null;
    try {
      const extraStr = formData.get("extra");
      if (extraStr) extra = JSON.parse(extraStr);
    } catch {
      extra = null;
    }

    for (const file of [...formData.getAll("images"), formData.get("image")].filter(isFileUpload)) {
      const validation = validateSchoolImage(file);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }
    }

    const uploadedImages = await uploadSchoolImagesFromFormData(formData, "images", "school_departments");
    const legacyImageFile = formData.get("image");
    if (isFileUpload(legacyImageFile)) {
      uploadedImages.push(...(await uploadSchoolImagesFromFormData(formData, "image", "school_departments")));
    }
    const primaryImage = uploadedImages[0]?.url || null;

    const department = await prisma.staffDepartment.create({
      data: {
        name,
        category,
        description: description || null,
        headName: headName || null,
        assistantHeadName: assistantHeadName || null,
        staffCount: Math.floor(staffCount),
        displayOrder: Math.floor(displayOrder),
        isActive,
        image: primaryImage,
        extra,
        images: uploadedImages.length
          ? {
              create: uploadedImages.map((image, index) => ({
                url: image.url,
                publicId: image.publicId,
                altText: image.altText || name,
                caption: image.caption || null,
                displayOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        images: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] },
      },
    });

    return NextResponse.json({ success: true, department }, { status: 201 });
  } catch (error) {
    console.error("❌ POST Department Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create department" },
      { status: 500 }
    );
  }
}
