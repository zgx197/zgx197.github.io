import { buildResumeSchemaDocument, RESUME_EXPORT_SCHEMA_FILENAME } from "../data/resume-export";

export const prerender = true;

export function GET() {
  return new Response(`${JSON.stringify(buildResumeSchemaDocument(), null, 2)}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${RESUME_EXPORT_SCHEMA_FILENAME}"`,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
