from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from pypdf import PdfReader


def extract_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    pages = []
    for page in reader.pages:
        text = ""
        try:
            text = page.extract_text(extraction_mode="layout") or ""
        except Exception:
            text = page.extract_text() or ""
        pages.append(text)
    return "\n".join(pages).strip()


def resolve_input(user_input: str | None) -> Path:
    if user_input:
        pdf_path = Path(user_input).resolve()
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")
        return pdf_path

    candidates = sorted(Path.cwd().glob("*.pdf"))
    if len(candidates) == 1:
        return candidates[0].resolve()
    if len(candidates) == 0:
        raise FileNotFoundError("No PDF found in current directory. Pass a PDF path explicitly.")
    names = ", ".join(candidate.name for candidate in candidates[:5])
    raise RuntimeError(f"Multiple PDFs found in current directory. Pass one explicitly. Candidates: {names}")


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser(description="Extract resume text from PDF and generate a resume-source draft.")
    parser.add_argument("input", nargs="?", help="Path to the PDF resume file. If omitted and only one PDF exists in cwd, that file is used.")
    parser.add_argument("--out-dir", default="generated/resume-import", help="Directory for generated draft files")
    parser.add_argument("--node", default="node", help="Node executable used to run the text importer")
    args = parser.parse_args()

    pdf_path = resolve_input(args.input)
    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    text = extract_text(pdf_path)
    extracted_path = out_dir / f"{pdf_path.stem}.extracted.txt"
    extracted_path.write_text(text + "\n", encoding="utf-8")

    script_path = Path(__file__).resolve().with_name("import-resume-text.mjs")
    command = [
        args.node,
        str(script_path),
        str(extracted_path),
        "--out-dir",
        str(out_dir),
        "--stem",
        pdf_path.stem,
    ]

    completed = subprocess.run(command, check=False)
    if completed.returncode != 0:
        return completed.returncode

    print(f"Imported resume PDF: {pdf_path}")
    print(f"- extracted text: {extracted_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

