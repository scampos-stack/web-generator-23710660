"use client";

import { useState } from "react";
import {
  INDUSTRY_TEMPLATES,
  renderIndustryTemplate,
} from "@/lib/industryTemplates";

export default function TemplatesPage() {
  const [preview, setPreview] = useState<{ name: string; html: string } | null>(
    null
  );

  return (
    <main className="flex-1">
      <section className="border-b border-[var(--border)] bg-gradient-to-b from-indigo-50 to-[var(--background)]">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Industry Template Library
          </h1>
          <p className="mt-2 text-slate-600 max-w-xl">
            {INDUSTRY_TEMPLATES.length} pre-built mockups, one per vertical, so
            you can test the look and feel before the Anthropic key is wired
            in. These use made-up placeholder businesses, not real audits.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {INDUSTRY_TEMPLATES.map((t) => (
            <button
              key={t.id}
              className="text-left rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm p-4 hover:border-indigo-300 hover:shadow-md transition-all"
              onClick={() =>
                setPreview({
                  name: t.data.businessName,
                  html: renderIndustryTemplate(t),
                })
              }
            >
              <div
                className="h-2 w-10 rounded-full mb-3"
                style={{ background: t.data.accentColor }}
              />
              <div className="text-xs uppercase tracking-wide text-indigo-600 font-medium">
                {t.industry}
              </div>
              <div className="mt-1 font-semibold text-slate-900">
                {t.data.businessName}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {t.data.city} · {t.data.phone}
              </div>
            </button>
          ))}
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <span className="text-sm font-medium text-slate-900">
                {preview.name} — visual concept only
              </span>
              <button
                className="text-slate-400 hover:text-slate-900 rounded-full h-7 w-7 flex items-center justify-center hover:bg-slate-100 transition-colors"
                onClick={() => setPreview(null)}
              >
                ✕
              </button>
            </div>
            <iframe srcDoc={preview.html} className="flex-1 w-full" sandbox="" />
          </div>
        </div>
      )}
    </main>
  );
}
