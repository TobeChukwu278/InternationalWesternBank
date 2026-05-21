"use client";

interface PersonalInfoData {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address_line1: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

interface ReviewSubmitProps {
  personalInfo: PersonalInfoData;
  ssnLastFour: string;
  avatarPreview: string | null;
  idFrontPreview: string | null;
  idBackPreview: string | null;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function ReviewSubmit({
  personalInfo, ssnLastFour, avatarPreview, idFrontPreview, idBackPreview, submitting, onSubmit, onBack,
}: ReviewSubmitProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-iwb-lg border border-iwb-border-light bg-white p-5">
        <h3 className="text-sm font-semibold text-iwb-navy mb-3">Personal Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-iwb-slate-light">Name</span>
            <span className="font-medium text-iwb-navy">{personalInfo.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-iwb-slate-light">Email</span>
            <span className="font-medium text-iwb-navy">{personalInfo.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-iwb-slate-light">Phone</span>
            <span className="font-medium text-iwb-navy">{personalInfo.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-iwb-slate-light">DOB</span>
            <span className="font-medium text-iwb-navy">{personalInfo.date_of_birth}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-iwb-slate-light">Address</span>
            <span className="font-medium text-iwb-navy text-right">
              {personalInfo.address_line1}, {personalInfo.address_city}, {personalInfo.address_state} {personalInfo.address_zip}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-iwb-lg border border-iwb-border-light bg-white p-5">
        <h3 className="text-sm font-semibold text-iwb-navy mb-3">Identity Documents</h3>
        <div className="flex gap-4">
          {avatarPreview ? (
            <div className="text-center">
              <img src={avatarPreview} alt="Profile" className="mx-auto size-16 rounded-full object-cover" />
              <p className="mt-1 text-xs text-iwb-slate-light">Photo</p>
            </div>
          ) : null}
          {idFrontPreview ? (
            <div className="text-center">
              <img src={idFrontPreview} alt="ID Front" className="mx-auto size-16 rounded-lg object-cover" />
              <p className="mt-1 text-xs text-iwb-slate-light">ID Front</p>
            </div>
          ) : null}
          {idBackPreview ? (
            <div className="text-center">
              <img src={idBackPreview} alt="ID Back" className="mx-auto size-16 rounded-lg object-cover" />
              <p className="mt-1 text-xs text-iwb-slate-light">ID Back</p>
            </div>
          ) : null}
        </div>
        {ssnLastFour ? (
          <p className="mt-3 text-xs text-iwb-slate">
            SSN (last 4): ••••{ssnLastFour}
          </p>
        ) : null}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-1 rounded-iwb-md border-2 border-iwb-border px-4 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-surface disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 rounded-iwb-md bg-iwb-teal px-4 py-3 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span className="size-4 animate-spin rounded-full border-2 border-iwb-navy border-t-transparent" />
          ) : null}
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>

      <p className="text-center text-xs text-iwb-slate-light">
        By submitting, you agree to IWB's Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
