"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiChevronDown,
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
  const cleanName = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  return `${cleanName || "staff"}-${id}`;
};

const normalizeText = (value = "") => value.toString().trim().toLowerCase();

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
  const role = normalizeText(staff?.role);
  const position = normalizeText(staff?.position);

  return (
    role.includes("principal") ||
    position.includes("principal") ||
    role.includes("senior teacher") ||
    position.includes("senior teacher") ||
    isHodValue(role) ||
    isHodValue(position)
  );
};

const leadershipRank = (staff) => {
  const role = normalizeText(staff?.role);
  const position = normalizeText(staff?.position);
  const combined = `${role} ${position}`;

  if (role === "principal" || position.includes("chief principal")) return 1;
  if (combined.includes("deputy") && combined.includes("academic")) return 2;
  if (combined.includes("deputy") && combined.includes("admin")) return 3;
  if (combined.includes("senior teacher")) return 4;
  if (isHodValue(combined)) return 5;
  return 10;
};

const getLeadershipImage = (staff) => {
  if (staff?.image) return staff.image;
  return staff?.gender === "female" ? "/female.png" : "/male.png";
};

const getDepartmentImage = (department) => {
  return department?.image || department?.images?.[0]?.url || "/teachers.png";
};

const getCategoryMeta = (category) => {
  return CATEGORY_META[category] || CATEGORY_META.TEACHING;
};

const getDepartmentSearchText = (department) => {
  const extra =
    department?.extra && typeof department.extra === "object"
      ? Object.values(department.extra).flat().join(" ")
      : "";

  return [
    department?.name,
    department?.category,
    department?.description,
    department?.headName,
    department?.assistantHeadName,
    extra,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const getLeadershipSearchText = (staff) => {
  return [
    staff?.name,
    staff?.role,
    staff?.position,
    staff?.department,
    staff?.bio,
    ...(Array.isArray(staff?.expertise) ? staff.expertise : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const StatPill = ({ icon: Icon, label, value, tone = "blue" }) => {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${tones[tone] || tones.blue}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-black leading-none text-slate-900">{value}</p>
        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
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

const LeadershipCard = ({ staff, viewMode }) => {
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

      const [staffResponse, departmentsResponse] = await Promise.all([
        fetch("/api/staff", { cache: "no-store" }),
        fetch("/api/staff/departments?grouped=1", { cache: "no-store" }),
      ]);

      if (!staffResponse.ok) {
        throw new Error(`Failed to fetch leadership profiles (${staffResponse.status})`);
      }

      if (!departmentsResponse.ok) {
        throw new Error(`Failed to fetch departments (${departmentsResponse.status})`);
      }

      const staffData = await staffResponse.json();
      const departmentData = await departmentsResponse.json();

      const publicLeadership = (staffData.staff || [])
        .filter(isLeadershipProfile)
        .sort((a, b) => leadershipRank(a) - leadershipRank(b) || (a.name || "").localeCompare(b.name || ""));

      const publicDepartments = (departmentData.departments || [])
        .filter((department) => department.isActive !== false)
        .sort((a, b) => {
          const categoryA = CATEGORY_ORDER.indexOf(a.category);
          const categoryB = CATEGORY_ORDER.indexOf(b.category);
          if (categoryA !== categoryB) return categoryA - categoryB;
          return (a.displayOrder || 0) - (b.displayOrder || 0) || (a.name || "").localeCompare(b.name || "");
        });

      setLeadership(publicLeadership);
      setDepartments(publicDepartments);
    } catch (err) {
      console.error("Error loading staff page:", err);
      setError(err.message || "Unable to load staff information");
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
    return leadership.filter((staff) => getLeadershipSearchText(staff).includes(query));
  }, [leadership, searchQuery, selectedFilter]);

  const filteredDepartments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesFilter = selectedFilter === "all" || department.category === selectedFilter;
      const matchesSearch = !query || getDepartmentSearchText(department).includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [departments, searchQuery, selectedFilter]);

  const departmentsByCategory = useMemo(() => {
    return CATEGORY_ORDER.reduce((acc, category) => {
      const items = filteredDepartments.filter((department) => department.category === category);
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
      counts[category] = departments.filter((department) => department.category === category).length;
    });
    return counts;
  }, [departments, leadership]);

  const totalDepartmentStaff = departments.reduce(
    (sum, department) => sum + (Number(department.staffCount) || 0),
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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
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
                <p className="text-sm font-black uppercase tracking-widest text-slate-900">Katz Staff</p>
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

      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="mb-6 overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-300">Staff Privacy Directory</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                School leadership profiles and department-based staff groups
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Individual public profiles are limited to leadership roles. Teaching and support teams are shown as department groups to protect staff privacy.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[520px]">
              <StatPill icon={FiUser} value={leadership.length} label="Leaders" tone="blue" />
              <StatPill icon={FiLayers} value={departments.length} label="Departments" tone="emerald" />
              <StatPill icon={FiUsers} value={totalDepartmentStaff} label="Grouped Staff" tone="amber" />
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

                {Object.entries(departmentsByCategory).map(([category, items]) => {
                  const meta = getCategoryMeta(category);
                  return (
                    <section key={category}>
                      <SectionHeader
                        icon={meta.icon}
                        title={meta.label}
                        subtitle={`${items.length} department group${items.length === 1 ? "" : "s"}`}
                      />
                      <div className={viewMode === "grid" ? "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
                        {items.map((department) => (
                          <DepartmentCard key={department.id} department={department} viewMode={viewMode} />
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
                  }}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
