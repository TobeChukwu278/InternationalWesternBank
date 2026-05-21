import { createServiceClient } from "@/lib/supabase/service";
import { KycActions } from "./kyc-actions";
import { getDocumentSignedUrl } from "@/lib/actions/kyc";

function extractStoragePath(url: string | null): { bucket: string; path: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.pathname.includes("/storage/v1/object/public/")) return null;
    const segs = u.pathname.split("/storage/v1/object/public/");
    if (segs.length < 2) return null;
    const parts = segs[1]!.split("/");
    const bucket = parts[0] ?? "";
    const path = parts.slice(1).join("/");
    if (!bucket || !path) return null;
    return { bucket, path } as { bucket: string; path: string };
  } catch {
    return null;
  }
}

export default async function AdminKycPage() {
  const svc = createServiceClient();

  const { data: pendingUsers } = await svc
    .from("profiles")
    .select("*")
    .eq("kyc_status", "pending")
    .order("created_at", { ascending: false });

  const { data: allUsers } = await svc
    .from("profiles")
    .select("*")
    .in("kyc_status", ["verified", "rejected"])
    .order("updated_at", { ascending: false })
    .limit(20);

  async function getDocumentUrls(url: string | null) {
    const info = extractStoragePath(url);
    if (!info) return { href: url, isSigned: false };
    const signed = await getDocumentSignedUrl(info.bucket, info.path);
    return { href: signed || url, isSigned: !!signed };
  }

  const pendingWithDocs = await Promise.all(
    (pendingUsers ?? []).map(async (user: any) => ({
      user,
      frontDoc: await getDocumentUrls(user.id_document_front),
      backDoc: await getDocumentUrls(user.id_document_back),
      avatarDoc: await getDocumentUrls(user.avatar_url),
    }))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-iwb-navy">KYC Verifications</h1>
        <p className="mt-1 text-sm text-iwb-slate">Review and verify new account registrations</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-iwb-navy mb-4">
          Pending Review
          {(pendingUsers ?? []).length > 0 ? (
            <span className="ml-2 rounded-iwb-full bg-iwb-error/10 px-2.5 py-0.5 text-xs font-medium text-iwb-error">
              {(pendingUsers ?? []).length}
            </span>
          ) : null}
        </h2>

        {(pendingUsers ?? []).length === 0 ? (
          <div className="rounded-iwb-xl bg-white p-12 text-center shadow-iwb-card">
            <i className="material-icons text-4xl text-iwb-slate-light mb-3">check_circle</i>
            <p className="text-base font-medium text-iwb-navy">No pending verifications</p>
            <p className="mt-1 text-sm text-iwb-slate">All registrations have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingWithDocs.map(({ user, frontDoc, backDoc, avatarDoc }) => (
              <div key={user.id} className="rounded-iwb-xl bg-white shadow-iwb-card border border-iwb-border-light overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {avatarDoc.href ? (
                        <img src={avatarDoc.href} alt="" className="size-12 rounded-full object-cover" />
                      ) : (
                        <span className="flex size-12 items-center justify-center rounded-full bg-iwb-navy/5 text-sm font-bold text-iwb-slate">
                          {user.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-iwb-navy">{user.full_name}</p>
                        <p className="text-xs text-iwb-slate-light">{user.email}</p>
                        <p className="text-xs text-iwb-slate-light mt-0.5">
                          Submitted {new Date(user.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div><span className="text-iwb-slate-light">Phone:</span> <span className="text-iwb-navy">{user.phone ?? "—"}</span></div>
                    <div><span className="text-iwb-slate-light">DOB:</span> <span className="text-iwb-navy">{user.date_of_birth ?? "—"}</span></div>
                    <div className="col-span-2">
                      <span className="text-iwb-slate-light">Address:</span>{" "}
                      <span className="text-iwb-navy">
                        {[user.address_line1, user.address_city, user.address_state, user.address_zip].filter(Boolean).join(", ") || "—"}
                      </span>
                    </div>
                    {user.ssn_last_four ? (
                      <div><span className="text-iwb-slate-light">SSN (last 4):</span> <span className="text-iwb-navy">••••{user.ssn_last_four}</span></div>
                    ) : null}
                  </div>

                  {frontDoc.href || backDoc.href ? (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {frontDoc.href ? (
                        <a href={frontDoc.href} target="_blank" className="group relative block aspect-[1.4/1] overflow-hidden rounded-iwb-lg border border-iwb-border-light bg-iwb-surface">
                          <img src={frontDoc.href} alt="ID Front" className="size-full object-cover transition-transform group-hover:scale-105" />
                          <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-[10px] font-medium text-white">ID Front</span>
                        </a>
                      ) : null}
                      {backDoc.href ? (
                        <a href={backDoc.href} target="_blank" className="group relative block aspect-[1.4/1] overflow-hidden rounded-iwb-lg border border-iwb-border-light bg-iwb-surface">
                          <img src={backDoc.href} alt="ID Back" className="size-full object-cover transition-transform group-hover:scale-105" />
                          <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-[10px] font-medium text-white">ID Back</span>
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <KycActions userId={user.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-iwb-navy mb-4">History</h2>
        {(allUsers ?? []).length === 0 ? (
          <p className="text-sm text-iwb-slate">No verified or rejected users yet</p>
        ) : (
          <div className="rounded-iwb-xl bg-white shadow-iwb-card overflow-hidden">
            <div className="divide-y divide-iwb-border-light">
              {(allUsers ?? []).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex size-8 items-center justify-center rounded-full text-xs ${
                      user.kyc_status === "verified" ? "bg-iwb-teal/10 text-iwb-teal" : "bg-iwb-error/10 text-iwb-error"
                    }`}>
                      <i className="material-icons text-sm">
                        {user.kyc_status === "verified" ? "check" : "close"}
                      </i>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-iwb-navy">{user.full_name}</p>
                      <p className="text-xs text-iwb-slate-light">{user.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium capitalize ${
                    user.kyc_status === "verified" ? "text-iwb-teal" : "text-iwb-error"
                  }`}>
                    {user.kyc_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
