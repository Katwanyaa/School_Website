"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiArrowLeft,
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiLayers,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";

const CATEGORY_META = {
  CBC: {
    label: "CBC Department",
    icon: FiBookOpen,
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    accent: "from-blue-600 to-cyan-600",
  },
  EIGHT_FOUR_FOUR: {
    label: "8-4-4 Department",
    icon: FiAward,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    accent: "from-amber-500 to-orange-600",
  },
  TEACHING: {
    label: "Teaching Department",
    icon: FiBriefcase,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accent: "from-emerald-500 to-teal-600",
  },
  SUPPORT: {
    label: "Support Department",
    icon: FiShield,
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    accent: "from-slate-700 to-slate-900",
  },
};

const getCategoryMeta = (category) => CATEGORY_META[category] || CATEGORY_META.TEACHING;

const getDepartmentImage = (department) => {
  return department?.image || department?.images?.[0]?.url || "/teachers.png";
};

const getTeacherImage = (teacher) => {
  if (teacher?.image) return teacher.image;
  return teacher?.gender === "female" ? "/female.png" : "/male.png";
};

const parseExtra = (extra) => {
  if (!extra) return {};
  if (typeof extra === "object") return extra;

  try {
    return JSON.parse(extra);
  } catch {
    return {};
  }
};

const formatKey = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
};

const formatValue = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (value && typeof value === "object") return Object.values(value).filter(Boolean).join(", ");
  return value?.toString() || "";
};

const DetailStat = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-1 truncate text-base font-black text-slate-900">{value || "Not listed"}</p>
      </div>
    </div>
  </div>
);

const TeacherCard = ({ teacher }) => (
  <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
    <div className="relative aspect-[4/3] bg-slate-100">
      <img
        src={getTeacherImage(teacher)}
        alt={teacher.name}
        className="h-full w-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
      {teacher.subjectOffered && (
        <span className="absolute bottom-3 left-3 right-3 rounded-full bg-white/95 px-3 py-1 text-center text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow">
          {teacher.subjectOffered}
        </span>
      )}
    </div>
    <div className="p-4">
      <h3 className="truncate text-base font-black text-slate-900">{teacher.name}</h3>
      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Teacher</p>
      {teacher.bio && (
        <p className="mt-3 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">
          {teacher.bio}
        </p>
      )}
    </div>
  </article>
);

export default function StaffDepartmentDetailPage() {
  const params = useParams();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/staff/departments/${params.id}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Department not found");
      }

      setDepartment(data.department);
    } catch (err) {
      console.error("Error loading department:", err);
      setError(err.message || "Unable to load department");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) fetchDepartment();
  }, [params?.id]);

  const extraDetails = useMemo(() => {
    const extra = parseExtra(department?.extra);
    return Object.entries(extra)
      .map(([key, value]) => [key, formatValue(value)])
      .filter(([, value]) => value);
  }, [department?.extra]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <FiRefreshCw className="mx-auto animate-spin text-4xl text-blue-600" />
          <p className="mt-4 text-sm font-black uppercase tracking-widest text-slate-500">Loading department</p>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <FiLayers className="mx-auto text-5xl text-red-300" />
          <h1 className="mt-4 text-2xl font-black text-slate-900">Department Unavailable</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{error || "This department could not be found."}</p>
          <Link
            href="/pages/staff"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-widest text-white"
          >
            <FiArrowLeft size={14} /> Back to Staff
          </Link>
        </div>
      </div>
    );
  }

  const meta = getCategoryMeta(department.category);
  const Icon = meta.icon;
  const teachers = Array.isArray(department.staff) ? department.staff : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <Link
          href="/pages/staff"
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <FiArrowLeft size={14} /> Staff Directory
        </Link>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* FULL IMAGE HERO SECTION - shows the entire image without cropping */}
          <div className="relative w-full">
            {/* Taller container on mobile, even taller on desktop to reveal full image */}
            <div className="relative h-[55vh] sm:h-[65vh] lg:h-[70vh] w-full bg-slate-900">
              <img
                src={getDepartmentImage(department)}
                alt={department.name}
                className="absolute inset-0 h-full w-full object-contain bg-slate-800"
                style={{ objectPosition: "center top" }}
              />
              {/* Fallback gradient for readability if image is bright */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </div>
            {/* Text overlay positioned over the bottom part of the image */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-10">
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-md ${meta.badge}`}
              >
                <Icon size={14} /> {meta.label}
              </span>
              <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight drop-shadow-lg sm:text-4xl lg:text-5xl">
                {department.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 drop-shadow-md sm:text-base">
                {department.description ||
                  "Department-level staff information is shared here without exposing individual private teacher details."}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {/* Stats grid - responsive: 1 column mobile, 2 on sm, 4 on lg */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <DetailStat icon={FiUsers} label="Teachers/Staff" value={`${department.staffCount || 0} members`} />
              <DetailStat icon={FiUser} label="Head of Department" value={department.headName} />
              <DetailStat icon={FiShield} label="AHOD" value={department.assistantHeadName} />
              <DetailStat icon={Icon} label="Category" value={meta.label} />
            </div>

            {/* Overview and Privacy Notice - stack on mobile, side by side on lg */}
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
              <section className="rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900">
                  <FiBookOpen className="text-blue-600" /> Department Overview
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  {department.description ||
                    "This department is managed as a grouped staff area for privacy. Public details focus on the department structure, responsibilities, and school-level service."}
                </p>
              </section>

              <section
                className={`rounded-2xl bg-gradient-to-br ${meta.accent} p-5 text-white sm:p-6`}
              >
                <h2 className="text-sm font-black uppercase tracking-widest">Privacy Notice</h2>
                <p className="mt-4 text-sm leading-7 text-white/85">
                  Individual teacher and support staff contact details are not published. Department
                  information is shared at group level.
                </p>
              </section>
            </div>

            {/* Extra details */}
            {extraDetails.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900">
                  <FiCheckCircle className="text-emerald-600" /> Additional Department Details
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {extraDetails.map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {formatKey(key)}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Teachers grid - responsive: 1 col mobile, 2 on sm, 3 on lg */}
            <section className="mt-8">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900">
                <FiUsers className="text-emerald-600" /> Department Teachers
              </h2>
              {teachers.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {teachers.map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-sm font-semibold text-slate-500">
                    Teachers assigned to this department will appear here after upload.
                  </p>
                </div>
              )}
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}