import { buildResumeMetaPayload, RESUME_EXPORT_META_FILENAME } from "../data/resume-export";

export const prerender = true;

export function GET() {
  return new Response(`${JSON.stringify(buildResumeMetaPayload(), null, 2)}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${RESUME_EXPORT_META_FILENAME}"`,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
