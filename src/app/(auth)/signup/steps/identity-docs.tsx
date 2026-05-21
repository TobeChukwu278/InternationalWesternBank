"use client";

import { useState, useRef } from "react";
import { uploadProfilePhoto, uploadKycDocument } from "@/lib/upload";

interface IdentityDocsProps {
  ssnLastFour: string;
  onSsnChange: (val: string) => void;
  onDocumentsChange: (docs: {
    avatarUrl?: string;
    idFrontUrl?: string;
    idBackUrl?: string;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function IdentityDocs({ ssnLastFour, onSsnChange, onDocumentsChange, onNext, onBack }: IdentityDocsProps) {
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);

  const avatarRef = useRef<HTMLInputElement>(null);
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(
    file: File | undefined,
    setPreview: (v: string | null) => void,
    setFile: (f: File | null) => void,
  ) {
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUploadAndContinue() {
    if (!idFrontFile || !idBackFile || !avatarFile) return;
    setUploading(true);

    const tempId = "temp";

    const avatarUrl = await uploadProfilePhoto(avatarFile, tempId);
    const idFrontUrl = await uploadKycDocument(idFrontFile, tempId, "front");
    const idBackUrl = await uploadKycDocument(idBackFile, tempId, "back");

    onDocumentsChange({
      avatarUrl: avatarUrl ?? undefined,
      idFrontUrl: idFrontUrl ?? undefined,
      idBackUrl: idBackUrl ?? undefined,
    });

    setUploading(false);
    onNext();
  }

  const canContinue = avatarFile && idFrontFile && idBackFile;

  return (
    <div className="space-y-6 identity-docs">
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
            onChange={(e) => handleFileSelect(e.target.files?.[0], setAvatarPreview, setAvatarFile)}
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
            onChange={(e) => handleFileSelect(e.target.files?.[0], setIdFrontPreview, setIdFrontFile)}
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
            onChange={(e) => handleFileSelect(e.target.files?.[0], setIdBackPreview, setIdBackFile)}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">
          SSN (Last 4 Digits) <span className="text-iwb-slate-light font-normal">— Optional</span>
        </label>
        <input
          type="text"
          value={ssnLastFour}
          onChange={(e) => onSsnChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="1234"
          maxLength={4}
          className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-iwb-md border-2 border-iwb-border px-4 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-surface"
        >
          Back
        </button>
        <button
          onClick={handleUploadAndContinue}
          disabled={!canContinue || uploading}
          className="flex-1 rounded-iwb-md bg-iwb-teal px-4 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
          ) : null}
          {uploading ? "Uploading..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
