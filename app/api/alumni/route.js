import { NextResponse } from "next/server";
import { prisma } from "../../../libs/prisma";
import {
  isFileUpload,
  uploadSchoolImagesFromFormData,
  validateSchoolImage,
} from "../../../libs/schoolContentUpload";

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

      if (!adminToken || !deviceToken) {
        return { valid: false, message: "Admin and device tokens are required" };
      }

      const adminParts = adminToken.split(".");
      if (adminParts.length !== 3) {
        return { valid: false, message: "Invalid admin token format" };
      }

      const deviceValid = this.validateDeviceToken(deviceToken);
      if (!deviceValid.valid) return { valid: false, message: deviceValid.error || "Invalid device token" };

      const payload = parseJwtPayload(adminToken);
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return { valid: false, message: "Admin token has expired" };
      }

      const role = (payload.role || payload.userRole || "").toUpperCase();
      if (!["ADMIN", "SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "STAFF"].includes(role)) {
        return { valid: false, message: "User does not have permission to manage alumni records" };
      }

      return {
        valid: true,
        user: {
          id: payload.userId || payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role || payload.userRole,
        },
      };
    } catch (error) {
      return { valid: false, message: error.message || "Authentication failed" };
    }
  }

  static validateDeviceToken(token) {
    try {
      const payload = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        return { valid: false, error: "Device token has expired" };
      }
      return { valid: true, payload };
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
  return { authenticated: true, user: validation.user };
};

const normalizeRecord = (record) => ({
  ...record,
  images: Array.isArray(record.images) ? record.images : [],
});

const parseBoolean = (value, fallback = true) => {
  if (value === null || value === undefined || value === "") return fallback;
  return value === "true" || value === "1" || value === true;
};

const readRecordForm = async (req) => {
  const formData = await req.formData();
  const section = (formData.get("section") || "ALUMNI").toString().trim();
  const name = (formData.get("name") || "").toString().trim();
  const position = (formData.get("position") || "").toString().trim();
  const description = (formData.get("description") || "").toString().trim();
  const displayOrder = Number(formData.get("displayOrder") || 0);
  const isActive = parseBoolean(formData.get("isActive"), true);

  if (!SECTIONS.has(section)) throw new Error("Invalid section");
  if (!name) throw new Error("Name is required");
  if (!Number.isFinite(displayOrder)) throw new Error("Display order must be a valid number");

  for (const file of [...formData.getAll("images"), formData.get("image")].filter(isFileUpload)) {
    const validation = validateSchoolImage(file);
    if (!validation.valid) throw new Error(validation.error);
  }

  const uploadedMain = await uploadSchoolImagesFromFormData(formData, "image", "school/alumni-governance");
  const uploadedImages = await uploadSchoolImagesFromFormData(formData, "images", "school/alumni-governance");

  const image = uploadedMain[0]?.url || (formData.get("existingImage") || "").toString().trim() || null;
  const existingImagesValue = formData.get("existingImages");
  let existingImages = [];
  if (existingImagesValue) {
    try {
      existingImages = JSON.parse(existingImagesValue.toString());
    } catch {
      existingImages = [];
    }
  }

  return {
    section,
    name,
    position: position || null,
    description: description || null,
    displayOrder: Math.floor(displayOrder),
    isActive,
    image,
    images: [
      ...existingImages.filter((item) => item?.url),
      ...uploadedImages,
    ],
  };
};

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const section = url.searchParams.get("section");
    const includeInactive = url.searchParams.get("includeInactive") === "1";

    const where = {};
    if (section) {
      if (!SECTIONS.has(section)) {
        return NextResponse.json({ success: false, error: "Invalid section" }, { status: 400 });
      }
      where.section = section;
    }
    if (!includeInactive) where.isActive = true;

    const records = await prisma.alumniGovernanceRecord.findMany({
      where,
      orderBy: [{ section: "asc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });

    const normalized = records.map(normalizeRecord);
    const grouped = normalized.reduce((acc, record) => {
      if (!acc[record.section]) acc[record.section] = [];
      acc[record.section].push(record);
      return acc;
    }, {});

    return NextResponse.json({ success: true, records: normalized, grouped });
  } catch (error) {
    console.error("GET alumni error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = authenticateWriteRequest(req);
    if (!auth.authenticated) return auth.response;

    const data = await readRecordForm(req);
    const record = await prisma.alumniGovernanceRecord.create({ data });

    return NextResponse.json({ success: true, record: normalizeRecord(record) }, { status: 201 });
  } catch (error) {
    console.error("POST alumni error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create record" }, { status: 400 });
  }
}
