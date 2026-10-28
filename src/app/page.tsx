"use client";

import { useState } from "react";
import Link from "next/link";
import type { AuditInput, AuditResult, ChecklistStatus } from "@/lib/types";

const MAX_SITES = 10;

function emptyRow(): AuditInput {
  return { url: "", vertical: "", city: "" };
}

function statusColor(status: ChecklistStatus) {
  if (status === "PASS") return "text-green-700 bg-green-50";
  if (status === "FAIL") return "text-red-700 bg-red-50";
  return "text-amber-700 bg-amber-50";
}

function priorityColor(priority: string | null) {
  if (priority === "high") return "bg-red-600";
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
    <main className="mx-auto max-w-5xl px-4 py-10 flex-1">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Web Audit & Mockup Generator</h1>
        <Link href="/templates" className="text-sm text-blue-600 hover:underline">
          Browse 20 industry templates →
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Paste up to {MAX_SITES} prospect URLs. Each gets a verified audit, an
        SEO fix list, and a single-file mockup.
      </p>

      <section className="mt-6 space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="flex-1 border rounded px-3 py-2 text-sm"
              placeholder="https://example.com"
              value={row.url}
              onChange={(e) => updateRow(i, "url", e.target.value)}
            />
            <input
              className="w-36 border rounded px-3 py-2 text-sm"
              placeholder="Vertical (optional)"
              value={row.vertical}
              onChange={(e) => updateRow(i, "vertical", e.target.value)}
            />
            <input
              className="w-32 border rounded px-3 py-2 text-sm"
              placeholder="City (optional)"
              value={row.city}
              onChange={(e) => updateRow(i, "city", e.target.value)}
            />
            <button
              className="text-slate-400 hover:text-red-600 px-2"
              onClick={() => removeRow(i)}
              disabled={rows.length === 1}
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <button
            className="text-sm text-blue-600 hover:underline disabled:text-slate-400"
            onClick={addRow}
            disabled={rows.length >= MAX_SITES}
          >
            + Add site
          </button>
          <button
            className="ml-auto rounded bg-slate-900 text-white text-sm px-4 py-2 disabled:opacity-50"
            onClick={runAudit}
            disabled={loading}
          >
            {loading ? "Auditing…" : "Run audit"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      {results && (
        <section className="mt-10 space-y-10">
          {results.map((r, i) => (
            <article key={i} className="border rounded-lg p-5">
              <header className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  {r.business_name ?? r.requested_url}
                </h2>
                <a
                  href={r.requested_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
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
                <p className="mt-3 text-sm text-red-600">
                  Page load error: {r.page_load_error}
                </p>
              )}

              {r.checklist.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="py-1 pr-3">Category</th>
                        <th className="py-1 pr-3">Item</th>
                        <th className="py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.checklist.map((c, j) => (
                        <tr key={j} className="border-t">
                          <td className="py-1 pr-3 text-slate-500">
                            {c.category}
                          </td>
                          <td className="py-1 pr-3">{c.item}</td>
                          <td className="py-1">
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusColor(c.status)}`}
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
                <p className="mt-4 text-sm bg-amber-50 border border-amber-200 rounded p-3">
                  <strong>Hook:</strong> {r.hook_issue.item} —{" "}
                  {r.hook_issue.reason}
                </p>
              )}

              {r.skip_recommended && (
                <p className="mt-4 text-sm bg-slate-50 border rounded p-3">
                  Fewer than three checklist items failed — this site is in
                  decent shape. Consider skipping this prospect.
                </p>
              )}

              {r.seo_fixes.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-medium text-sm">SEO fixes</h3>
                  <ol className="mt-2 space-y-3 list-decimal list-inside text-sm">
                    {r.seo_fixes.map((f, j) => (
                      <li key={j}>
                        <span className="font-medium">{f.title}</span> (
                        {f.effort_minutes} min)
                        <div className="text-slate-600 mt-0.5">
                          <span className="text-red-600">Now:</span> {f.issue}
                        </div>
                        <div className="text-slate-600">
                          <span className="text-green-700">Fix:</span> {f.fix}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {r.before_after.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-medium text-sm">Before / after</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    {r.before_after.map((ba, j) => (
                      <div
                        key={j}
                        className="grid grid-cols-2 gap-3 border rounded p-2"
                      >
                        <div className="text-slate-500">{ba.before}</div>
                        <div className="text-green-700">{ba.after}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {r.outreach_line && (
                <p className="mt-5 text-sm italic bg-blue-50 border border-blue-200 rounded p-3">
                  {r.outreach_line}
                </p>
              )}

              {r.mockup_html && (
                <div className="mt-5">
                  <button
                    className="text-sm text-blue-600 hover:underline"
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

          <div className="overflow-x-auto">
            <h2 className="font-semibold mb-2">Summary</h2>
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
                  <tr key={i} className="border-t">
                    <td className="py-1 pr-3">
                      {r.business_name ?? r.requested_url}
                    </td>
                    <td className="py-1 pr-3">
                      {r.hook_issue?.item ?? "—"}
                    </td>
                    <td className="py-1 pr-3">{r.fail_count}</td>
                    <td className="py-1">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs text-white ${priorityColor(r.priority)}`}
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

      {mockupPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="text-sm font-medium">
                {mockupPreview.name} — visual concept only
              </span>
              <button
                className="text-slate-500 hover:text-black"
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
