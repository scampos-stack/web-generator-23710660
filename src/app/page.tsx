"use client";

import { useState } from "react";
import Link from "next/link";
import type { AuditInput, AuditResult, ChecklistStatus } from "@/lib/types";

const MAX_SITES = 10;

function emptyRow(): AuditInput {
  return { url: "", vertical: "", city: "" };
}

function statusColor(status: ChecklistStatus) {
  if (status === "PASS") return "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200";
  if (status === "FAIL") return "text-rose-700 bg-rose-50 ring-1 ring-rose-200";
  return "text-amber-700 bg-amber-50 ring-1 ring-amber-200";
}

function priorityColor(priority: string | null) {
  if (priority === "high") return "bg-rose-600";
  if (priority === "medium") return "bg-amber-500";
  return "bg-slate-400";
}

export default function Home() {
  const [rows, setRows] = useState<AuditInput[]>([emptyRow()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AuditResult[] | null>(null);
  const [mockupPreview, setMockupPreview] = useState<{
    name: string;
    html: string;
  } | null>(null);

  function updateRow(index: number, field: keyof AuditInput, value: string) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  function addRow() {
    setRows((prev) => (prev.length >= MAX_SITES ? prev : [...prev, emptyRow()]));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function runAudit() {
    setError(null);
    const sites = rows
      .filter((r) => r.url.trim().length > 0)
      .map((r) => ({
        url: r.url.trim(),
        vertical: r.vertical?.trim() || undefined,
        city: r.city?.trim() || undefined,
      }));

    if (sites.length === 0) {
      setError("Enter at least one URL.");
      return;
    }

    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sites }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Audit request failed");
      }
      setResults(data.results as AuditResult[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="border-b border-[var(--border)] bg-gradient-to-b from-indigo-50 to-[var(--background)]">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Web Audit &amp; Mockup Generator
              </h1>
              <p className="mt-2 text-slate-600 max-w-xl">
                Paste up to {MAX_SITES} prospect URLs. Each gets a verified
                audit, an SEO fix list, and a single-file mockup your sales
                team can show on a call.
              </p>
            </div>
            <Link
              href="/templates"
              className="inline-flex items-center gap-1 rounded-full bg-white border border-[var(--border)] px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700 transition-colors"
            >
              Browse 20 industry templates →
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Input card */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5 sm:p-6">
          <div className="space-y-3">
            {rows.map((row, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-2 sm:items-center"
              >
                <input
                  className="flex-1 border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  placeholder="https://example.com"
                  value={row.url}
                  onChange={(e) => updateRow(i, "url", e.target.value)}
                />
                <input
                  className="sm:w-40 border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  placeholder="Vertical (optional)"
                  value={row.vertical}
                  onChange={(e) => updateRow(i, "vertical", e.target.value)}
                />
                <input
                  className="sm:w-32 border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  placeholder="City (optional)"
                  value={row.city}
                  onChange={(e) => updateRow(i, "city", e.target.value)}
                />
                <button
                  className="self-end sm:self-auto text-slate-400 hover:text-rose-600 px-2 py-2 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 1}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="flex items-center gap-4 pt-2">
              <button
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 transition-colors"
                onClick={addRow}
                disabled={rows.length >= MAX_SITES}
              >
                + Add site
              </button>
              <button
                className="ml-auto inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                onClick={runAudit}
                disabled={loading}
              >
                {loading && (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                )}
                {loading ? "Auditing…" : "Run audit"}
              </button>
            </div>
            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>
        </section>

        {results && (
          <section className="mt-10 space-y-6">
            {results.map((r, i) => (
              <article
                key={i}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5 sm:p-6"
              >
                <header className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {r.business_name ?? r.requested_url}
                  </h2>
                  <a
                    href={r.requested_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    {r.requested_url}
                  </a>
                </header>
                <p className="text-xs text-slate-500 mt-1">
                  {r.vertical ?? "unknown vertical"}
                  {r.vertical_inferred ? " (inferred)" : ""} ·{" "}
                  {r.city ?? "unknown city"}
                  {r.city_inferred ? " (inferred)" : ""}
                </p>

                {r.page_load_error && (
                  <p className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    Page load error: {r.page_load_error}
                  </p>
                )}

                {r.checklist.length > 0 && (
                  <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)]">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-slate-500">
                          <th className="py-2 px-3 font-medium">Category</th>
                          <th className="py-2 px-3 font-medium">Item</th>
                          <th className="py-2 px-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.checklist.map((c, j) => (
                          <tr key={j} className="border-t border-[var(--border)]">
                            <td className="py-2 px-3 text-slate-500">
                              {c.category}
                            </td>
                            <td className="py-2 px-3">{c.item}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(c.status)}`}
                              >
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {r.hook_issue && (
                  <p className="mt-4 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <strong>Hook:</strong> {r.hook_issue.item} —{" "}
                    {r.hook_issue.reason}
                  </p>
                )}

                {r.skip_recommended && (
                  <p className="mt-4 text-sm bg-slate-50 border border-[var(--border)] rounded-lg p-3">
                    Fewer than three checklist items failed — this site is in
                    decent shape. Consider skipping this prospect.
                  </p>
                )}

                {r.seo_fixes.length > 0 && (
                  <div className="mt-5">
                    <h3 className="font-semibold text-sm text-slate-900">
                      SEO fixes
                    </h3>
                    <ol className="mt-2 space-y-3 list-decimal list-inside text-sm">
                      {r.seo_fixes.map((f, j) => (
                        <li key={j}>
                          <span className="font-medium">{f.title}</span>{" "}
                          <span className="text-slate-400">
                            ({f.effort_minutes} min)
                          </span>
                          <div className="text-slate-600 mt-0.5 pl-5">
                            <span className="text-rose-600 font-medium">
                              Now:
                            </span>{" "}
                            {f.issue}
                          </div>
                          <div className="text-slate-600 pl-5">
                            <span className="text-emerald-700 font-medium">
                              Fix:
                            </span>{" "}
                            {f.fix}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {r.before_after.length > 0 && (
                  <div className="mt-5">
                    <h3 className="font-semibold text-sm text-slate-900">
                      Before / after
                    </h3>
                    <div className="mt-2 space-y-2 text-sm">
                      {r.before_after.map((ba, j) => (
                        <div
                          key={j}
                          className="grid grid-cols-2 gap-3 border border-[var(--border)] rounded-lg p-3"
                        >
                          <div className="text-slate-500">{ba.before}</div>
                          <div className="text-emerald-700">{ba.after}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {r.outreach_line && (
                  <p className="mt-5 text-sm italic bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    {r.outreach_line}
                  </p>
                )}

                {r.mockup_html && (
                  <div className="mt-5">
                    <button
                      className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      onClick={() =>
                        setMockupPreview({
                          name: r.business_name ?? r.requested_url,
                          html: r.mockup_html as string,
                        })
                      }
                    >
                      View mockup →
                    </button>
                  </div>
                )}
              </article>
            ))}

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5 sm:p-6 overflow-x-auto">
              <h2 className="font-semibold text-slate-900 mb-3">Summary</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-1 pr-3">Business</th>
                    <th className="py-1 pr-3">Hook issue</th>
                    <th className="py-1 pr-3">Fails</th>
                    <th className="py-1">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-t border-[var(--border)]">
                      <td className="py-2 pr-3">
                        {r.business_name ?? r.requested_url}
                      </td>
                      <td className="py-2 pr-3">{r.hook_issue?.item ?? "—"}</td>
                      <td className="py-2 pr-3">{r.fail_count}</td>
                      <td className="py-2">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs text-white ${priorityColor(r.priority)}`}
                        >
                          {r.priority ?? "n/a"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {mockupPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <span className="text-sm font-medium text-slate-900">
                {mockupPreview.name} — visual concept only
              </span>
              <button
                className="text-slate-400 hover:text-slate-900 rounded-full h-7 w-7 flex items-center justify-center hover:bg-slate-100 transition-colors"
                onClick={() => setMockupPreview(null)}
              >
                ✕
              </button>
            </div>
            <iframe
              srcDoc={mockupPreview.html}
              className="flex-1 w-full"
              sandbox=""
            />
          </div>
        </div>
      )}
    </main>
  );
}
