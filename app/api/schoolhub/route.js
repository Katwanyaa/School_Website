import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import {
  isFileUpload,
  uploadSchoolImagesFromFormData,
  validateSchoolImage,
} from "../../../libs/schoolContentUpload";

// ==================== AUTHENTICATION UTILITIES ====================

class DeviceTokenManager {
  static validateTokensFromHeaders(headers) {
    try {
      const adminToken =
        headers.get("x-admin-token") ||
        headers.get("authorization")?.replace("Bearer ", "");
      const deviceToken = headers.get("x-device-token");

      if (!adminToken) {
        return { valid: false, reason: "no_admin_token", message: "Admin token is required" };
      }

      if (!deviceToken) {
        return { valid: false, reason: "no_device_token", message: "Device token is required" };
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
          return { valid: false, reason: "admin_token_expired", message: "Admin token has expired" };
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
            message: "User does not have permission to manage School Hub items",
          };
        }
      } catch {
        return { valid: false, reason: "invalid_admin_token", message: "Invalid admin token" };
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
        return { valid: false, reason: "expired", payload, error: "Device token has expired" };
      }

      const createdAt = new Date(payload.createdAt || payload.iat * 1000);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      if (createdAt < thirtyDaysAgo) {
        return { valid: false, reason: "age_expired", payload, error: "Device token is too old" };
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
          message: "Authentication required to manage School Hub items.",
          details: validationResult.message,
        },
        { status: 401 }
      ),
    };
  }
  return { authenticated: true, user: validationResult.user };
};

const VALID_TYPES = new Set([
  "CLUB",
  "SOCIETY",
  "STUDENT_COUNCIL",
  "COMPUTER_LAB",
  "BOARDING",
  "SECURITY",
  "DEPARTMENT",
]);

const parseSocialMedia = (value) => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value.toString());
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const grouped = url.searchParams.get("grouped") === "1";
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
    }

    const where = {};

    if (type) {
      if (!VALID_TYPES.has(type)) {
        return NextResponse.json({ success: false, error: "Invalid School Hub type" }, { status: 400 });
      }
      where.type = type;
    } else {
      where.type = { not: "FARM" };
    }

    if (!includeInactive || !adminOk) {
      where.isActive = true;
    }

    const items = await prisma.schoolHubItem.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: {
        images: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] },
      },
    });

    if (!grouped) {
      return NextResponse.json({ success: true, items });
    }

    const itemsByType = items.reduce((acc, item) => {
      const key = item.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return NextResponse.json({ success: true, items, itemsByType });
  } catch (error) {
    console.error("❌ GET SchoolHub Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch School Hub items" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const auth = authenticateWriteRequest(req);
    if (!auth.authenticated) return auth.response;

    const formData = await req.formData();

    const type = (formData.get("type") || "").toString().trim();
    const title = (formData.get("title") || "").toString().trim();

    if (!type || !title) {
      return NextResponse.json(
        { success: false, error: "type and title are required", authenticated: true },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.has(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid School Hub type", authenticated: true },
        { status: 400 }
      );
    }

    const shortDescription = (formData.get("shortDescription") || "").toString().trim();
    const description = (formData.get("description") || "").toString().trim();
    const contactName = (formData.get("contactName") || "").toString().trim();
    const contactPhone = (formData.get("contactPhone") || "").toString().trim();
    const contactEmail = (formData.get("contactEmail") || "").toString().trim();
    const location = (formData.get("location") || "").toString().trim();
    const established = (formData.get("established") || "").toString().trim();
    const website = (formData.get("website") || "").toString().trim();
    const socialMedia = parseSocialMedia(formData.get("socialMedia"));

    const isActiveRaw = formData.get("isActive");
    const displayOrderRaw = formData.get("displayOrder");

    const isActive =
      typeof isActiveRaw === "string"
        ? isActiveRaw === "true" || isActiveRaw === "1"
        : true;

    const displayOrder =
      displayOrderRaw !== null && displayOrderRaw !== undefined && displayOrderRaw !== ""
        ? Number(displayOrderRaw)
        : 0;

    if (!Number.isFinite(displayOrder)) {
      return NextResponse.json(
        { success: false, error: "displayOrder must be a valid number", authenticated: true },
        { status: 400 }
      );
    }

    let details = [];
    try {
      const detailsStr = formData.get("details");
      if (detailsStr) details = JSON.parse(detailsStr);
    } catch {
      details = [];
    }

    for (const file of [...formData.getAll("images"), formData.get("image")].filter(isFileUpload)) {
      const validation = validateSchoolImage(file);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.error, authenticated: true },
          { status: 400 }
        );
      }
    }

    const uploadedImages = await uploadSchoolImagesFromFormData(formData, "images", "school_hub");
    const legacyImageFile = formData.get("image");
    if (isFileUpload(legacyImageFile)) {
      uploadedImages.push(...(await uploadSchoolImagesFromFormData(formData, "image", "school_hub")));
    }

    const legacyImageUrl =
      typeof legacyImageFile === "string" && legacyImageFile.trim() !== ""
        ? legacyImageFile.trim()
        : null;
    const primaryImage = uploadedImages[0]?.url || legacyImageUrl || null;

    const item = await prisma.schoolHubItem.create({
      data: {
        type,
        title,
        shortDescription: shortDescription || null,
        description: description || null,
        image: primaryImage,
        location: location || null,
        established: established || null,
        website: website || null,
        socialMedia,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        details,
        isActive,
        displayOrder: Math.floor(displayOrder),
        images: uploadedImages.length
          ? {
              create: uploadedImages.map((image, index) => ({
                url: image.url,
                publicId: image.publicId,
                altText: image.altText || title,
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

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("❌ POST SchoolHub Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create School Hub item", authenticated: true },
      { status: 500 }
    );
  }
}
