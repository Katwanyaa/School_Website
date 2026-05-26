'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiGrid,
  FiLayers,
  FiList,
  FiMenu,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

const CATEGORY_META = {
  CBC: {
    label: "CBC Department",
    shortLabel: "CBC",
    icon: FiBookOpen,
    color: "blue",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    panel: "from-blue-50 to-white border-blue-100",
  },
  EIGHT_FOUR_FOUR: {
    label: "8-4-4 Department",
    shortLabel: "8-4-4",
    icon: FiAward,
    color: "amber",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    panel: "from-amber-50 to-white border-amber-100",
  },
  TEACHING: {
    label: "Teaching Department",
    shortLabel: "Teaching",
    icon: FiBriefcase,
    color: "emerald",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    panel: "from-emerald-50 to-white border-emerald-100",
  },
  SUPPORT: {
    label: "Support Department",
    shortLabel: "Support",
    icon: FiShield,
    color: "slate",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    panel: "from-slate-50 to-white border-slate-100",
  },
};

const FILTERS = [
  { id: "all", label: "All Staff Areas", icon: FiLayers },
  { id: "leadership", label: "Leadership Profiles", icon: FiUser },
  { id: "CBC", label: "CBC Departments", icon: FiBookOpen },
  { id: "EIGHT_FOUR_FOUR", label: "8-4-4 Departments", icon: FiAward },
  { id: "TEACHING", label: "Teaching Departments", icon: FiBriefcase },
  { id: "SUPPORT", label: "Support Departments", icon: FiShield },
];

const CATEGORY_ORDER = ["CBC", "EIGHT_FOUR_FOUR", "TEACHING", "SUPPORT"];

const generateSlug = (name = "staff", id = "") => {
  const safeName = name == null ? "staff" : String(name);
  const cleanName = safeName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  return `${cleanName || "staff"}-${id}`;
};

const normalizeText = (value) => {
  if (value == null) return "";
  return String(value).trim().toLowerCase();
};

const isHodValue = (value = "") => {
  const normalized = normalizeText(value);
  return (
    normalized === "hod" ||
    normalized === "ahod" ||
    normalized.includes("head of department") ||
    normalized.includes("assistant head of department")
  );
};

const isLeadershipProfile = (staff) => {
  if (!staff) return false;
  
  const role = normalizeText(staff?.role);
  const position = normalizeText(staff?.position);
  const combined = `${role} ${position}`;

  // Check for leadership keywords
  if (
    role.includes("principal") ||
    position.includes("principal") ||
    role.includes("deputy principal") ||
    position.includes("deputy principal") ||
    role.includes("senior teacher") ||
    position.includes("senior teacher") ||
    role.includes("hod") ||
    position.includes("hod") ||
    isHodValue(role) ||
    isHodValue(position)
  ) {
    return true;
  }
  
  return false;
};

const leadershipRank = (staff) => {
  if (!staff) return 10;
  
  const role = normalizeText(staff?.role);
  const position = normalizeText(staff?.position);
  const combined = `${role || ''} ${position || ''}`;

  if (role === "principal" || (position && position.includes("principal"))) return 1;
  if (combined.includes("deputy principal") && combined.includes("academic")) return 2;
  if (combined.includes("deputy principal") && combined.includes("admin")) return 3;
  if (combined.includes("senior teacher")) return 4;
  if (isHodValue(combined)) return 5;
  return 10;
};

const getLeadershipImage = (staff) => {
  if (!staff) return "/male.png";
  if (staff?.image && staff.image !== "/images/avata/male.png" && staff.image !== "/images/avata/female.png") {
    return staff.image;
  }
  return staff?.gender === "female" ? "/female.png" : "/male.png";
};

const getDepartmentImage = (department) => {
  if (!department) return "/teachers.png";
  return department?.image || department?.images?.[0]?.url || "/teachers.png";
};

const getCategoryMeta = (category) => {
  return CATEGORY_META[category] || CATEGORY_META.TEACHING;
};

