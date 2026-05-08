import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import {
  deleteSchoolImages,
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

export async function GET(req, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    const includeInactive = new URL(req.url).searchParams.get("includeInactive") === "1";
    let isAdmin = false;

    if (includeInactive) {
      const maybeAdminToken =
        req?.headers?.get("x-admin-token") ||
        req?.headers?.get("authorization")?.replace("Bearer ", "");
      const maybeDeviceToken = req?.headers?.get("x-device-token");
      if (maybeAdminToken && maybeDeviceToken) {
        const validation = DeviceTokenManager.validateTokensFromHeaders(req.headers);
        isAdmin = validation.valid;
      }
    }

    const item = await prisma.schoolHubItem.findUnique({
      where: { id },
      include: { images: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] } },
    });
    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    if (item.type === "FARM") {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    if (!item.isActive && !isAdmin) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("❌ GET SchoolHub Item Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const auth = authenticateWriteRequest(req);
    if (!auth.authenticated) return auth.response;

    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid id", authenticated: true },
        { status: 400 }
      );
    }

    const existing = await prisma.schoolHubItem.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Item not found", authenticated: true },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const data = {};

    const type = formData.get("type");
    if (type !== null) {
      const t = type.toString().trim();
      if (!VALID_TYPES.has(t)) {
        return NextResponse.json(
          { success: false, error: "Invalid School Hub type", authenticated: true },
          { status: 400 }
        );
      }
      data.type = t;
    }

    const title = formData.get("title");
    if (title !== null) {
      const trimmed = title.toString().trim();
      if (!trimmed) {
        return NextResponse.json(
          { success: false, error: "title cannot be empty", authenticated: true },
          { status: 400 }
        );
      }
      data.title = trimmed;
    }

    const shortDescription = formData.get("shortDescription");
    if (shortDescription !== null) data.shortDescription = shortDescription.toString().trim() || null;

    const description = formData.get("description");
    if (description !== null) data.description = description.toString().trim() || null;

    const contactName = formData.get("contactName");
    if (contactName !== null) data.contactName = contactName.toString().trim() || null;

    const contactPhone = formData.get("contactPhone");
    if (contactPhone !== null) data.contactPhone = contactPhone.toString().trim() || null;

    const contactEmail = formData.get("contactEmail");
    if (contactEmail !== null) data.contactEmail = contactEmail.toString().trim() || null;

    const location = formData.get("location");
    if (location !== null) data.location = location.toString().trim() || null;

    const established = formData.get("established");
    if (established !== null) data.established = established.toString().trim() || null;

    const website = formData.get("website");
    if (website !== null) data.website = website.toString().trim() || null;

    const socialMedia = formData.get("socialMedia");
    if (socialMedia !== null) data.socialMedia = parseSocialMedia(socialMedia);

    const isActiveRaw = formData.get("isActive");
    if (isActiveRaw !== null) data.isActive = isActiveRaw === "true" || isActiveRaw === "1";

    const displayOrderRaw = formData.get("displayOrder");
    if (displayOrderRaw !== null) {
      const displayOrder = displayOrderRaw === "" ? 0 : Number(displayOrderRaw);
      if (!Number.isFinite(displayOrder)) {
        return NextResponse.json(
          { success: false, error: "displayOrder must be a valid number", authenticated: true },
          { status: 400 }
        );
      }
      data.displayOrder = Math.floor(displayOrder);
    }

    const detailsStr = formData.get("details");
    if (detailsStr !== null) {
      try {
        data.details = detailsStr ? JSON.parse(detailsStr) : [];
      } catch {
        data.details = [];
      }
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

    let imagesChanged = false;
    const imagesToRemove = formData.getAll("imagesToRemove").map((value) => value.toString());
    const matchingImagesToRemove = existing.images.filter((image) => imagesToRemove.includes(image.url));
    if (matchingImagesToRemove.length > 0) {
      imagesChanged = true;
      await deleteSchoolImages(matchingImagesToRemove);
      await prisma.schoolHubImage.deleteMany({
        where: { id: { in: matchingImagesToRemove.map((image) => image.id) } },
      });
    }

    if (existing.image && imagesToRemove.includes(existing.image)) {
      imagesChanged = true;
      data.image = null;
      await deleteSchoolImages(existing.image);
    }

    const legacyImageFile = formData.get("image");
    const uploadedImages = await uploadSchoolImagesFromFormData(formData, "images", "school_hub");
    if (isFileUpload(legacyImageFile)) {
      uploadedImages.push(...(await uploadSchoolImagesFromFormData(formData, "image", "school_hub")));
    } else if (typeof legacyImageFile === "string" && legacyImageFile.trim() !== "" && uploadedImages.length === 0) {
      data.image = legacyImageFile.trim();
    }

    if (uploadedImages.length > 0) {
      imagesChanged = true;
      await prisma.schoolHubImage.createMany({
        data: uploadedImages.map((image, index) => ({
          schoolHubItemId: id,
          url: image.url,
          publicId: image.publicId,
          altText: image.altText || data.title || existing.title,
          caption: image.caption || null,
          displayOrder: existing.images.length + index,
        })),
      });
      data.image = data.image || uploadedImages[0].url;
    }

    const remainingImages = existing.images.filter(
      (image) => !matchingImagesToRemove.some((removed) => removed.id === image.id)
    );
    if (imagesChanged && !data.image) {
      data.image = remainingImages[0]?.url || uploadedImages[0]?.url || null;
    }

    const item = await prisma.schoolHubItem.update({
      where: { id },
      data,
      include: { images: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] } },
    });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("❌ PUT SchoolHub Item Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update item", authenticated: true },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = authenticateWriteRequest(req);
    if (!auth.authenticated) return auth.response;

    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid id", authenticated: true },
        { status: 400 }
      );
    }

    const existing = await prisma.schoolHubItem.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Item not found", authenticated: true },
        { status: 404 }
      );
    }

    await prisma.schoolHubItem.delete({ where: { id } });

    await deleteSchoolImages([...(existing.images || []), existing.image].filter(Boolean));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ DELETE SchoolHub Item Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete item", authenticated: true },
      { status: 500 }
    );
  }
}
