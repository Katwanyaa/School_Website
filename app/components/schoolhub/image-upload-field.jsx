'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FiImage, FiPlus, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';

export const MAX_SCHOOL_IMAGE_SIZE = 4.5 * 1024 * 1024;

export const normalizeSchoolImages = (item) => {
  const related = Array.isArray(item?.images)
    ? item.images.map((image) => ({
        url: image?.url || image,
        altText: image?.altText || item?.title || item?.name || 'School image',
        caption: image?.caption || '',
      }))
    : [];

  const legacy = item?.image
    ? [{ url: item.image, altText: item?.title || item?.name || 'School image', caption: '' }]
    : [];

  const seen = new Set();
  return [...related, ...legacy].filter((image) => {
    if (!image?.url || seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });
};

const formatMb = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

export default function ImageUploadField({
  existingImages = [],
  files = [],
  removedImages = [],
  onChange,
  error,
  setError,
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [files]
  );

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  const visibleExisting = existingImages.filter((image) => !removedImages.includes(image.url));

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    const valid = [];
    const rejected = [];

    incoming.forEach((file) => {
      if (!file.type?.startsWith('image/')) {
        rejected.push(`${file.name} is not an image.`);
      } else if (file.size > MAX_SCHOOL_IMAGE_SIZE) {
        rejected.push(`${file.name} is ${formatMb(file.size)}. Max is 4.5MB.`);
      } else {
        valid.push(file);
      }
    });

    if (rejected.length) setError?.(rejected[0]);
    else setError?.('');

    if (valid.length) {
      onChange?.({ files: [...files, ...valid], removedImages });
    }
  };

  const removeNewFile = (index) => {
    onChange?.({
      files: files.filter((_, i) => i !== index),
      removedImages,
    });
  };

  const removeExistingImage = (url) => {
    onChange?.({
      files,
      removedImages: [...removedImages, url],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            Images
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Multiple images supported. Each image must be less than 4.5MB.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800"
        >
          <FiPlus /> Add Images
        </button>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-[28px] border-2 border-dashed p-6 text-center transition-all ${
          dragActive
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
          <FiUploadCloud size={24} />
        </div>
        <p className="mt-4 text-sm font-black text-slate-900">
          {dragActive ? 'Drop images here' : 'Drag images here or click to browse'}
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Clean previews before saving, gallery-style.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {(visibleExisting.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleExisting.map((image, index) => (
            <div key={image.url} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img src={image.url} alt={image.altText || `Existing image ${index + 1}`} className="h-28 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeExistingImage(image.url)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-red-600 shadow-sm backdrop-blur hover:bg-white"
              >
                <FiTrash2 size={14} />
              </button>
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Saved
              </div>
            </div>
          ))}

          {previews.map((preview, index) => (
            <div key={`${preview.file.name}-${index}`} className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-white">
              <img src={preview.url} alt={preview.file.name} className="h-28 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewFile(index)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-red-600 shadow-sm backdrop-blur hover:bg-white"
              >
                <FiX size={14} />
              </button>
              <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                <FiImage /> New
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
