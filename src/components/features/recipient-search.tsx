"use client";

import { useState, useRef, useEffect } from "react";

interface Recipient {
  account_number: string;
  full_name: string;
}

interface RecipientSearchProps {
  onSelect: (recipient: Recipient) => void;
}

export function RecipientSearch({ onSelect }: RecipientSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipient[]>([]);
  const [selected, setSelected] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSearch(value: string) {
    setQuery(value);
    setSelected(null);

    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);

    const res = await fetch(`/api/recipients?q=${encodeURIComponent(value)}`);
    const data = await res.json();
    setResults(data.recipients ?? []);
    setLoading(false);
  }

  function handleSelect(r: Recipient) {
    setSelected(r);
    setQuery(r.account_number);
    setOpen(false);
    onSelect(r);
  }

  return (
    <div ref={ref} className="relative">
      <label className="text-sm font-medium text-iwb-navy">Recipient</label>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by account number or name"
        className="mt-1.5 block w-full rounded-iwb-md border border-iwb-border bg-white px-4 py-3 text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:border-iwb-teal focus:ring-2 focus:ring-iwb-teal/10 focus:outline-none transition-colors"
      />
      <input type="hidden" name="recipient" value={selected?.account_number ?? ""} />

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-iwb-md border border-iwb-border-light bg-white shadow-iwb-overlay">
          {loading ? (
            <div className="px-4 py-3 text-sm text-iwb-slate">Searching...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((r) => (
                <li
                  key={r.account_number}
                  onClick={() => handleSelect(r)}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-iwb-surface"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-iwb-teal/10 text-xs font-bold text-iwb-teal">
                    {r.full_name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-medium text-iwb-navy">{r.full_name}</p>
                    <p className="text-xs text-iwb-slate">{r.account_number}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="px-4 py-3 text-sm text-iwb-slate">No recipients found</div>
          ) : null}
        </div>
      )}

      {selected && (
        <div className="mt-2 flex items-center gap-2 rounded-iwb-md bg-iwb-teal/5 px-3 py-2">
          <span className="text-xs text-iwb-teal-dark">
            Sending to <strong>{selected.full_name}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
