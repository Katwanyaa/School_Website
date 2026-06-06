import { prisma } from "../../libs/prisma";
import { cleanFileRecordName } from "../../libs/displayNames";
import AcademicDownloadsPage from "../components/AcademicDownloadsPage";

export const metadata = {
  title: "Learning Resources & Exams | A.I.C Katwanyaa Senior School",
  description: "Download learning resources, revision materials, past papers, exams, and academic content from A.I.C Katwanyaa Senior School.",
};

export default async function ResourcesExamsPage() {
  const resources = await prisma.resource.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const items = resources.map((resource) => ({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    subject: resource.subject,
    className: resource.className,
    teacher: resource.teacher,
    category: resource.category,
    dateUploaded: resource.createdAt,
    files: (Array.isArray(resource.files) ? resource.files : []).map((file) => ({
      ...file,
      name: cleanFileRecordName(file),
    })),
  }));

  return (
    <AcademicDownloadsPage
      title="Learning Resources & Exams"
      eyebrow="Resources, Revision, Past Papers & Exams"
      description="Access learning resources, revision materials, past papers, exams, and other academic content uploaded by the school."
      items={items}
      type="resources"
    />
  );
}
