"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { signupWithKyc, updateKycDocumentUrls } from "@/lib/actions/kyc";
import { uploadProfilePhoto, uploadKycDocument } from "@/lib/upload";
import { PersonalInfo } from "./steps/personal-info";
import { IdentityDocs } from "./steps/identity-docs";
import { ReviewSubmit } from "./steps/review-submit";
import { useLocale } from "@/i18n/client";

interface PersonalInfoData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  date_of_birth: string;
  address_line1: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

export default function SignupPage() {
  const { t } = useLocale();
  const steps = [t("auth.signup.personalInfo"), t("auth.signup.identity"), t("auth.signup.review")];
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    full_name: "", email: "", password: "", phone: "", date_of_birth: "",
    address_line1: "", address_city: "", address_state: "", address_zip: "",
  });
  const [ssnLastFour, setSsnLastFour] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

  function handlePersonalChange(data: Partial<PersonalInfoData>) {
    setPersonalInfo((prev) => ({ ...prev, ...data }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setStatusMessage(t("auth.signup.creatingAccount"));

    const formData = new FormData();
    formData.set("full_name", personalInfo.full_name);
    formData.set("email", personalInfo.email);
    formData.set("password", personalInfo.password);
    formData.set("phone", personalInfo.phone);
    formData.set("date_of_birth", personalInfo.date_of_birth);
    formData.set("address_line1", personalInfo.address_line1);
    formData.set("address_city", personalInfo.address_city);
    formData.set("address_state", personalInfo.address_state);
    formData.set("address_zip", personalInfo.address_zip);
    if (ssnLastFour) formData.set("ssn_last_four", ssnLastFour);

    const res = await signupWithKyc(formData);

    if (!res.success) {
      setError(res.error ?? t("common.somethingWentWrong"));
      setSubmitting(false);
      setStatusMessage("");
      return;
    }

    const userId = res.userId!;

    setStatusMessage(t("auth.signup.uploadingDocs"));

    const avatarUrl = avatarFile ? await uploadProfilePhoto(avatarFile, userId) : null;
    const idFrontUrl = idFrontFile ? await uploadKycDocument(idFrontFile, userId, "front") : null;
    const idBackUrl = idBackFile ? await uploadKycDocument(idBackFile, userId, "back") : null;

    if (avatarUrl || idFrontUrl || idBackUrl) {
      const urlForm = new FormData();
      urlForm.set("user_id", userId);
      if (avatarUrl) urlForm.set("avatar_url", avatarUrl);
      if (idFrontUrl) urlForm.set("id_document_front", idFrontUrl);
      if (idBackUrl) urlForm.set("id_document_back", idBackUrl);
      await updateKycDocumentUrls(urlForm);
    }

    if (!avatarUrl && avatarFile) setError(t("auth.signup.photoUploadFailed"));
    if (!idFrontUrl && idFrontFile) setError(t("auth.signup.idUploadFailed"));
    if (!idBackUrl && idBackFile) setError(t("auth.signup.idUploadFailed"));

    setStatusMessage("");
    setSubmitting(false);
    router.push("/pending-verification");
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {submitting ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-iwb-xl bg-white p-8 shadow-iwb-overlay">
            <span className="size-10 animate-spin rounded-full border-4 border-iwb-teal border-t-transparent" />
            <p className="text-sm font-medium text-iwb-navy">{statusMessage || t("common.loading")}</p>
          </div>
        </div>
      ) : null}

      <div className="hidden lg:flex lg:w-1/2 bg-iwb-navy items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#0a2540,_#001020)]" />
        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center">
            <img src="/logo.png" alt="IWB" className="size-16" />
          </div>
          <h2 className="text-3xl font-bold text-white">International Western Bank</h2>
          <p className="mt-3 text-lg text-iwb-slate-light">
            {t("auth.signup.subtitle")}
          </p>
          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-center gap-3 text-white/70">
              <i className="material-icons text-iwb-teal text-sm">verified</i>
              <span className="text-sm">{t("auth.signup.fdicInsured")}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <i className="material-icons text-iwb-teal text-sm">security</i>
              <span className="text-sm">{t("auth.signup.encryptedSecurity")}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <i className="material-icons text-iwb-teal text-sm">support_agent</i>
              <span className="text-sm">{t("auth.signup.support247")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-iwb-surface px-4 py-12 lg:px-8">
        <Card className="w-full max-w-lg p-8">
          <div className="mb-8 flex justify-center lg:hidden">
            <img src="/logo.png" alt="IWB" className="h-10" />
          </div>

          <h1 className="text-xl font-semibold text-iwb-navy">{t("auth.signup.title")}</h1>
          <p className="mt-1 text-sm text-iwb-slate">
            {t("auth.signup.step", { current: String(currentStep + 1), name: steps[currentStep] ?? "" })}
          </p>

          <div className="mt-6 flex gap-2">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= currentStep ? "bg-iwb-teal" : "bg-iwb-border"
                }`}
              />
            ))}
          </div>

          <div className="mt-8">
            {currentStep === 0 ? (
              <PersonalInfo data={personalInfo} onChange={handlePersonalChange} onNext={() => setCurrentStep(1)} />
            ) : currentStep === 1 ? (
              <IdentityDocs
                avatarFile={avatarFile}
                idFrontFile={idFrontFile}
                idBackFile={idBackFile}
                avatarPreview={avatarPreview}
                idFrontPreview={idFrontPreview}
                idBackPreview={idBackPreview}
                onFilesChange={(files) => {
                  if (files.avatarFile) setAvatarFile(files.avatarFile);
                  if (files.idFrontFile) setIdFrontFile(files.idFrontFile);
                  if (files.idBackFile) setIdBackFile(files.idBackFile);
                  if (files.avatarPreview !== undefined) setAvatarPreview(files.avatarPreview);
                  if (files.idFrontPreview !== undefined) setIdFrontPreview(files.idFrontPreview);
                  if (files.idBackPreview !== undefined) setIdBackPreview(files.idBackPreview);
                }}
                onNext={() => setCurrentStep(2)}
                onBack={() => setCurrentStep(0)}
              />
            ) : (
              <ReviewSubmit
                personalInfo={personalInfo}
                ssnLastFour={ssnLastFour}
                avatarPreview={avatarPreview}
                idFrontPreview={idFrontPreview}
                idBackPreview={idBackPreview}
                submitting={submitting}
                onSubmit={handleSubmit}
                onBack={() => setCurrentStep(1)}
              />
            )}
          </div>

          {error ? (
            <div className="mt-4 rounded-iwb-lg bg-iwb-error/5 border border-iwb-error/20 p-3">
              <p className="text-sm text-iwb-error">{error}</p>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
