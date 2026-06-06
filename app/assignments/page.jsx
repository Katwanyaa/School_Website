import { prisma } from "../../libs/prisma";
import { cleanGeneratedFileName } from "../../libs/displayNames";
import AcademicDownloadsPage from "../components/AcademicDownloadsPage";

export const metadata = {
  title: "Assignments | A.I.C Katwanyaa Senior School",
  description: "Download current assignments from A.I.C Katwanyaa Senior School.",
};

const fileFromUrl = (url) => ({
  url,
  name: cleanGeneratedFileName(url),
});

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
      ...(Array.isArray(assignment.assignmentFiles) ? assignment.assignmentFiles.map(fileFromUrl) : []),
      ...(Array.isArray(assignment.attachments) ? assignment.attachments.map(fileFromUrl) : []),
    ],
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
