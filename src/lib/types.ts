export type ChecklistStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface ChecklistItem {
  category: "Technical" | "Conversion" | "SEO";
  item: string;
  status: ChecklistStatus;
  note?: string;
}

export interface SeoFix {
  title: string;
  issue: string;
  fix: string;
  effort_minutes: number;
}

export interface BeforeAfter {
  before: string;
  after: string;
}

export interface AuditInput {
  url: string;
  vertical?: string;
  city?: string;
}

export interface AuditResult {
  requested_url: string;
  business_name: string | null;
  vertical: string | null;
  vertical_inferred: boolean;
  city: string | null;
  city_inferred: boolean;
  page_load_error: string | null;
  checklist: ChecklistItem[];
  hook_issue: { item: string; reason: string } | null;
  seo_fixes: SeoFix[];
  mockup_html: string | null;
  before_after: BeforeAfter[];
  outreach_line: string | null;
  fail_count: number;
  priority: "high" | "medium" | "low" | null;
  skip_recommended: boolean;
}
