import cloudinary from "./cloudinary";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const isFileUpload = (value) => {
  return (
    value &&
    typeof value === "object" &&
    typeof value.arrayBuffer === "function" &&
    typeof value.size === "number" &&
    value.size > 0
  );
};

export const validateSchoolImage = (file) => {
  if (!isFileUpload(file)) {
    return { valid: false, error: "No valid image file was uploaded" };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      valid: false,
      error: "Invalid image format. Only JPEG, PNG, WebP, and GIF are allowed.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: "Image size too large. Maximum size is 5MB.",
    };
  }

  return { valid: true };
};

const sanitizeFileName = (name = "image") => {
  const withoutExt = name.includes(".") ? name.slice(0, name.lastIndexOf(".")) : name;
  return withoutExt.replace(/[^a-zA-Z0-9.-]/g, "_") || "image";
};

const uploadImage = async (file, folder) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();
  const safeName = sanitizeFileName(file.name);

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        public_id: `${timestamp}-${safeName}`,
        transformation: [
          { width: 1200, height: 800, crop: "limit" },
          { quality: "auto:good" },
        ],
      },
      (error, uploadResult) => {
        if (error) reject(error);
        else resolve(uploadResult);
      }
    );

    uploadStream.end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    altText: file.name || null,
    caption: null,
  };
};

export const uploadSchoolImagesFromFormData = async (
  formData,
  fieldName,
  folder = "school_content"
) => {
  const files = formData.getAll(fieldName).filter(isFileUpload);
  const uploadedImages = [];

  for (const file of files) {
    const validation = validateSchoolImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    uploadedImages.push(await uploadImage(file, folder));
  }

  return uploadedImages;
};

const publicIdFromCloudinaryUrl = (url) => {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) {
    return null;
  }

  const urlParts = url.split("/");
  const uploadIndex = urlParts.indexOf("upload");
  if (uploadIndex === -1) return null;

  const pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");
  const withoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
  return withoutVersion.replace(/\.[^/.]+$/, "");
};

const normalizeImageItems = (images) => {
  if (!images) return [];
  return Array.isArray(images) ? images : [images];
};

export const deleteSchoolImages = async (images) => {
  const items = normalizeImageItems(images);

  for (const image of items) {
    const publicId =
      typeof image === "string"
        ? publicIdFromCloudinaryUrl(image)
        : image?.publicId || publicIdFromCloudinaryUrl(image?.url);

    if (!publicId) continue;

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Error deleting school image:", error);
    }
  }
};
