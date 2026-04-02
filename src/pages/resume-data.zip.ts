import { buildResumeExportArchive, RESUME_EXPORT_ARCHIVE_FILENAME } from "../data/resume-export";

export const prerender = true;

export function GET() {
  return new Response(buildResumeExportArchive(), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${RESUME_EXPORT_ARCHIVE_FILENAME}"`,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
