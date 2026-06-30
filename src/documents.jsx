import React, { useState, useRef, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  UploadCloud,
  FileText,
  Download,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const initialDocs = [
  {
    id: 1,
    name: "Briefing_v2.pdf",
    size: "2.4 MB",
    type: "pdf",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  { id: 2, name: "API_Specs.xlsx", size: "1.1 MB", type: "excel", url: "#" },
];

export const DocumentManager = () => {
  const [documents, setDocuments] = useState(initialDocs);
  const [isHovering, setIsHovering] = useState(false);

  // Modals
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const fileInputRef = useRef(null);

  const navigatePreview = useCallback(
    (direction) => {
      const previewableDocs = documents.filter(
        (d) => (d.type === "image" || d.type === "pdf") && d.url !== "#",
      );
      if (previewableDocs.length <= 1 || !previewDoc) return;

      const currentIndex = previewableDocs.findIndex(
        (d) => d.id === previewDoc.id,
      );
      if (currentIndex === -1) return;

      let nextIndex = currentIndex + direction;
      if (nextIndex < 0) nextIndex = previewableDocs.length - 1;
      if (nextIndex >= previewableDocs.length) nextIndex = 0;

      setPreviewDoc(previewableDocs[nextIndex]);
    },
    [documents, previewDoc],
  );

  const closePreview = useCallback(() => {
    setPreviewDoc(null);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (!previewDoc) return;

      if (e.key === "Escape") {
        closePreview();
      } else if (e.key === "ArrowLeft") {
        navigatePreview(-1);
      } else if (e.key === "ArrowRight") {
        navigatePreview(1);
      }
    },
    [previewDoc, closePreview, navigatePreview],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files) => {
    const newDocs = Array.from(files).map((file, idx) => {
      const isImage = file.type.startsWith("image/");
      let objectUrl = null;
      if (isImage || file.type === "application/pdf") {
        objectUrl = URL.createObjectURL(file);
      }
      return {
        id: Date.now() + idx,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
        type: isImage
          ? "image"
          : file.name.endsWith(".pdf")
            ? "pdf"
            : "unknown",
        url: objectUrl || "#",
        fileObj: file,
      };
    });

    setDocuments([...newDocs, ...documents]);

    if (window.showToast) {
      window.showToast(
        `Successfully uploaded ${files.length} file(s)`,
        "success",
      );
    }

    // Update outside total document counter if exists
    const docCountEl = document.getElementById("doc-count");
    if (docCountEl) docCountEl.textContent = documents.length + newDocs.length;
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    setDocuments(documents.filter((d) => d.id !== deleteConfirmId));
    setDeleteConfirmId(null);

    const docCountEl = document.getElementById("doc-count");
    if (docCountEl) docCountEl.textContent = documents.length - 1;

    if (window.showToast) window.showToast("File deleted", "info");
  };

  const openPreview = (doc) => {
    setPreviewDoc(doc);
  };

  return (
    <>
      <div className="mb-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group
            ${isHovering ? "border-primary bg-primary/5" : "border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:border-primary"}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          />
          <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
            <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PDF, DOC, XLS, PNG, JPG (max. 10MB)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-slate-600 rounded-xl hover:border-primary/50 hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${doc.type === "pdf" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : doc.type === "excel" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : doc.type === "image" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"}`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {doc.name}
                </p>
                <p className="text-xs text-gray-500">{doc.size}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {(doc.type === "pdf" || doc.type === "image") &&
                doc.url !== "#" && (
                  <button
                    onClick={() => openPreview(doc)}
                    className="text-gray-400 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              <a
                href={doc.url !== "#" ? doc.url : undefined}
                download={doc.name}
                className="text-gray-400 hover:text-green-600 transition-colors p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => handleDeleteClick(doc.id)}
                className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[200] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up border border-gray-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete File?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this document? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Lightbox Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[200] bg-gray-900/90 backdrop-blur flex flex-col animate-fade-in">
          <div className="flex justify-between items-center p-4 text-white">
            <p className="font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" /> {previewDoc.name}
            </p>
            <div className="flex items-center gap-4">
              <a
                href={previewDoc.url}
                download={previewDoc.name}
                className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Download className="w-4 h-4" /> Download
              </a>
              <button
                onClick={closePreview}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-between px-4 pb-4 overflow-hidden relative">
            {documents.filter(
              (d) => (d.type === "image" || d.type === "pdf") && d.url !== "#",
            ).length > 1 && (
              <button
                onClick={() => navigatePreview(-1)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors shrink-0 z-10"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            <div className="flex-1 h-full mx-4 flex items-center justify-center overflow-hidden">
              {previewDoc.type === "image" ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              ) : previewDoc.type === "pdf" ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-full max-w-5xl bg-white rounded-lg shadow-2xl"
                  title={previewDoc.name}
                ></iframe>
              ) : (
                <div className="text-white text-center">
                  <p>Preview not available for this file type.</p>
                </div>
              )}
            </div>

            {documents.filter(
              (d) => (d.type === "image" || d.type === "pdf") && d.url !== "#",
            ).length > 1 && (
              <button
                onClick={() => navigatePreview(1)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors shrink-0 z-10"
                title="Next (Right Arrow)"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

let root = null;
export function renderDocuments() {
  const container = document.getElementById("project-documents-root");
  if (container) {
    if (!root) {
      root = createRoot(container);
    }
    setTimeout(() => {
      root.render(<DocumentManager />);
    }, 50);
  }
}
