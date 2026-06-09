import { prisma } from "../../libs/prisma";
import { cleanGeneratedFileName } from "../../libs/displayNames";
import AcademicDownloadsPage from "../components/AcademicDownloadsPage";

export const metadata = {
  title: "Assignments | A.I.C Katwanyaa Senior School",
  description: "Download current assignments from A.I.C Katwanyaa Senior School.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const fileFromRecord = (file) => {
  if (!file) return null;
  if (typeof file === "string") {
    return {
      url: file,
      name: cleanGeneratedFileName(file),
    };
  }

  const url = file.url || file.downloadUrl || file.href;
  if (!url) return null;

  return {
    ...file,
    url,
    name: cleanGeneratedFileName(file.fileName || file.name || file.originalName || url),
  };
};

export default async function AssignmentsPage() {
  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: "desc" },
  });

  const items = assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    subject: assignment.subject,
    className: assignment.className,
    teacher: assignment.teacher,
    dateUploaded: assignment.createdAt,
    files: [
      ...(Array.isArray(assignment.assignmentFiles) ? assignment.assignmentFiles.map(fileFromRecord) : []),
      ...(Array.isArray(assignment.attachments) ? assignment.attachments.map(fileFromRecord) : []),
    ].filter(Boolean),
  }));

  return (
    <AcademicDownloadsPage
      title="Assignments"
      eyebrow="Academic Work"
      description="Browse and download assignments uploaded by the school. When an assignment contains several documents or images, use Download All to collect every file."
      items={items}
      type="assignments"
    />
  );
}
