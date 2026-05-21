"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { signupWithKyc } from "@/lib/actions/kyc";
import { PersonalInfo } from "./steps/personal-info";
import { IdentityDocs } from "./steps/identity-docs";
import { ReviewSubmit } from "./steps/review-submit";

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

const steps = ["Personal Info", "Identity", "Review"];

export default function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    full_name: "", email: "", password: "", phone: "", date_of_birth: "",
    address_line1: "", address_city: "", address_state: "", address_zip: "",
  });
  const [ssnLastFour, setSsnLastFour] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [idFrontUrl, setIdFrontUrl] = useState<string | undefined>();
  const [idBackUrl, setIdBackUrl] = useState<string | undefined>();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

  function handlePersonalChange(data: Partial<PersonalInfoData>) {
    setPersonalInfo((prev) => ({ ...prev, ...data }));
  }

  function handleDocumentsChange(docs: { avatarUrl?: string; idFrontUrl?: string; idBackUrl?: string }) {
    if (docs.avatarUrl) setAvatarUrl(docs.avatarUrl);
    if (docs.idFrontUrl) setIdFrontUrl(docs.idFrontUrl);
    if (docs.idBackUrl) setIdBackUrl(docs.idBackUrl);
  }

  function handleIdentityNext() {
    setAvatarPreview((document.querySelector(".identity-docs [alt='Preview']") as HTMLImageElement)?.src ?? null);
    setIdFrontPreview((document.querySelector(".identity-docs [alt='ID Front']") as HTMLImageElement)?.src ?? null);
    setIdBackPreview((document.querySelector(".identity-docs [alt='ID Back']") as HTMLImageElement)?.src ?? null);
    setCurrentStep(2);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

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
    if (avatarUrl) formData.set("avatar_url", avatarUrl);
    if (idFrontUrl) formData.set("id_document_front", idFrontUrl);
    if (idBackUrl) formData.set("id_document_back", idBackUrl);
    if (ssnLastFour) formData.set("ssn_last_four", ssnLastFour);

    const res = await signupWithKyc(formData);

    if (res.success) {
      router.push("/pending-verification");
    } else {
      setError(res.error ?? "Something went wrong");
    }

    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-iwb-navy items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#0a2540,_#001020)]" />
        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center">
            <img src="/logo.png" alt="IWB" className="size-16" />
          </div>
          <h2 className="text-3xl font-bold text-white">International Western Bank</h2>
          <p className="mt-3 text-lg text-iwb-slate-light">
            Open your account in minutes. Join thousands of satisfied customers worldwide.
          </p>
          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-center gap-3 text-white/70">
              <i className="material-icons text-iwb-teal text-sm">verified</i>
              <span className="text-sm">FDIC insured up to $250,000</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <i className="material-icons text-iwb-teal text-sm">security</i>
              <span className="text-sm">256-bit encrypted security</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <i className="material-icons text-iwb-teal text-sm">support_agent</i>
              <span className="text-sm">24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-iwb-surface px-4 py-12 lg:px-8">
        <Card className="w-full max-w-lg p-8">
          <div className="mb-8 flex justify-center lg:hidden">
            <img src="/logo.png" alt="IWB" className="h-10" />
          </div>

          <h1 className="text-xl font-semibold text-iwb-navy">Create account</h1>
          <p className="mt-1 text-sm text-iwb-slate">
            Step {currentStep + 1} of 3: {steps[currentStep]}
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
                ssnLastFour={ssnLastFour}
                onSsnChange={setSsnLastFour}
                onDocumentsChange={handleDocumentsChange}
                onNext={handleIdentityNext}
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
