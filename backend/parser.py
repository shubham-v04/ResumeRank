"""
Handles turning uploaded resume files into plain text, and pulling out
a few basic fields (name, email, years of experience) so the results
table and skill-matching logic have something structured to work with.
"""

import os
import re

from pypdf import PdfReader
from docx import Document

EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
NAME_PATTERN = re.compile(r"^\s*([A-Z][a-zA-Z'-]+)\s+([A-Z][a-zA-Z'-]+)", re.MULTILINE)

# Matches things like "5 years", "3+ years", "2 yrs of experience"
EXPERIENCE_PATTERN = re.compile(r"(\d{1,2})\s*\+?\s*(?:years?|yrs?)\b", re.IGNORECASE)


def extract_text_from_pdf(path: str) -> str:
    try:
        reader = PdfReader(path)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        return ""


def extract_text_from_docx(path: str) -> str:
    try:
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception:
        return ""


def extract_text(path: str) -> str:
    """Dispatches to the right extractor based on file extension."""
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(path)
    if ext == ".docx":
        return extract_text_from_docx(path)
    return ""


def extract_entities(text: str):
    """Very lightweight name/email extraction. Good enough for a v1 -
    swap in spaCy NER later if this proves unreliable on real resumes."""
    emails = EMAIL_PATTERN.findall(text)
    name_match = NAME_PATTERN.search(text)
    name = f"{name_match.group(1)} {name_match.group(2)}" if name_match else "Unknown"
    email = emails[0] if emails else "Not found"
    return name, email


def extract_years_of_experience(text: str):
    """
    Heuristic only: looks for the largest "N years" mention in the resume.
    Not reliable for every resume format - treat as an estimate, not a fact.
    Returns an int, or None if nothing matched.
    """
    matches = EXPERIENCE_PATTERN.findall(text)
    if not matches:
        return None
    years = [int(m) for m in matches if int(m) <= 50]  # ignore obvious junk matches
    return max(years) if years else None


def is_allowed_file(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in (".pdf", ".docx")
