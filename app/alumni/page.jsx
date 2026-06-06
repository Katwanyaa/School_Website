import { prisma } from "../../libs/prisma";
import { FiAward, FiBriefcase, FiUsers } from "react-icons/fi";

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

const orderedSections = ["ALUMNI", "BOM", "PTA", "PRINCIPAL_CURRENT", "PRINCIPAL_PREVIOUS"];

function RecordCard({ record, section }) {
  const images = Array.isArray(record.images) ? record.images.filter((image) => image?.url) : [];
  const primaryImage = record.image || images[0]?.url;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {primaryImage ? (
        <div className="flex h-72 items-center justify-center bg-slate-100">
          <img src={primaryImage} alt={record.name} className="h-full w-full object-contain" />
        </div>
      ) : (
        <div className="flex h-72 items-center justify-center bg-slate-100">
          <FiUsers className="text-5xl text-slate-300" />
        </div>
      )}
      <div className="p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-700">{section.eyebrow}</p>
        <h2 className="mt-2 text-xl font-black text-slate-950">{record.name}</h2>
        {record.position && (
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-400">{record.position}</p>
        )}
        {record.description && (
          <p className="mt-4 text-sm leading-7 text-slate-600">{record.description}</p>
        )}
        {images.length > 1 && (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {images.slice(0, 6).map((image, index) => (
              <div key={`${image.url}-${index}`} className="flex aspect-square items-center justify-center rounded-lg bg-slate-100">
                <img src={image.url} alt={image.altText || record.name} className="h-full w-full object-contain" />
              </div>
            ))}
          </div>
        )}
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
    if (!acc[record.section]) acc[record.section] = [];
    acc[record.section].push(record);
    return acc;
  }, {});

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
        {orderedSections.map((sectionKey) => {
          const section = SECTION_META[sectionKey];
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
              <div className={`grid gap-5 ${sectionKey === "PRINCIPAL_CURRENT" ? "lg:grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3"}`}>
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
