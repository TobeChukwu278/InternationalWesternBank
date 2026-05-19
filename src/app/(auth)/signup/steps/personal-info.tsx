"use client";

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

interface PersonalInfoProps {
  data: PersonalInfoData;
  onChange: (data: Partial<PersonalInfoData>) => void;
  onNext: () => void;
}

export function PersonalInfo({ data, onChange, onNext }: PersonalInfoProps) {
  const required = [
    { key: "full_name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "password", label: "Password" },
    { key: "phone", label: "Phone Number" },
    { key: "date_of_birth", label: "Date of Birth" },
    { key: "address_line1", label: "Home Address" },
    { key: "address_city", label: "City" },
    { key: "address_state", label: "State" },
    { key: "address_zip", label: "ZIP Code" },
  ];

  const isValid = required.every((r) => (data as any)[r.key]?.trim());

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            value={data.full_name}
            onChange={(e) => onChange({ full_name: e.target.value })}
            placeholder="John Doe"
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="john@example.com"
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Phone Number</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Date of Birth</label>
          <input
            type="date"
            value={data.date_of_birth}
            onChange={(e) => onChange({ date_of_birth: e.target.value })}
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Password</label>
          <input
            type="password"
            value={data.password}
            onChange={(e) => onChange({ password: e.target.value })}
            placeholder="Create a strong password"
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">Home Address</label>
          <input
            type="text"
            value={data.address_line1}
            onChange={(e) => onChange({ address_line1: e.target.value })}
            placeholder="123 Main St"
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">City</label>
          <input
            type="text"
            value={data.address_city}
            onChange={(e) => onChange({ address_city: e.target.value })}
            placeholder="Los Angeles"
            className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
            required
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">State</label>
            <input
              type="text"
              value={data.address_state}
              onChange={(e) => onChange({ address_state: e.target.value })}
              placeholder="CA"
              className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
              required
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider">ZIP</label>
            <input
              type="text"
              value={data.address_zip}
              onChange={(e) => onChange({ address_zip: e.target.value })}
              placeholder="90012"
              className="mt-2 w-full rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none"
              required
            />
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full rounded-iwb-md bg-iwb-teal px-6 py-3.5 text-sm font-semibold text-iwb-navy transition-all hover:bg-iwb-teal-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