const getDepartmentSearchText = (department) => {
  if (!department) return "";
  
  const extra =
    department?.extra && typeof department.extra === "object"
      ? Object.values(department.extra).flat().join(" ")
      : "";
  const teacherText = Array.isArray(department?.staff)
    ? department.staff.map((teacher) => [teacher.name, teacher.subjectOffered, teacher.bio].filter(Boolean).join(" ")).join(" ")
    : "";

  return [
    department?.name,
    department?.category,
    department?.description,
    department?.headName,
    department?.assistantHeadName,
    teacherText,
    extra,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const getLeadershipSearchText = (staff) => {
  if (!staff) return "";
  
  return [
    staff?.name,
    staff?.role,
    staff?.position,
    staff?.department,
    staff?.bio,
    ...(Array.isArray(staff?.expertise) ? staff.expertise : []),
    ...(Array.isArray(staff?.achievements) ? staff.achievements : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const StatPill = ({ icon: Icon, value, label, tone }) => {
  const tones = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${tones[tone]} min-w-0`}>
      <div className="shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex flex-col">
        <span className="text-lg font-black leading-none tracking-tight truncate">
          {value ?? 0}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-70 truncate">
          {label}
        </span>
      </div>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-5 flex items-center gap-3">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
      <Icon size={19} />
    </div>
    <div className="min-w-0">
      <h2 className="text-xl font-black tracking-tight text-slate-900">{title}</h2>
      <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{subtitle}</p>
    </div>
    <div className="hidden h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent sm:block" />
  </div>
);

const DepartmentIntro = ({ departments, totalStaff }) => {
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const previewDepartments = safeDepartments.slice(0, 4);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-2xl ring-1 ring-slate-900/10 backdrop-blur-sm">
      <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
        <div className="p-6 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-blue-700">
            <FiLayers size={14} />
            Department Groups
          </div>
          <h2 className="max-w-2xl text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
            Teaching and support staff are shown by department for privacy
          </h2>
          <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-600">
            The school admin manages each department with its own image, public description, HOD, AHOD where needed, and staff count. This keeps the Staff page useful while avoiding public exposure of every individual teacher or support staff member.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatPill icon={FiLayers} value={safeDepartments.length} label="Departments" tone="blue" />
            <StatPill icon={FiUsers} value={totalStaff} label="Grouped Staff" tone="emerald" />
            <StatPill icon={FiShield} value="Private" label="Contacts" tone="slate" />
            <StatPill icon={FiBookOpen} value="Custom" label="Descriptions" tone="amber" />
          </div>
        </div>

        <div className="grid min-h-[260px] grid-cols-2 gap-2 bg-slate-950 p-3">
          {previewDepartments.length > 0 ? (
            previewDepartments.map((department, index) => (
              <div key={department?.id || index} className="relative overflow-hidden rounded-xl bg-slate-800">
                <img
                  src={getDepartmentImage(department)}
                  alt={department?.name || "Department"}
                  className="h-full min-h-[118px] w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-3 right-3 line-clamp-2 text-xs font-black leading-tight text-white">
                  {department?.name || "Department"}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-2 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-xs font-bold leading-6 text-slate-300">
                Department images uploaded by the admin will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const LeadershipCard = ({ staff, viewMode }) => {
  if (!staff) return null;
  
  const title = staff.position || staff.role || "School Leadership";
  const profileHref = `/pages/staff/${staff.id}/${generateSlug(staff.name, staff.id)}`;

  if (viewMode === "list") {
    return (
      <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <img
          src={getLeadershipImage(staff)}
          alt={staff.name}
          className="h-24 w-24 shrink-0 rounded-xl object-cover object-top"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">{title}</p>
          <h3 className="mt-1 text-lg font-black text-slate-900">{staff.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {staff.bio || "Part of the school leadership team guiding academic and student development."}
          </p>
        </div>
        <Link
          href={profileHref}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white"
        >
          Profile <FiArrowRight size={14} />
        </Link>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-slate-100">
        <img
          src={getLeadershipImage(staff)}
          alt={staff.name}
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-flex rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 shadow">
            {title}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-black leading-tight text-slate-900">{staff.name}</h3>
        <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-slate-600">
          {staff.bio || "Part of the school leadership team guiding academic and student development."}
        </p>
        <Link
          href={profileHref}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white"
        >
          View Profile <FiArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
};

const DepartmentCard = ({ department, viewMode }) => {
  if (!department) return null;
  
  const meta = getCategoryMeta(department.category);
  const Icon = meta.icon;
  const href = `/pages/staff/departments/${department.id}`;

  if (viewMode === "list") {
    return (
      <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <img
          src={getDepartmentImage(department)}
          alt={department.name}
          className="h-28 w-full rounded-xl object-cover sm:w-36"
        />
        <div className="min-w-0 flex-1">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${meta.badge}`}>
            <Icon size={12} /> {meta.label}
          </span>
          <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900">{department.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {department.description || "Department group details are maintained at department level for staff privacy."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
            {department.headName && <span>HOD: {department.headName}</span>}
            {department.assistantHeadName && <span>AHOD: {department.assistantHeadName}</span>}
            <span>{department.staffCount || 0} staff</span>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white"
        >
          View Department <FiArrowRight size={14} />
        </Link>
      </article>
    );
  }

  return (
    <article className={`overflow-hidden rounded-xl border bg-gradient-to-br ${meta.panel} shadow-sm`}>
      <div className="relative aspect-[16/10] bg-slate-100">
        <img
          src={getDepartmentImage(department)}
          alt={department.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
        <span className={`absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-widest ${meta.badge}`}>
          <Icon size={12} /> {meta.shortLabel}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-black tracking-tight text-slate-900">{department.name}</h3>
        <p className="mt-2 line-clamp-3 min-h-[4rem] text-sm leading-relaxed text-slate-600">
          {department.description || "Department group details are maintained at department level for staff privacy."}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/80 p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">HOD</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-800">{department.headName || "Not listed"}</p>
          </div>
          <div className="rounded-xl bg-white/80 p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Staff</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{department.staffCount || 0} members</p>
          </div>
          {department.assistantHeadName && (
            <div className="col-span-2 rounded-xl bg-white/80 p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">AHOD</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-800">{department.assistantHeadName}</p>
            </div>
          )}
        </div>
        <Link
          href={href}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white"
        >
          View Department <FiArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
};

const getTeacherImage = (teacher) => {
  if (teacher?.image && teacher.image !== "/images/avata/male.png" && teacher.image !== "/images/avata/female.png") {
    return teacher.image;
  }
  return teacher?.gender === "female" ? "/female.png" : "/male.png";
};

const TeacherCard = ({ teacher }) => (
  <article className="snap-start shrink-0 w-[240px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
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
      <h4 className="truncate text-base font-black text-slate-900">{teacher.name}</h4>
      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
        Teacher
      </p>
      {teacher.bio && (
        <p className="mt-3 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">
          {teacher.bio}
        </p>
      )}
    </div>
  </article>
);

const DepartmentTeacherCarousel = ({ department, viewMode }) => {
  const scrollRef = useRef(null);
  const autoScrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const teachers = Array.isArray(department?.staff) ? department.staff : [];
  const meta = getCategoryMeta(department?.category);
  const Icon = meta.icon;
  const href = `/pages/staff/departments/${department?.id}`;

  const scrollBy = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!teachers.length || isHovered) return;

    autoScrollRef.current = window.setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
      const nextPosition = scrollLeft + clientWidth * 0.9;
      if (nextPosition + clientWidth >= scrollWidth - 2) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollTo({ left: nextPosition, behavior: "smooth" });
      }
    }, 4200);

    return () => window.clearInterval(autoScrollRef.current);
  }, [teachers.length, isHovered]);

  if (!department) return null;

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        <DepartmentCard department={department} viewMode={viewMode} />
        {teachers.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-2xl ring-1 ring-slate-900/10 backdrop-blur-sm">
      <div className="overflow-hidden rounded-t-[2rem]">
        <div className="relative aspect-[16/9] bg-slate-100">
          <img
            src={getDepartmentImage(department)}
            alt={department.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900">
              <Icon size={12} /> {meta.shortLabel}
            </span>
            <h3 className="text-3xl font-black tracking-tight sm:text-4xl">{department.name}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
              {department.description || "Department profile maintained by the school administration."}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Assigned Staff</p>
            <h4 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              {teachers.length ? `${teachers.length} teacher${teachers.length === 1 ? "" : "s"}` : "No teachers assigned yet"}
            </h4>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Swipe or use the controls to preview the current department team in a smooth carousel.
            </p>
          </div>
          <Link
            href={href}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
          >
            View Department <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm shadow-sm ring-1 ring-slate-200">
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500">HOD</p>
            <p className="mt-2 font-black text-slate-900">{department.headName || "Not listed"}</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm shadow-sm ring-1 ring-slate-200">
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500">Teachers</p>
            <p className="mt-2 font-black text-slate-900">{teachers.length}</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4 text-sm shadow-sm ring-1 ring-slate-200">
            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500">Department</p>
            <p className="mt-2 font-black text-slate-900">{meta.label}</p>
          </div>
        </div>

        {teachers.length > 0 ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-[1.75rem] bg-slate-100 px-4 py-3 shadow-sm ring-1 ring-slate-200">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Teacher Carousel</p>
                <p className="mt-1 text-xs text-slate-500">Auto-scrolls every few seconds. Hover to pause.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                  aria-label={`Previous ${department.name} teachers`}
                >
                  <FiChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                  aria-label={`Next ${department.name} teachers`}
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3 touch-pan-x scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300/80"
            >
              {teachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 flex min-h-[250px] items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="max-w-sm text-sm font-semibold leading-relaxed text-slate-500">
              Teachers uploaded from the dashboard will appear here after they are linked to this department.
            </p>
          </div>
        )}
      </div>
    </article>
  );
};

