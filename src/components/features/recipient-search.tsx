"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "@/i18n/client";

interface SearchResult {
  account_number: string;
  full_name: string;
}

interface RecipientSearchProps {
  recentRecipients: { account_number: string; full_name: string }[];
  onSelect: (recipient: { accountNumber: string; fullName: string }) => void;
  selected: { accountNumber: string; fullName: string } | null;
}

export function RecipientSearch({ recentRecipients, onSelect, selected }: RecipientSearchProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    fetch(`/api/recipients?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setResults(data.recipients ?? []);
        setShowDropdown(true);
      })
      .catch(() => {})
      .finally(() => setSearching(false));
    return () => controller.abort();
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(r: { account_number: string; full_name: string }) {
    onSelect({ accountNumber: r.account_number, fullName: r.full_name });
    setQuery("");
    setShowDropdown(false);
    setShowAddNew(false);
  }

  function handleClear() {
    onSelect({ accountNumber: "", fullName: "" });
    setQuery("");
    setResults([]);
  }

  if (selected && selected.accountNumber) {
    return (
      <div className="flex items-center justify-between rounded-iwb-lg border border-iwb-teal/30 bg-iwb-teal/5 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-iwb-teal/10 text-sm font-bold text-iwb-teal">
            {selected.fullName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-medium text-iwb-navy">{selected.fullName}</p>
            <p className="text-xs text-iwb-slate">**** {selected.accountNumber.slice(-4)}</p>
          </div>
        </div>
        <button onClick={handleClear} className="text-xs text-iwb-slate-light hover:text-iwb-error transition-colors">
          Change
        </button>
      </div>
    );
  }

  return (
    <div>
      {!showAddNew && recentRecipients.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-iwb-slate-light uppercase tracking-wider mb-3">Recent Recipients</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {recentRecipients.map((r) => (
              <button
                key={r.account_number}
                onClick={() => handleSelect(r)}
                className="flex items-center gap-2 rounded-iwb-lg border border-iwb-border-light p-3 transition-all hover:border-iwb-teal hover:bg-iwb-teal/5 text-left"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-iwb-navy/5 text-xs font-bold text-iwb-slate">
                  {r.full_name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium text-iwb-navy">{r.full_name}</p>
                  <p className="text-xs text-iwb-slate-light">**** {r.account_number.slice(-4)}</p>
                </div>
              </button>
            ))}
            <button
              onClick={() => setShowAddNew(true)}
              className="flex items-center gap-2 rounded-iwb-lg border border-dashed border-iwb-border p-3 transition-all hover:border-iwb-teal hover:bg-iwb-teal/5 text-left"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-iwb-teal/10 text-iwb-teal">
                <i className="material-icons text-sm">add</i>
              </span>
              <div>
                <p className="text-sm font-medium text-iwb-navy">Add New</p>
                <p className="text-xs text-iwb-slate-light">Search by account</p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-2 rounded-iwb-lg border border-iwb-border bg-white px-4 py-3 focus-within:border-iwb-teal focus-within:ring-2 focus-within:ring-iwb-teal/10 transition-colors">
            <i className="material-icons text-iwb-slate-light">search</i>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('send.recipientPlaceholder')}
              className="flex-1 bg-transparent text-sm text-iwb-navy placeholder:text-iwb-slate-light focus:outline-none"
            />
            {searching ? (
              <span className="size-4 animate-spin rounded-full border-2 border-iwb-teal border-t-transparent" />
            ) : null}
          </div>

          {showDropdown && results.length > 0 ? (
            <div
              ref={dropdownRef}
              className="absolute z-10 mt-1 w-full rounded-iwb-lg bg-white shadow-iwb-overlay border border-iwb-border-light max-h-60 overflow-y-auto"
            >
              {results.map((r) => (
                <button
                  key={r.account_number}
                  onClick={() => handleSelect(r)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-iwb-surface"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-iwb-navy/5 text-xs font-bold text-iwb-slate">
                    {r.full_name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-iwb-navy">{r.full_name}</p>
                    <p className="text-xs text-iwb-slate-light">{r.account_number}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : showDropdown && query.length >= 2 ? (
            <div className="absolute z-10 mt-1 w-full rounded-iwb-lg bg-white shadow-iwb-overlay border border-iwb-border-light p-4 text-center text-sm text-iwb-slate">
              {t('common.noResults')}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
