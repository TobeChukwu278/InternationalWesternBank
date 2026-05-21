"use client";

import { useRef } from "react";

interface IdentityDocsProps {
  avatarFile: File | null;
  idFrontFile: File | null;
  idBackFile: File | null;
  avatarPreview: string | null;
  idFrontPreview: string | null;
  idBackPreview: string | null;
  onFilesChange: (files: {
    avatarFile?: File;
    idFrontFile?: File;
    idBackFile?: File;
    avatarPreview?: string | null;
    idFrontPreview?: string | null;
    idBackPreview?: string | null;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function IdentityDocs({
  avatarFile, idFrontFile, idBackFile,
  avatarPreview, idFrontPreview, idBackPreview,
  onFilesChange, onNext, onBack,
}: IdentityDocsProps) {
  const avatarRef = useRef<HTMLInputElement>(null);
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(
    file: File | undefined,
    key: "avatarFile" | "idFrontFile" | "idBackFile",
    previewKey: "avatarPreview" | "idFrontPreview" | "idBackPreview",
  ) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onFilesChange({ [key]: file, [previewKey]: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  }

  const canContinue = avatarFile && idFrontFile && idBackFile;

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider mb-3 block">
          Profile Photo <span className="text-iwb-error">*</span>
        </label>
        <div
          onClick={() => avatarRef.current?.click()}
          className="flex cursor-pointer items-center gap-4 rounded-iwb-lg border border-dashed border-iwb-border p-4 transition-colors hover:border-iwb-teal"
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Preview" className="size-16 rounded-full object-cover" />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-iwb-surface text-iwb-slate-light">
              <i className="material-icons text-2xl">person_add</i>
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-iwb-navy">
              {avatarFile ? avatarFile.name : "Upload profile photo"}
            </p>
            <p className="text-xs text-iwb-slate-light">JPG or PNG recommended</p>
          </div>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0], "avatarFile", "avatarPreview")}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider mb-3 block">
          Driver's License / State ID — Front <span className="text-iwb-error">*</span>
        </label>
        <div
          onClick={() => idFrontRef.current?.click()}
          className="flex cursor-pointer items-center gap-4 rounded-iwb-lg border border-dashed border-iwb-border p-4 transition-colors hover:border-iwb-teal"
        >
          {idFrontPreview ? (
            <img src={idFrontPreview} alt="ID Front" className="size-16 rounded-lg object-cover" />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-lg bg-iwb-surface text-iwb-slate-light">
              <i className="material-icons text-2xl">badge</i>
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-iwb-navy">
              {idFrontFile ? idFrontFile.name : "Upload front of ID"}
            </p>
            <p className="text-xs text-iwb-slate-light">Clear photo, all details visible</p>
          </div>
          <input
            ref={idFrontRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0], "idFrontFile", "idFrontPreview")}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider mb-3 block">
          Driver's License / State ID — Back <span className="text-iwb-error">*</span>
        </label>
        <div
          onClick={() => idBackRef.current?.click()}
          className="flex cursor-pointer items-center gap-4 rounded-iwb-lg border border-dashed border-iwb-border p-4 transition-colors hover:border-iwb-teal"
        >
          {idBackPreview ? (
            <img src={idBackPreview} alt="ID Back" className="size-16 rounded-lg object-cover" />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-lg bg-iwb-surface text-iwb-slate-light">
              <i className="material-icons text-2xl">badge</i>
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-iwb-navy">
              {idBackFile ? idBackFile.name : "Upload back of ID"}
            </p>
            <p className="text-xs text-iwb-slate-light">Clear photo, barcode visible</p>
          </div>
          <input
            ref={idBackRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0], "idBackFile", "idBackPreview")}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-iwb-md border-2 border-iwb-border px-4 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-surface"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="flex-1 rounded-iwb-md bg-iwb-teal px-4 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
