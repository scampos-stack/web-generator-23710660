import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white text-xs">
            W
          </span>
          Web Audit Generator
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link
            href="/"
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            Audit tool
          </Link>
          <Link
            href="/templates"
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            Templates
          </Link>
        </nav>
      </div>
    </header>
  );
}