const SkeletonGrid = ({ viewMode }) => (
  <div className={viewMode === "grid" ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
        <div className="aspect-[16/10] rounded-xl bg-slate-200" />
        <div className="mt-4 h-5 w-2/3 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-full rounded bg-slate-100" />
        <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
      </div>
    ))}
  </div>
);

export default function StaffDirectory() {
  const [leadership, setLeadership] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchStaffPageData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      // Fetch staff data
      const staffResponse = await fetch("/api/staff", { cache: "no-store" });
      
      let staffData = { staff: [] };
      let departmentData = { departments: [] };

      // Parse staff data
      if (staffResponse.ok) {
        const staffJson = await staffResponse.json();
        if (staffJson && staffJson.success && Array.isArray(staffJson.staff)) {
          staffData = staffJson;
        } else if (Array.isArray(staffJson)) {
          staffData = { staff: staffJson };
        } else if (staffJson && Array.isArray(staffJson.staff)) {
          staffData = staffJson;
        } else {
          staffData = { staff: [] };
        }
      } else {
        console.error(`Staff API returned ${staffResponse.status}`);
        staffData = { staff: [] };
      }

      // Try to fetch departments, but don't fail if it doesn't work
      try {
        const departmentsResponse = await fetch("/api/staff/departments?grouped=1&includeStaff=1", { cache: "no-store" });
        if (departmentsResponse.ok) {
          const departmentsJson = await departmentsResponse.json();
          if (departmentsJson && departmentsJson.success && Array.isArray(departmentsJson.departments)) {
            departmentData = departmentsJson;
          } else if (Array.isArray(departmentsJson)) {
            departmentData = { departments: departmentsJson };
          } else if (departmentsJson && Array.isArray(departmentsJson.departments)) {
            departmentData = departmentsJson;
          }
        }
      } catch (deptError) {
        console.warn("Could not fetch departments:", deptError);
        // Continue without departments
      }

      // Filter leadership profiles
      const allStaff = staffData.staff || [];
      const publicLeadership = allStaff
        .filter(staff => staff && isLeadershipProfile(staff))
        .sort((a, b) => {
          const rankA = leadershipRank(a);
          const rankB = leadershipRank(b);
          if (rankA !== rankB) return rankA - rankB;
          return (a?.name || "").localeCompare(b?.name || "");
        });

      // Process departments
      const allDepartments = departmentData.departments || [];
      const publicDepartments = allDepartments
        .filter((department) => department && department.isActive !== false)
        .sort((a, b) => {
          const categoryA = CATEGORY_ORDER.indexOf(a?.category);
          const categoryB = CATEGORY_ORDER.indexOf(b?.category);
          if (categoryA !== categoryB) return categoryA - categoryB;
          return (a?.displayOrder || 0) - (b?.displayOrder || 0) || (a?.name || "").localeCompare(b?.name || "");
        });

      setLeadership(publicLeadership);
      setDepartments(publicDepartments);
      
      if (publicLeadership.length === 0 && publicDepartments.length === 0) {
        setError("No staff or department data available. Please check your API endpoints.");
      }
    } catch (err) {
      console.error("Error loading staff page:", err);
      setError(err.message || "Unable to load staff information. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaffPageData();
  }, []);

  const filteredLeadership = useMemo(() => {
    if (!["all", "leadership"].includes(selectedFilter)) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return leadership;
    return leadership.filter((staff) => staff && getLeadershipSearchText(staff).includes(query));
  }, [leadership, searchQuery, selectedFilter]);

  const filteredDepartments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return departments.filter((department) => {
      if (!department) return false;
      const matchesFilter = selectedFilter === "all" || department.category === selectedFilter;
      const matchesSearch = !query || getDepartmentSearchText(department).includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [departments, searchQuery, selectedFilter]);

  const departmentsByCategory = useMemo(() => {
    return CATEGORY_ORDER.reduce((acc, category) => {
      const items = filteredDepartments.filter((department) => department && department.category === category);
      if (items.length) acc[category] = items;
      return acc;
    }, {});
  }, [filteredDepartments]);

  const filterCounts = useMemo(() => {
    const counts = {
      all: leadership.length + departments.length,
      leadership: leadership.length,
    };
    CATEGORY_ORDER.forEach((category) => {
      counts[category] = departments.filter((department) => department && department.category === category).length;
    });
    return counts;
  }, [departments, leadership]);

  const totalDepartmentStaff = departments.reduce(
    (sum, department) => sum + (Number(department?.staffCount) || 0),
    0
  );
  const filteredDepartmentStaff = filteredDepartments.reduce(
    (sum, department) => sum + (Number(department?.staffCount) || 0),
    0
  );

  const hasResults = filteredLeadership.length > 0 || filteredDepartments.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      {isSidebarOpen && (
        <button
          aria-label="Close filters"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[80%] items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open filters"
            >
              <FiMenu size={21} />
            </button>
            <Link href="/" className="flex items-center gap-3">
              <img src="/katz.jpeg" alt="School logo" className="h-10 w-10 rounded-xl object-contain" />
              <div className="hidden sm:block">
                <p className="text-sm font-black uppercase tracking-widest text-slate-900">Katwanyaa Senior Staff</p>
                <p className="text-[10px] font-bold text-slate-400">Leadership and departments</p>
              </div>
            </Link>
          </div>

          <div className="hidden max-w-lg flex-1 md:block">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search leadership or departments..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label="Clear search"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStaffPageData(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm disabled:opacity-60"
            >
              <FiRefreshCw className={refreshing ? "animate-spin text-blue-600" : ""} size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="hidden rounded-xl border border-slate-200 bg-white p-1 sm:flex">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-slate-500"}`}
                aria-label="Grid view"
              >
                <FiGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "text-slate-500"}`}
                aria-label="List view"
              >
                <FiList size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full px-4 py-6 md:max-w-[80%] lg:max-w-[80%]">
        <section className="mb-6 overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl ring-1 ring-slate-950/10 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Department Staff Directory
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Teaching and support staff are shown by department for privacy.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-wrap lg:justify-end lg:gap-4">
              <StatPill icon={FiUser} value={leadership.length} label="Leaders" tone="blue" />
              <StatPill icon={FiLayers} value={departments.length} label="Depts" tone="emerald" />
              <StatPill icon={FiUsers} value={totalDepartmentStaff} label="Staff" tone="amber" />
              <StatPill icon={FiShield} value="Private" label="Contacts" tone="slate" />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-xl transition-transform lg:static lg:z-auto lg:w-72 lg:translate-x-0 lg:border-r-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="sticky top-20 space-y-4">
              <div className="flex items-center justify-between lg:hidden">
                <p className="text-xs font-black uppercase tracking-widest text-slate-900">Filters</p>
                <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg bg-slate-100 p-2 text-slate-600">
                  <FiX size={18} />
                </button>
              </div>

              <div className="md:hidden">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-900 p-4 text-white">
                  <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                    <FiFilter size={15} /> Directory View
                  </h2>
                </div>
                <div className="space-y-1 p-2">
                  {FILTERS.map((filter) => {
                    const Icon = filter.icon;
                    const active = selectedFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setSelectedFilter(filter.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition ${
                          active ? "bg-blue-600 text-white shadow" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-tight">
                          <Icon size={15} /> {filter.label}
                        </span>
                        <span className={`rounded-md px-2 py-1 text-[10px] font-black ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                          {filterCounts[filter.id] || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(searchQuery || selectedFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  <FiX size={14} /> Reset Filters
                </button>
              )}
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Staff Directory</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Showing {filteredLeadership.length} leadership profiles and {filteredDepartments.length} departments
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <select
                  value={selectedFilter}
                  onChange={(event) => setSelectedFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-xs font-black uppercase tracking-widest text-slate-700 outline-none focus:border-blue-500"
                >
                  {FILTERS.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                      {filter.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
                <p className="font-bold">Unable to load staff information</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <SkeletonGrid viewMode={viewMode} />
            ) : hasResults ? (
              <div className="space-y-10">
                {filteredLeadership.length > 0 && (
                  <section>
                    <SectionHeader
                      icon={FiUser}
                      title="School Leadership"
                      subtitle="Individual profiles for approved leadership roles"
                    />
                    <div className={viewMode === "grid" ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
                      {filteredLeadership.map((staff) => (
                        <LeadershipCard key={staff.id} staff={staff} viewMode={viewMode} />
                      ))}
                    </div>
                  </section>
                )}

                {filteredDepartments.length > 0 && selectedFilter !== "leadership" && (
                  <DepartmentIntro departments={filteredDepartments} totalStaff={filteredDepartmentStaff} />
                )}

                {Object.entries(departmentsByCategory).map(([category, items]) => {
                  const meta = getCategoryMeta(category);
                  return (
                    <section key={category}>
                      <SectionHeader
                        icon={meta.icon}
                        title={meta.label}
                        subtitle={`${items.length} department group${items.length === 1 ? "" : "s"}`}
                      />
                      <div className="space-y-5">
                        {items.map((department) => (
                          <DepartmentTeacherCarousel key={department.id} department={department} viewMode={viewMode} />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                <FiSearch className="mx-auto text-4xl text-slate-300" />
                <h3 className="mt-4 text-xl font-black text-slate-900">No matching staff areas found</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                  Try clearing the search or selecting another department category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                    fetchStaffPageData();
                  }}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}