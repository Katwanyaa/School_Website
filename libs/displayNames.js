export const cleanGeneratedFileName = (value = "download") => {
  if (!value || typeof value !== "string") return "download";

  const withoutQuery = value.split("?")[0].split("#")[0];
  const lastSegment = decodeURIComponent(withoutQuery.split("/").pop() || value);
  const normalized = lastSegment.replace(/\s+/g, "_");

  return normalized
    .replace(/^\d{10,}[-_]+/, "")
    .replace(/^[a-f0-9]{8,}[-_]+/i, "")
    .replace(/^file[-_]+/i, "")
    || "download";
};

export const cleanFileRecordName = (file = {}) => {
  return cleanGeneratedFileName(file.fileName || file.name || file.url || "download");
};
