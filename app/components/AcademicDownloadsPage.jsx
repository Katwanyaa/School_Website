"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiArchive, FiBookOpen, FiCheckCircle, FiDownload, FiEye, FiExternalLink, FiFileText, FiFilter, FiSearch, FiX } from "react-icons/fi";
import { cleanFileRecordName } from "../../libs/displayNames";

const formatDate = (value) => {
  if (!value) return "Not listed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not listed";
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const normalizeFiles = (files = []) => {
  return files
    .map((file) => {
      if (!file) return null;
      if (typeof file === "string") {
        return {
          url: file,
          name: cleanFileRecordName({ url: file }),
        };
      }

      const url = file.url || file.downloadUrl || file.href;
      if (!url) return null;

      return {
        ...file,
        url,
        name: cleanFileRecordName({ ...file, url }),
      };
    })
    .filter(Boolean);
};

const triggerBrowserDownload = (url, fileName) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName || "download";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

const openDownload = async (file) => {
  const fileName = file.name || "download";

  try {
    const response = await fetch(file.url);
    if (!response.ok) throw new Error("Unable to fetch file");

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    triggerBrowserDownload(blobUrl, fileName);
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    triggerBrowserDownload(file.url, fileName);
  }
};

const downloadAll = (files) => {
  normalizeFiles(files).forEach((file, index) => {
    window.setTimeout(() => openDownload(file), index * 250);
  });
};

export default function AcademicDownloadsPage({
  title,
  eyebrow,
  description,
  items = [],
  type = "assignments",
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedItem, setSelectedItem] = useState(null);

  const pageInstructions = type === "assignments"
    ? [
        "Download the assignment files for your class and read every instruction before you begin.",
        "Plan your time early, complete the work honestly, and submit it according to your teacher's guidance.",
        "Use the filters to quickly find assignments by subject, class, or upload date.",
      ]
    : [
        "Use these materials for steady revision, exam preparation, and independent study.",
        "Start with your class resources, then use past papers and revision files to test your understanding.",
        "Download all related files when a resource has several documents or images.",
      ];

  const subjects = useMemo(() => {
    const values = items
      .map((item) => item.subject)
      .filter((subject) => subject && subject.toLowerCase() !== "general");
    return ["all", ...Array.from(new Set(values))];
  }, [items]);

  const classes = useMemo(() => {
    const values = items.map((item) => item.className).filter(Boolean);
    return ["all", ...Array.from(new Set(values))];
  }, [items]);

  const filteredItems = useMemo(() => {
    const text = query.trim().toLowerCase();
    return items
      .filter((item) => {
      const matchesSubject = selectedCategory === "all" || item.subject === selectedCategory;
      const matchesClass = selectedClass === "all" || item.className === selectedClass;
      const haystack = [
        item.title,
        item.description,
        item.subject,
        item.className,
        item.teacher,
        item.category,
      ].filter(Boolean).join(" ").toLowerCase();
      return matchesSubject && matchesClass && (!text || haystack.includes(text));
    })
      .sort((a, b) => {
        const aDate = new Date(a.dateUploaded || 0).getTime();
        const bDate = new Date(b.dateUploaded || 0).getTime();
        if (sortOrder === "oldest") return aDate - bDate;
        if (sortOrder === "title") return (a.title || "").localeCompare(b.title || "");
        return bDate - aDate;
      });
  }, [items, query, selectedCategory, selectedClass, sortOrder]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-700">{eyebrow}</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {title}
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-blue-900">
              {type === "assignments" ? <FiFileText size={22} /> : <FiBookOpen size={22} />}
              <div>
                <p className="text-2xl font-black">{items.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest">Published Items</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <FiCheckCircle className="text-blue-700" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">
                  Instructions
                </h2>
              </div>
              <div className="space-y-2">
                {pageInstructions.map((instruction) => (
                  <p key={instruction} className="text-sm font-semibold leading-6 text-slate-600">
                    {instruction}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-blue-100 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <FiFilter className="text-blue-700" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">
                  Filter Materials
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${title.toLowerCase()}`}
                className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject === "all" ? "All Subjects" : subject}
                </option>
              ))}
            </select>
                <select
                  value={selectedClass}
                  onChange={(event) => setSelectedClass(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {classes.map((className) => (
                    <option key={className} value={className}>
                      {className === "all" ? "All Classes/Forms" : className}
                    </option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-500">
                Showing {filteredItems.length} of {items.length} published item{items.length === 1 ? "" : "s"}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest">Title</th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest">Description</th>
                  <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest">Date Uploaded</th>
                  <th className="px-4 py-4 text-right text-xs font-black uppercase tracking-widest">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const files = normalizeFiles(item.files);
                  return (
                    <tr key={`${type}-${item.id}`} className="align-top hover:bg-slate-50">
                      <td className="min-w-[220px] px-4 py-4">
                        <p className="font-black text-slate-950">{item.title}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                          {[item.subject, item.className, item.category].filter(Boolean).join(" / ")}
                        </p>
                      </td>
                      <td className="min-w-[280px] px-4 py-4 text-sm leading-6 text-slate-600">
                        <p
                          className="max-w-[420px] overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {item.description || "No description provided."}
                        </p>
                      </td>
                      <td className="min-w-[150px] px-4 py-4 text-sm font-bold text-slate-700">
                        {formatDate(item.dateUploaded)}
                      </td>
                      <td className="min-w-[260px] px-4 py-4">
                        <div className="flex flex-col items-stretch gap-2 sm:items-end">
                          {files.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => downloadAll(files)}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-800"
                            >
                              <FiArchive size={14} /> Download All
                            </button>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">
                              <FiExternalLink size={14} /> No file
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedItem({ ...item, files })}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <FiEye size={14} /> View All
                          </button>
                          <p className="text-right text-xs font-bold text-slate-400">
                            {files.length} file{files.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="p-10 text-center">
              <FiFileText className="mx-auto text-5xl text-slate-300" />
              <h2 className="mt-4 text-xl font-black text-slate-900">No items found</h2>
              <p className="mt-2 text-sm text-slate-500">Try another search or category filter.</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link href="/" className="text-sm font-bold text-blue-700 hover:text-blue-900">
            Back to home
          </Link>
        </div>
      </section>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">
                  {type === "assignments" ? "Assignment Details" : "Resource Details"}
                </p>
                <h2 className="mt-2 text-xl font-black">{selectedItem.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-2 text-white transition hover:bg-white/10"
                aria-label="Close details"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="max-h-[calc(90vh-92px)] overflow-y-auto p-5">
              <div className="grid gap-3 text-sm font-bold text-slate-600 sm:grid-cols-2">
                <p><span className="text-slate-950">Subject:</span> {selectedItem.subject || "General"}</p>
                <p><span className="text-slate-950">Class:</span> {selectedItem.className || "All Classes"}</p>
                <p><span className="text-slate-950">Teacher:</span> {selectedItem.teacher || "Not listed"}</p>
                <p><span className="text-slate-950">Uploaded:</span> {formatDate(selectedItem.dateUploaded)}</p>
              </div>

              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-700">Description</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {selectedItem.description || "No description provided."}
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-slate-500">
                  {selectedItem.files.length} downloadable file{selectedItem.files.length === 1 ? "" : "s"} available.
                </p>
                <button
                  type="button"
                  onClick={() => downloadAll(selectedItem.files)}
                  disabled={selectedItem.files.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <FiDownload size={14} /> Download All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
