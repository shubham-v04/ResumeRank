"""
ResumeRank backend.

Endpoints:
  POST /analyze          - job description + resumes (+ optional skills/min experience) -> ranked results
  GET  /download/excel    - downloads the most recent results as an .xlsx
  GET  /download/pdf      - downloads the most recent results as a .pdf
  GET  /resumes/<file>     - serves an uploaded resume so it can be viewed in-browser

No database, no auth - everything lives in memory / on disk for the
current server run, which is fine for a local, single-user tool.
"""

import os
import shutil

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, JSONResponse
from werkzeug.utils import secure_filename

from parser import extract_text, extract_entities, extract_years_of_experience, is_allowed_file
from scorer import score_resumes
from exporters import generate_excel, generate_pdf

app = FastAPI(title="ResumeRank")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/resumes", StaticFiles(directory=UPLOAD_DIR), name="resumes")

latest_results: list[dict] = []


def reset_upload_dir():
    shutil.rmtree(UPLOAD_DIR, ignore_errors=True)
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def parse_skills(raw: str) -> list[str]:
    """Turns a comma-separated skills string into a clean list."""
    if not raw:
        return []
    return [s.strip() for s in raw.split(",") if s.strip()]


@app.post("/analyze")
async def analyze(
    job_description: str = Form(...),
    resume_files: list[UploadFile] = File(...),
    required_skills: str = Form(""),          # comma-separated, optional
    min_experience: int | None = Form(None),   # years, optional
):
    global latest_results

    if not job_description.strip():
        return JSONResponse(status_code=400, content={"error": "Job description is empty."})

    if not resume_files:
        return JSONResponse(status_code=400, content={"error": "No resume files were uploaded."})

    skills_list = parse_skills(required_skills)
    reset_upload_dir()

    parsed = []       # (stored_filename, original_filename, name, email, text, years_exp)
    skipped = []

    for idx, f in enumerate(resume_files):
        if not f.filename or not is_allowed_file(f.filename):
            skipped.append(f.filename or "unknown file")
            continue

        stored_filename = f"{idx}_{secure_filename(f.filename)}"
        stored_path = os.path.join(UPLOAD_DIR, stored_filename)
        with open(stored_path, "wb") as out:
            shutil.copyfileobj(f.file, out)

        text = extract_text(stored_path)
        if not text.strip():
            skipped.append(f.filename)
            continue

        name, email = extract_entities(text)
        years_exp = extract_years_of_experience(text)
        parsed.append((stored_filename, f.filename, name, email, text, years_exp))

    if not parsed:
        return JSONResponse(
            status_code=400,
            content={"error": "None of the uploaded files could be read.", "skipped": skipped},
        )

    score_results = score_resumes(job_description, [p[4] for p in parsed], skills_list)

    results = []
    for (stored_filename, original_filename, name, email, _, years_exp), score in zip(parsed, score_results):
        meets_experience = None
        if min_experience is not None:
            meets_experience = (years_exp is not None) and (years_exp >= min_experience)

        results.append({
            "filename": original_filename,
            "name": name,
            "email": email,
            "score": score["final_score"],
            "tfidf_score": score["tfidf_score"],
            "skill_match_percent": score["skill_match_percent"],
            "skills_matched": score["skills_matched"],
            "skills_missing": score["skills_missing"],
            "years_experience": years_exp,
            "meets_experience": meets_experience,
            "resume_url": f"/resumes/{stored_filename}",
        })

    results.sort(key=lambda r: r["score"], reverse=True)
    latest_results = results

    return {"results": results, "skipped": skipped}


@app.get("/download/excel")
def download_excel():
    if not latest_results:
        return JSONResponse(status_code=400, content={"error": "No results to export yet."})
    buffer = generate_excel(latest_results)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=ranked_resumes.xlsx"},
    )


@app.get("/download/pdf")
def download_pdf():
    if not latest_results:
        return JSONResponse(status_code=400, content={"error": "No results to export yet."})
    buffer = generate_pdf(latest_results)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=ranked_resumes.pdf"},
    )
