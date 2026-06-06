"use client";

import { useEffect, useMemo, useState } from "react";
import { FiEdit, FiImage, FiPlus, FiRefreshCw, FiSave, FiTrash2, FiUsers, FiX } from "react-icons/fi";
import { toast } from "sonner";

const SECTION_OPTIONS = [
  { value: "ALUMNI", label: "Alumni Gallery" },
  { value: "BOM", label: "Board of Management" },
  { value: "PTA", label: "PTA Members" },
  { value: "PRINCIPAL_CURRENT", label: "Current Principal" },
  { value: "PRINCIPAL_PREVIOUS", label: "Previous Principals" },
];

const emptyForm = {
  section: "ALUMNI",
  name: "",
  position: "",
  description: "",
  displayOrder: 0,
  isActive: true,
  image: null,
  images: [],
  existingImage: "",
  existingImages: [],
};

const getAuthHeaders = () => {
  const adminToken = localStorage.getItem("admin_token");
  const deviceToken = localStorage.getItem("device_token");
  if (!adminToken || !deviceToken) throw new Error("Authentication required");
  return {
    Authorization: `Bearer ${adminToken}`,
    "x-device-token": deviceToken,
  };
};

function RecordModal({ record, onClose, onSaved }) {
  const [form, setForm] = useState(() => record ? {
    section: record.section,
    name: record.name || "",
    position: record.position || "",
    description: record.description || "",
    displayOrder: record.displayOrder || 0,
    isActive: record.isActive !== false,
    image: null,
    images: [],
    existingImage: record.image || "",
    existingImages: Array.isArray(record.images) ? record.images : [],
  } : emptyForm);
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  const removeExistingGalleryImage = (url) => {
    setForm((previous) => ({
      ...previous,
      existingImages: previous.existingImages.filter((item) => item.url !== url),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("section", form.section);
      payload.append("name", form.name.trim());
      payload.append("position", form.position.trim());
      payload.append("description", form.description.trim());
      payload.append("displayOrder", String(Number(form.displayOrder) || 0));
      payload.append("isActive", form.isActive ? "true" : "false");
      payload.append("existingImage", form.existingImage || "");
      payload.append("existingImages", JSON.stringify(form.existingImages || []));
      if (form.image) payload.append("image", form.image);
      form.images.forEach((file) => payload.append("images", file));

      const response = await fetch(record?.id ? `/api/alumni/${record.id}` : "/api/alumni", {
        method: record?.id ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: payload,
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to save record");

      toast.success(record?.id ? "Record updated" : "Record created");
      onSaved();
    } catch (error) {
      toast.error(error.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-700">Alumni & Governance</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{record ? "Edit Record" : "Create Record"}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 p-2 text-slate-600">
            <FiX />
          </button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Section</span>
            <select value={form.section} onChange={(event) => update("section", event.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold">
              {SECTION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Name</span>
            <input required value={form.name} onChange={(event) => update("name", event.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Position</span>
            <input value={form.position} onChange={(event) => update("position", event.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold" placeholder="Chairperson, Member, Principal" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Display Order</span>
            <input type="number" value={form.displayOrder} onChange={(event) => update("displayOrder", event.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold" />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Description / Biography</span>
            <textarea value={form.description} onChange={(event) => update("description", event.target.value)} rows={4} className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold leading-6" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Primary Image</span>
            <input type="file" accept="image/*" onChange={(event) => update("image", event.target.files?.[0] || null)} className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-bold file:text-blue-700" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Gallery Images</span>
            <input type="file" accept="image/*" multiple onChange={(event) => update("images", Array.from(event.target.files || []))} className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-bold file:text-blue-700" />
          </label>
          <label className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={(event) => update("isActive", event.target.checked)} className="h-5 w-5" />
            Active
          </label>
        </div>

        {(form.existingImage || form.existingImages.length > 0) && (
          <div className="border-t border-slate-100 px-5 pb-5">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">Existing Images</p>
            <div className="grid gap-3 sm:grid-cols-4">
              {form.existingImage && (
                <div className="relative rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <img src={form.existingImage} alt="Primary" className="h-24 w-full object-contain" />
                  <button type="button" onClick={() => update("existingImage", "")} className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white">
                    <FiX />
                  </button>
                </div>
              )}
              {form.existingImages.map((image) => (
                <div key={image.url} className="relative rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <img src={image.url} alt={image.altText || "Gallery"} className="h-24 w-full object-contain" />
                  <button type="button" onClick={() => removeExistingGalleryImage(image.url)} className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white">
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 px-5 py-3 text-sm font-black uppercase tracking-widest text-slate-600">Cancel</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-black uppercase tracking-widest text-white disabled:opacity-50">
            <FiSave /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AlumniGovernanceManager() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [section, setSection] = useState("all");

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/alumni?includeInactive=1", { headers: getAuthHeaders() });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to load records");
      setRecords(data.records || []);
    } catch (error) {
      toast.error(error.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filtered = useMemo(() => records.filter((record) => section === "all" || record.section === section), [records, section]);

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete "${record.name}"?`)) return;
    try {
      const response = await fetch(`/api/alumni/${record.id}`, { method: "DELETE", headers: getAuthHeaders() });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to delete record");
      toast.success("Record deleted");
      fetchRecords();
    } catch (error) {
      toast.error(error.message || "Failed to delete record");
    }
  };

  const openCreate = () => {
    setEditingRecord(null);
    setShowModal(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-700">Alumni Management Module</p>
            <h1 className="mt-2 text-2xl font-black text-slate-950">Alumni, BOM, PTA & Principals</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Create, edit, update, and delete public alumni galleries and leadership records.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={fetchRecords} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-700">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">
              <FiPlus /> Add Record
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-5">
          {SECTION_OPTIONS.map((option) => (
            <div key={option.value} className="rounded-lg bg-slate-50 p-4">
              <FiUsers className="text-blue-700" />
              <p className="mt-2 text-xl font-black text-slate-950">{records.filter((record) => record.section === option.value).length}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{option.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <select value={section} onChange={(event) => setSection(event.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold sm:max-w-xs">
          <option value="all">All Sections</option>
          {SECTION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-10 text-center text-sm font-bold text-slate-500">Loading records...</div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((record) => {
            const label = SECTION_OPTIONS.find((option) => option.value === record.section)?.label || record.section;
            return (
              <article key={record.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex h-56 items-center justify-center bg-slate-100">
                  {record.image ? (
                    <img src={record.image} alt={record.name} className="h-full w-full object-contain" />
                  ) : (
                    <FiImage className="text-5xl text-slate-300" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">{label}</span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${record.isActive === false ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                      {record.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-black text-slate-950">{record.name}</h2>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">{record.position || "Position not set"}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{record.description || "No description added."}</p>
                  <p className="mt-3 text-xs font-bold text-slate-500">{Array.isArray(record.images) ? record.images.length : 0} gallery image(s)</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openEdit(record)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white">
                      <FiEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(record)} className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <FiUsers className="mx-auto text-5xl text-slate-300" />
          <h2 className="mt-4 text-xl font-black text-slate-950">No records found</h2>
          <button onClick={openCreate} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">
            <FiPlus /> Add Record
          </button>
        </div>
      )}

      {showModal && (
        <RecordModal
          record={editingRecord}
          onClose={() => {
            setShowModal(false);
            setEditingRecord(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingRecord(null);
            fetchRecords();
          }}
        />
      )}
    </div>
  );
}
