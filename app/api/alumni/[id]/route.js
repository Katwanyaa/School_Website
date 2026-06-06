import { NextResponse } from "next/server";
import { prisma } from "../../../../libs/prisma";
import {
  deleteSchoolImages,
  isFileUpload,
  uploadSchoolImagesFromFormData,
  validateSchoolImage,
} from "../../../../libs/schoolContentUpload";

const SECTIONS = new Set([
  "ALUMNI",
  "BOM",
  "PTA",
  "PRINCIPAL_CURRENT",
  "PRINCIPAL_PREVIOUS",
]);

const parseJwtPayload = (token) => {
  const payload = token.split(".")[1];
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
};

class DeviceTokenManager {
  static validateTokensFromHeaders(headers) {
    try {
      const adminToken = headers.get("x-admin-token") || headers.get("authorization")?.replace("Bearer ", "");
      const deviceToken = headers.get("x-device-token");
      if (!adminToken || !deviceToken) return { valid: false, message: "Admin and device tokens are required" };
      if (adminToken.split(".").length !== 3) return { valid: false, message: "Invalid admin token format" };

      const deviceValid = this.validateDeviceToken(deviceToken);
      if (!deviceValid.valid) return { valid: false, message: deviceValid.error || "Invalid device token" };

      const payload = parseJwtPayload(adminToken);
      if (payload.exp && payload.exp < Date.now() / 1000) return { valid: false, message: "Admin token has expired" };

      const role = (payload.role || payload.userRole || "").toUpperCase();
      if (!["ADMIN", "SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "STAFF"].includes(role)) {
        return { valid: false, message: "User does not have permission to manage alumni records" };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, message: error.message || "Authentication failed" };
    }
  }

  static validateDeviceToken(token) {
    try {
      const payload = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      if (payload.exp && payload.exp * 1000 <= Date.now()) return { valid: false, error: "Device token has expired" };
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

const authenticateWriteRequest = (req) => {
  const validation = DeviceTokenManager.validateTokensFromHeaders(req.headers);
  if (!validation.valid) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: "Access Denied", message: validation.message },
        { status: 401 }
      ),
    };
  }
  return { authenticated: true };
};

const normalizeRecord = (record) => ({
  ...record,
  images: Array.isArray(record.images) ? record.images : [],
});

const parseBoolean = (value, fallback = true) => {
  if (value === null || value === undefined || value === "") return fallback;
  return value === "true" || value === "1" || value === true;
};

const parseExistingImages = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value.toString());
    return Array.isArray(parsed) ? parsed.filter((item) => item?.url) : [];
  } catch {
    return [];
  }
};

const readUpdateForm = async (req, existing) => {
  const formData = await req.formData();
  const section = (formData.get("section") || existing.section).toString().trim();
  const name = (formData.get("name") || existing.name).toString().trim();
  const position = (formData.get("position") || "").toString().trim();
  const description = (formData.get("description") || "").toString().trim();
  const displayOrder = Number(formData.get("displayOrder") ?? existing.displayOrder ?? 0);
  const isActive = parseBoolean(formData.get("isActive"), existing.isActive !== false);

  if (!SECTIONS.has(section)) throw new Error("Invalid section");
  if (!name) throw new Error("Name is required");
  if (!Number.isFinite(displayOrder)) throw new Error("Display order must be a valid number");

  for (const file of [...formData.getAll("images"), formData.get("image")].filter(isFileUpload)) {
    const validation = validateSchoolImage(file);
    if (!validation.valid) throw new Error(validation.error);
  }

  const uploadedMain = await uploadSchoolImagesFromFormData(formData, "image", "school/alumni-governance");
  const uploadedImages = await uploadSchoolImagesFromFormData(formData, "images", "school/alumni-governance");
  const retainedImages = parseExistingImages(formData.get("existingImages"));
  const existingImage = (formData.get("existingImage") || existing.image || "").toString().trim();

  return {
    section,
    name,
    position: position || null,
    description: description || null,
    displayOrder: Math.floor(displayOrder),
    isActive,
    image: uploadedMain[0]?.url || existingImage || null,
    images: [...retainedImages, ...uploadedImages],
  };
};

export async function GET(_req, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const record = await prisma.alumniGovernanceRecord.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });

    return NextResponse.json({ success: true, record: normalizeRecord(record) });
  } catch (error) {
    console.error("GET alumni record error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch record" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const auth = authenticateWriteRequest(req);
    if (!auth.authenticated) return auth.response;

    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const existing = await prisma.alumniGovernanceRecord.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });

    const data = await readUpdateForm(req, existing);
    const updated = await prisma.alumniGovernanceRecord.update({ where: { id }, data });

    return NextResponse.json({ success: true, record: normalizeRecord(updated) });
  } catch (error) {
    console.error("PUT alumni record error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update record" }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = authenticateWriteRequest(req);
    if (!auth.authenticated) return auth.response;

    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const existing = await prisma.alumniGovernanceRecord.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });

    await deleteSchoolImages([
      existing.image,
      ...(Array.isArray(existing.images) ? existing.images : []),
    ].filter(Boolean));
    await prisma.alumniGovernanceRecord.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Record deleted" });
  } catch (error) {
    console.error("DELETE alumni record error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete record" }, { status: 500 });
  }
}
