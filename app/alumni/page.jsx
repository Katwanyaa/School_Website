import { prisma } from "../../libs/prisma";
import { FiAward, FiBriefcase, FiImage, FiUsers } from "react-icons/fi";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Alumni & Governance | A.I.C Katwanyaa Senior School",
  description: "Alumni galleries, Board of Management, PTA members, and principal leadership at A.I.C Katwanyaa Senior School.",
};

const SECTION_META = {
  ALUMNI: {
    title: "Alumni Gallery",
    eyebrow: "Former Students",
    icon: FiAward,
  },
  COMMITTEE: {
    title: "Committee Members",
    eyebrow: "School Committees",
    icon: FiBriefcase,
  },
  BOM: {
    title: "Board of Management",
    eyebrow: "Governance",
    icon: FiBriefcase,
  },
  PTA: {
    title: "PTA Members",
    eyebrow: "Parent Leadership",
    icon: FiUsers,
  },
  PRINCIPAL_CURRENT: {
    title: "Current Principal",
    eyebrow: "School Leadership",
    icon: FiAward,
  },
  PRINCIPAL_PREVIOUS: {
    title: "Previous Principals",
    eyebrow: "Leadership History",
    icon: FiUsers,
  },
};

const orderedSections = ["ALUMNI", "COMMITTEE", "BOM", "PTA", "PRINCIPAL_CURRENT", "PRINCIPAL_PREVIOUS"];

const normalizeSectionKey = (section = "") => section.toString().trim().toUpperCase().replace(/[\s-]+/g, "_");

const normalizeImageItem = (image, fallbackAlt) => {
  if (!image) return null;
  if (typeof image === "string") return image.trim() ? { url: image.trim(), altText: fallbackAlt } : null;
  const url = image.url || image.secure_url || image.preview;
  if (!url) return null;
  return {
    ...image,
    url,
    altText: image.altText || image.alt || fallbackAlt,
  };
};

const normalizeImages = (record) => {
  const seen = new Set();
  const related = (Array.isArray(record.images) ? record.images : [])
    .map((image) => normalizeImageItem(image, record.name))
    .filter((image) => {
      if (!image?.url || seen.has(image.url)) return false;
      seen.add(image.url);
      return true;
    });

  const primary = record.image ? normalizeImageItem(record.image, record.name) : null;
  if (primary?.url && !seen.has(primary.url)) {
    return [primary, ...related];
  }
  return related;
};

function RecordCard({ record, section }) {
  const images = normalizeImages(record);
  const primaryImage = record.image || images[0]?.url;
  const BadgeIcon = section.icon || FiUsers;

  return (
    <article className="grid w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.25fr)]">
      <div className="relative min-h-[260px] bg-slate-100 sm:min-h-[340px] lg:min-h-full">
        {primaryImage ? (
          <img src={primaryImage} alt={record.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <FiUsers className="text-5xl text-slate-300" />
          </div>
        )}

        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-700 shadow-sm">
            <BadgeIcon className="text-xs" /> {section.eyebrow}
          </span>
        </div>

        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-white">
          <FiImage className="text-[11px]" /> {images.length}
        </div>

        {images.length > 1 && (
          <div className="absolute inset-x-3 bottom-3 flex gap-2 overflow-x-auto rounded-xl bg-slate-950/65 p-2 backdrop-blur-md">
            {images.slice(0, 6).map((image, index) => (
              <span key={`${image.url}-overlay-${index}`} className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-white/25">
                <img src={image.url} alt={image.altText || `${record.name} ${index + 1}`} className="h-full w-full object-cover" />
              </span>
            ))}
            {images.length > 6 && (
              <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-white/15 text-xs font-black text-white">
                +{images.length - 6}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex min-h-[300px] flex-col p-5 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-700">{section.eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">{record.name}</h2>
        {record.position && (
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-400">{record.position}</p>
        )}
        {record.description && (
          <p className="mt-4 text-sm font-medium leading-7 text-slate-600">{record.description}</p>
        )}
        {images.length > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {images.slice(0, 6).map((image, index) => (
              <div key={`${image.url}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <img src={image.url} alt={image.altText || record.name} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">{section.title}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            <FiImage /> {images.length} {images.length === 1 ? "photo" : "photos"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default async function AlumniPage() {
  const records = await prisma.alumniGovernanceRecord.findMany({
    where: { isActive: true },
    orderBy: [{ section: "asc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
  });

  const grouped = records.reduce((acc, record) => {
    const sectionKey = normalizeSectionKey(record.section);
    if (!acc[sectionKey]) acc[sectionKey] = [];
    acc[sectionKey].push(record);
    return acc;
  }, {});
  const sectionsToRender = [
    ...orderedSections,
    ...Object.keys(grouped).filter((sectionKey) => !orderedSections.includes(sectionKey)),
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-700">Katwanyaa Community</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Alumni & Governance</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Alumni moments, school governance, PTA leadership, and the principals who have shaped A.I.C Katwanyaa Senior School.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {sectionsToRender.map((sectionKey) => {
          const section = SECTION_META[sectionKey] || {
            title: sectionKey.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
            eyebrow: "School Community",
            icon: FiUsers,
          };
          const sectionRecords = grouped[sectionKey] || [];
          const Icon = section.icon;
          if (sectionRecords.length === 0) return null;

          return (
            <section key={sectionKey}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-white">
                  <Icon />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-700">{section.eyebrow}</p>
                  <h2 className="text-2xl font-black text-slate-950">{section.title}</h2>
                </div>
              </div>
              <div className="grid gap-5 rounded-2xl bg-slate-100 p-3 sm:p-4">
                {sectionRecords.map((record) => (
                  <RecordCard key={record.id} record={record} section={section} />
                ))}
              </div>
            </section>
          );
        })}

        {records.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <FiUsers className="mx-auto text-5xl text-slate-300" />
            <h2 className="mt-4 text-xl font-black text-slate-950">No alumni records published yet</h2>
            <p className="mt-2 text-sm text-slate-500">Published alumni and governance records will appear here.</p>
          </div>
        )}
      </div>
    </main>
  );
}
