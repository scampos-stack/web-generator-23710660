import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchSite } from "@/lib/fetchSite";
import { buildUserMessage, SYSTEM_PROMPT } from "@/lib/prompt";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type { AuditInput, AuditResult, ChecklistItem } from "@/lib/types";

export const maxDuration = 300;

const MODEL = "claude-sonnet-5-5";
const MAX_SITES = 10;

function computeFailCount(checklist: ChecklistItem[]): number {
  return checklist.filter((c) => c.status === "FAIL").length;
}

function computePriority(failCount: number): "high" | "medium" | "low" {
  if (failCount >= 6) return "high";
  if (failCount >= 3) return "medium";
  return "low";
}

function parseModelJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  return JSON.parse(candidate);
}

async function auditOneSite(
  input: AuditInput,
  anthropic: Anthropic
): Promise<AuditResult> {
  const { url, vertical, city } = input;
  const siteFetch = await fetchSite(url);

  const userMessage = buildUserMessage({
    url,
    vertical,
    city,
    html: siteFetch.html,
    fetchError: siteFetch.fetchError,
    fetchTimeMs: siteFetch.fetchTimeMs,
    httpStatus: siteFetch.httpStatus,
  });

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Model returned no text content");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = parseModelJson(textBlock.text);
  } catch {
    throw new Error("Model did not return valid JSON");
  }

  const checklist = Array.isArray(parsed.checklist)
    ? (parsed.checklist as ChecklistItem[])
    : [];
  const failCount = computeFailCount(checklist);
  const skipRecommended = failCount < 3;

  return {
    requested_url: url,
    business_name: (parsed.business_name as string) ?? null,
    vertical: (parsed.vertical as string) ?? vertical ?? null,
    vertical_inferred: Boolean(parsed.vertical_inferred),
    city: (parsed.city as string) ?? city ?? null,
    city_inferred: Boolean(parsed.city_inferred),
    page_load_error:
      (parsed.page_load_error as string) ?? siteFetch.fetchError ?? null,
    checklist,
    hook_issue: skipRecommended
      ? null
      : ((parsed.hook_issue as AuditResult["hook_issue"]) ?? null),
    seo_fixes: Array.isArray(parsed.seo_fixes)
      ? (parsed.seo_fixes as AuditResult["seo_fixes"])
      : [],
    mockup_html: (parsed.mockup_html as string) ?? null,
    before_after: Array.isArray(parsed.before_after)
      ? (parsed.before_after as AuditResult["before_after"])
      : [],
    outreach_line: (parsed.outreach_line as string) ?? null,
    fail_count: failCount,
    priority: computePriority(failCount),
    skip_recommended: skipRecommended,
  };
}

export async function POST(req: NextRequest) {
  let body: { sites?: AuditInput[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sites = body.sites;
  if (!Array.isArray(sites) || sites.length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty `sites` array with at least one url." },
      { status: 400 }
    );
  }
  if (sites.length > MAX_SITES) {
    return NextResponse.json(
      { error: `Provide at most ${MAX_SITES} sites per run.` },
      { status: 400 }
    );
  }
  for (const site of sites) {
    if (!site.url || typeof site.url !== "string") {
      return NextResponse.json(
        { error: "Every site needs a `url` string." },
        { status: 400 }
      );
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const results: AuditResult[] = [];
  for (const site of sites) {
    try {
      const result = await auditOneSite(site, anthropic);
      results.push(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results.push({
        requested_url: site.url,
        business_name: null,
        vertical: site.vertical ?? null,
        vertical_inferred: false,
        city: site.city ?? null,
        city_inferred: false,
        page_load_error: message,
        checklist: [],
        hook_issue: null,
        seo_fixes: [],
        mockup_html: null,
        before_after: [],
        outreach_line: null,
        fail_count: 0,
        priority: null,
        skip_recommended: false,
      });
    }
  }

  try {
    const supabase = getSupabaseServerClient();
    const rows = results.map((r) => ({
      requested_url: r.requested_url,
      vertical: r.vertical,
      city: r.city,
      vertical_inferred: r.vertical_inferred,
      city_inferred: r.city_inferred,
      business_name: r.business_name,
      page_load_error: r.page_load_error,
      checklist: r.checklist,
      hook_issue: r.hook_issue,
      seo_fixes: r.seo_fixes,
      mockup_html: r.mockup_html,
      before_after: r.before_after,
      outreach_line: r.outreach_line,
      fail_count: r.fail_count,
      priority: r.priority,
      skip_recommended: r.skip_recommended,
    }));
    await supabase.from("audit_runs").insert(rows);
  } catch (err) {
    console.error("Failed to persist audit_runs to Supabase:", err);
  }

  return NextResponse.json({ results });
}
