"use client";

import { useState } from "react";
import Link from "next/link";
import {
  INDUSTRY_TEMPLATES,
  renderIndustryTemplate,
} from "@/lib/industryTemplates";

export default function TemplatesPage() {
  const [preview, setPreview] = useState<{ name: string; html: string } | null>(
    null
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 flex-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Industry Template Library</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back to audit tool
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {INDUSTRY_TEMPLATES.length} pre-built mockups, one per vertical, so you
        can test the look and feel before the Anthropic key is wired in. These
        use made-up placeholder businesses, not real audits.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {INDUSTRY_TEMPLATES.map((t) => (
          <button
            key={t.id}
            className="text-left border rounded-lg p-4 hover:border-slate-400 transition-colors"
            onClick={() =>
              setPreview({
                name: t.data.businessName,
                html: renderIndustryTemplate(t),
              })
            }
          >
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {t.industry}
            </div>
            <div className="mt-1 font-medium">{t.data.businessName}</div>
            <div className="mt-1 text-xs text-slate-500">
              {t.data.city} · {t.data.phone}
            </div>
          </button>
        ))}
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="text-sm font-medium">
                {preview.name} — visual concept only
              </span>
              <button
                className="text-slate-500 hover:text-black"
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
